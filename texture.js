const textureLevels=new WeakMap();
function pixelsFor(image,spanX,spanY){
 let w=image.naturalWidth||image.width,h=image.naturalHeight||image.height,level=0;
 // Downsample before projecting so the brushed metal and lettering remain clean at small sizes.
 while(w>spanX*2.6&&h>spanY*2.6&&w>8&&h>8){w=Math.ceil(w/2);h=Math.ceil(h/2);level++}
 let sizes=textureLevels.get(image);if(!sizes){sizes=new Map();textureLevels.set(image,sizes)}
 if(!sizes.has(level)){const c=document.createElement('canvas');c.width=w;c.height=h;const ct=c.getContext('2d',{willReadFrequently:true});ct.imageSmoothingQuality='high';ct.drawImage(image,0,0,w,h);sizes.set(level,{w,h,rgba:ct.getImageData(0,0,w,h).data})}
 return sizes.get(level)
}
function projectTexture(ctx,g,image,z,rect={}){
 const bw=rect.width||g.m.w,bh=rect.height||g.m.h,cx=rect.cx||0,cy=rect.cy||0,t=g.matrix,ratio=ctx.getTransform().a||1;
 const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>g.project(cx+x*bw/2,cy+y*bh/2,z));
 const left=Math.max(0,Math.floor(Math.min(...corners.map(a=>a[0]))*ratio)),top=Math.max(0,Math.floor(Math.min(...corners.map(a=>a[1]))*ratio)),width=Math.ceil(Math.min(g.w,Math.max(...corners.map(a=>a[0])))*ratio)-left+1,height=Math.ceil(Math.min(g.h,Math.max(...corners.map(a=>a[1])))*ratio)-top+1;if(width<=0||height<=0)return;
 const {w,h,rgba}=pixelsFor(image,width,height),bitmap=document.createElement('canvas');bitmap.width=width;bitmap.height=height;
 const context=bitmap.getContext('2d'),pixels=context.createImageData(width,height),out=pixels.data,base=t.m34*z+t.m44,sign=rect.mirror?-1:1;
 for(let j=0;j<height;j++){const y=(j+top+.5)/ratio-g.h/2,c=t.m12-y*t.m14,d=t.m22-y*t.m24,biasY=y*base-t.m32*z;
 for(let i=0;i<width;i++){const x=(i+left+.5)/ratio-g.w/2,a=t.m11-x*t.m14,b=t.m21-x*t.m24,biasX=x*base-t.m31*z,det=a*d-b*c;
 let u=(((biasX*d-b*biasY)/det-cx)*sign/bw+.5)*w-.5,v=(((a*biasY-biasX*c)/det-cy)/bh+.5)*h-.5;
 if(u<-.5||u>=w-.5||v<-.5||v>=h-.5)continue;u=Math.max(0,Math.min(w-1,u));v=Math.max(0,Math.min(h-1,v));
 const ix=Math.floor(u),iy=Math.floor(v),fx=u-ix,fy=v-iy,k=(iy*w+ix)*4,kx=ix<w-1?k+4:k,ky=iy<h-1?k+w*4:k,kxy=ky+kx-k,oi=(j*width+i)*4;
 for(let n=0;n<4;n++){const up=rgba[k+n]+fx*(rgba[kx+n]-rgba[k+n]),down=rgba[ky+n]+fx*(rgba[kxy+n]-rgba[ky+n]);out[oi+n]=up+fy*(down-up)}
 }}
 context.putImageData(pixels,0,0);ctx.drawImage(bitmap,left/ratio,top/ratio,width/ratio,height/ratio);
}
