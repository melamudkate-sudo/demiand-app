// Both entry points share the app and its browser-local content store.
const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const appOnly = document.body.classList.contains('app-full');
let launchTimer;
function scheduleLaunch(){
  clearTimeout(launchTimer);
  launchTimer=setTimeout(()=>{if(appState.page==='Welcome')acts.enter()},1800);
}
if (appOnly) {
  document.documentElement.classList.toggle('installed', !!standalone);
  renderApp();
  dbReady.then(()=>{if(overrides.size)renderApp(true)}).catch(console.error);
  document.documentElement.lang = 'en';
  document.querySelector('meta[name="theme-color"]').content = '#191919';
  if (!standalone) {
    const install = document.createElement('button');
    install.className = 'install-app';
    install.textContent = 'На экран iPhone';
    install.setAttribute('aria-label', 'Добавить приложение на домашний экран');
    document.body.append(install);
    const help = document.createElement('dialog');
    help.className = 'install-dialog';
    help.innerHTML = '<h2>DEMIAND на домашнем экране</h2><p>Откройте эту страницу в Safari на iPhone. Нажмите «Поделиться», затем «На экран Домой». Включите «Открывать как веб-приложение», если этот пункт отображается, и нажмите «Добавить».</p><p>Иконка DEMIAND будет открывать приложение на весь экран.</p><p><a href="./">Вернуться в студию</a></p><button autofocus>Понятно</button>';
    document.body.append(help);
    install.onclick = () => help.showModal();
    acts.openFullscreen=async()=>{
      if(document.fullscreenEnabled){
        try{await document.documentElement.requestFullscreen();return}catch{}
      }
      help.showModal();
    };
    help.querySelector('button').onclick = () => help.close();
  }
}
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js', {updateViaCache:'none'}).catch(console.error));
}
const launchApp = document.querySelector('.launch-app');
if (launchApp) launchApp.addEventListener('click', () => {
  sessionStorage.setItem('demiand-launch-state', JSON.stringify(appState));
});
if (appOnly) {
  try {
    const state = sessionStorage.getItem('demiand-launch-state');
    sessionStorage.removeItem('demiand-launch-state');
    if (state) { Object.assign(appState, JSON.parse(state)); renderApp(); }
  } catch (error) { console.error(error); }
}
// Browser chrome and rotation resize the CSS viewport. Only a focused editor
// needs the smaller visual viewport when the software keyboard covers the page.
if (appOnly && window.visualViewport) {
  const syncKeyboard = () => {
    const view = visualViewport;
    const textEntry = document.activeElement?.matches('input:not([type=range]):not([type=checkbox]),textarea');
    if (textEntry && Math.abs(view.scale - 1) < .01 && innerHeight - view.height > 100) {
      document.body.style.setProperty('--keyboard-height', Math.round(view.height) + 'px');
    } else {
      document.body.style.removeProperty('--keyboard-height');
    }
  };
  visualViewport.addEventListener('resize', syncKeyboard);
  window.addEventListener('pageshow', syncKeyboard);
  document.addEventListener('focusout', () => requestAnimationFrame(syncKeyboard));
}
