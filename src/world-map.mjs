import {PROJECTS,REGIONAL_ANCHORS,filterAnchors,geoToCartesian} from './world-map-core.mjs';

const root=document.querySelector('#omni-world');
if(!root)throw Error('OMNI_WORLD_ROOT_MISSING');
const $=selector=>root.querySelector(selector);
const loading=$('#loading'), container=$('#globe'), status=$('#globe-status');
const selection=$('#selection'), points=$('#points'), search=$('#search');
const selectedLink=$('#maps-link'), resultCount=$('#result-count');
const buttons=[...root.querySelectorAll('[data-project]')];
const state={project:'teahub',selected:'jp-uji',paused:window.matchMedia('(prefers-reduced-motion: reduce)').matches,filter:''};
let scene,renderer,camera,group,markerMeshes=[],threeModule,raycaster,resizeObserver,raf=0,dragging=false;
let lastPointerX=0,lastPointerY=0,downX=0,downY=0, cameraZ=3.6;
const toRad=Math.PI/180;
const region=()=>filterAnchors(REGIONAL_ANCHORS,[state.project]);
const visible=()=>region().filter(p=>(p.name+' '+p.country).toLocaleLowerCase('cs').includes(state.filter));
const projectColor=p=>PROJECTS[p.project].color;
const setStatus=message=>{status.textContent=message};
const mapUrl=p=>{const u=new URL('https://www.google.com/maps/search/');u.searchParams.set('api','1');u.searchParams.set('query',p.lat.toFixed(5)+','+p.lng.toFixed(5));return u.toString()};
function renderSelection(){
 const point=REGIONAL_ANCHORS.find(p=>p.id===state.selected);
 if(!point)return;
 selection.replaceChildren();
 const tag=document.createElement('span');tag.className='eyebrow';tag.textContent='VYBRANÁ LOKALITA / DEMO';
 const h=document.createElement('h3');h.textContent=point.name;
 const d=document.createElement('p');d.textContent=point.note;
 selection.append(tag,h,d);
 selectedLink.href=mapUrl(point);
}
function renderList(){
 const data=visible();
 points.replaceChildren();
 resultCount.textContent=data.length+' lokalit';
 if(!data.length){const p=document.createElement('p');p.className='empty-state';p.textContent='Žádné odpovídající lokality. Zkus jiný název.';points.append(p);return}
 for(const p of data){
  const button=document.createElement('button');button.type='button';button.className='point-row';
  button.dataset.pointId=p.id;button.setAttribute('aria-current',String(p.id===state.selected));
  const label=document.createElement('span');
  const name=document.createElement('strong');name.textContent=p.name;
  const country=document.createElement('small');country.textContent=p.country+' · regionální bod';
  label.append(name,country);
  const arrow=document.createElement('span');arrow.className='arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';
  button.append(label,arrow);button.addEventListener('click',()=>select(p.id));
  points.append(button);
 }
}
function updateMarkers(){
 if(!threeModule||!group)return;
 for(const marker of markerMeshes){group.remove(marker);marker.geometry.dispose();marker.material.dispose()}
 markerMeshes=[];
 const THREE=threeModule;
 for(const point of region()){
  const geometry=new THREE.SphereGeometry(point.id === state.selected ? 0.033 : 0.025,12,12);
  const material=new THREE.MeshBasicMaterial({color:projectColor(point)});
  const mesh=new THREE.Mesh(geometry,material);
  mesh.position.set(...geoToCartesian(point.lat,point.lng,1.032));
  mesh.userData.pointId=point.id;group.add(mesh);markerMeshes.push(mesh);
 }
}
function select(id){
 const point=REGIONAL_ANCHORS.find(p=>p.id===id);
 if(!point||point.project!==state.project)return;
 state.selected=id;renderSelection();renderList();updateMarkers();
 if(group)group.rotation.y= -point.lng*toRad;
 setStatus(point.name+' · souřadnice regionu, nikoliv farmy');
}
function setProject(project){
 if(!Object.hasOwn(PROJECTS,project))return;
 state.project=project;state.filter='';search.value='';
 state.selected=REGIONAL_ANCHORS.find(p=>p.project===project)?.id||'';
 buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.project===project)));
 renderSelection();renderList();updateMarkers();
 const p=REGIONAL_ANCHORS.find(p=>p.id===state.selected);
 if(p&&group)group.rotation.y=-p.lng*toRad;
}
buttons.forEach(button=>button.addEventListener('click',()=>setProject(button.dataset.project)));
search.addEventListener('input',()=>{state.filter=search.value.trim().toLocaleLowerCase('cs').slice(0,100);renderList()});
function syncMotion(){
 const button=$('#toggle-motion');
 button.setAttribute('aria-pressed',String(!state.paused));
 button.textContent=state.paused?'▶ Rotace':'⏸ Rotace';
}
$('#toggle-motion').addEventListener('click',()=>{state.paused=!state.paused;syncMotion()});
$('#home').addEventListener('click',()=>{setProject('teahub');select('jp-uji')});
function zoom(delta){cameraZ=Math.min(5.8,Math.max(1.75,cameraZ+delta));if(camera)camera.position.z=cameraZ}
$('#zoom-in').addEventListener('click',()=>zoom(-.35));
$('#zoom-out').addEventListener('click',()=>zoom(.35));
syncMotion();renderSelection();renderList();

