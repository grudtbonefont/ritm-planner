const CACHE='ritm-lite-v1';
const CORE=['./','./index.html','./style.css','./app.js','./manifest.webmanifest','../icons/icon-192.png','../icons/icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  // same-origin under this scope: cache-first for app shell
  if(u.origin===self.location.origin){
    e.respondWith(
      caches.match(e.request).then(cached=>{
        const net=fetch(e.request).then(res=>{
          if(res&&res.ok){const clone=res.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}
          return res;
        }).catch(()=>cached);
        return cached||net;
      })
    );
  }
});
