#!/usr/bin/env python3
"""
Convert technique GIFs to MP4 video + still poster images.

The source GIFs are 1280x720 animations of ~10MB each, rendered into grid cards
that are 350px wide. A GIF cannot be paused or previewed, so the browser has to
download the whole file before showing a single frame. Converting to MP4 + a
poster still lets the grid load posters only (~10KB each) and fetch video only
when the user actually asks to play it.

Outputs land next to each source GIF:
    yellow/O-goshi.gif  ->  yellow/O-goshi.mp4   (animation)
                            yellow/O-goshi.webp  (poster, first frame)

Single-frame GIFs get a poster only -- there is nothing to animate.

Video encoding runs through ffmpeg in Docker (no local ffmpeg needed); posters
are produced locally with Pillow. Existing up-to-date outputs are skipped, so
the script is safe to re-run.

Usage:
    python3 scripts/convert_media.py [--crf 28] [--jobs 4] [--force] [--dry-run]
"""

import argparse
import concurrent.futures
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

FFMPEG_IMAGE = "jrottenberg/ffmpeg:6-alpine"

SOURCE_DIRS = [
    "src/pages/judo_techniques",
    "src/pages/kata_techniques",
]

VIDEO_WIDTH = 720   # cards are 350 CSS px; 720 covers retina
POSTER_WIDTH = 700
POSTER_QUALITY = 75


def project_root() -> Path:
    return Path(__file__).resolve().parent.parent


def find_gifs(root: Path) -> list[Path]:
    gifs: list[Path] = []
    for rel in SOURCE_DIRS:
        base = root / rel
        if not base.is_dir():
            print(f"  ! missing source dir, skipping: {rel}")
            continue
        gifs.extend(sorted(base.rglob("*.gif")))
    return gifs


def is_stale(src: Path, dst: Path, force: bool) -> bool:
    """True if dst needs building."""
    if force or not dst.exists():
        return True
    return dst.stat().st_mtime < src.stat().st_mtime


def probe(gif: Path) -> tuple[int, str]:
    """Return (frame count, real format).

    A fifth of these files are PNG/JPEG/WebP saved with a .gif extension, so
    the extension cannot be trusted -- the real format decides how we decode.
    """
    with Image.open(gif) as im:
        return getattr(im, "n_frames", 1), (im.format or "")


def mean_frame_ms(im: Image.Image, frames: int) -> float:
    """Average frame delay in ms, for rebuilding a constant frame rate."""
    total = 0
    counted = 0
    for i in range(frames):
        im.seek(i)
        d = im.info.get("duration")
        if d:
            total += d
            counted += 1
    return (total / counted) if counted else 100.0


def make_poster(gif: Path, dst: Path) -> None:
    with Image.open(gif) as im:
        im.seek(0)
        frame = im.convert("RGB")
        frame.thumbnail((POSTER_WIDTH, POSTER_WIDTH), Image.LANCZOS)
        frame.save(dst, "WEBP", quality=POSTER_QUALITY, method=4)


def _encode(mount: Path, in_args: list[str], rel_out: str, crf: int) -> None:
    """Run ffmpeg in Docker over `mount`, writing rel_out inside it."""
    # min() guards against any source narrower than VIDEO_WIDTH; the 2*trunc
    # keeps both dimensions even, which yuv420p requires.
    scale = f"scale='2*trunc(min({VIDEO_WIDTH},iw)/2)':-2:flags=lanczos"
    cmd = [
        "docker", "run", "--rm",
        "-v", f"{mount}:/work",
        "-w", "/work",
        FFMPEG_IMAGE,
        "-y", "-loglevel", "error",
        *in_args,
        "-vf", scale,
        "-c:v", "libx264",
        "-crf", str(crf),
        "-preset", "medium",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-an",
        rel_out,
    ]
    subprocess.run(cmd, check=True, capture_output=True, text=True)


