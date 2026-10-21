// Offline support for the static GitHub Pages build.
// scripts/build-sw.ts copies this into out/sw.js and puts self.__SW_CONFIG in front of it:
// { base: "/norsk-app", version: "<hash of the build>", precache: ["/norsk-app/", ...] }.
//
// Every page and asset of the build is cached on install, so the whole app works offline
// after the first visit. Precached files are served from the cache; a new deploy changes
// the version, which installs a new worker and replaces the caches.

const { base, version, precache } = self.__SW_CONFIG;
const PRECACHE = `norsk-precache-${version}`;
const RUNTIME = `norsk-runtime-${version}`;
const precached = new Set(precache);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(precache))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith("norsk-") && key !== PRECACHE && key !== RUNTIME).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(base)) return;

  if (precached.has(url.pathname)) {
    event.respondWith(cacheFirst(request, url.pathname));
  } else if (request.mode === "navigate") {
    event.respondWith(page(request, url));
  } else {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request, key) {
  const cached = await caches.match(key, { cacheName: PRECACHE });
  return cached ?? fetch(request);
}

/** Pages: network, then a cached copy of the page (with a trailing slash), then the 404 page. */
async function page(request, url) {
  try {
    return await fetch(request);
  } catch (error) {
    const path = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
    const cached = (await caches.match(path, { cacheName: PRECACHE })) ?? (await caches.match(`${base}/404.html`));
    if (cached) return cached;
    throw error;
  }
}

/** Everything else (React Server Component payloads, icons with a query string): network, then cache. */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const copy = response.clone();
      caches.open(RUNTIME).then((cache) => cache.put(request, copy));
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    throw error;
  }
}
