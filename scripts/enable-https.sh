#!/bin/bash
#
# HTTPS setup for judoquiz.com. Run ON THE SERVER, as root, from
# /root/judoquiz/JudoTest.
#
# nginx.conf is the TLS config and is what gets deployed. It cannot start
# without a certificate, and certbot cannot issue a certificate without nginx
# answering an http challenge -- so on a machine with no certificate this
# writes a throwaway self-signed one purely to get nginx up, then lets certbot
# replace it. That is why there is no second "http-only" config to swap around.
#
# Safe to re-run: certbot skips a certificate that is still valid, and the
# self-signed placeholder is only ever written when nothing else is there.

set -euo pipefail

DOMAIN="judoquiz.com"
EMAIL="iakimchuk.a@gmail.com"
WEBROOT="/var/www/certbot"
LIVE="/etc/letsencrypt/live/$DOMAIN"

log() { echo -e "\033[0;32m[$(date +%H:%M:%S)]\033[0m $1"; }
fail() { echo -e "\033[0;31m[ERROR]\033[0m $1"; exit 1; }

[ "$(id -u)" -eq 0 ] || fail "Run as root."
[ -f nginx.conf ] || fail "Run from the JudoTest directory."

# --- 1. certbot -------------------------------------------------------------
if ! command -v certbot >/dev/null 2>&1; then
    log "Installing certbot..."
    apt-get update -qq && apt-get install -y -qq certbot
fi

# --- 2. Placeholder certificate, only if there is nothing at all ------------
# Without this, a fresh machine deadlocks: no cert means nginx will not start,
# and nginx not starting means the ACME challenge cannot be answered.
if [ ! -f "$LIVE/fullchain.pem" ]; then
    log "No certificate yet -- writing a temporary self-signed one so nginx can start..."
    mkdir -p "$LIVE"
    openssl req -x509 -newkey rsa:2048 -nodes -days 1 \
        -subj "/CN=$DOMAIN" \
        -keyout "$LIVE/privkey.pem" \
        -out "$LIVE/fullchain.pem" 2>/dev/null
    log "Placeholder written. certbot will replace it below."
fi

# --- 3. Webroot for the ACME challenge --------------------------------------
log "Preparing ACME webroot at $WEBROOT..."
mkdir -p "$WEBROOT/.well-known/acme-challenge"
chmod -R 755 "$WEBROOT"

# Rebuild, don't just restart. nginx.conf is baked into the image by the
# Dockerfile, so `up -d` alone will happily keep running a stale image --
# including one from a failed attempt that cannot start, which leaves port 80
# dead and makes the challenge check below fail for an unrelated reason.
log "Rebuilding the container so it matches the current config..."
docker compose build

# Validate through the SERVICE, not a stock nginx image run as root: this
# inherits the real image, user, volumes and extra_hosts, so a permission or
# name-resolution problem surfaces here instead of after the container is live.
log "Validating nginx.conf in the real image..."
docker compose run --rm --entrypoint nginx judo-quiz-app -t \
    || fail "nginx.conf failed validation. Nothing restarted."

docker compose up -d

log "Verifying the challenge path is reachable over http..."
echo "ok" > "$WEBROOT/.well-known/acme-challenge/preflight"
sleep 3
if ! curl -fsS -m 10 "http://$DOMAIN/.well-known/acme-challenge/preflight" | grep -q ok; then
    rm -f "$WEBROOT/.well-known/acme-challenge/preflight"
    echo "Recent container logs:"
    docker compose logs --tail=30 judo-quiz-app || true
    fail "Challenge path not reachable over http. Logs above."
fi
rm -f "$WEBROOT/.well-known/acme-challenge/preflight"
log "Challenge path OK."

# --- 4. Issue (or renew) the certificate ------------------------------------
log "Requesting certificate for $DOMAIN and www.$DOMAIN..."
certbot certonly \
    --webroot -w "$WEBROOT" \
    -d "$DOMAIN" -d "www.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos --no-eff-email --non-interactive \
    --keep-until-expiring

# certbot leaves its own files root-owned at 0600. That is correct and needs no
# loosening: the Dockerfile lets nginx's MASTER process run as root so it can
# read the key, then nginx forks workers as the unprivileged nginx user.
log "Reloading nginx to pick up the certificate..."
docker exec judo-quiz-frontend nginx -s reload

# --- 5. Confirm it actually works from outside ------------------------------
log "Waiting for HTTPS to answer..."
HTTPS_OK=0
for _ in 1 2 3 4 5 6; do
    if curl -fsS -m 10 -o /dev/null "https://$DOMAIN/"; then HTTPS_OK=1; break; fi
    sleep 3
done

if [ "$HTTPS_OK" -eq 1 ]; then
    log "HTTPS is live."
else
    # nginx broken, or port blocked on the way in? Opposite problems needing
    # opposite fixes, so ask the container directly rather than guessing.
    if docker exec judo-quiz-frontend curl -sk -o /dev/null -m 5 https://127.0.0.1/; then
        echo
        echo "nginx IS serving TLS inside the container, but 443 is unreachable"
        echo "from outside. That is a firewall, not this config. Open 443/tcp in"
        echo "the Hetzner cloud firewall (and 'ufw allow 443/tcp' if ufw is on)."
        exit 1
    fi
    echo
    echo "nginx is NOT serving TLS. Recent logs:"
    docker compose logs --tail=30 judo-quiz-app || true
    fail "TLS did not come up. Logs above."
fi

# --- 6. Renewal -------------------------------------------------------------
# certbot's own timer handles renewal; it only needs nginx to keep serving the
# webroot over http, which the TLS config still does. The container just has to
# be told to pick up the new file.
log "Installing renewal hook..."
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-judoquiz.sh <<'HOOK'
#!/bin/bash
# nginx's master runs as root here, so a renewed key needs no permission fixups.
docker exec judo-quiz-frontend nginx -s reload
HOOK
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-judoquiz.sh

log "Done. Verify renewal with: certbot renew --dry-run"
