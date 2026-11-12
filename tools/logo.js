// Desenha o logótipo do jogo com os próprios bonecos e a fonte do jogo (ver logo.html):
//   - a imagem de partilha (1200x630): o pôr do sol sobre o Tejo, a Inês com um ramo de balões,
//     o título e o subtítulo; e a versão quadrada (512x512, igual ao ícone);
//   - os ícones da app (512, 192 e 180): o mesmo cenário sem texto, com a Inês ao centro dentro
//     da zona segura dos ícones «maskable».
// Tudo é desenhado em píxeis de jogo e ampliado sem suavização, para ficar bem pixelizado;
// só o texto é desenhado à resolução final. `window.logos()` devolve as imagens em PNG (data URL).
import { getCharacter, getSprites } from '../js/sprites.js';

const INK = '#2b1d2e';
const SKY = ['#2a2358', '#4a2f78', '#8a3f84', '#c8527a', '#ee8a66', '#f8c27a'];
const BALLOONS = ['#ff5d8f', '#ffd166', '#7be0b0', '#6fb0f0', '#c79bff'];

// O cenário: céu ao pôr do sol, a ponte, o rio e o cais, numa tela w x h com o chão em gy.
function scenery(ctx, w, h, gy, seed = 3) {
  const R = (x, y, ww, hh, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(ww), Math.round(hh)); };
  const hz = gy - Math.round(h * 0.12), n = SKY.length;
  for (let i = 0; i < n; i++) R(0, Math.floor((hz * i) / n), w, Math.ceil(hz / n) + 1, SKY[i]);
  for (let i = 0; i < 40; i++) { const k = ((i * 7919 + seed * 131) % 1000) / 1000, k2 = ((i * 104729 + seed * 17) % 1000) / 1000; if (k2 < 0.75) R(k * w, k2 * hz * 0.42, i % 5 ? 1 : 2, i % 5 ? 1 : 2, i % 3 ? '#fff6e6' : '#ffd1e0'); }
  const sr = Math.round(hz * 0.13), sx = Math.round(w * 0.74), sy = hz - Math.round(sr * 0.4);
  for (let dy = -sr; dy < Math.round(sr * 0.4); dy++) { const hw = Math.round(Math.sqrt(sr * sr - (dy + 0.5) ** 2)); R(sx - hw, sy + dy, hw * 2, 1, dy % 4 === 0 ? '#ffe9a8' : '#fff3c4'); }
  // a ponte e a outra margem
  R(0, hz - 3, w, 3, '#4a2f78');
  const ph = Math.round(h * 0.2);
  for (const px of [0.16, 0.5]) { R(w * px, hz - ph, 3, ph, '#3a2358'); R(w * px - 2, hz - ph - 1, 7, 2, '#3a2358'); }
  R(0, hz - Math.round(ph * 0.45), w, 2, '#3a2358');
  for (let x = 0; x < w; x += 6) R(x, hz - Math.round(ph * 0.45) + 2, 1, Math.round(ph * 0.45) - 4, '#3a2358');
  // o rio com o reflexo do sol, e o cais
  R(0, hz, w, gy - hz, '#3b4a8a');
  for (let i = 0; i < Math.floor((gy - hz) / 3); i++) R(sx - 10 + ((i * 7) % 16), hz + 1 + i * 3, 5 + (i % 3) * 3, 1, '#f8c27a');
  R(0, gy, w, h - gy, '#6b5a4e'); R(0, gy, w, 2, '#8a7868');
  for (let x = 0; x < w; x += 18) R(x, gy + 2, 1, h - gy, '#5a4a40');
}

// A Inês com o ramo de balões (e um coração por cima, se pedido), centrada em cx e assente em gy.
function ines(ctx, cx, gy, scale, heartScale) {
  ctx.imageSmoothingEnabled = false;
  const R = (x, y, ww, hh, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(ww), Math.round(hh)); };
  const img = getCharacter('ines', 'festa').stand.r, w = img.width * scale, h = img.height * scale;
  BALLOONS.forEach((c, i) => {
    const bx = cx + (6 + i * 5) * scale, by = gy - h - (2 + (i % 2) * 5) * scale, r = 3 * scale;
    R(bx, by + r, Math.max(1, scale / 3), gy - h * 0.55 - by - r, '#fff6e6');
    for (let dy = -r; dy <= r; dy++) { const hw = Math.floor(Math.sqrt(r * r - dy * dy)); R(bx - hw - 1, by + dy, hw * 2 + 2, 1, INK); }
    for (let dy = -r + 1; dy < r; dy++) { const hw = Math.floor(Math.sqrt((r - 1) * (r - 1) - dy * dy)); R(bx - hw, by + dy, hw * 2, 1, c); }
    R(bx - r * 0.5, by - r * 0.5, Math.max(1, scale * 0.7), Math.max(1, scale * 0.7), '#ffffff');
  });
  ctx.drawImage(img, Math.round(cx - w / 2), gy - h, w, h);
  if (!heartScale) return;
  const heart = getSprites().heart, hw = heart.width * heartScale, hh = heart.height * heartScale;
  ctx.drawImage(heart, Math.round(cx - w / 2 - hw * 0.9), Math.round(gy - h - hh * 0.4), hw, hh);
}

