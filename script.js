'use strict';
const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('#motion-toggle');
let paused = false;
try { paused = localStorage.getItem('abhishek-motion') === 'paused'; } catch {}
let restartAnimation = () => {};
function applyMotion() {
  root.classList.toggle('paused', paused || reducedMotion.matches);
  motionButton.setAttribute('aria-pressed', String(paused || reducedMotion.matches));
  motionButton.innerHTML = reducedMotion.matches ? 'Motion reduced <span>○</span>' : paused ? 'Motion off <span>○</span>' : 'Motion on <span>◉</span>';
  motionButton.disabled = reducedMotion.matches;
  motionButton.title = reducedMotion.matches ? 'Following your system’s reduced-motion preference' : 'Toggle decorative animations';
  restartAnimation();
}
motionButton.addEventListener('click', () => { paused = !paused; try { localStorage.setItem('abhishek-motion', paused ? 'paused' : 'active'); } catch {} applyMotion(); });
reducedMotion.addEventListener('change', applyMotion);
applyMotion();
if ('IntersectionObserver' in window) {
  root.classList.add('js');
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }), {threshold:.07});
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
  const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting) document.querySelectorAll('.navigation nav a').forEach(link => link.classList.toggle('active',link.getAttribute('href') === '#'+entry.target.id));
  }), {rootMargin:'-20% 0px -55% 0px'});
  document.querySelectorAll('#work,#about,#stack').forEach(section => navObserver.observe(section));
}
let scrollScheduled = false;
function updateScroll() { const height = root.scrollHeight-innerHeight; document.querySelector('.scroll-progress').style.transform = `scaleX(${height>0 ? Math.min(scrollY/height,1) : 0})`; scrollScheduled=false; }
addEventListener('scroll', () => { if(!scrollScheduled) { scrollScheduled=true; requestAnimationFrame(updateScroll); } }, {passive:true});
addEventListener('resize', updateScroll); updateScroll();
document.querySelector('#year').textContent = new Date().getFullYear();

// Project filtering keeps the original order and works with keyboard buttons.
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(item => { item.classList.toggle('active',item===button);item.setAttribute('aria-pressed',String(item===button)); });
  document.querySelectorAll('.project-card').forEach(card => { card.hidden=button.dataset.filter!=='all' && !card.dataset.category.split(' ').includes(button.dataset.filter);card.classList.add('visible'); });
}));
const projects={
  pix:{name:'PixPassVisa',description:'A browser-based photo preparation experience for passport and visa applications.',points:['Choose a country and document format.','Preview the crop and review photo checks.','Explore digital photo and printable-sheet options.'],url:'https://pixpassvisa.com'},
  create:{name:'CreateSprint',description:'An IT services and training website presenting technology solutions for businesses and learning opportunities for professionals.',points:['Software development and IT services.','Business software and product offerings.','Professional technology training programs.'],url:'https://createsprint.in'},
  post:{name:'Postryx',description:'A creative web toolkit bringing together AI content tools and digital invitations.',points:['Tools for social posts and written content.','Content repurposing for different channels.','Digital invitations and event experiences.'],url:'https://postryx.in'}
};
const projectDialog=document.querySelector('#project-dialog');
document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>{
  const project=projects[button.dataset.project];
  document.querySelector('#project-title').textContent=project.name;
  document.querySelector('#project-summary').textContent=project.description;
  document.querySelector('#project-points').replaceChildren(...project.points.map(text=>{const item=document.createElement('li');item.textContent=text;return item;}));
  document.querySelector('#project-visit').href=project.url;
  projectDialog.showModal();
}));
document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
});
// Accessible vertical tabs support arrows, Home, End, and ordinary clicks.
const tabs=[...document.querySelectorAll('[data-stack]')];
function selectStack(tab,focus=false){tabs.forEach(item=>{const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;document.getElementById(item.getAttribute('aria-controls')).hidden=!selected;});if(focus)tab.focus();}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectStack(tab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowDown')next=(index+1)%tabs.length;if(event.key==='ArrowUp')next=(index-1+tabs.length)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();selectStack(tabs[next],true);}});});
const commandDialog=document.querySelector('#command-dialog');
const search=document.querySelector('#command-search');
const commandLinks=[...document.querySelectorAll('.command-results a')];
function filterCommands(){const query=search.value.trim().toLowerCase();commandLinks.forEach(link=>link.hidden=!link.textContent.toLowerCase().includes(query));document.querySelector('#no-results').hidden=commandLinks.some(link=>!link.hidden);}
function openCommands(){if(projectDialog.open)projectDialog.close();search.value='';filterCommands();commandDialog.showModal();search.focus();}
document.querySelector('.command-trigger').addEventListener('click',openCommands);
addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();commandDialog.open?commandDialog.close():openCommands();}});
search.addEventListener('input',filterCommands);
search.addEventListener('keydown',event=>{if(event.key==='Enter'){const target=commandLinks.find(link=>!link.hidden);if(target){event.preventDefault();target.click();}}});
commandLinks.forEach(link=>link.addEventListener('click',()=>commandDialog.close()));
let copyTimer;
document.querySelector('#copy-email').addEventListener('click',async()=>{const status=document.querySelector('#copy-status');clearTimeout(copyTimer);try{await navigator.clipboard.writeText('abhi14abs@gmail.com');status.textContent='Email copied. Let’s build something.';}catch{status.textContent='Select the email address to copy it.';}copyTimer=setTimeout(()=>status.textContent='',4000);});
document.querySelectorAll('.magnetic').forEach(button=>{button.addEventListener('pointermove',event=>{if(paused||reducedMotion.matches||event.pointerType!=='mouse')return;const rect=button.getBoundingClientRect();button.style.transform=`translate(${(event.clientX-rect.left-rect.width/2)*.1}px,${(event.clientY-rect.top-rect.height/2)*.15}px)`;});button.addEventListener('pointerleave',()=>button.style.transform='');});

