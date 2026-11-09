import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import {CountryLabels} from './country-labels.js';
import './country-labels.css';

const GREEN = 0x53dfb5, RED = 0xff7777;
export function latLon(lat, lon, radius = 2) {
  const a = lat * Math.PI / 180, b = lon * Math.PI / 180;
  return new THREE.Vector3(radius * Math.cos(a) * Math.cos(b), radius * Math.sin(a), -radius * Math.cos(a) * Math.sin(b));
}
export class GlobeScene {
  constructor(container, clusters, onSelect, onPerformance) {
    this.container = container; this.clusters = clusters; this.onSelect = onSelect; this.onPerformance = onPerformance;
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.scene = new THREE.Scene(); this.scene.background=new THREE.Color(0x090f16); this.camera = new THREE.PerspectiveCamera(38, 1, .1, 100); this.camera.position.set(0, .4, 7.1);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.pixelRatio = Math.min(devicePixelRatio, 1.7); this.renderer.setPixelRatio(this.pixelRatio); this.renderer.setClearColor(0, 0);
    container.prepend(this.renderer.domElement); this.renderer.domElement.setAttribute('aria-label','Interactive 3D globe. Drag to rotate, scroll to zoom, or select a cluster from the list.');
    this.controls = new OrbitControls(this.camera, this.renderer.domElement); this.controls.enableDamping = true; this.controls.enablePan = false; this.controls.minDistance = 2.7; this.controls.maxDistance = 11; this.controls.autoRotate = !this.reducedMotion; this.controls.autoRotateSpeed = .16;
    this.globe = new THREE.Group(); this.scene.add(this.globe);
    this.network = new THREE.Group(); this.threats = new THREE.Group(); this.compliance = new THREE.Group(); this.markers = new THREE.Group(); this.explorerMarkers=new THREE.Group();this.overlayMarkers=new THREE.Group();this.packets = [];
    this.buildEarth(); this.globe.add(this.network, this.threats, this.compliance, this.markers,this.explorerMarkers,this.overlayMarkers);
    this.buildNetwork(); this.buildStars(); this.buildCity();
    this.composer = new EffectComposer(this.renderer); this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .7, .5, .65); this.composer.addPass(this.bloom); this.composer.addPass(new OutputPass());
    this.raycaster = new THREE.Raycaster(); this.pointer = new THREE.Vector2();
    this.renderer.domElement.addEventListener('pointerdown', e => { this.down = [e.clientX,e.clientY]; });
    this.renderer.domElement.addEventListener('pointerup', e => { if (!this.down || Math.hypot(e.clientX-this.down[0],e.clientY-this.down[1]) > 5 || this.cityMode) return; const r = container.getBoundingClientRect(); this.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1); this.raycaster.setFromCamera(this.pointer,this.camera);const group=this.explorerActive?this.explorerMarkers:this.markers;const targets=[...(group.visible?group.children:[]),...this.overlayMarkers.children].filter(m=>m.visible&&m.isMesh); const hit = this.raycaster.intersectObjects(targets).find(h => h.point.clone().normalize().dot(this.camera.position.clone().normalize()) > .18); if(hit){const pin=hit.object.userData.pins?.[hit.instanceId]??hit.object.userData.pin;if(hit.object.userData.overlay)this.overlayPick?.(pin);else if(this.explorerActive)this.explorerPick?.(pin);else onSelect(hit.object.userData.cluster);} });
    this.resizeObserver = new ResizeObserver(() => this.resize()); this.resizeObserver.observe(container); this.resize();
    this.frames = 0; this.lastSample = performance.now(); this.lastFrame = this.lastSample; this.running = true; this.animate();this.countryLabelsVisible=true;try{this.countryLabelsVisible=localStorage.getItem('cognitivegeo-country-labels')!=='off';}catch{}fetch(import.meta.env.BASE_URL+'countries.json').then(r=>{if(!r.ok)throw Error('Country labels unavailable');return r.json();}).then(data=>{if(!this.running)return;this.countryLabels=new CountryLabels(this,data.entries);this.countryLabels.setVisible(this.countryLabelsVisible);}).catch(()=>{});
    this.renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); this.running=false; onPerformance({fps:0,quality:'Context lost · reload',memory:null}); });
    document.addEventListener('visibilitychange', () => {this.lastSample = performance.now();this.frames=0;});
  }
  buildEarth() {
    const map = document.createElement('canvas'); map.width=2048; map.height=1024; const ctx=map.getContext('2d');
    const countries = feature(world,world.objects.countries).features;
    ctx.fillStyle='#0b1b24';ctx.fillRect(0,0,2048,1024);ctx.fillStyle='#1a463f'; ctx.strokeStyle='#477d6c'; ctx.lineWidth=.65;
    for(const c of countries) { const polys=c.geometry.type==='Polygon'?[c.geometry.coordinates]:c.geometry.coordinates; for(const polygon of polys) { ctx.beginPath(); for(const ring of polygon) {ring.forEach(([lon,lat],i)=>{const x=(lon+180)/360*2048,y=(90-lat)/180*1024;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();}ctx.fill('evenodd');ctx.stroke(); } }
    const texture=new THREE.CanvasTexture(map); texture.colorSpace=THREE.SRGBColorSpace;
    this.earthLOD=new THREE.LOD();
    const material=new THREE.MeshBasicMaterial({map:texture,color:0x80b9a7});
    this.earthLOD.addLevel(new THREE.Mesh(new THREE.SphereGeometry(2,96,64),material),0);this.earthLOD.addLevel(new THREE.Mesh(new THREE.SphereGeometry(2,40,24),material),9);this.globe.add(this.earthLOD);
    const pixels=ctx.getImageData(0,0,2048,1024).data;const positions=[];
    for(let i=0;i<40000;i++){const y=1-2*(i+.5)/40000,lat=Math.asin(y)*180/Math.PI,lon=((i*137.507764)%360)-180;const x=Math.min(2047,Math.floor((lon+180)/360*2048)),py=Math.min(1023,Math.floor((90-lat)/180*1024));if(pixels[(py*2048+x)*4+1]>50){const p=latLon(lat,lon,2.008);positions.push(p.x,p.y,p.z);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));this.landDots=new THREE.Points(geo,new THREE.PointsMaterial({color:0x77bda0,size:.011,transparent:true,opacity:.65}));this.globe.add(this.landDots);
    const grid=[];for(let lat=-75;lat<=75;lat+=15){for(let lon=-180;lon<180;lon+=2){grid.push(...latLon(lat,lon,2.015).toArray(),...latLon(lat,lon+2,2.015).toArray());}}for(let lon=-180;lon<180;lon+=15){for(let lat=-90;lat<90;lat+=2){grid.push(...latLon(lat,lon,2.015).toArray(),...latLon(lat+2,lon,2.015).toArray());}}
    const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(grid,3));this.globe.add(new THREE.LineSegments(gg,new THREE.LineBasicMaterial({color:0x29524e,transparent:true,opacity:.27})));
    this.globe.add(new THREE.Mesh(new THREE.SphereGeometry(2.055,64,48),new THREE.ShaderMaterial({uniforms:{glowColor:{value:new THREE.Color(0x35ab90)}},vertexShader:'varying vec3 vNormal; varying vec3 vPosition; void main(){ vNormal=normalize(normalMatrix*normal);vPosition=(modelViewMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*vec4(vPosition,1.0);}',fragmentShader:'uniform vec3 glowColor; varying vec3 vNormal; varying vec3 vPosition; void main(){float a=pow(1.0-abs(dot(normalize(vNormal),normalize(-vPosition))),4.0);gl_FragColor=vec4(glowColor,a*0.4);}',side:THREE.BackSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})));
    const ring=new THREE.Mesh(new THREE.RingGeometry(2.33,2.336,160),new THREE.MeshBasicMaterial({color:0x315852,side:THREE.DoubleSide,transparent:true,opacity:.45}));ring.rotation.x=Math.PI/2.4;this.globe.add(ring);
  }
  buildNetwork() {
    const sphere=new THREE.SphereGeometry(.027,12,8);
    this.clusters.forEach((c,i)=>{const color=c.cybersecurity.activeThreatLevel==='HIGH'?RED:c.cybersecurity.activeThreatLevel==='MEDIUM'?0xf1bb65:GREEN;const marker=new THREE.Mesh(sphere,new THREE.MeshBasicMaterial({color}));marker.position.copy(latLon(...c.coordinates,2.035));marker.userData.cluster=c;this.markers.add(marker);
      const ring=new THREE.Mesh(new THREE.RingGeometry(.045,.055,32),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.65}));ring.position.copy(marker.position);ring.lookAt(marker.position.clone().multiplyScalar(2));this.network.add(ring);
      const boundary=new THREE.Mesh(new THREE.RingGeometry(.11,.115,48),new THREE.MeshBasicMaterial({color:0x89a7ff,side:THREE.DoubleSide,transparent:true,opacity:.8}));boundary.position.copy(latLon(...c.coordinates,2.025));boundary.lookAt(boundary.position.clone().multiplyScalar(2));this.compliance.add(boundary);
      if(i>0)this.addArc(c,this.clusters[i%3],i%4===0?this.threats:this.network,i%4===0?RED:GREEN,i);
    }); this.compliance.visible=false;
    // One batched draw call for 12,846 simulated runtime vectors.
    const pos=[],colors=[];let seed=121;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
    this.capacity=63316;
    for(let i=0;i<this.capacity;i++){const c=this.clusters[i%this.clusters.length];const p=latLon(c.coordinates[0]+(rand()-.5)*9,c.coordinates[1]+(rand()-.5)*12,2.023);pos.push(...p.toArray());const color=new THREE.Color(this.metricColor(c));colors.push(color.r,color.g,color.b);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setDrawRange(0,12846);this.density=new THREE.Points(geo,new THREE.PointsMaterial({size:.009,vertexColors:true,transparent:true,opacity:.65}));this.runtimePositions=pos;this.runtimeColors=colors;this.runtimeCount=this.capacity;this.network.add(this.density);
  }
  addArc(a,b,group,color,i=0){const start=latLon(...a.coordinates,2.04),end=latLon(...b.coordinates,2.04);const angle=start.angleTo(end);const middle=start.clone().add(end).normalize().multiplyScalar(2.1+angle*.55);const curve=new THREE.QuadraticBezierCurve3(start,middle,end);const geo=new THREE.BufferGeometry().setFromPoints(curve.getPoints(64));group.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color,transparent:true,opacity:.45})));const packet=new THREE.Mesh(new THREE.SphereGeometry(.018,6,4),new THREE.MeshBasicMaterial({color}));group.add(packet);this.packets.push({packet,curve,offset:i*.13});}
  buildStars(){const a=[];for(let i=0;i<600;i++){const t=i*2.39996,y=1-2*i/600,r=Math.sqrt(1-y*y);a.push(18*r*Math.cos(t),18*y,18*r*Math.sin(t));}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a,3));this.stars=new THREE.Points(g,new THREE.PointsMaterial({color:0x729aab,size:.015,transparent:true,opacity:.35}));this.scene.add(this.stars);}
  buildCity(){this.city=new THREE.Group();this.city.visible=false;this.scene.add(this.city);const grid=new THREE.GridHelper(9,36,0x4cb599,0x173b3b);grid.position.y=-1;this.city.add(grid);for(let i=0;i<110;i++){const h=.15+((i*73)%17)/15;const geometry=new THREE.BoxGeometry(.19,h,.19);const mat=new THREE.MeshBasicMaterial({color:i%9===0?0x30685d:0x112b2c});const b=new THREE.Mesh(geometry,mat);b.position.set((i%11-5)*.49,-1+h/2,(Math.floor(i/11)-5)*.49);this.city.add(b);const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geometry),new THREE.LineBasicMaterial({color:i%9===0?GREEN:0x2c5655,transparent:true,opacity:.7}));edges.position.copy(b.position);this.city.add(edges);}this.city.rotation.y=.3;}
  setExplorerEntries(entries,onPick){
    this.explorerActive=entries!==null;this.explorerPick=onPick;
    for(const child of [...this.explorerMarkers.children]){child.geometry?.dispose();child.material?.map?.dispose();child.material?.dispose();child.dispose?.();this.explorerMarkers.remove(child);}
    this.explorerMarkers.visible=this.explorerActive;if(!this.explorerActive)return;
    this.network.visible=false;this.threats.visible=false;this.compliance.visible=false;this.markers.visible=false;
    const groups=new Map();entries.forEach(pin=>{const key=pin.coordinates.map(n=>n.toFixed(2)).join(',');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(pin);});
    const grouped=[...groups.values()].map(pins=>({...pins[0],group:pins}));
    if(grouped.length>200){
      const mesh=new THREE.InstancedMesh(new THREE.SphereGeometry(.028,8,6),new THREE.MeshBasicMaterial({color:0xffffff}),grouped.length);
      const matrix=new THREE.Matrix4();grouped.forEach((pin,i)=>{matrix.makeTranslation(...latLon(...pin.coordinates,2.05).toArray());mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,new THREE.Color(pin.color??GREEN));});
      mesh.userData.pins=grouped;mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;mesh.computeBoundingSphere();this.explorerMarkers.add(mesh);return;
    }
    for(const pin of grouped){
      const marker=new THREE.Mesh(new THREE.SphereGeometry(.036,12,8),new THREE.MeshBasicMaterial({color:pin.color??GREEN}));marker.position.copy(latLon(...pin.coordinates,2.05));marker.userData.pin=pin;this.explorerMarkers.add(marker);
      if(pin.group.length>1){const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;const context=canvas.getContext('2d');context.fillStyle='#10261f';context.beginPath();context.arc(32,32,26,0,Math.PI*2);context.fill();context.strokeStyle='#64bca2';context.lineWidth=3;context.stroke();context.font='bold 28px sans-serif';context.textAlign='center';context.textBaseline='middle';context.fillStyle='#d3ffe9';context.fillText(String(pin.group.length),32,33);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),depthTest:true}));sprite.position.copy(latLon(...pin.coordinates,2.14));sprite.scale.set(.12,.12,1);this.explorerMarkers.add(sprite);}
    }
  }
  setOverlayEntries(entries,onPick){this.overlayPick=onPick;for(const mesh of [...this.overlayMarkers.children]){mesh.geometry?.dispose();mesh.material?.dispose();mesh.dispose?.();this.overlayMarkers.remove(mesh);}const grouped=new Map();entries.filter(x=>Array.isArray(x.coordinates)).forEach(pin=>{const key=pin.coordinates.map(n=>n.toFixed(2)).join(',');if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(pin);});const pins=[...grouped.values()].map(group=>({...group[0],group}));if(!pins.length)return;const mesh=new THREE.InstancedMesh(new THREE.SphereGeometry(.031,10,6),new THREE.MeshBasicMaterial({color:0xffffff}),pins.length);const matrix=new THREE.Matrix4();pins.forEach((pin,i)=>{matrix.makeTranslation(...latLon(...pin.coordinates,2.085).toArray());mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,new THREE.Color(pin.color??GREEN));});mesh.userData={overlay:true,pins};mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;mesh.computeBoundingSphere();this.overlayMarkers.add(mesh);}
  highlightExplorer(id,pinId){this.explorerMarkers.children.forEach(m=>{if(!m.isMesh)return;if(m.isInstancedMesh){const matrix=new THREE.Matrix4();m.userData.pins.forEach((pin,i)=>{const match=pin.group.some(p=>p.entityId===id&&(!pinId||p.id===pinId));const position=latLon(...pin.coordinates,2.05);matrix.makeScale(match?1.8:1,match?1.8:1,match?1.8:1);matrix.setPosition(position);m.setMatrixAt(i,matrix);});m.instanceMatrix.needsUpdate=true;return;}const match=m.userData.pin.group.some(p=>p.entityId===id&&(!pinId||p.id===pinId));m.scale.setScalar(match?1.8:1);});}
  select(cluster){this.selected=cluster;this.controls.autoRotate=false;this.destination=latLon(...cluster.coordinates,7.2);this.controls.target.set(0,0,0);this.markers.children.forEach(m=>m.scale.setScalar(m.userData.cluster===cluster?1.8:1));}
  setCity(active){this.cityMode=active;this.globe.visible=!active;this.city.visible=active;this.controls.minDistance=active?3:2.7;this.controls.maxPolarAngle=active?Math.PI/2.05:Math.PI;this.controls.autoRotate=false;this.controls.target.set(0,active?-.3:0,0);this.destination=active?new THREE.Vector3(4,3.5,5):this.selected?latLon(...this.selected.coordinates,7.2):new THREE.Vector3(0,.4,7.9);}
  reset(){this.setCity(false);this.selected=null;this.destination=new THREE.Vector3(0,.4,7.9);this.controls.autoRotate=!this.reducedMotion;}
  setLayer(layer,on){({clusters:this.network,threats:this.threats,compliance:this.compliance})[layer].visible=on;if(layer==='clusters')this.markers.visible=on;}
  metricColor(c){if(!this.metric||this.metric==='security')return c.cybersecurity.activeThreatLevel==='HIGH'?RED:c.cybersecurity.activeThreatLevel==='MEDIUM'?0xf1bb65:GREEN;const value=this.metric==='tokens'?Math.max(...c.activeModels.map(m=>m.tokensPerSecond)):this.metric==='context'?Math.max(...c.activeModels.map(m=>m.allocatedContext)):c.infrastructure.vramTotalGB;const thresholds={tokens:[60,100],context:[32768,65536],vram:[128,640]}[this.metric];return value>=thresholds[1]?GREEN:value>=thresholds[0]?0xf1bb65:RED;}
  setMetric(metric){this.metric=metric;this.markers.children.forEach(m=>m.material.color.setHex(this.metricColor(m.userData.cluster)));for(let i=0;i<this.capacity;i++){const color=new THREE.Color(this.metricColor(this.clusters[i%this.clusters.length]));this.runtimeColors[i*3]=color.r;this.runtimeColors[i*3+1]=color.g;this.runtimeColors[i*3+2]=color.b;}this.filter(this.filtered??this.clusters);}
  filter(clusters){this.filtered=clusters;this.markers.children.forEach(m=>m.visible=clusters.includes(m.userData.cluster));const positions=[],colors=[];for(let i=0;i<this.capacity;i++){if(clusters.includes(this.clusters[i%this.clusters.length])){positions.push(...this.runtimePositions.slice(i*3,i*3+3));colors.push(...this.runtimeColors.slice(i*3,i*3+3));}}this.density.geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));this.density.geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));this.density.geometry.computeBoundingSphere();this.runtimeCount=positions.length/3;this.setYear(this.year??2026);}
  setYear(year){this.year=year;const ratio=Math.min(1,Math.pow(1.49,year-2030));this.density.geometry.setDrawRange(0,Math.round(this.runtimeCount*ratio));}
  resize(){const w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h)return;this.camera.aspect=w/h;this.camera.fov=w<h?2*Math.atan(Math.tan(19*Math.PI/180)/(w/h))*180/Math.PI:38;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);this.composer?.setSize(w,h);}
  animate(){if(!this.running)return;this.frame=requestAnimationFrame(()=>this.animate());if(document.hidden)return;const now=performance.now(),t=now*.0001;this.frames++;if(this.destination){this.camera.position.lerp(this.destination,.055);if(this.camera.position.distanceTo(this.destination)<.01)this.destination=null;}this.controls.update();if(!this.reducedMotion)this.packets.forEach(({packet,curve,offset})=>packet.position.copy(curve.getPoint((t+offset)%1)));this.composer.render();if(now-this.lastSample>1500){const fps=Math.round(this.frames*1000/(now-this.lastSample));if(fps<42&&this.pixelRatio>.75){this.pixelRatio=Math.max(.75,this.pixelRatio-.2);this.renderer.setPixelRatio(this.pixelRatio);this.composer.setPixelRatio(this.pixelRatio);this.resize();}this.onPerformance({fps,quality:this.pixelRatio<1.1?'Adaptive':'High',memory:performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null});this.frames=0;this.lastSample=now;}}
  dispose(){this.countryLabels?.dispose();this.running=false;cancelAnimationFrame(this.frame);this.resizeObserver.disconnect();this.controls.dispose();this.scene.traverse(o=>{o.geometry?.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{m?.map?.dispose();m?.dispose();});});this.composer.dispose();this.renderer.dispose();}
}
