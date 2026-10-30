export const SITE_URL = __SITE_URL__;

// Visitors who land on a free Firebase address (*.web.app / *.firebaseapp.com) are sent to the
// main site address, keeping the page they asked for. Nothing happens while SITE_URL is itself
// the .web.app address; it starts working once SITE_URL is switched to the custom domain.
const isFirebaseDefaultHost = /\.(web\.app|firebaseapp\.com)$/.test(window.location.hostname);
if (isFirebaseDefaultHost && window.location.host !== new URL(SITE_URL).host) {
  const { pathname, search, hash } = window.location;
  window.location.replace(SITE_URL + pathname + search + hash);
}
