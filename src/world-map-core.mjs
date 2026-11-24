/** OMNI WORLD MAP — portable allowlisted public spatial contract. */
export const PROJECTS=Object.freeze({
  teahub:{label:'TEAHUB GLOBAL',color:0xc6dc9e},
  travel:{label:'OMNI TRAVEL',color:0x77d6ec},
  places:{label:'OMNIEARTH+',color:0xf4c18f},
});
/** Approximate regional centres; NOT farm coordinates, verified TEAHUB partners or paid leads. */
export const REGIONAL_ANCHORS=Object.freeze([
  {id:'jp-uji',name:'Uji · Kyoto',country:'Japonsko',lat:34.89,lng:135.80,project:'teahub',kind:'tea-region',note:'Tradiční oblast japonského zeleného čaje. Žádná konkrétní farma zde zatím není ověřena.'},
  {id:'jp-shizuoka',name:'Shizuoka',country:'Japonsko',lat:34.98,lng:138.38,project:'teahub',kind:'tea-region',note:'Čajový region. Nejde o ověřený vztah s producentem.'},
  {id:'tw-nantou',name:'Nantou',country:'Tchaj-wan',lat:23.96,lng:120.97,project:'teahub',kind:'tea-region',note:'Regionální bod pro budoucí evidenci producentů a čajů.'},
  {id:'tw-taipei',name:'Taipei',country:'Tchaj-wan',lat:25.03,lng:121.56,project:'teahub',kind:'market',note:'Geografický referenční bod. Žádný obchodní partner zatím není doložen.'},
  {id:'cz-prague',name:'Praha · pilot',country:'Česko',lat:50.087,lng:14.421,project:'teahub',kind:'market',note:'Potenciální odběratelský trh, ne potvrzená objednávka.'},
  {id:'it-florence',name:'Florencie',country:'Itálie',lat:43.77,lng:11.26,project:'travel',kind:'destination',note:'Ukázkový veřejný geografický bod pro OMNI TRAVEL.'},
  {id:'ma-marrakech',name:'Marrákeš',country:'Maroko',lat:31.63,lng:-8.00,project:'travel',kind:'destination',note:'Ukázkový veřejný geografický bod pro OMNI TRAVEL.'},
  {id:'fr-paris',name:'Paříž',country:'Francie',lat:48.8566,lng:2.3522,project:'places',kind:'destination',note:'Ukázkový veřejný geografický bod pro OMNIEARTH+.'},
]);
const FORBIDDEN=['email','phone','customerEmail','customerId','customerName','passportUserId','receiptId','supplierEmail','privateNotes','accessToken','secret','contract','sourceCost','gpsTrail'];
export function validPoint(p){
 if(!p||!Number.isFinite(p.lat)||!Number.isFinite(p.lng)||p.lat < -90||p.lat>90||p.lng < -180||p.lng >180)throw Error('INVALID_WGS84');
 return p;
}
export function geoToCartesian(lat,lng,radius=1){
 validPoint({lat,lng});
 if(!Number.isFinite(radius)||radius<=0)throw Error('INVALID_RADIUS');
 const a=lat*Math.PI/180,b=lng*Math.PI/180;
 return [radius*Math.cos(a)*Math.sin(b),radius*Math.sin(a),radius*Math.cos(a)*Math.cos(b)];
}
export function publicAnchor(record){
 if(!record||typeof record!=='object')throw Error('INVALID_RECORD');
 if(!Object.hasOwn(PROJECTS,record.project))throw Error('UNKNOWN_PROJECT');
 for(const key of FORBIDDEN)if(Object.hasOwn(record,key))throw Error('PRIVATE_FIELD_'+key);
 const {id,name,country,lat,lng,kind,note,sourceUrl,verified=false}=record;
 validPoint({lat,lng});
 if(typeof id!=='string'||!(/^[a-z0-9-]{2,80}$/).test(id))throw Error('INVALID_ID');
 if(typeof name!=='string'||name.length<2||name.length>120)throw Error('INVALID_NAME');
 if(verified!==false&&verified!==true)throw Error('INVALID_VERIFIED');
 if(verified===true&&!sourceUrl)throw Error('EVIDENCE_REQUIRED');
 if(sourceUrl&&(!/^https:\/\//.test(sourceUrl)||sourceUrl.length>500))throw Error('INVALID_EVIDENCE_URL');
 return {id,name,country:String(country||'').slice(0,80),lat,lng,project:record.project,kind:String(kind||'place').slice(0,40),note:String(note||'').slice(0,300),verified,...(sourceUrl?{sourceUrl}:{})};
}
export function filterAnchors(records,projects){
 const wanted=new Set(projects);
 return records.map(publicAnchor).filter(r=>wanted.has(r.project));
}
