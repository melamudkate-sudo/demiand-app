// This preview runs locally. It never connects to a network or an appliance.
const paired = readLocal('paired-air-fryers', {});
const control = {mode:'detail', ai:false, query:'', choice:0, smart:10, weight:1000,
  progress:0, feedback:readLocal('control-feedback-pending',false), success:false};
function saveDevices(){ persist('paired-air-fryers',paired); }
function unit(){return paired[appState.device]}
function modelPhoto(i,cls=''){return img('device-'+(i+1),controlModels[i],cls)}
function unitTitle(){return esc(controlModels[appState.device])}
function controlHeader(title,extra=''){return topbar(title,extra)}
function bottomButtons(content){return '<div class="control-bottom">'+content+'</div>'}
function primary(action,title,arg=''){return bt(action,title,'red-btn',arg)}
function controlCatalog(){
  return controlModels.map((name,i)=>name.toLowerCase().includes(appState.deviceSearch.toLowerCase()) ?
    bt('device',modelPhoto(i)+'<b>'+esc(name)+'</b>','device-tile',i):'').join('') || '<p>No matching models.</p>';
}
function controlHome(){
  if(!Object.keys(paired).length || appState.page==='Models'){
    return controlHeader(logo())+'<div class="padded"><h2>Choose an air fryer</h2><label class="in-search">'+icon('search')+
      '<input id="control-search" placeholder="Search air fryer models" value="'+esc(appState.deviceSearch)+'"></label></div>'+
      pane('<div class="device-grid" id="control-results">'+controlCatalog()+'</div>');
  }
  const cards=Object.keys(paired).map(id=>bt('openUnit',modelPhoto(+id)+'<b>'+esc(controlModels[id])+'</b>','device-tile',id));
  cards.push(ib('addUnit','plus','Add an air fryer','','device-tile add-unit'));
  const feedback=control.feedback?'<form id="control-feedback" class="feedback-card"><h3>How did your last dish turn out?</h3><textarea aria-label="Cooking feedback" placeholder="Tell us how it went" required></textarea><div>'+bt('hideFeedback','Hide')+'<button class="red-btn">Send</button></div></form>':'';
  return controlHeader(logo())+pane(feedback+'<div class="device-grid">'+cards.join('')+'</div>');
}
function setupView(){
  const p=appState.phase;
  if(p===0) return '<div class="over-controls right">'+ib('back','close','Close')+'</div>'+pane(modelPhoto(appState.device,'setup-photo')+
    '<h2 class="center">Turn on the device</h2><ol>'+setupSteps.map(s=>'<li>'+s+'</li>').join('')+'</ol>','setup-scroll')+
    bottomButtons(bt('setupVideo',icon('play')+' Watch setup guide','white-btn')+primary('setupNext','Next'));
  if(p===1) return controlHeader('Prepare to connect')+pane('<section class="permission-copy"><p>The next screens guide you through Wi-Fi, Bluetooth and location access. Together they help find your air fryer and connect it to your home network.</p>'+
    '<article>'+icon('send')+'<div><b>Location</b><p>Find available Wi-Fi networks during setup.</p></div></article><article>'+icon('wifi')+'<div><b>Bluetooth</b><p>Discover nearby air fryers and set up the connection.</p></div></article></section>')+bottomButtons(primary('setupNext','Next'));
  if(p===2)return controlHeader('Choose your air fryer')+pane(bt('pickDevice',modelPhoto(appState.device)+'<b>'+ (appState.device===14?'Belstone Air Fryer 801':unitTitle())+'</b>','pair-choice '+(appState.picked?'chosen':'')))+bottomButtons('<button class="red-btn" data-act="beginPair" '+(appState.picked?'':'disabled')+'>Connect device</button>');
  if(p===4)return controlHeader('Wi-Fi network details')+'<form id="demo-wifi" class="wifi-form"><div class="wifi-pulse">'+icon('wifi')+'</div><h2>Enter the network password</h2><label><span>Demo network</span><input aria-label="Demo network" required value="DEMIAND Demo" autocomplete="off"></label><label><span>Demo password</span><input id="demo-password" aria-label="Demo password" type="password" required value="demokitchen" autocomplete="off">'+ib('seePassword','search','Show or hide password')+'</label><small>Test credentials are provided for this preview.</small><button class="red-btn">Continue</button></form>';
  return controlHeader('Connection')+pane('<div class="pair-progress">'+modelPhoto(appState.device)+'<progress max="6" value="'+control.progress+'"></progress><h2>Connecting…</h2><p>Keep the air fryer switched on and leave the basket in place.</p></div><ol class="connection-list">'+connectChecks.map((label,i)=>'<li class="'+(i<control.progress?'done':i===control.progress?'busy':'')+'">'+label+(i<control.progress?icon('check'):i===control.progress?'<i class="spinner"></i>':'')+'</li>').join('')+'</ol>');
}
let pairingTimer;
function pairProgress(afterWifi){
  clearTimeout(pairingTimer);
  appState.phase=afterWifi?5:3;
  control.progress=afterWifi?2:0;
  const advance=()=>{
    if(appState.page!=='Setup'||appState.phase!==(afterWifi?5:3))return;
    renderApp();
    pairingTimer=setTimeout(()=>{
      if(appState.page!=='Setup'||appState.phase!==(afterWifi?5:3))return;
      if(!afterWifi&&control.progress===2){appState.phase=4;renderApp();return}
      if(afterWifi&&control.progress===6){
        paired[appState.device]??={power:true,temp:195,mins:10,fan:4,features:[false,false,true,false],preset:0};
        saveDevices();control.success=true;openDashboard();return;
      }
      control.progress++;advance();
    },850);
  };
  advance();
}
function openControlHome(){appState.deviceSearch='';go('Remote',false)}
function openDashboard(){
  appState.previous=appState.previous.filter(p=>!['Setup','Models','Dashboard','Remote'].includes(p));
  appState.returnScroll=appState.previous.map(()=>0);
  appState.previous.push('Remote');appState.returnScroll.push(0);
  appState.page='Dashboard';appState.sheet='';renderApp();
}
function deviceRow(withPower=true){
  const d=unit(),state=d.run?(d.run.ends?'Cooking':'Paused'):d.power?'On':'Off';
  return '<div class="unit-row">'+modelPhoto(appState.device)+'<div><b>'+unitTitle()+'</b><small class="unit-state '+(state==='Off'?'off':state==='Paused'?'paused':'')+'">'+state+'</small></div>'+
    (withPower?'<button aria-label="Power" data-act="unitPower" class="power '+(d.power?'on':'')+'">'+remoteIcon(56)+'</button>':
    d.run&&!d.run.stages?'<div class="current-program">'+remoteIcon(d.preset)+'<small>'+presetRows[d.preset][0]+'</small></div>':'')+'</div>';
}
function features(){
  return '<div class="feature-row">'+featureNames.map((label,i)=>'<button type="button" data-act="feature" data-arg="'+i+'" aria-pressed="'+!!unit().features[i]+'">'+'<span class="feature-art">'+remoteIcon(52+i)+'</span><span>'+label+'</span></button>').join('')+'</div>';
}
function fanBounds(d){return d.temp<=80?[1,2]:d.temp<=100?[2,3]:d.temp>=150?[4,4]:[2,4]}
function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function normalizeFan(d){const [lo,hi]=fanBounds(d);d.fan=clamp(d.fan,lo,hi)}
function fanRow(){
  const d=unit(),[lo,hi]=fanBounds(d);
  return '<div class="fan-row"><b>Fan speed</b><div>'+bt('fan','−',d.fan===lo?'at-limit':'',-1)+'<span aria-label="Fan speed '+d.fan+'">'+[1,2,3,4].map(v=>'<i class="'+(d.fan>=v?'lit':'')+'"></i>').join('')+'</span>'+bt('fan','+',d.fan===hi?'at-limit':'',1)+'</div></div>';
}
const wheelRanges={temp:[40,230],mins:[1,480]};
function wheels(){
  return '<div class="dial-pickers">'+Object.entries(wheelRanges).map(([key,[lo,hi]])=>{
    const options=Array.from({length:hi-lo+1},(_,i)=>'<div data-value="'+(lo+i)+'">'+(lo+i)+(key==='temp'?' °C':' min')+'</div>');
    return '<div class="wheel" tabindex="0" role="spinbutton" aria-label="'+(key==='temp'?'Temperature':'Cooking time')+'" aria-valuemin="'+lo+'" aria-valuemax="'+hi+'" aria-valuenow="'+unit()[key]+'" data-wheel="'+key+'">'+options.join('')+'</div>';
  }).join('')+'</div>';
}
function programTile(i,ai,selected=false){
  const row=(ai?smartRows:presetRows)[i];
  return bt('chooseProgram',(ai?img('ai-'+row[1],row[0]):remoteIcon(i))+'<b>'+row[0]+'</b>', 'program-tile '+(selected?'selected':''),(ai?'ai-':'p-')+i);
}
function programStrip(ai){
  const ids=ai?[0,1,2]:[...new Set([unit().preset,0,1,2])].slice(0,3);
  return '<section class="'+(ai?'smart-strip':'standard-strip')+'">'+(ai?'<header>'+icon('spark')+' DEMIAND Cook AI™<br>Smart programs <small>Exclusive</small></header>':'')+
    '<div class="program-strip">'+bt('allPrograms',remoteIcon(58)+'<sup>'+(ai?14:52)+'</sup><b>Show all</b>','program-tile',ai?'ai':'standard')+
    ids.map(i=>programTile(i,ai,!ai&&i===unit().preset)).join('')+'</div></section>';
}
function dashboard(){
  if(!unit())return controlHome();
  const d=unit();
  return controlHeader('','<button data-act="unitSettings" aria-label="Device settings" class="settings">'+remoteIcon(57)+'</button>')+pane('<div class="dashboard">'+(control.success?'<aside class="setup-ok">'+icon('check')+'<div><b>Setup complete</b><br>Your air fryer has been added. You can start cooking!</div></aside>':'')+deviceRow()+
    (d.run?primary('showRun','View cooking progress'):'')+'<fieldset '+(!d.power||d.run?'disabled':'')+'>'+wheels()+features()+fanRow()+primary('startCustom',icon('play')+' Start')+'</fieldset>'+
    programStrip(false)+programStrip(true)+'</div>','controller-scroll');
}
function presetDescription(i){return presetDescriptions[i]||('Program for '+presetRows[i][0].toLowerCase()+'.')}
function smartDescription(i){return i===10?'Roast a whole chicken evenly with a crisp golden skin.':'A guided cooking cycle for '+smartRows[i][0].toLowerCase()+'.'}
function programBrowser(){
  const ai=control.ai;
  const tabs='<div class="program-switch">'+['detail','compact'].map(m=>bt('listMode',m==='detail'?'Detailed':'Compact',control.mode===m?'selected':'',m)).join('')+'</div>';
  return '<header class="program-header">'+ib('back','left','Back')+(ai?'<h2>✧ DEMIAND Cook AI™<br>Smart programs</h2>':tabs)+'</header>'+
    (ai?'<div class="smart-search">'+tabs+'<label class="in-search">'+icon('search')+'<input id="program-query" aria-label="Search programs" placeholder="Search programs" value="'+esc(control.query)+'"></label></div>':'')+
    pane('<div id="program-list">'+programResults()+'</div>','controller-scroll');
}
function programResults(){
  const ai=control.ai,rows=ai?smartRows:presetRows;
  return (ai?[[0,14,'']]:[[0,12,'Standard programs · 12'],[12,52,'Additional programs · 40']]).map(([a,b,heading])=>{
    const tiles=[];
    for(let i=a;i<b;i++){
      const r=rows[i];if(!r[0].toLowerCase().includes(control.query.toLowerCase()))continue;
      if(control.mode==='compact'){tiles.push(programTile(i,ai));continue}
      const art=ai?img('ai-'+r[1],r[0]):remoteIcon(i);
      tiles.push(bt('chooseProgram',art+'<div><b>'+r[0]+'</b><p>'+(ai?smartDescription(i):presetDescription(i))+'</p><small>'+(ai?r[2]+' g · '+r[3]+' min · '+r[4]+' stages':r[3]?r[3]+' g':'')+'</small></div>','program-detail',(ai?'ai-':'p-')+i));
    }
    return (heading?'<h3>'+heading+'</h3>':'')+'<div class="program-list '+control.mode+' '+(ai?'smart':'')+'">'+(tiles.join('')||'<p>No matching programs</p>')+'</div>';
  }).join('');
}
function presetSheet(){
  const i=control.choice,r=presetRows[i];
  return deviceRow(false)+'<div class="preset-preview">'+remoteIcon(i)+'<div><b>'+r[0]+'</b> '+(r[3]?r[3]+' g':'')+'<p>'+presetDescription(i)+'</p></div></div><div class="preset-values"><b>'+r[1]+'°</b><b>'+r[2]+' min</b></div>'+primary('launchPreset',icon('play')+' Start');
}
function smartWeights(i){return i===10?[600,1000,1500,2000]:[smartRows[i][2]]}
function stagesFor(i,weight){
  if(i===10)return chickenStages[weight].map((mins,j)=>({mins,temp:[160,160,200][j]}));
  const total=smartRows[i][3],count=smartRows[i][4],first=Math.floor(total/count);
  return Array.from({length:count},(_,j)=>({mins:j===count-1?total-first*j:first,temp:j===count-1?190:170}));
}
const fmtTime=s=>Math.floor(Math.max(0,s)/60).toString().padStart(2,'0')+':'+(Math.max(0,s)%60).toString().padStart(2,'0');
function smartCard(i,weight){
  const r=smartRows[i],stages=stagesFor(i,weight);
  return '<div class="smart-label">'+icon('spark')+' DEMIAND Cook AI™ — Smart program</div><div class="smart-card">'+img('ai-'+r[1],r[0])+'<div><b>'+r[0]+'</b><p>'+smartDescription(i)+'</p><small>'+weight+' g · '+stages.reduce((n,s)=>n+s.mins,0)+' min · '+stages.length+' stages</small>'+bt('smartRecipe','View recipe')+'</div></div>';
}
function stageDials(stages,elapsed,running){
  let offset=0;
  return '<div class="stage-dials">'+stages.map(s=>{
    const start=offset,seconds=s.mins*60;offset+=seconds;
    const remaining=clamp(offset-elapsed,0,seconds),active=running&&elapsed>=start&&elapsed<offset;
    return '<div class="'+(active?'active':'')+'"><b>'+s.temp+'°C</b><strong>'+fmtTime(remaining)+'</strong></div>';
  }).join('')+'</div><div class="total-time">'+(running?fmtTime(elapsed)+' / '+fmtTime(offset):offset/60+' min')+'</div>';
}
function smartScreen(){
  const i=control.smart;
  return controlHeader('')+pane('<div class="smart-options">'+deviceRow()+smartCard(i,control.weight)+'<b>Select food weight</b><div class="weight-options">'+smartWeights(i).map(w=>bt('smartWeight',w+' g',w===control.weight?'selected':'',w)).join('')+'</div>'+stageDials(stagesFor(i,control.weight),0,false)+'</div>')+bottomButtons(primary('startSmart',icon('play')+' Start'));
}
function smartRecipe(){
  const i=control.smart,r=smartRows[i];
  const steps=i===10?[
    ['ai-chicken-step-raw','Gather the ingredients. Thaw the chicken fully and pat dry with paper towels.'],
    ['ai-chicken-step-raw','Prepare the whole chicken and select its weight in the program.'],
    ['ai-chicken-step-seasoning','Season the chicken on all sides and place it in the basket.']
  ]:[['ai-'+r[1],'Prepare the ingredients for '+r[0].toLowerCase()+'.'],['ai-'+r[1],'Select the program and load the air fryer basket.']];
  return '<h2>'+r[0]+'</h2>'+img('ai-'+r[1],r[0],'smart-hero')+(i===10?'<div class="preset-values">186 kcal · Protein 12.5 g · Fat 12.8 g · Carbs 4.7 g</div><small>Per 100 g of raw ingredients</small>':'')+
    steps.map(([id,copy],j)=>'<article class="step-card">'+img(id,'Step '+(j+1))+'<div><b>Step '+(j+1)+'</b><p>'+copy+'</p></div></article>').join('');
}
function leftSeconds(run){return run.ends?Math.max(0,Math.ceil((run.ends-Date.now())/1000)):run.left}
function changeRow(key,value){return '<div class="run-adjust">'+bt('adjustRun','−','',key+'-down')+'<b>'+value+'</b>'+bt('adjustRun','+','',key+'-up')+'</div>'}
function runClock(){
  const d=unit(),r=d.run,left=leftSeconds(r);
  if(r.stages)return stageDials(r.stages,r.duration-left,true);
  return '<div class="fan-dial '+(r.ends?'spinning':'')+'"><img src="assets/control-fan.webp" alt=""><div><strong>'+Math.ceil(left/60)+'</strong><small>min</small><b>'+d.temp+' °C</b></div></div>';
}
function runPanel(){
  const d=unit(),r=d.run;if(!r)return '';
  return deviceRow(false)+(r.stages?smartCard(r.smart,r.weight):'')+'<div id="run-clock">'+runClock()+'</div>'+
    (r.stages?'':changeRow('mins',d.mins+' min')+changeRow('temp',d.temp+' °C'))+'<div class="run-actions">'+bt('confirmStop',icon('close')+' Finish')+bt('pauseRun',(r.ends?icon('pause')+' Pause':icon('play')+' Resume'),r.ends?'':'resume')+'</div>'+
    (r.stages?'':fanRow())+features();
}
function controlSheet(){
  const n=appState.sheet;
  if(!['control-preset','control-run','control-stop','control-recipe','control-info','control-settings','control-forget'].includes(n))return '';
  if(n==='control-settings')return '<div class="control-menu-backdrop" data-act="closeControl"><div class="control-menu" role="menu">'+bt('refreshUnit',icon('reset')+' Refresh')+bt('deviceInfo',icon('book')+' Instructions')+bt('askForget',icon('close')+' Forget device')+'</div></div>';
  const contents=n==='control-forget'?'<h3>Forget this air fryer?</h3><p>You can add it again from Control.</p><div class="run-actions">'+bt('forgetUnit','Forget device')+bt('closeControl','Cancel')+'</div>':n==='control-preset'?presetSheet():n==='control-run'?runPanel():n==='control-stop'?'<h3>Finish cooking?</h3><div class="run-actions">'+bt('finishRun','Yes')+bt('showRun','No')+'</div>':n==='control-recipe'?smartRecipe():
    '<h2>'+unitTitle()+'</h2>'+(appState.device===14?[1,2].map(i=>img('harrington-manual-'+i,'Harrington instruction manual, page '+i,'manual-page')).join(''):modelPhoto(appState.device,'smart-hero')+'<ol>'+setupSteps.map(s=>'<li>'+s+'</li>').join('')+'</ol>');
  return '<div class="sheet-overlay control-overlay"><section class="control-sheet '+n+'" role="dialog" aria-modal="true" aria-label="'+({'control-preset':'Program settings','control-run':'Cooking progress','control-stop':'Finish cooking','control-recipe':'Program recipe','control-info':'Device manual','control-forget':'Forget device'})[n]+'">'+ib('closeControl','close','Close','','close-control')+contents+(n==='control-recipe'&&!unit().run?bottomButtons(primary('startSmart',icon('play')+' Start')):'')+'</section></div>';
}
function startCycle(stages=null){
  const d=unit();if(!d.power||d.run)return;
  const mins=stages?stages.reduce((n,s)=>n+s.mins,0):d.mins;
  d.run={duration:mins*60,left:mins*60,ends:Date.now()+mins*60000,stages,smart:control.smart,weight:control.weight};
  saveDevices();control.success=false;acts.showRun();
}
function completeCycle(id){
  const d=paired[id];delete d.run;saveDevices();control.feedback=true;persist('control-feedback-pending',true);
  if(+id===appState.device && ['Dashboard','Smart','Programs'].includes(appState.page)){openDashboard()}
  toast('Dish ready! Your air fryer has finished cooking. Enjoy your meal!');
}
function dataAction(arg){
  const [type,index]=arg.split('-');if(!unit().power||unit().run){toast('Turn on the air fryer and finish the current cycle first.');return}
  if(type==='ai'){control.smart=+index;control.weight=smartRows[index][2];go('Smart')}
  else if(+index<12){
    const d=unit(),r=presetRows[index];Object.assign(d,{preset:+index,temp:r[1],mins:r[2]});normalizeFan(d);saveDevices();control.success=false;
    if(appState.page==='Programs')openDashboard();else renderApp(true);
  }else{control.choice=+index;acts.sheet('control-preset')}
}
Object.assign(acts,{
  addUnit(){appState.deviceSearch='';go('Models')},
  openUnit(i){appState.device=+i;control.success=false;openDashboard();if(unit().run)acts.showRun()},
  device(i){clearTimeout(pairingTimer);if(paired[i])return acts.openUnit(i);Object.assign(appState,{device:+i,phase:0,picked:true});go('Setup')},
  setupNext(){appState.phase++;renderApp()},
  beginPair(){if(appState.picked)pairProgress(false)},
  pickDevice(){appState.picked=!appState.picked;renderApp()},
  seePassword(){const input=$('#demo-password');input.type=input.type==='password'?'text':'password'},
  unitSettings(){acts.sheet('control-settings')},
  refreshUnit(){acts.sheetClose();toast('Device status refreshed')},
  askForget(){acts.sheet('control-forget')},
  forgetUnit(){delete paired[appState.device];saveDevices();control.success=false;openControlHome()},
  deviceInfo(){acts.sheet('control-info')},
  unitPower(){const d=unit();if(d.run){acts.confirmStop();return}d.power=!d.power;control.success=false;saveDevices();renderApp(true)},
  feature(i){const d=unit();if(!d.power)return;d.features[i]=!d.features[i];saveDevices();renderApp(true)},
  fan(n){const d=unit();if(!d.power)return;const old=d.fan;d.fan+=+n;normalizeFan(d);if(d.fan===old){toast('Fan speed limit for this temperature');return}saveDevices();renderApp(true)},
  allPrograms(type){control.ai=type==='ai';control.query='';go('Programs')},
  listMode(m){control.mode=m;renderApp()},
  chooseProgram:dataAction,
  launchPreset(){const d=unit(),r=presetRows[control.choice];Object.assign(d,{preset:control.choice,temp:r[1],mins:r[2]});normalizeFan(d);openDashboard();startCycle()},
  smartWeight(n){control.weight=+n;renderApp(true)},
  smartRecipe(){acts.sheet('control-recipe')},
  startCustom(){startCycle()},
  startSmart(){const stages=stagesFor(control.smart,control.weight);unit().temp=stages[0].temp;unit().mins=stages.reduce((n,s)=>n+s.mins,0);startCycle(stages)},
  showRun(){if(unit()?.run)acts.sheet('control-run')},
  confirmStop(){acts.sheet('control-stop')},finishRun(){completeCycle(appState.device)},
  closeControl(){if(appState.sheet==='control-stop'||appState.sheet==='control-recipe'&&unit()?.run)acts.showRun();else acts.sheetClose()},
  pauseRun(){const r=unit().run;if(!r)return;if(r.ends){r.left=leftSeconds(r);r.ends=0}else r.ends=Date.now()+r.left*1000;saveDevices();renderApp(true)},
  adjustRun(arg){const [key,dir]=arg.split('-'),d=unit(),r=d.run;if(!r||r.stages)return;
    const delta=(dir==='up'?1:-1)*(key==='temp'?5:1),before=d[key];d[key]=clamp(before+delta,...wheelRanges[key]);
    if(key==='mins'){const sec=(d[key]-before)*60;r.duration+=sec;r.left=Math.max(0,leftSeconds(r)+sec);if(r.ends)r.ends=Date.now()+r.left*1000}
    normalizeFan(d);saveDevices();renderApp(true)},
  hideFeedback(){control.feedback=false;persist('control-feedback-pending',false);renderApp()}
});
document.querySelector('#app').addEventListener('submit',e=>{
  if(e.target.id==='demo-wifi'){e.preventDefault();pairProgress(true)}
  if(e.target.id==='control-feedback'){e.preventDefault();persist('last-cooking-feedback',e.target.querySelector('textarea').value.trim());acts.hideFeedback();toast('Thanks! Your feedback was saved.')}
});
document.querySelector('#app').addEventListener('input',e=>{
  if(e.target.id==='control-search'){appState.deviceSearch=e.target.value;$('#control-results').innerHTML=controlCatalog()}
  if(e.target.id==='program-query'){control.query=e.target.value;$('#program-list').innerHTML=programResults()}
});
function initWheels(){
  const d=unit();if(!d||appState.page!=='Dashboard')return;
  document.querySelectorAll('[data-wheel]').forEach(w=>{
    const key=w.dataset.wheel,[lo,hi]=wheelRanges[key],step=w.firstElementChild.offsetHeight;
    if(!step)return;
    const mark=v=>{w.querySelector('.current')?.classList.remove('current');w.children[v-lo].classList.add('current');w.setAttribute('aria-valuenow',v)};
    w.scrollTop=(d[key]-lo)*step;mark(d[key]);
    const choose=v=>w.scrollTo({top:(clamp(v,lo,hi)-lo)*step,behavior:'instant'});
    w.onscroll=()=>{if(!w.isConnected||!d.power||d.run)return;const value=clamp(Math.round(w.scrollTop/step)+lo,lo,hi);if(value===d[key])return;d[key]=value;mark(value);normalizeFan(d);saveDevices();const f=$('.dashboard .fan-row');if(f)f.outerHTML=fanRow()};
    w.onclick=e=>{const row=e.target.closest('[data-value]');if(row&&d.power&&!d.run)choose(+row.dataset.value)};
    w.onkeydown=e=>{if(['ArrowUp','ArrowDown'].includes(e.key)&&d.power&&!d.run){e.preventDefault();choose(d[key]+(e.key==='ArrowDown'?1:-1))}};
  });
}
setInterval(()=>{
  for(const id of Object.keys(paired)){
    const r=paired[id].run;if(r?.ends&&leftSeconds(r)===0)completeCycle(id);
  }
  const clock=$('#run-clock');if(clock&&unit()?.run){
    if(unit().run.stages)clock.innerHTML=runClock();
    else clock.querySelector('strong').textContent=Math.ceil(leftSeconds(unit().run)/60);
  }
},1000);
