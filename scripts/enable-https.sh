#!/bin/bash
#
# One-time HTTPS setup for judoquiz.com. Run ON THE SERVER (91.99.101.21), as
# root, from /root/judoquiz/JudoTest.
#
# Order matters: nginx refuses to start when ssl_certificate points at a file
# that is not there, so the certificate has to exist BEFORE nginx.ssl.conf is
# swapped in. Doing it the other way round takes the site down instead of
# leaving it on http.
#
# Re-runnable: certbot skips a cert that is still valid.

set -euo pipefail

DOMAIN="judoquiz.com"
EMAIL="iakimchuk.a@gmail.com"
WEBROOT="/var/www/certbot"

log() { echo -e "\033[0;32m[$(date +%H:%M:%S)]\033[0m $1"; }
fail() { echo -e "\033[0;31m[ERROR]\033[0m $1"; exit 1; }

[ "$(id -u)" -eq 0 ] || fail "Run as root."
[ -f nginx.ssl.conf ] || fail "Run from the JudoTest directory."

# --- 1. certbot on the host -------------------------------------------------
if ! command -v certbot >/dev/null 2>&1; then
    log "Installing certbot..."
    apt-get update -qq && apt-get install -y -qq certbot
fi

# --- 2. Webroot the container can serve the challenge from ------------------
log "Preparing ACME webroot at $WEBROOT..."
mkdir -p "$WEBROOT/.well-known/acme-challenge"
chmod -R 755 "$WEBROOT"

# The running container must already mount the webroot and serve
# /.well-known/acme-challenge/ over http. That is what the current nginx.conf
# and docker-compose.yml do, so deploy those first if you have not yet.
log "Restarting container so the webroot mount is present..."
docker compose up -d

log "Verifying the challenge path is reachable over http..."
echo "ok" > "$WEBROOT/.well-known/acme-challenge/preflight"
sleep 2
if ! curl -fsS "http://$DOMAIN/.well-known/acme-challenge/preflight" | grep -q ok; then
    rm -f "$WEBROOT/.well-known/acme-challenge/preflight"
    fail "Challenge path not reachable. Deploy the current nginx.conf and docker-compose.yml first, then re-run."
fi
rm -f "$WEBROOT/.well-known/acme-challenge/preflight"
log "Challenge path OK."

# --- 3. Issue the certificate ----------------------------------------------
log "Requesting certificate for $DOMAIN and www.$DOMAIN..."
certbot certonly \
    --webroot -w "$WEBROOT" \
    -d "$DOMAIN" -d "www.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos --no-eff-email --non-interactive \
    --keep-until-expiring

# nginx.ssl.conf carries its TLS settings inline, so there is nothing to fetch
# and no dhparam to generate. Just confirm certbot produced what we will mount.
for f in fullchain.pem privkey.pem; do
    [ -f "/etc/letsencrypt/live/$DOMAIN/$f" ] || fail "Missing /etc/letsencrypt/live/$DOMAIN/$f"
done
log "Certificate files present."

# --- 4. Certificate permissions ---------------------------------------------
# Nothing to do. certbot's defaults (live/ and archive/ 0700, privkey.pem 0600,
# all root-owned) are exactly right: the Dockerfile lets nginx's master process
# run as root, so it can read the key directly. An earlier version of this
# script loosened these directories to 0755 to accommodate a container running
# wholly as the nginx user -- that was the wrong end of the problem to fix.

# --- 5. Swap in the TLS config ----------------------------------------------
# Only ever back up once. On a re-run after a partial success, nginx.conf is
# already the TLS config -- copying it over the backup would destroy the only
# copy of the http-only config we can roll back to.
if [ ! -f nginx.conf.http-backup ]; then
    log "Backing up the http-only config to nginx.conf.http-backup..."
    cp nginx.conf nginx.conf.http-backup
else
    log "Existing nginx.conf.http-backup kept."
fi

restore_http() {
    log "Restoring the http-only config..."
    cp nginx.conf.http-backup nginx.conf
    docker compose build >/dev/null 2>&1 && docker compose up -d >/dev/null 2>&1
    log "Site restored on http."
}

