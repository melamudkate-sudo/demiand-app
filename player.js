function recipePlayer(r){
 return `<section id="recipe-player" class="recipe-player"><h3>${icon('play')} Video recipe</h3><div class="player-frame"><video class="recipe-footage" data-media="recipe-film-${r[0]}" src="${assetPath(r[0]+'.mp4')}" preload="metadata" playsinline aria-label="${esc(r[1])} recipe video"></video><div class="player-poster">${img('official-logo-black','DEMIAND video logo','player-brand','png')}<span class="player-ribbon">Culinary arts</span></div>${ib('togglePlayer','play','Play recipe video','','player-play')}<div class="player-controls"><span class="player-time">0:00 / 0:00</span><input type="range" min="0" step="0.05" value="0" class="player-seek" aria-label="Video position"></div></div></section>`
}
function initPlayer(){const box=$('#recipe-player');if(!box)return;const v=box.querySelector('.recipe-footage'),seek=box.querySelector('.player-seek'),out=box.querySelector('.player-time'),btn=box.querySelector('.player-play');
 if(v.tagName!=='VIDEO'){box.querySelector('.player-poster').hidden=true;btn.hidden=true;box.querySelector('.player-controls').hidden=true;return}
 v.autoplay=false;v.loop=false;v.controls=false;
 const stamp=n=>Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0');
 const update=()=>{let duration=Number.isFinite(v.duration)?v.duration:0;out.textContent=stamp(v.currentTime)+' / '+stamp(duration);seek.max=duration||1;seek.value=v.currentTime;box.querySelector('.player-poster').hidden=v.currentTime>.02||!v.paused;btn.innerHTML=icon(v.paused?'play':'pause');btn.setAttribute('aria-label',v.paused?'Play recipe video':'Pause recipe video');box.classList.toggle('playing',!v.paused)};
 for(const ev of ['loadedmetadata','durationchange','timeupdate','play','pause','ended','seeked'])v.addEventListener(ev,update);
 seek.oninput=()=>{if(Number.isFinite(v.duration))v.currentTime=Number(seek.value)};update()
}
function scrollToPlayer(){let sc=$('.detail-scroll'),p=$('#recipe-player');if(sc&&p){let y=0,el=p;while(el&&el!==sc){y+=el.offsetTop;el=el.offsetParent}sc.scrollTo({top:Math.max(0,y-40),behavior:'auto'})}}
function togglePlayer(){let v=$('.recipe-footage');if(v?.tagName!=='VIDEO')return;if(v.paused){v.play().catch(()=>toast('The selected video could not play.'))}else v.pause()}
