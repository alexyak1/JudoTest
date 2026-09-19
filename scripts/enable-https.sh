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

# --- 4. Let the container's nginx user read the key -------------------------
# certbot locks live/ and archive/ to root only. nginx runs as the unprivileged
# "nginx" user inside the container, so it cannot read privkey.pem through the
# bind mount without this. The trade-off: the key becomes readable by any local
# user on the host. Acceptable on a single-purpose box; note it and move on.
log "Opening cert directories for the container's nginx user..."
chmod 755 /etc/letsencrypt/live /etc/letsencrypt/archive

# --- 5. Swap in the TLS config ----------------------------------------------
log "Backing up the http-only config to nginx.conf.http-backup..."
cp nginx.conf nginx.conf.http-backup

# nginx resolves a literal proxy_pass hostname once, AT STARTUP, through the
# system resolver -- which reads /etc/hosts. docker-compose.yml puts
# host.docker.internal there via extra_hosts, so the test container needs the
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

log "Testing the TLS config before committing to it..."
docker run --rm "${HOST_GW[@]}" \
    -v "$PWD/nginx.ssl.conf:/etc/nginx/conf.d/default.conf:ro" \
    -v /etc/letsencrypt:/etc/letsencrypt:ro \
    nginx:alpine nginx -t \
    || fail "nginx.ssl.conf failed validation. Nothing changed; site is still up on http."

cp nginx.ssl.conf nginx.conf
log "Rebuilding and restarting with TLS..."
docker compose build && docker compose up -d

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
    echo
    echo "HTTPS did not answer from this host after ~20s."
    echo "Check the container first -- it may be a firewall on 443 rather than nginx:"
    echo "    docker compose logs --tail=30 judo-quiz-app"
    echo "    curl -sI https://$DOMAIN/    # from your laptop"
    echo
    echo "If nginx is genuinely broken, roll back with:"
    echo "    cp nginx.conf.http-backup nginx.conf && docker compose build && docker compose up -d"
    exit 1
fi

# --- 6. Renewal -------------------------------------------------------------
# Renewal only needs nginx to keep serving the webroot over http, which the TLS
# config still does. The container must be told to pick up the renewed file.
log "Installing renewal hook..."
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-judoquiz.sh <<'HOOK'
#!/bin/bash
chmod 755 /etc/letsencrypt/live /etc/letsencrypt/archive
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