def make_video_direct(gif: Path, dst: Path, root: Path, crf: int) -> None:
    """Let ffmpeg demux the source itself. Works for real GIFs.

    The whole project dir is mounted so input and output paths stay relative,
    which keeps the container command identical for every belt folder.
    """
    _encode(root, ["-i", str(gif.relative_to(root))],
            str(dst.relative_to(root)), crf)


def make_video_via_frames(gif: Path, dst: Path, crf: int) -> None:
    """Decode with Pillow, then encode from a PNG sequence.

    Needed for animated WebP saved as .gif -- the ffmpeg build has no animated
    WebP demuxer, so it reads zero frames and writes an empty file.
    """
    with Image.open(gif) as im:
        frames = getattr(im, "n_frames", 1)
        fps = max(1.0, min(50.0, 1000.0 / mean_frame_ms(im, frames)))

        with tempfile.TemporaryDirectory() as tmp:
            tmpdir = Path(tmp)
            for i in range(frames):
                im.seek(i)
                im.convert("RGB").save(tmpdir / f"{i:05d}.png")

            _encode(tmpdir,
                    ["-framerate", f"{fps:.3f}", "-i", "%05d.png"],
                    "out.mp4", crf)
            shutil.move(str(tmpdir / "out.mp4"), str(dst))


def process(gif: Path, root: Path, crf: int, force: bool, dry_run: bool) -> dict:
    result = {
        "gif": gif,
        "src_bytes": gif.stat().st_size,
        "video_bytes": 0,
        "poster_bytes": 0,
        "animated": False,
        "actions": [],
        "error": None,
    }
    mp4 = gif.with_suffix(".mp4")
    poster = gif.with_suffix(".webp")

    try:
        frames, fmt = probe(gif)
        result["animated"] = frames > 1
        result["format"] = fmt

        if is_stale(gif, poster, force):
            if not dry_run:
                make_poster(gif, poster)
            result["actions"].append("poster")

        if result["animated"]:
            if is_stale(gif, mp4, force):
                if not dry_run:
                    if fmt == "GIF":
                        make_video_direct(gif, mp4, root, crf)
                    else:
                        # Mislabelled source; ffmpeg may not demux it.
                        make_video_via_frames(gif, mp4, crf)
                    if mp4.exists() and mp4.stat().st_size == 0:
                        mp4.unlink()
                        make_video_via_frames(gif, mp4, crf)
                result["actions"].append("video")
        else:
            result["actions"].append("still-only")

        if not dry_run:
            if poster.exists():
                result["poster_bytes"] = poster.stat().st_size
            if mp4.exists():
                result["video_bytes"] = mp4.stat().st_size
    except subprocess.CalledProcessError as exc:
        result["error"] = (exc.stderr or "").strip()[:300] or "ffmpeg failed"
    except Exception as exc:  # noqa: BLE001 - report and keep going
        result["error"] = f"{type(exc).__name__}: {exc}"

    return result


def write_manifest(root: Path) -> int:
    """Record fps/duration per video so the player can step exact frames.

    Frame rate varies per clip (10-20fps, inherited from each source GIF), so
    a fixed step would skip or stall depending on the technique. One container
    probes every file, since spawning one per file costs more than the probes.
    """
    media_root = root / "src" / "pages"
    videos = sorted(media_root.rglob("*.mp4"))
    if not videos:
        return 0

    rels = [str(v.relative_to(media_root)) for v in videos]
    script = (
        'for f in "$@"; do '
        'echo "$f|$(ffprobe -v error -select_streams v:0 '
        '-show_entries stream=avg_frame_rate,duration,nb_frames '
        '-of csv=p=0 "$f")"; done'
    )
    out = subprocess.run(
        ["docker", "run", "--rm", "-v", f"{media_root}:/work", "-w", "/work",
         "--entrypoint", "sh", FFMPEG_IMAGE, "-c", script, "_", *rels],
        check=True, capture_output=True, text=True,
    ).stdout

    manifest = {}
    for line in out.splitlines():
        if "|" not in line:
            continue
        rel, _, csv = line.partition("|")
        parts = [p for p in csv.split(",") if p]
        if len(parts) < 2:
            continue
        rate, duration = parts[0], parts[1]
        num, _, den = rate.partition("/")
        try:
            fps = float(num) / float(den or 1)
            dur = float(duration)
        except (ValueError, ZeroDivisionError):
            continue
        if fps <= 0:
            continue
        key = rel[:-4]  # drop .mp4; components rebuild this from belt + name
        manifest[key] = {"fps": round(fps, 3), "duration": round(dur, 3)}

    dst = media_root / "media-manifest.json"
    dst.write_text(json.dumps(manifest, indent=1, sort_keys=True) + "\n")
    return len(manifest)