// Native WebGL: an illuminated torus-knot sculpture. No external 3D runtime.
const canvas=document.querySelector('#sculpture');
const stage=document.querySelector('.visual-stage');
const starCanvas=document.querySelector('#particles');
const starContext=starCanvas.getContext('2d');
let gl;
try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});}catch{}
let program,buffer,count=0;
const vertexSource=`attribute vec3 aPosition;attribute vec3 aNormal;uniform vec2 uRotation;uniform float uAspect;varying vec3 vNormal;varying vec3 vPosition;
vec3 turn(vec3 p){float a=uRotation.x,b=uRotation.y;vec3 q=vec3(p.x,cos(a)*p.y-sin(a)*p.z,sin(a)*p.y+cos(a)*p.z);return vec3(cos(b)*q.x+sin(b)*q.z,q.y,-sin(b)*q.x+cos(b)*q.z);}
void main(){vec3 p=turn(aPosition);vPosition=p;vNormal=turn(aNormal);gl_Position=vec4(p.x*2.65/uAspect,(p.y+.23)*2.65,-p.z*.5,5.0-p.z);}`;
const fragmentSource=`precision mediump float;varying vec3 vNormal;varying vec3 vPosition;
void main(){vec3 n=normalize(vNormal);vec3 view=normalize(vec3(0.,0.,5.)-vPosition);vec3 light=normalize(vec3(-2.,3.,4.));float diffuse=max(dot(n,light),0.);float fresnel=pow(1.-abs(dot(n,view)),2.2);float spec=pow(max(dot(reflect(-light,n),view),0.),55.);float hue=.5+.5*sin(vPosition.y*1.9+vPosition.x*.7);vec3 base=mix(vec3(.23,.08,.43),vec3(.30,.58,.66),hue);vec3 color=base*(.30+diffuse*.95)+vec3(.66,.37,.95)*fresnel*.78+vec3(.85,.90,1.)*spec*.9;float edge=max(dot(n,normalize(vec3(2.,-1.,1.))),0.);color+=vec3(.15,.35,.46)*pow(edge,5.);gl_FragColor=vec4(color,1.);}`;
function shader(type,source){const item=gl.createShader(type);gl.shaderSource(item,source);gl.compileShader(item);if(!gl.getShaderParameter(item,gl.COMPILE_STATUS))throw new Error('WebGL shader unavailable');return item;}
function vecNorm(v){const length=Math.hypot(...v)||1;return v.map(x=>x/length);}
function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function center(t){return[(1.02+.37*Math.cos(3*t))*Math.cos(2*t),(1.02+.37*Math.cos(3*t))*Math.sin(2*t),.52*Math.sin(3*t)];}
function knotPoint(t,angle){const p=center(t),next=center(t+.001);const tangent=vecNorm(next.map((v,i)=>v-p[i]));const normal=vecNorm(cross(tangent,p));const binormal=vecNorm(cross(tangent,normal));const n=normal.map((v,i)=>v*Math.cos(angle)+binormal[i]*Math.sin(angle));return [...p.map((v,i)=>v+n[i]*.20),...n];}
if(gl){try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertexSource));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragmentSource));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('WebGL linking unavailable');gl.useProgram(program);const vertices=[];const segments=220,sides=18;for(let i=0;i<segments;i++){for(let j=0;j<sides;j++){const t=i/segments*Math.PI*2,t2=(i+1)/segments*Math.PI*2,a=j/sides*Math.PI*2,a2=(j+1)/sides*Math.PI*2;const p=knotPoint(t,a),q=knotPoint(t2,a),r=knotPoint(t2,a2),s=knotPoint(t,a2);vertices.push(...p,...q,...r,...p,...r,...s);}}count=vertices.length/6;buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'aPosition'),normal=gl.getAttribLocation(program,'aNormal');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(normal);gl.vertexAttribPointer(normal,3,gl.FLOAT,false,24,12);gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);stage.classList.add('canvas-ready');}catch{gl=null;}}
let w=0,h=0,sw=0,sh=0,heroVisible=true,frame=0,last=0,elapsed=0;
let pointer={x:0,y:0},smoothPointer={x:0,y:0};
const stars=Array.from({length:65},()=>({x:Math.random(),y:Math.random(),r:.4+Math.random()*1.1,s:.15+Math.random()*.4,phase:Math.random()*6.28}));
function resize(){const dpr=Math.min(devicePixelRatio||1,1.75);w=stage.clientWidth;h=stage.clientHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);if(gl)gl.viewport(0,0,canvas.width,canvas.height);const hero=document.querySelector('.hero');sw=hero.clientWidth;sh=hero.clientHeight;starCanvas.width=Math.round(sw*dpr);starCanvas.height=Math.round(sh*dpr);if(starContext)starContext.setTransform(dpr,0,0,dpr,0,0);draw();}
function draw(){if(gl&&program){gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform2f(gl.getUniformLocation(program,'uRotation'),.4+Math.sin(elapsed*.17)*.17+smoothPointer.y*.25,elapsed*.12+smoothPointer.x*.35);gl.uniform1f(gl.getUniformLocation(program,'uAspect'),w/Math.max(h,1));gl.drawArrays(gl.TRIANGLES,0,count);}if(starContext){starContext.clearRect(0,0,sw,sh);const positions=stars.map(star=>({x:star.x*sw+Math.sin(elapsed*star.s*.1+star.phase)*12,y:star.y*sh+Math.cos(elapsed*star.s*.1+star.phase)*12,r:star.r}));positions.forEach((star,i)=>{starContext.beginPath();starContext.fillStyle=`rgba(185,162,243,${.22+Math.sin(elapsed*.6+stars[i].phase)*.14})`;starContext.arc(star.x,star.y,star.r,0,Math.PI*2);starContext.fill();for(let j=i+1;j<positions.length;j++){const other=positions[j],distance=Math.hypot(star.x-other.x,star.y-other.y);if(distance<115){starContext.beginPath();starContext.strokeStyle=`rgba(149,117,228,${(1-distance/115)*.08})`;starContext.moveTo(star.x,star.y);starContext.lineTo(other.x,other.y);starContext.stroke();}}});}}
function animate(time){frame=0;if(paused||reducedMotion.matches||document.hidden||!heroVisible){last=0;return;}const dt=last?Math.min((time-last)/1000,.05):0;last=time;elapsed+=dt;smoothPointer.x+=(pointer.x-smoothPointer.x)*.045;smoothPointer.y+=(pointer.y-smoothPointer.y)*.045;draw();frame=requestAnimationFrame(animate);}
restartAnimation=()=>{if(frame){cancelAnimationFrame(frame);frame=0;}last=0;draw();if(!paused&&!reducedMotion.matches&&!document.hidden&&heroVisible)frame=requestAnimationFrame(animate);};
stage.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse')return;const rect=stage.getBoundingClientRect();pointer.x=(event.clientX-rect.left)/rect.width-.5;pointer.y=(event.clientY-rect.top)/rect.height-.5;});stage.addEventListener('pointerleave',()=>pointer={x:0,y:0});
if('ResizeObserver'in window)new ResizeObserver(resize).observe(stage);else addEventListener('resize',resize);
if('IntersectionObserver'in window)new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;restartAnimation();}).observe(document.querySelector('.hero'));
document.addEventListener('visibilitychange',restartAnimation);
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();gl=null;stage.classList.remove('canvas-ready');});
resize();restartAnimation();
