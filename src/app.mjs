import {viewLinks,searchLinks,routesTo,meters,point,premiumKatastrLink} from './core.mjs';
const centers={
 pardubice:{lat:50.0383,lng:15.7792,name:'Pardubice — centrum',zoom:14},
 prague:{lat:50.0878,lng:14.4203,name:'Praha — centrum',zoom:14},
 paris:{lat:48.8566,lng:2.3522,name:'Paříž — centrum',zoom:13}
};
const demo={
 pardubice:[{lat:50.0355,lng:15.7697,info:'DEMO: fiktivní dopravní událost'},{lat:50.0469,lng:15.7823,info:'DEMO: fiktivní omezení'}],
 prague:[{lat:50.0884,lng:14.4167,info:'DEMO: fiktivní upozornění'}],
 paris:[{lat:48.8606,lng:2.3376,info:'DEMO: fiktivní událost'}]
};
const trail={
 pardubice:[[50.0356,15.7701],[50.0364,15.7732],[50.0373,15.7766],[50.0381,15.7795],[50.0388,15.7824]],
 prague:[[50.0846,14.4167],[50.0860,14.4180],[50.0875,14.4195],[50.0884,14.4213]],
 paris:[[48.8549,2.3459],[48.8553,2.3475],[48.8557,2.3500],[48.8566,2.3522]]
};
const $=id=>document.getElementById(id);
const st={city:'pardubice',map:null,selected:{...centers.pardubice},marks:[],pin:null,vehicle:null,poly:null,events:true,timer:null,step:0,gpsWatch:null,gps:null,gpsPin:null,gpsCircle:null};
function labels(){
 const p=point(st.selected),links=viewLinks(p,st.map?st.map.getZoom():p.zoom||15);
 $('point-name').textContent=p.name||'Vybraný bod mapy';
 $('point-coords').textContent=p.lat.toFixed(5)+', '+p.lng.toFixed(5);
 $('link-google').href=links.google;$('link-mapy').href=links.mapy;
 $('link-travel').href=links.travel;$('link-partner').href=links.partner;
 const premiumLink=premiumKatastrLink(p,st.map?st.map.getZoom():p.zoom||15);
 const katastr=$('link-katastr');
 if(premiumLink){katastr.href=premiumLink;katastr.hidden=false;}
 else{katastr.removeAttribute('href');katastr.hidden=true;}

 const r=routesTo(p,{mode:$('mode').value,origin:st.gps});
 $('route-google').href=r.google;$('route-mapy').href=r.mapy||'#';
 $('route-mapy').setAttribute('aria-disabled',String(!r.mapy));
 $('route-mapy').tabIndex=r.mapy?0:-1;
 $('distance').textContent=st.gps?'Přímá vzdálenost '+meters(st.gps,p).toLocaleString('cs-CZ')+' m (NE délka navigační trasy). Přesnost GPS ±'+Math.round(st.gps.accuracy)+' m.':'Zapni GPS pro přímou vzdálenost od své polohy. Trasu vypočítá poskytovatel mapy.';
 const q=$('place-query').value.trim();
 if(q.length>=2){try{$('google-search').href=searchLinks(q,p).google;$('google-search').removeAttribute('aria-disabled');}catch{}}
 else{$('google-search').href='#';$('google-search').setAttribute('aria-disabled','true');}
}
function markerStyle(bg){return window.L.divIcon({html:'<span class="pin" style="background:'+bg+'"></span>',iconSize:[20,20],iconAnchor:[10,10],className:'no-marker'});}
function halt(){if(st.timer!==null)clearInterval(st.timer);st.timer=null;$('animate').textContent='▶ Přehrát demo';$('animate').setAttribute('aria-pressed','false');}
function city(name){
 if(!centers[name])return;halt();st.city=name;st.step=0;st.selected={...centers[name]};$('city').value=name;
 $('city-description').textContent=st.selected.name+' — pouze demo';
 if(st.map){
  const L=window.L;
  st.map.setView([st.selected.lat,st.selected.lng],st.selected.zoom);
  st.marks.forEach(m=>m.remove());st.marks=[];
  demo[name].forEach(e=>{const m=L.marker([e.lat,e.lng],{icon:markerStyle('#b48b55')}).bindPopup(e.info);st.marks.push(m);if(st.events)m.addTo(st.map)});
  if(st.poly)st.poly.remove();if(st.vehicle)st.vehicle.remove();
  st.poly=L.polyline(trail[name],{color:'#2669b6',dashArray:'6 10',weight:3,opacity:.58}).addTo(st.map);
  st.vehicle=L.marker(trail[name][0],{icon:markerStyle('#2e76c6')}).addTo(st.map).bindPopup('DEMO: simulované vozidlo — nikoliv reálná GPS.');
  if(st.pin){st.pin.remove();st.pin=null}
 }
 labels();
}
function select(p){
 st.selected={lat:p.lat,lng:p.lng,name:'Vybraný bod'};
 if(st.map){if(st.pin)st.pin.remove();st.pin=window.L.marker([p.lat,p.lng],{icon:markerStyle('#1d3549')}).addTo(st.map)}
 labels();
}
function initialize(){
 labels();
 if(!window.L){$('map-error').hidden=false;$('map-status').textContent='Mapová knihovna nedostupná';return;}
 const L=window.L;st.map=L.map('map',{scrollWheelZoom:false});
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'}).addTo(st.map);
 st.map.on('click',e=>select(e.latlng));st.map.on('zoomend',labels);
 $('map-status').textContent='2D OSM · syntetické body';city('pardubice');
 const params=new URLSearchParams(window.location.search);
 if(params.has('lat')&&params.has('lng')){
  const p={lat:Number(params.get('lat')),lng:Number(params.get('lng'))};
  const z=Number(params.get('z'));
  try{
   point(p);
   st.map.setView([p.lat,p.lng],Number.isFinite(z)&&z>=8&&z<=19?z:15);
   select(p);
   const option=document.createElement('option');
   option.value='shared';option.textContent='Sdílené souřadnice';
   $('city').append(option);$('city').value='shared';
   $('city-description').textContent='Sdílený bod · údaje o parcele ověřte v KATASTR ONLINE';
  }catch{$('map-status').textContent='Neplatný bod v URL; zobrazena výchozí mapa.';}
 }

}
function gpsStop(){
 if(st.gpsWatch!==null&&navigator.geolocation)navigator.geolocation.clearWatch(st.gpsWatch);
 st.gpsWatch=null;st.gps=null;
 if(st.gpsPin){st.gpsPin.remove();st.gpsPin=null}
 if(st.gpsCircle){st.gpsCircle.remove();st.gpsCircle=null}
 $('gps').textContent='◎ Zapnout GPS';$('gps-center').disabled=true;
 $('gps-message').textContent='GPS vypnutá. Poloha se neodesílá na server.';labels();
}
$('city').addEventListener('change',e=>city(e.target.value));
$('reset').addEventListener('click',()=>city(st.city));
$('toggle-demo').addEventListener('click',()=>{
 st.events=!st.events;$('toggle-demo').setAttribute('aria-pressed',String(st.events));
 if(st.map)st.marks.forEach(m=>{if(st.events)m.addTo(st.map);else m.remove()});
});
$('animate').addEventListener('click',()=>{
 if(st.timer!==null){halt();return}
 if(!st.map)return;
 if(st.step>=trail[st.city].length-1)st.step=0;
 $('animate').textContent='Ⅱ Pozastavit';$('animate').setAttribute('aria-pressed','true');
 st.timer=setInterval(()=>{st.step++;if(st.step>=trail[st.city].length){st.step=trail[st.city].length-1;halt();return;}st.vehicle?.setLatLng(trail[st.city][st.step]);},1000);
});
$('pause').addEventListener('click',halt);
$('mode').addEventListener('change',labels);
$('place-query').addEventListener('input',labels);
$('place-form').addEventListener('submit',e=>{
 e.preventDefault();
 try{
  const l=searchLinks($('place-query').value,st.selected,st.map?.getZoom()||15);
  $('search-message').textContent='Otevírám Mapy.com. Skutečné výsledky zajišťuje poskytovatel.';
  const win=window.open(l.mapy,'_blank','noopener,noreferrer');
  if(!win)$('search-message').textContent='Pokud se nic neotevře, povol otevírání odkazů v prohlížeči.';
 }catch{$('search-message').textContent='Zadej alespoň dva znaky názvu.'}
});
$('gps').addEventListener('click',()=>{
 if(st.gpsWatch!==null){gpsStop();return}
 if(!navigator.geolocation){$('gps-message').textContent='Geolokace není podporována.';return}
 if(!window.isSecureContext){$('gps-message').textContent='GPS vyžaduje HTTPS nebo localhost.';return}
 $('gps-message').textContent='Žádám o povolení polohy…';
 st.gpsWatch=navigator.geolocation.watchPosition(pos=>{
  const p={lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy};
  try{point(p)}catch{gpsStop();return}
  st.gps=p;$('gps').textContent='■ Vypnout GPS';$('gps-center').disabled=false;
  $('gps-message').textContent='GPS aktivní v tomto zařízení, přesnost ±'+Math.round(p.accuracy)+' m.';
  if(st.map){
   const L=window.L;
   if(!st.gpsPin)st.gpsPin=L.marker([p.lat,p.lng],{icon:markerStyle('#2c9c7d')}).addTo(st.map);else st.gpsPin.setLatLng([p.lat,p.lng]);
   if(!st.gpsCircle)st.gpsCircle=L.circle([p.lat,p.lng],{radius:p.accuracy,color:'#2c9c7d',weight:1,fillOpacity:.07}).addTo(st.map);
   else{st.gpsCircle.setLatLng([p.lat,p.lng]);st.gpsCircle.setRadius(p.accuracy)}
  }
  labels();
 },err=>{gpsStop();$('gps-message').textContent=err.code===1?'Povolení polohy zamítnuto.':'GPS není dostupná nebo vypršel časový limit.'},{enableHighAccuracy:true,maximumAge:10000,timeout:15000});
 $('gps').textContent='■ Vypnout GPS';
});
$('gps-center').addEventListener('click',()=>{if(st.gps&&st.map)st.map.flyTo([st.gps.lat,st.gps.lng],16,{duration:.5})});
window.addEventListener('pagehide',gpsStop);
initialize();
