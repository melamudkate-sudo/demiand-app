const models=[{name:'iPhone 16 Pro',short:'iPhone 16 Pro',id:'iphone',w:390,h:848,r:50,lip:9,d:46},{name:'Galaxy S24 Ultra',short:'Galaxy S24',id:'galaxy',w:390,h:834,r:15,lip:8,d:45},{name:'Pixel 9 Pro',short:'Pixel 9 Pro',id:'pixel',w:390,h:854,r:43,lip:10,d:46}];
const finishes=[['Black titanium','#494846'],['Natural titanium','#bab4a9'],['White titanium','#d6d5d1'],['Desert titanium','#ad9581']];
const backgrounds=[['Linen','#e9e9e1'],['White','#ffffff'],['Blush','#e9cfc2'],['Slate','#4b5357'],['Transparent','transparent']];
const presets=[['Front',0,0,0],['Left',-28,6,-4],['Right',28,6,4],['Back',180,0,0]];
const scene=Object.assign({model:0,finish:1,bg:0,yaw:0,pitch:0,roll:0,mode:'interact'},readLocal('scene',{}));scene.mode='interact';
const model=()=>models[scene.model]||models[0];
const P=1900;
function geometry(w,h){const m=model(),s=Math.min((w-55)/(m.w+m.lip*2+50),(h-70)/(m.h+m.lip*2+16));const rotation=new DOMMatrix().rotateAxisAngle(1,0,0,scene.pitch).rotateAxisAngle(0,1,0,scene.yaw).rotateAxisAngle(0,0,1,scene.roll);const persp=new DOMMatrix();persp.m34=-1/P;const matrix=new DOMMatrix().scale(s,s,s).multiply(persp).multiply(rotation);return {w,h,m,s,matrix,rotation,project(x,y,z){let p=matrix.transformPoint({x,y,z,w:1});return [w/2+p.x/p.w,h/2+p.y/p.w,p.z/p.w]}}}
function outline(hw,hh,r,z,cx=0,cy=0){const pts=[];for(let q=0;q<4;q++){const x=cx+(q===0||q===3?1:-1)*(hw-r),y=cy+(q<2?1:-1)*(hh-r);for(let i=0;i<=10;i++){let a=(q+i/10)*Math.PI/2;pts.push([x+r*Math.cos(a),y+r*Math.sin(a),z])}}return pts}
function tone(hex,n){return 'rgb('+[1,3,5].map(k=>Math.min(255,Math.max(0,Math.round(parseInt(hex.slice(k,k+2),16)*n)))).join(',')+')'}
function shape(ctx,g,points,fill,stroke,width=.5){ctx.beginPath();points.forEach((a,i)=>{let [x,y]=g.project(...a);if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y)});ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.lineWidth=width;ctx.strokeStyle=stroke;ctx.stroke()}}
function paintHardware(ctx,g,withBg=false,texture=null){
 const {m,w,h}=g,hw=m.w/2+m.lip,hh=m.h/2+m.lip,rad=m.r+m.lip,metal=finishes[scene.finish][1],z=m.d/2;
 if(withBg&&scene.bg!==4){ctx.fillStyle=backgrounds[scene.bg][1];ctx.fillRect(0,0,w,h)}
 if(scene.bg!==4){ctx.save();ctx.translate(w*.5,h/2+(hh+16)*g.s);ctx.scale(g.s*1.2,g.s*.12);let grad=ctx.createRadialGradient(0,0,0,0,0,150);grad.addColorStop(0,'rgba(33,33,24,.22)');grad.addColorStop(.5,'rgba(33,33,24,.09)');grad.addColorStop(1,'rgba(33,33,24,0)');ctx.fillStyle=grad;ctx.fillRect(-151,-151,302,302);ctx.restore()}
 const faces=[];function add(pts,fill,stroke=fill){let depth=pts.reduce((v,p)=>v+g.rotation.transformPoint({x:p[0],y:p[1],z:p[2],w:1}).z,0)/pts.length;faces.push({pts,fill,stroke,depth})}
 const bands=[[-z,3,.65],[-z+1.7,1,1.12],[-z+4,0,.84],[z-4,0,.93],[z-1.4,1,1.25],[z,3,.67]];
 const rings=bands.map(([zz,inset])=>outline(hw-inset,hh-inset,rad-inset,zz));
 for(let j=1;j<rings.length;j++)for(let i=0;i<rings[j].length;i++){
 let n=(i+1)%rings[j].length,a=rings[j-1][i],b=rings[j-1][n],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;
 let l=.78+.27*(-dy/len+dx/len)+.11*Math.sin(i*.22);add([a,b,rings[j][n],rings[j][i]],tone(metal,l*bands[j][2]));
 }
 // Physical side buttons have their own shallow bevels.
 for(const [side,cy,by] of [[-1,-hh*.5,16],[-1,-hh*.30,36],[-1,-hh*.10,36],[1,-hh*.22,45]]){const x=side*hw,xx=x+side*3.8;
 add([[xx,cy-by,-4],[xx,cy+by,-4],[xx,cy+by,4],[xx,cy-by,4]],tone(metal,.75));add([[x,cy-by,5],[xx,cy-by,4],[xx,cy+by,4],[x,cy+by,5]],tone(metal,1.23))}
 // Insulating antenna bands, bottom speaker perforations and USB-C socket.
 for(const side of [-1,1])for(const cy of [-hh*.78,hh*.78]){const x=side*(hw+.05);add([[x,cy-2,-z+4],[x,cy+2,-z+4],[x,cy+2,z-4],[x,cy-2,z-4]],tone(metal,.55))}
 function port(cx,rx,rz){const pts=[];for(let i=0;i<24;i++){const a=i*Math.PI/12;pts.push([cx+rx*Math.cos(a),hh+.05,rz*Math.sin(a)])}add(pts,'#272826','#4e4f4a')}
 port(0,24,6.5);for(let i=0;i<6;i++){port(47+i*10,2.5,3.4);port(-47-i*10,2.5,3.4)}
 faces.sort((a,b)=>a.depth-b.depth);const front=g.rotation.m33>z/P;
 // Paint the far end cap, then the rail, then the near cap.
 if(front&&m.id==='iphone'&&Math.abs(g.rotation.m33)<.55)rearGeometry(ctx,g,true);
 shape(ctx,g,rings[front?0:5],tone(metal,.7));for(const f of faces)shape(ctx,g,f.pts,f.fill,f.stroke,.32);
 if(front){
 shape(ctx,g,rings[5],'#090a09','#85847b',.65);shape(ctx,g,outline(m.w/2+2,m.h/2+2,m.r+2,z+.2),'#101010','#1b1b1b',.6);
 if(texture){ctx.save();shape(ctx,g,outline(m.w/2,m.h/2,m.r,z+.6),null);ctx.clip();projectTexture(ctx,g,texture,z+.6);ctx.restore()}
 }else{
 const grad=ctx.createLinearGradient(w*.25,h*.2,w*.75,h*.75);grad.addColorStop(0,tone(metal,1.12));grad.addColorStop(.64,metal);grad.addColorStop(1,tone(metal,.83));shape(ctx,g,rings[0],grad,tone(metal,1.25));
 const camera=(x,y,r)=>{for(const [radius,offset,color] of [[r+2,-2,metal],[r,-4,'#353633'],[r-2,-6,'#848781'],[r-4,-7,'#101316'],[r*.48,-7.5,'#1a2230'],[r*.24,-8,'#101318']])shape(ctx,g,outline(radius,radius,radius,-z+offset,x,y),color);shape(ctx,g,outline(1.5,1.5,1.5,-z-9,x+r*.20,y-r*.25),'#778aa0')};
 let x=hw-64,y=-hh+71;
 if(m.id==='iphone'){rearGeometry(ctx,g,false)} else if(m.id==='galaxy'){camera(x+23,y-30,19);camera(x+23,y+21,19);camera(x+23,y+71,19);camera(x-17,y-18,10);camera(x-17,y+13,10)}
 else{shape(ctx,g,outline(hw-15,31,28,-z-5,0,y),tone(metal,.85),'#a8a9a3');shape(ctx,g,outline(62,23,22,-z-8,42,y),'#202526');camera(72,y,12);camera(34,y,12);shape(ctx,g,outline(8,8,8,-z-8,-hw+55,y),'#ece8d5')}
 }
}
function drawScene(){if(document.body.classList.contains('app-full'))return;const stage=$('#stage'),canvas=$('#hardware'),width=stage.clientWidth,height=stage.clientHeight;if(!width||!height)return;const dpr=Math.min(3,Math.max(2,devicePixelRatio||1));canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);const g=geometry(width,height),m=g.m;paintHardware(ctx,g);
 const screen=$('#screen'),frontView=scene.yaw===0&&scene.pitch===0&&scene.roll===0;
 const app=screen.firstElementChild,z=m.d/2+.6,density=frontView?1:2;
 const displayZoom=frontView?g.s/(1-z/P):1;
 Object.assign(app.style,{width:m.w+'px',height:m.h+'px',zoom:String(density)});
 Object.assign(screen.style,{zoom:String(displayZoom),width:m.w*density+'px',height:m.h*density+'px',left:-m.w*density/2+'px',top:-m.h*density/2+'px',borderRadius:m.r*density+'px',transform:frontView?'none':g.matrix.translate(0,0,z).scale(1/density,1/density,1/density).toString(),visibility:g.rotation.m33>m.d/2/P?'visible':'hidden'});screen.classList.toggle('android',m.id!=='iphone');$('#model-caption').textContent=m.name;stage.style.backgroundColor=scene.bg===4?'#fcfcfa':backgrounds[scene.bg][1];stage.classList.toggle('checker',scene.bg===4);const scale=Number($('#quality').value)/Math.max(width,height);$('#export-size').textContent=Math.round(width*scale)+' × '+Math.round(height*scale)+' px'}
