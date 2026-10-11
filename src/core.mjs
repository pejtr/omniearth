// External, provider-owned map services. Never embed/scrape proprietary basemaps.
export function point(p){
 if(!p||!Number.isFinite(p.lat)||!Number.isFinite(p.lng)||Math.abs(p.lat)>90||Math.abs(p.lng)>180)throw Error('INVALID_WGS84');
 return p;
}
const xy=p=>p.lat.toFixed(6)+','+p.lng.toFixed(6);
const yx=p=>p.lng.toFixed(6)+','+p.lat.toFixed(6);
export function viewLinks(p,zoom=15){
 point(p);
 const google=new URL('https://www.google.com/maps/search/');
 google.searchParams.set('api','1');google.searchParams.set('query',xy(p));
 const mapy=new URL('https://mapy.com/fnc/v1/showmap');
 mapy.searchParams.set('center',yx(p));mapy.searchParams.set('zoom',String(Math.max(1,Math.min(19,Math.round(zoom)||15))));mapy.searchParams.set('marker','true');mapy.searchParams.set('mapset','basic');
 const travel=new URL('https://www.lastminutedovolene.cz/');
 travel.searchParams.set('utm_source','omniearth');travel.searchParams.set('utm_medium','referral');travel.searchParams.set('utm_campaign','open-maps');
 const partner=new URL('https://www.optimateo.com/');
 partner.searchParams.set('utm_source','omniearth');partner.searchParams.set('utm_medium','referral');partner.searchParams.set('utm_campaign','open-spatial');
 return {google:google.toString(),mapy:mapy.toString(),travel:travel.toString(),partner:partner.toString()};
}
export function searchLinks(query,p,zoom=15){
 const q=String(query||'').trim().slice(0,160);if(q.length<2)throw Error('SEARCH_QUERY_REQUIRED');
 point(p);
 const google=new URL('https://www.google.com/maps/search/');
 google.searchParams.set('api','1');google.searchParams.set('query',q);
 const mapy=new URL('https://mapy.com/fnc/v1/search');
 mapy.searchParams.set('query',q);mapy.searchParams.set('center',yx(p));mapy.searchParams.set('zoom',String(Math.min(19,Math.max(1,Math.round(zoom)||15))));
 return {google:google.toString(),mapy:mapy.toString()};
}
const modes={walking:['walking','foot_fast'],driving:['driving','car_fast_traffic'],cycling:['bicycling','bike_road'],transit:['transit',null]};
export function routesTo(p,{mode='walking',origin=null}={}){
 point(p);if(!Object.hasOwn(modes,mode))throw Error('UNSUPPORTED_MODE');if(origin)point(origin);
 const google=new URL('https://www.google.com/maps/dir/');
 google.searchParams.set('api','1');google.searchParams.set('destination',xy(p));google.searchParams.set('travelmode',modes[mode][0]);
 if(origin)google.searchParams.set('origin',xy(origin));
 let mapy=null;
 if(modes[mode][1]){
  const m=new URL('https://mapy.com/fnc/v1/route');m.searchParams.set('end',yx(p));m.searchParams.set('routeType',modes[mode][1]);
  if(origin)m.searchParams.set('start',yx(origin));
  mapy=m.toString();
 }
 return {google:google.toString(),mapy};
}
export function meters(a,b){
 point(a);point(b);
 const rad=Math.PI/180,R=6371000,dLat=(b.lat-a.lat)*rad,dLng=(b.lng-a.lng)*rad;
 const t=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLng/2)**2;
 return Math.round(2*R*Math.atan2(Math.sqrt(t),Math.sqrt(Math.max(0,1-t))));
}
export function publicObservation(event){
 if(!event||event.publicAuthorized!==true||event.isRedacted!==true)throw Error('EVENT_NOT_PUBLIC');
 if(typeof event.provenance!=='string'||event.provenance.length<3)throw Error('PROVENANCE_REQUIRED');
 for(const key of ['faces','licensePlate','rawVideo','audio','driverId','ownerIdentity'])if(Object.hasOwn(event,key))throw Error('PERSONAL_DATA_PROHIBITED');
 point(event);if(!Number.isFinite(Date.parse(event.observedAt)))throw Error('INVALID_TIMESTAMP');
 return {...event,description:String(event.description||'').slice(0,180)};
}
