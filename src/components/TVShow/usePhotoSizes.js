import { useCallback, useEffect, useRef, useState } from 'react';

// How many photos are fetched at once while measuring. Competition albums can
// hold hundreds of full-size photos and a TV's browser has little memory, so
// they are loaded a few at a time rather than all together.
const CONCURRENCY = 3;

// Finds each photo's real dimensions by loading it in the background.
//
// The page has to know whether a photo is portrait or landscape before it can
// decide how to lay it out, and the API does not say. Measuring in the browser
// is also the only way to get the orientation the viewer will actually see:
// phones often store a portrait shot as landscape pixels plus an EXIF rotation
// flag, and the browser applies that flag when it reports naturalWidth/Height.
//
// Returns { [photoId]: { w, h } | null }; null means the photo failed to load.
// Photos not in the map yet are still waiting in the queue. Each load also
// warms the browser cache, so the slide is ready by the time it is shown.
//
// `photos` is newest first, and photos that arrive later are queued ahead of
// the backlog so a fresh upload reaches the screen quickly.
const usePhotoSizes = (photos, toUrl) => {
    const [sizes, setSizes] = useState({});
    const queueRef = useRef([]);
    const seenRef = useRef(new Set());
    const activeRef = useRef(new Set());
    const aliveRef = useRef(true);

    const pump = useCallback(() => {
        while (aliveRef.current && activeRef.current.size < CONCURRENCY && queueRef.current.length > 0) {
            const photo = queueRef.current.shift();
            const img = new Image();
            activeRef.current.add(img);

            const finish = (size) => {
                img.onload = null;
                img.onerror = null;
                activeRef.current.delete(img);
                if (aliveRef.current) {
                    setSizes((prev) => ({ ...prev, [photo.id]: size }));
                    pump();
                }
            };
            img.onload = () =>
                finish(
                    img.naturalWidth > 0 && img.naturalHeight > 0
                        ? { w: img.naturalWidth, h: img.naturalHeight }
                        : null
                );
            img.onerror = () => finish(null);
            img.src = toUrl(photo.url);
        }
    }, [toUrl]);

    useEffect(() => {
        const fresh = photos.filter((photo) => !seenRef.current.has(photo.id));
        if (fresh.length === 0) return;
        fresh.forEach((photo) => seenRef.current.add(photo.id));
        queueRef.current = [...fresh, ...queueRef.current];
        pump();
    }, [photos, pump]);

    useEffect(() => {
        aliveRef.current = true;
        const active = activeRef.current;
        return () => {
            aliveRef.current = false;
            active.forEach((img) => {
                img.onload = null;
                img.onerror = null;
                img.src = '';
            });
            active.clear();
        };
    }, []);

    return sizes;
};

export default usePhotoSizes;