function pixelText(ctx, text, x, y, size, color, align = 'center') {
  ctx.font = `${size}px "Press Start 2P", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = INK;
  const o = Math.max(2, Math.round(size / 10));
  for (const [dx, dy] of [[o, o], [o, 0], [0, o], [-o, 0], [0, -o]]) ctx.fillText(text, x + dx, y + dy);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

// A imagem de partilha: cenário em 300x158 píxeis de jogo, ampliado 4x, com o texto por cima.
export function shareImage() {
  const W = 1200, H = 630, k = 4, w = W / k, h = Math.ceil(H / k);
  const base = document.createElement('canvas');
  base.width = w; base.height = h;
  const b = base.getContext('2d');
  const gy = Math.round(h * 0.86);
  scenery(b, w, h, gy);
  ines(b, Math.round(w * 0.5), gy, 3, 0);
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(base, 0, 0, w * k, h * k);
  pixelText(ctx, 'Inês', W * 0.5 - 60, 112, 56, '#ffd166', 'right');
  pixelText(ctx, '40', W * 0.5 + 60, 112, 56, '#ffd166', 'left');
  const heart = getSprites().heart;
  ctx.drawImage(heart, Math.round(W * 0.5 - 36), 56, 72, 64);
  pixelText(ctx, 'Quarenta anos de aventuras em pixel art', W * 0.5, H - 26, 24, '#fff6e6');
  return c;
}

// Um ícone: cenário em `base` píxeis de jogo com a Inês ao centro, ampliado `k` vezes.
export function iconImage(base, k, spriteScale) {
  const c0 = document.createElement('canvas');
  c0.width = base; c0.height = base;
  const b = c0.getContext('2d');
  const gy = Math.round(base * 0.84);
  scenery(b, base, base, gy, 5);
  ines(b, Math.round(base * 0.46), gy, spriteScale, spriteScale > 2 ? 2 : 1);
  const c = document.createElement('canvas');
  c.width = base * k; c.height = base * k;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(c0, 0, 0, base * k, base * k);
  return c;
}

export async function logos() {
  await document.fonts.load('56px "Press Start 2P"');
  await document.fonts.load('16px "Press Start 2P"');
  return {
    'share.png': shareImage().toDataURL('image/png'),
    'share-square.png': iconImage(128, 4, 3).toDataURL('image/png'),
    'icon-512.png': iconImage(128, 4, 3).toDataURL('image/png'),
    'icon-192.png': iconImage(96, 2, 2).toDataURL('image/png'),
    'icon-180.png': iconImage(90, 2, 2).toDataURL('image/png'),
  };
}
window.logos = logos;

// Guarda as imagens em assets/, através do servidor local (ver tools/serve.mjs).
export async function saveAll() {
  const imgs = await logos(), done = [];
  for (const [name, url] of Object.entries(imgs)) {
    const blob = await (await fetch(url)).blob();
    const r = await fetch('/__guardar/' + name, { method: 'POST', body: blob });
    done.push(name + ': ' + (await r.text()));
  }
  return done;
}
window.saveAll = saveAll;

// Na página: mostra as imagens, um botão para as guardar todas em assets/ e, para cada uma,
// a transferência direta.
logos().then((imgs) => {
  const out = document.getElementById('out');
  if (!out) return;
  const all = document.createElement('a');
  all.className = 'btn'; all.href = '#'; all.textContent = 'Guardar todas em assets/ (servidor local)';
  all.onclick = async (e) => { e.preventDefault(); all.textContent = 'A guardar...'; all.textContent = (await saveAll()).join(' · '); };
  out.append(all);
  for (const [name, url] of Object.entries(imgs)) {
    const a = document.createElement('a');
    a.className = 'btn'; a.href = url; a.download = name; a.textContent = 'Transferir ' + name;
    const img = new Image(); img.src = url; img.style.maxWidth = '100%'; img.style.imageRendering = 'pixelated'; img.style.display = 'block';
    out.append(a, img);
  }
});