async function captureScreen(density){await document.fonts.ready;const screen=$('#screen'),m=model(),copy=screen.cloneNode(true);copy.id='capture-screen';copy.style.zoom=1;copy.firstElementChild.style.zoom=1;copy.classList.remove('editing');Object.assign(copy.style,{position:'fixed',left:'-10000px',top:'0',width:m.w+'px',height:m.h+'px',borderRadius:'0',overflow:'hidden',transform:'none',visibility:'visible',background:'#191919',pointerEvents:'none'});document.body.append(copy);
 try{copy.querySelectorAll('.picked').forEach(el=>el.classList.remove('picked'));const a=[...screen.querySelectorAll('*')],b=[...copy.querySelectorAll('*')];for(let i=0;i<a.length;i++){if(a[i].scrollTop)b[i].scrollTop=a[i].scrollTop;if(a[i].scrollLeft)b[i].scrollLeft=a[i].scrollLeft;if(a[i] instanceof HTMLInputElement){b[i].value=a[i].value;b[i].checked=a[i].checked}if(a[i].tagName==='VIDEO'){let frame=document.createElement('canvas'),v=a[i];frame.width=v.videoWidth||1;frame.height=v.videoHeight||1;let im=document.createElement('img');im.className=v.className;im.style.cssText=v.style.cssText;if(v.readyState>=2){frame.getContext('2d').drawImage(v,0,0);im.src=frame.toDataURL()}else{im.src=v.poster}b[i].replaceWith(im)}}
 await Promise.all([...copy.querySelectorAll('img')].map(async im=>{
   await im.decode().catch(()=>{});const style=getComputedStyle(im),fit=style.objectFit;
   if(!im.naturalWidth||!['cover','contain'].includes(fit)||!im.clientWidth||!im.clientHeight)return;
   const width=im.clientWidth,height=im.clientHeight,scale=Math.min(density,im.naturalWidth/width+1);
   const bitmap=document.createElement('canvas');bitmap.width=Math.ceil(width*scale);bitmap.height=Math.ceil(height*scale);
   const ratio=(fit==='cover'?Math.max:Math.min)(bitmap.width/im.naturalWidth,bitmap.height/im.naturalHeight);
   const dw=im.naturalWidth*ratio,dh=im.naturalHeight*ratio;
   bitmap.getContext('2d').drawImage(im,(bitmap.width-dw)/2,(bitmap.height-dh)/2,dw,dh);
   im.style.width=width+'px';im.style.height=height+'px';im.style.objectFit='fill';im.src=bitmap.toDataURL();await im.decode()
 }));
 return await html2canvas(copy,{backgroundColor:'#191919',scale:density,logging:false,width:m.w,height:m.h,windowWidth:innerWidth,windowHeight:innerHeight,ignoreElements:el=>el.id==='hardware'});
 }finally{copy.remove()}}