# nginx resolves a literal proxy_pass hostname once, AT STARTUP, through the
# system resolver -- which reads /etc/hosts. docker-compose.yml puts
# host.docker.internal there via extra_hosts, so a test container needs the
# same mapping or it fails on a name the real container resolves fine.
#
# (Deliberately not switching proxy_pass to a resolver+variable to dodge this:
# nginx's `resolver` speaks DNS and ignores /etc/hosts entirely, which is the
# one place host.docker.internal exists. That would turn a startup failure into
# a runtime failure -- strictly worse.)
HOST_GW=(--add-host "host.docker.internal:host-gateway")

log "Checking the proxy target resolves and the backend answers..."
if ! docker run --rm "${HOST_GW[@]}" nginx:alpine \
        sh -c 'getent hosts host.docker.internal >/dev/null && nc -z -w5 host.docker.internal 8787'; then
    fail "Cannot reach the backend on host.docker.internal:8787 from a container.
       Check the Techniques stack is up (cd ../Techniques && docker compose ps)
       and that :8787 is published. Nothing changed; site is still up on http."
fi
log "Backend reachable."

cp nginx.ssl.conf nginx.conf

log "Building the image with the TLS config..."
docker compose build || { restore_http; fail "Image build failed."; }

# Validate through the SERVICE, not a stock nginx:alpine run as root. This
# inherits the real image, user, volumes and extra_hosts, so a permission or
# resolution problem surfaces here rather than after the swap. Validating a
# stock image as root is exactly what let earlier failures reach production.
log "Validating the TLS config in the real image..."
if ! docker compose run --rm --entrypoint nginx judo-quiz-app -t; then
    restore_http
    fail "TLS config failed validation in the real image. Site restored on http."
fi
log "Config valid in the real image."

log "Starting with TLS..."
docker compose up -d

# nginx needs a moment after the rebuild; do not call it dead on the first try.
log "Waiting for HTTPS to answer..."
HTTPS_OK=0
for _ in 1 2 3 4 5 6; do
    if curl -fsS -m 10 -o /dev/null "https://$DOMAIN/"; then HTTPS_OK=1; break; fi
    sleep 3
done

if [ "$HTTPS_OK" -eq 1 ]; then
    log "HTTPS is live."
else
    # Is nginx itself serving TLS, or is the port blocked on the way in?
    # Opposite problems needing opposite fixes, so ask the container directly.
    if docker exec judo-quiz-frontend curl -sk -o /dev/null -m 5 https://127.0.0.1/; then
        echo
        echo "nginx IS serving TLS correctly inside the container, but port 443"
        echo "is not reachable from outside. That is a firewall, not this config."
        echo "Open 443/tcp in the Hetzner cloud firewall (and ufw, if active):"
        echo "    ufw allow 443/tcp"
        echo
        echo "Leaving TLS in place -- it will work as soon as 443 is open."
        exit 1
    fi

    echo
    echo "nginx is NOT serving TLS inside the container. Recent logs:"
    docker compose logs --tail=30 judo-quiz-app || true
    restore_http
    fail "TLS did not come up. Site restored on http; logs above."
fi

# --- 6. Renewal -------------------------------------------------------------
# Renewal only needs nginx to keep serving the webroot over http, which the TLS
# config still does. The container must be told to pick up the renewed file.
log "Installing renewal hook..."
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-judoquiz.sh <<'HOOK'
#!/bin/bash
# nginx's master runs as root in this container, so the renewed key needs no
# permission fixups -- just pick it up.
docker exec judo-quiz-frontend nginx -s reload
HOOK
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-judoquiz.sh

log "Done. Verify renewal with: certbot renew --dry-run"
echo
echo "NEXT: flip the canonical URLs from http to https in these four places,"
echo "      then redeploy the frontend:"
echo "        JudoTest/src/utils/seo.js       SITE_ORIGIN"
echo "        JudoTest/public/index.html      canonical, og:url, og:image, JSON-LD"
echo "        JudoTest/public/sitemap.xml     every <loc> and hreflang href"
echo "        JudoTest/public/robots.txt      the Sitemap: line"
echo "      Also set FRONTEND_URL=https://judoquiz.com in Techniques/.env"
echo "      so account emails link to https."
