const rearFiles=['black','natural','white','desert'];
const rearTextures={};let paintRequest=0;
function loadRear(finish){let id=rearFiles[finish];if(!rearTextures[id]){let group={};rearTextures[id]=group;const entries={glass:'iphone-glass-'+id,island:'iphone-island-'+id,lens1:'iphone-lens-'+id+'-1',lens2:'iphone-lens-'+id+'-2',lens3:'iphone-lens-'+id+'-3'};group.ready=Promise.all(Object.entries(entries).map(async ([k,file])=>{let im=new Image();im.src=assetPath(file+'.webp');await im.decode();group[k]=im})).then(()=>{group.loaded=true;cancelAnimationFrame(paintRequest);paintRequest=requestAnimationFrame(drawScene)}).catch(()=>{group.loaded=false})}return rearTextures[id]}
function rearGeometry(ctx,g,front){
 const {m}=g,hw=m.w/2+m.lip-2,hh=m.h/2+m.lip-2,z=-m.d/2,metal=finishes[scene.finish][1],t=loadRear(scene.finish),sx=hw*2/814,sy=hh*2/1710;
 function coords(px,py,w,h){return {cx:hw-px*sx,cy:py*sy-hh,width:w*sx,height:h*sy,mirror:true}}
 function layer(rect,r,base,depth,face,tint){
 const rr=Math.min(r,rect.width/2,rect.height/2),h=rect.height/2,w=rect.width/2,{cx,cy}=rect,end=base-depth;
 const rings=[[base,1,.55],[base-1,0,.75],[end+1,0,1.1],[end,1,.92]].map(([zz,inset,k])=>({pts:outline(w-inset,h-inset,Math.max(.1,rr-inset),zz,cx,cy),k}));
 const sides=[];for(let j=1;j<rings.length;j++){for(let i=0;i<rings[j].pts.length;i++){let n=(i+1)%rings[j].pts.length,a=rings[j-1].pts[i],b=rings[j-1].pts[n],quad=[a,b,rings[j].pts[n],rings[j].pts[i]],dx=b[0]-a[0],dy=b[1]-a[1];const norm=g.rotation.transformPoint({x:dy,y:-dx,z:0,w:0}),len=Math.hypot(dx,dy)||1;let brightness=.55+.55*Math.max(0,(norm.x*-.4+norm.y*-.6+norm.z*.45)/len);sides.push({quad,fill:tone(tint,brightness*rings[j].k),z:quad.reduce((v,p)=>v+g.rotation.transformPoint({x:p[0],y:p[1],z:p[2],w:1}).z/4,0)})}}
 sides.sort((a,b)=>a.z-b.z);for(const side of sides)shape(ctx,g,side.quad,side.fill,side.fill,.27);
 if(front)return;shape(ctx,g,rings.at(-1).pts,tone(tint,.95));if(face)projectTexture(ctx,g,face,end-.05,rect)
 }
 if(!front&&t.glass)projectTexture(ctx,g,t.glass,z-.03,{width:hw*2,height:hh*2,mirror:true});
 const island=coords(263.5,269,471,490),lensPoints=[[161,160],[161,381],[368,271]].map(([x,y],i)=>({rect:coords(x,y,184,184),im:t['lens'+(i+1)]}));
 layer(island,128*sx,z,9,t.island,metal);
 lensPoints.sort((a,b)=>g.rotation.transformPoint({x:a.rect.cx,y:a.rect.cy,z,w:1}).z-g.rotation.transformPoint({x:b.rect.cx,y:b.rect.cy,z,w:1}).z);
 for(const l of lensPoints)layer(l.rect,l.rect.width/2,z-9,11,l.im,metal)
}
