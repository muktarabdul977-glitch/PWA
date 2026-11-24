// Test News App (PWA version)
// Shows a list of articles. Tap an article to read the full text.

const DATA_CACHE = 'data-v1';          // must match the name in sw.js
const list = document.getElementById('list');
let readyMs = null;                    // time until the first article title is visible

function showArticles(articles) {
  articles.forEach(a => {
    const card = document.createElement('article');
    card.className = 'card';

    const img = document.createElement('img');
    img.src = a.image;
    img.alt = '';
    img.loading = 'lazy';              // only images near the screen are downloaded

    const box = document.createElement('div');
    box.className = 'text';
    const h = document.createElement('h2');
    h.textContent = a.title;
    const p = document.createElement('p');
    p.textContent = a.summary;
    const body = document.createElement('p');
    body.className = 'body';
    body.textContent = a.body;

    box.append(h, p, body);
    card.append(img, box);
    card.addEventListener('click', () => card.classList.toggle('open'));
    list.appendChild(card);

    // "Ready" = the first article title is on the screen.
    // performance.now() counts from the moment the page started loading.
    if (readyMs === null) {
      readyMs = -1;                     // pending until the browser has painted the title
      requestAnimationFrame(() => requestAnimationFrame(() => {
        readyMs = performance.now();
        performance.mark('first-title-visible');
      }));
    }
  });
}

async function start() {
  try {
    const res = await fetch('articles.json');
    showArticles(await res.json());
  } catch (err) {
    list.textContent = 'No connection and no saved articles yet.';
  }
}

// Keep what has already been loaded, so the second launch and offline use are fair.
async function keepLoadedItems() {
  if (!('caches' in window)) return;
  const cache = await caches.open(DATA_CACHE);
  const urls = ['articles.json', ...[...document.images].map(i => i.currentSrc).filter(Boolean)];
  await Promise.all(urls.map(async u => {
    if (!(await cache.match(u))) { try { await cache.add(u); } catch (e) { /* offline: ignore */ } }
  }));
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('sw.js');
      await navigator.serviceWorker.ready;
      keepLoadedItems();
    } catch (e) { /* service worker not available */ }
  });
}

// Optional measurement panel: open the app with ?metrics=1 at the end of the address.
// The panel refreshes every second for 30 seconds, so on slow networks you can read the
// final values once loading has finished (wait until the numbers stop changing).
function showMetrics() {
  if (!new URLSearchParams(location.search).has('metrics')) return;
  const box = document.getElementById('metrics');
  box.hidden = false;
  let bytesAtReady = null;
  const started = performance.now();

  async function update() {
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    const bytes = (nav ? nav.transferSize : 0) + res.reduce((s, r) => s + (r.transferSize || 0), 0);
    if (bytesAtReady === null && readyMs !== null && readyMs >= 0) bytesAtReady = bytes;
    let storage = 'n/a';
    if (navigator.storage && navigator.storage.estimate) {
      const e = await navigator.storage.estimate();
      storage = (e.usage / 1024 / 1024).toFixed(2) + ' MB';
    }
    const ready = (readyMs === null || readyMs < 0) ? 'waiting...' : readyMs.toFixed(0) + ' ms';
    box.textContent =
      'Ready (first title painted): ' + ready + '\n' +
      'Network bytes at ready: ' + (bytesAtReady === null ? 'waiting...' : (bytesAtReady / 1024).toFixed(1) + ' KB') + '\n' +
      'Network bytes now: ' + (bytes / 1024).toFixed(1) + ' KB (cache hits count as 0)\n' +
      'Storage used by this site: ' + storage + '\n' +
      'Service worker controlling page: ' + (navigator.serviceWorker && navigator.serviceWorker.controller ? 'yes' : 'no') + '\n' +
      'Seconds since start: ' + ((performance.now() - started) / 1000).toFixed(0);
  }
  const timer = setInterval(update, 1000);
  setTimeout(() => clearInterval(timer), 30000);
  update();
}

start();
showMetrics();
