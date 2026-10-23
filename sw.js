const CACHE='sons-directe-v4';
const FILES=['./','./index.html','./manifest.webmanifest','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png'];
const SHELL=new Set(FILES.map(file=>new URL(file,self.registration.scope).href));
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 const request=e.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  e.respondWith(fetch(request).catch(async()=>{
   const cache=await caches.open(CACHE);
   return cache.match('./index.html');
  }));
  return;
 }
 if(!SHELL.has(url.href))return;
 e.respondWith(caches.open(CACHE).then(async cache=>{
  const hit=await cache.match(request,{ignoreSearch:true});
  if(hit)return hit;
  const response=await fetch(request);
  if(response.ok&&response.type==='basic')await cache.put(request,response.clone());
  return response;
 }));
});
