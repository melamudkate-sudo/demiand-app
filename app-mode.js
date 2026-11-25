// Both entry points share the app and its browser-local content store.
const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const appOnly = document.body.classList.contains('app-full');
if (appOnly) {
  // The real-device app lives directly in the viewport, outside the 3D studio.
  document.body.prepend(document.querySelector('#app'));
  scene.mode = 'interact';
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
// Installed iPhone web apps can retain Safari's shorter dynamic viewport.
// Use the physical screen's CSS size in standalone mode and the browser's
// layout viewport in Safari. Never inherit a height from the 3D preview.
if (appOnly) {
  const syncAppViewport = () => {
    let height = window.innerHeight;
    if (standalone && /iPhone/.test(navigator.userAgent)) {
      const landscape = window.matchMedia('(orientation: landscape)').matches;
      const screenHeight = landscape ? Math.min(screen.width, screen.height) : Math.max(screen.width, screen.height);
      height = Math.max(height, screenHeight);
    }
    document.body.style.setProperty('--app-viewport-height', height + 'px');
  };
  syncAppViewport();
  window.addEventListener('resize', syncAppViewport);
  window.addEventListener('pageshow', syncAppViewport);
  window.addEventListener('orientationchange', () => requestAnimationFrame(syncAppViewport));
}
// The visual viewport is used only to make room for an input keyboard.
if (appOnly && window.visualViewport) {
  const syncKeyboard = () => {
    const field = document.activeElement;
    const editing = field instanceof HTMLTextAreaElement ||
      (field instanceof HTMLInputElement && ['text', 'search', 'email', 'tel', 'url', 'password', 'number'].includes(field.type));
    const viewport = window.visualViewport;
    const appHeight = parseFloat(document.body.style.getPropertyValue('--app-viewport-height')) || window.innerHeight;
    const keyboardOpen = editing && viewport.scale === 1 && appHeight - viewport.height > 140;
    document.body.classList.toggle('keyboard-open', keyboardOpen);
    if (keyboardOpen) document.body.style.setProperty('--keyboard-height', viewport.height + 'px');
    else document.body.style.removeProperty('--keyboard-height');
  };
  window.visualViewport.addEventListener('resize', syncKeyboard);
  document.addEventListener('focusin', syncKeyboard);
  document.addEventListener('focusout', () => requestAnimationFrame(syncKeyboard));
}