def mb(n: int) -> str:
    return f"{n / 1048576:.1f} MB"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--crf", type=int, default=28,
                        help="x264 quality, lower is better/bigger (default 28)")
    parser.add_argument("--jobs", type=int, default=4,
                        help="parallel encodes (default 4)")
    parser.add_argument("--force", action="store_true",
                        help="rebuild even if outputs are up to date")
    parser.add_argument("--dry-run", action="store_true",
                        help="list what would be done, encode nothing")
    args = parser.parse_args()

    root = project_root()

    if not args.dry_run and not shutil.which("docker"):
        print("ERROR: docker not found; it is needed to run ffmpeg.", file=sys.stderr)
        return 1

    gifs = find_gifs(root)
    if not gifs:
        print("No GIFs found.")
        return 1

    total_src = sum(g.stat().st_size for g in gifs)
    print(f"Found {len(gifs)} GIFs, {mb(total_src)} total")
    print(f"crf={args.crf}  jobs={args.jobs}"
          f"{'  (dry run)' if args.dry_run else ''}\n")

    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futures = {
            pool.submit(process, g, root, args.crf, args.force, args.dry_run): g
            for g in gifs
        }
        for i, fut in enumerate(concurrent.futures.as_completed(futures), 1):
            res = fut.result()
            results.append(res)
            rel = res["gif"].relative_to(root)
            if res["error"]:
                print(f"[{i}/{len(gifs)}] FAIL {rel}\n        {res['error']}")
            elif not res["actions"] or res["actions"] == []:
                print(f"[{i}/{len(gifs)}] skip {rel}")
            else:
                out = res["video_bytes"] + res["poster_bytes"]
                shrink = f"{res['src_bytes'] / out:.0f}x" if out else "-"
                print(f"[{i}/{len(gifs)}] ok   {rel}  "
                      f"{mb(res['src_bytes'])} -> {mb(out)}  ({shrink})  "
                      f"[{'+'.join(res['actions'])}]")

    failures = [r for r in results if r["error"]]
    stills = [r for r in results if not r["animated"] and not r["error"]]
    total_out = sum(r["video_bytes"] + r["poster_bytes"] for r in results)
    total_posters = sum(r["poster_bytes"] for r in results)

    print("\n" + "=" * 60)
    print(f"Source GIFs      : {mb(total_src)}")
    if not args.dry_run:
        print(f"MP4 + posters    : {mb(total_out)}")
        print(f"Posters only     : {mb(total_posters)}  <- what the grid loads")
        if total_out:
            print(f"Overall shrink   : {total_src / total_out:.0f}x")
    if stills:
        print(f"\nSingle-frame GIFs (poster only, no video): {len(stills)}")
        for r in stills:
            print(f"  - {r['gif'].relative_to(root)}")
    if not args.dry_run:
        count = write_manifest(root)
        print(f"\nWrote media-manifest.json ({count} videos)")

    if failures:
        print(f"\nFAILED: {len(failures)}")
        for r in failures:
            print(f"  - {r['gif'].relative_to(root)}: {r['error']}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
