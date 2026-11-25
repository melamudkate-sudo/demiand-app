const androidFinishes = {
  galaxy: [['Оникс', '#66666a', 'onyx'], ['Мрамор', '#bfc0bd', 'marble'], ['Фиолетовый', '#8c879e', 'violet'], ['Янтарный', '#d2bd8e', 'amber']],
  pixel: [['Обсидиан', '#555758', 'obsidian'], ['Серо-зелёный', '#929991', 'hazel'], ['Фарфор', '#e4e1d7', 'porcelain'], ['Розовый кварц', '#c9acb4', 'rose-quartz']]
};
const androidTextures = new Map();
function deviceFinishes() { return androidFinishes[model().id] || finishes; }
function loadAndroidRear() {
  const id = model().id;
  const color = deviceFinishes()[scene.finish][2];
  const key = id + '-' + color;
  if (!androidTextures.has(key)) {
    const texture = {};
    androidTextures.set(key, texture);
    const image = new Image();
    image.src = assetPath(key + '.png');
    texture.ready = image.decode().then(() => {
      const canvas = document.createElement('canvas');
      if (id === 'galaxy') {
        canvas.width = 692;
        canvas.height = 1430;
        canvas.getContext('2d').drawImage(image, 1002, 365, 692, 1430, 0, 0, 692, 1430);
      } else {
        canvas.width = 1120;
        canvas.height = 420;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();ctx.roundRect(0, 0, 1120, 420, 200);ctx.clip();
        ctx.drawImage(image, 240, 350, 1120, 420, 0, 0, 1120, 420);
      }
      texture.image = canvas;
      if (id === 'pixel') {
        const logo = document.createElement('canvas');logo.width=100;logo.height=100;
        const lc=logo.getContext('2d');lc.fillStyle='#606760';lc.font='500 70px Arial';lc.textAlign='center';lc.textBaseline='middle';lc.fillText('G',50,52);texture.logo=logo;
      }
      requestAnimationFrame(drawScene);
    }).catch(console.error);
  }
  return androidTextures.get(key);
}
function androidRear(ctx, g) {
  const texture = loadAndroidRear();
  if (!texture.image) return;
  const {m} = g;
  if (m.id === 'galaxy') {
    ctx.save();
    shape(ctx, g, outline(m.w / 2 + m.lip - 2, m.h / 2 + m.lip - 2, m.r + m.lip, -m.d / 2), null);
    ctx.clip();
    projectTexture(ctx, g, texture.image, -m.d / 2 - .05, {width:m.w + m.lip * 2 - 4, height:m.h + m.lip * 2 - 4, mirror:true});
    ctx.restore();
  } else {
    const z = -m.d / 2;
    projectTexture(ctx,g,texture.logo,z-.1,{width:45,height:45,mirror:true});
    const cy = -m.h / 2 + 140;
    for (const depth of [2,5,8]) shape(ctx,g,outline(m.w*.445,66,58,z-depth,0,cy),tone(deviceFinishes()[scene.finish][1],.8+depth*.03));
    projectTexture(ctx, g, texture.image, z-8.1, {width:m.w*.89,height:130,cx:0,cy,mirror:true});
  }
}