function addGraticule(THREE){
 const material=new THREE.LineBasicMaterial({color:0x29515c,transparent:true,opacity:.38});
 for(let lat=-60;lat<=60;lat+=30){
  const positions=[];for(let lon=-180;lon<=180;lon+=5)positions.push(...geoToCartesian(lat,lon,1.005));
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  group.add(new THREE.Line(geo,material));
 }
 for(let lon=-180;lon<180;lon+=30){
  const positions=[];for(let lat=-90;lat<=90;lat+=5)positions.push(...geoToCartesian(lat,lon,1.005));
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  group.add(new THREE.Line(geo,material));
 }
}
function addBorders(THREE,segments){
 const mat=new THREE.LineBasicMaterial({color:0x80c4b0,opacity:.73,transparent:true});
 let total=0;
 for(const segment of segments){
  if(!Array.isArray(segment)||segment.length<2)continue;
  let part=[],prev=null;
  function draw(){
   if(part.length<2)return;
   const geometry=new THREE.BufferGeometry().setFromPoints(part);
   group.add(new THREE.Line(geometry,mat));total++;part=[];
  }
  for(const coord of segment){
   const lon=Number(coord[0]),lat=Number(coord[1]);
   if(!Number.isFinite(lon)||!Number.isFinite(lat)||Math.abs(lat)>90||Math.abs(lon)>180)continue;
   if(prev&&Math.abs(lon-prev)>180)draw();
   part.push(new THREE.Vector3(...geoToCartesian(lat,lon,1.009)));
   prev=lon;
  }
  draw();
 }
 return total;
}
async function loadWorldBorders(THREE){
 try{
  const topoModule=await import('https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm');
  const response=await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json',{cache:'force-cache'});
  if(!response.ok)throw Error('ATLAS_HTTP_'+response.status);
  const world=await response.json();
  const mesh=topoModule.mesh(world,world.objects.countries);
  const lines=mesh.type==='MultiLineString'?mesh.coordinates:[mesh.coordinates];
  addBorders(THREE,lines);setStatus('Zeměpisné hranice načteny · veřejný atlas 110m');
 }catch(err){
  setStatus('Základní glóbus funguje · hranice států nyní nejsou dostupné');
 }
}
function buildStars(THREE){
 const pts=[];let seed=7291;
 for(let i=0;i<420;i++){
  seed=(seed*16807)%2147483647;const u=seed/2147483647;
  seed=(seed*16807)%2147483647;const v=seed/2147483647;
  const a=u*Math.PI*2,b=Math.acos(2*v-1),r=8;
  pts.push(r*Math.sin(b)*Math.cos(a),r*Math.cos(b),r*Math.sin(b)*Math.sin(a));
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
 const dots=new THREE.Points(geometry,new THREE.PointsMaterial({size:.012,color:0x9bcac3,transparent:true,opacity:.52}));
 scene.add(dots);
}
async function init3D(){
 try{
  const THREE=await import('https://cdn.jsdelivr.net/npm/three@0.170.0/+esm');
  threeModule=THREE;
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(43,1,.1,25);
  camera.position.set(0,0,cameraZ);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(1.75,window.devicePixelRatio||1));
  renderer.setClearColor(0x000000,0);
  const w=container.clientWidth||500,h=container.clientHeight||510;
  renderer.setSize(w,h);
  camera.aspect=w/h;camera.updateProjectionMatrix();
  container.replaceChildren(renderer.domElement);
  group=new THREE.Group();scene.add(group);
  const planet=new THREE.Mesh(new THREE.SphereGeometry(1,64,48),new THREE.MeshPhongMaterial({color:0x123d47,emissive:0x0a242c,shininess:24,specular:0x25767a}));
  group.add(planet);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(1.022,48,48),new THREE.MeshBasicMaterial({color:0x4f9896,transparent:true,opacity:.065,depthWrite:false}));
  group.add(glow);
  const light=new THREE.DirectionalLight(0xdaf7d5,2.2);light.position.set(3,2,5);scene.add(light);
  scene.add(new THREE.AmbientLight(0x537e8b,1.5));
  buildStars(THREE);addGraticule(THREE);updateMarkers();
  const point=REGIONAL_ANCHORS.find(p=>p.id===state.selected);
  group.rotation.y=-(point?.lng||0)*toRad;
  raycaster=new THREE.Raycaster();
  renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;downX=e.clientX;downY=e.clientY;lastPointerX=e.clientX;lastPointerY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});
  renderer.domElement.addEventListener('pointermove',e=>{
   if(!dragging)return;
   const dx=e.clientX-lastPointerX,dy=e.clientY-lastPointerY;
   group.rotation.y+=dx*.005;
   group.rotation.x=Math.max(-.65,Math.min(.65,group.rotation.x+dy*.0025));
   lastPointerX=e.clientX;lastPointerY=e.clientY;
  });
  renderer.domElement.addEventListener('pointerup',e=>{
   if(!dragging)return;
   dragging=false;
   if(renderer.domElement.hasPointerCapture(e.pointerId))renderer.domElement.releasePointerCapture(e.pointerId);
   if(Math.abs(e.clientX-downX)>8||Math.abs(e.clientY-downY)>8)return;
   const rect=renderer.domElement.getBoundingClientRect();
   const pointer=new THREE.Vector2(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
   raycaster.setFromCamera(pointer,camera);
   const hit=raycaster.intersectObjects(markerMeshes,false)[0];
   if(hit?.object?.userData?.pointId)select(hit.object.userData.pointId);
  });
  renderer.domElement.addEventListener('pointercancel',()=>{dragging=false});
  resizeObserver=new ResizeObserver(entries=>{
   const box=entries[0]?.contentRect;if(!box||box.width<1)return;
   const w=box.width,h=box.height;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
  });
  resizeObserver.observe(container);
  let last=performance.now();
  const loop=t=>{
   if(!root.isConnected){cancelAnimationFrame(raf);resizeObserver?.disconnect();renderer?.dispose();return}
   const delta=Math.min(80,Math.max(0,t-last));last=t;
   if(!state.paused&&!dragging&&document.visibilityState==='visible')group.rotation.y+=delta*.00006;
   renderer.render(scene,camera);
   raf=requestAnimationFrame(loop);
  };
  raf=requestAnimationFrame(loop);
  setStatus('Interaktivní glóbus připraven · veřejné referenční body');
  void loadWorldBorders(THREE);
 }catch(err){
  container.replaceChildren();
  const fallback=document.createElement('p');
  fallback.className='fallback-text';
  fallback.textContent='3D grafika není v tomto prohlížeči dostupná. Lokalitu stále vybereš ze seznamu.';
  container.append(fallback);
  setStatus('Režim seznamu · WebGL nebo externí knihovna nedostupná');
  $('#zoom-in').disabled=true;$('#zoom-out').disabled=true;$('#toggle-motion').disabled=true;$('#home').disabled=true;
 }
}
void init3D();
