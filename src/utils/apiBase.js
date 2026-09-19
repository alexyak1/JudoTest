// Every call site used to build its own `http://${hostname}:8787`. That pinned
// the whole app to http: on an https page the browser blocks a plain-http XHR
// as mixed content, which is why the app used to force itself back down to
// http on boot. Resolving the base once, here, makes the https migration a
// config change instead of a sweep through sixteen files.
//
// Over https the API is expected behind the nginx /api proxy on the same
// origin, so it inherits the certificate and there is no CORS or mixed-content
// problem. Over http nothing changes: the backend is still on :8787.
const { protocol, hostname } = window.location;

export const API_BASE =
  process.env.REACT_APP_API_BASE ||
  (protocol === 'https:' ? `https://${hostname}/api` : `http://${hostname}:8787`);

export default API_BASE;
