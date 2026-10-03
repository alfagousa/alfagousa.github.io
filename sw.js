/* خدمة العمل لموقع قرية الفقوسة
   - الصفحة نفسها: الشبكة أولاً (حتى تظهر تحديثاتك فوراً)، وإذا تأخرت الشبكة 4 ثوانٍ أو انقطعت تُعرض النسخة المحفوظة.
   - الأيقونات: من الذاكرة أولاً.
   - Firebase والخطوط وGoogle Analytics: لا نتدخل فيها إطلاقاً. */
const C = 'alfagousa-v1';
const PRE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(PRE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;

  if (r.mode === 'navigate') {
    const net = fetch(r).then(res => {
      if (res && res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put('index.html', cp)); }
      return res;
    });
    const wait = new Promise(res => setTimeout(() => res(null), 4000));
    e.waitUntil(net.catch(() => {}));
    e.respondWith(
      Promise.race([net, wait])
        .then(res => res || caches.match('index.html').then(c => c || net))
        .catch(() => caches.match('index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(r).then(c => c || fetch(r).then(res => {
      if (res && res.ok) { const cp = res.clone(); caches.open(C).then(x => x.put(r, cp)); }
      return res;
    }))
  );
});