async function exportPNG(){let btn=$('#export');if(btn.disabled)return;btn.disabled=true;btn.querySelector('span').textContent='Rendering…';try{const stage=$('#stage'),w=stage.clientWidth,h=stage.clientHeight,factor=Number($('#quality').value)/Math.max(w,h),canvas=document.createElement('canvas');canvas.width=Math.round(w*factor);canvas.height=Math.round(h*factor);let g=geometry(w,h);if(g.m.id==='iphone'&&g.rotation.m33<.55)await loadRear(scene.finish).ready;const tex=g.rotation.m33>0?await captureScreen(Math.min(7,Math.max(3,Math.ceil(g.s*factor*1.45)))):null;g.s*=factor;g.w=canvas.width;g.h=canvas.height;g.matrix=new DOMMatrix().scale(factor,factor,factor).multiply(g.matrix);g.project=function(x,y,z){let p=this.matrix.transformPoint({x,y,z,w:1});return [this.w/2+p.x/p.w,this.h/2+p.y/p.w,p.z/p.w]};paintHardware(canvas.getContext('2d'),g,true,tex);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('encode');const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='DEMIAND-'+model().id+'-'+appState.page.toLowerCase()+'.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('PNG exported')}catch(e){console.error(e);toast('Could not export this view. Please try again.')}finally{btn.disabled=false;btn.querySelector('span').textContent='Export PNG'}}
