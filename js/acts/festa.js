// Atos do último nível, a festa dos 40 anos no Recreio:
//   Abracos — a Inês atravessa a festa e vai sendo recebida por cada grupo de família e amigos;
//   Bolo    — o bolo com 40 velas: tocar muitas vezes para ajudar a soprá-las todas.
import { Act } from './base.js';
import { getCharacter, charFrame } from '../sprites.js';
import { INK, GOLD, PINK, PAPER, MINT, clamp, text, sign, disc, hash, shadow } from '../draw.js';

const WALL = '#bfe8d8', WALLD = '#9fd4c0', FLOOR = '#e8dcc8', ROSA = '#ff9fc6';
const GAP = 190;                 // distância entre grupos
const BALLOONS = ['#ff5d8f', '#ffd166', '#6fb0f0', '#c79bff', '#ff8a4b'];

// O interior do Recreio (verde-menta, plantas, mesas e cadeiras cor-de-rosa), a deslizar com a câmara.
function recreio(ctx, v, R, gy, cam, top, t) {
  R(0, 0, v.w, gy, WALL);
  for (let x = -(cam % 40); x < v.w; x += 40) R(x, 0, 1, gy, WALLD);
  R(0, gy - 26, v.w, 26, WALLD); R(0, gy - 26, v.w, 2, '#7fc0a8');
  // bancas dos restaurantes e letreiros, de 260 em 260 píxeis
  const names = ['PIZZA', 'BURGERS', 'DUMPLINGS', 'COCKTAILS', 'GELADOS', 'PASTRAMI'];
  const sy = Math.max(top + 4, gy - 104);
  for (let i = Math.floor((cam - 120) / 260); i <= Math.floor((cam + v.w + 120) / 260); i++) {
    const x = i * 260 + 130 - cam;
    R(x - 50, sy + 16, 100, gy - 26 - sy - 16, '#f6fbf8'); R(x - 50, sy + 16, 100, 3, '#7fc0a8');
    R(x - 46, sy + 30, 92, 18, '#2f6f62'); R(x - 44, sy + 32, 88, 14, '#3f8f7a');
    for (let k = 0; k < 5; k++) R(x - 40 + k * 18, sy + 35, 10, 8, ['#ffd166', '#ff8a4b', '#ff5d8f', '#fff6e6', '#c79bff'][(k + i + 50) % 5]);
    sign(ctx, names[((i % names.length) + names.length) % names.length], x, sy, { bg: '#2f6f62', color: '#ffffff' });
    // planta pendurada entre bancas
    const px = x + 130;
    R(px, 0, 1, sy + 6, '#7fc0a8'); disc(ctx, px, sy + 12, 7, '#3f8f5a'); disc(ctx, px - 5, sy + 16, 4, '#4fa86a'); disc(ctx, px + 5, sy + 17, 4, '#2f7a4a');
  }
  // grinalda de bandeirinhas
  for (let x = -(cam % 9), i = Math.floor(cam / 9); x < v.w; x += 9, i++) {
    const y = sy - 8 + Math.round(Math.sin(i * 0.5) * 2);
    if (y < top) break;
    R(x, y, 9, 1, PAPER); R(x + 2, y + 1, 5, 3, BALLOONS[((i % 5) + 5) % 5]); R(x + 3, y + 4, 3, 2, BALLOONS[((i % 5) + 5) % 5]);
  }
  // chão
  R(0, gy, v.w, v.h - gy, FLOOR); R(0, gy, v.w, 2, '#c8b8a0');
  for (let x = -(cam % 24); x < v.w; x += 24) R(x, gy + 2, 1, v.h - gy, '#d8c8b0');
}

// Mesa redonda com duas cadeiras cor-de-rosa.
function mesa(R, x, gy) {
  R(x - 10, gy - 16, 20, 3, INK); R(x - 9, gy - 15, 18, 1, ROSA); R(x - 1, gy - 13, 2, 13, INK);
  for (const d of [-1, 1]) { const cx = x + d * 17; R(cx - 4, gy - 20, 8, 2, ROSA); R(cx - 4, gy - 20, 1, 20, ROSA); R(cx + 3, gy - 20, 1, 20, ROSA); R(cx - 4, gy - 11, 8, 2, ROSA); }
}

export class Abracos extends Act {
  constructor(scene, cfg) {
    super(scene, cfg);
    this.ines = getCharacter('ines', 'festa');
    this.groups = (cfg.groups || []).map((g, i) => ({ ...g, x: 150 + i * GAP, done: false, joy: 0, frames: g.people.map(([who, outfit]) => getCharacter(who, outfit)) }));
  }

  get max() { return this.groups.length; }

  start() {
    this.x = 30;
    this.face = 1;
    this.dist = 0;
    this.moving = false;
    this.over = 0;
    for (const g of this.groups) { g.done = false; g.joy = 0; }
    this.hint('Arrasta o dedo (ou usa as setas) para a Inês atravessar a festa. Está cá toda a gente!');
  }

  world() { return 150 + (this.groups.length - 1) * GAP + 110; }
  ground(v) { return Math.round(v.h * (v.portrait ? 0.74 : 0.86)); }
  cam(v) { return clamp(this.x - v.w * 0.35, 0, Math.max(0, this.world() - v.w)); }

  update(dt, I, v) {
    for (const g of this.groups) g.joy = Math.max(0, g.joy - dt);
    if (this.over) { this.over += dt; if (this.over > 3.4) this.done(); return; }
    let dir = (I.right ? 1 : 0) - (I.left ? 1 : 0);
    if (!dir && I.pointerX >= 0) { const d = I.pointerX * v.w - (this.x - this.cam(v)); if (Math.abs(d) > 10) dir = Math.sign(d); }
    this.moving = !!dir;
    if (dir) {
      this.x = clamp(this.x + dir * 88 * dt, 16, this.world() - 40);
      this.dist += 88 * dt;
      this.face = dir;
    }
    const gy = this.ground(v);
    for (const g of this.groups) {
      if (g.done || Math.abs(this.x - (g.x - 44)) > 22) continue;
      g.done = true;
      g.joy = 2.4;
      this.heart(1, g.x - this.cam(v), gy - 60);
      this.sfx('kiss');
      this.hint(g.line);
      if (this.groups.every((q) => q.done)) this.over = 0.01;
    }
  }

  bot(I) { if (!this.over) I.right = true; }

  draw(ctx, v, R) {
    const gy = this.ground(v), cam = Math.round(this.cam(v)), top = this.top(v), t = this.t;
    recreio(ctx, v, R, gy, cam, top, t);
    // o letreiro da casa e os matraquilhos, logo à entrada
    sign(ctx, 'RECREIO', 60 - cam, Math.max(top + 4, gy - 104) + 22, { scale: 2, bg: '#ff9fc6', color: '#2b1d2e' });
    for (const g of this.groups) {
      const gx = g.x - cam;
      if (gx < -160 || gx > v.w + 160) continue;
      mesa(R, gx + 62, gy);
      const n = g.frames.length, sp = n > 3 ? 22 : 26;
      g.frames.forEach((f, i) => {
        const x = Math.round(gx + (i - (n - 1) / 2) * sp), hop = g.joy > 0 ? Math.round(Math.abs(Math.sin(t * 9 + i)) * 4) : 0;
        shadow(ctx, x, gy, 14);
        const img = f.stand[x > this.x - cam ? 'l' : 'r'];
        ctx.drawImage(img, x - img.width, gy - img.height * 2 - hop, img.width * 2, img.height * 2);
      });
      if (g.extra === 'bebe') this.carrinho(R, gx + (n - 1) / 2 * sp + 24, gy, t);
      if (g.extra === 'baloes') BALLOONS.forEach((c, i) => { const bx = Math.round(gx - 50 + i * 7), by = gy - 78 - (i % 2) * 8 + Math.round(Math.sin(t * 2 + i) * 2); R(bx, by + 6, 1, gy - by - 6, PAPER); disc(ctx, bx, by, 6, INK); disc(ctx, bx, by, 5, c); });
      if (!g.done && Math.floor(t * 3) % 2) { R(gx - 1, gy - 66, 3, 7, '#e0572f'); R(gx - 1, gy - 57, 3, 3, '#e0572f'); }
    }
    // a Inês
    const ix = Math.round(this.x - cam);
    shadow(ctx, ix, gy, 14);
    const img = charFrame(this.ines, this.face, this.moving, false, this.dist);
    ctx.drawImage(img, ix - img.width, gy - img.height * 2, img.width * 2, img.height * 2);
  }

  // O carrinho da bebé Jeanne.
  carrinho(R, x, gy, t) {
    x = Math.round(x);
    R(x - 9, gy - 20, 18, 12, INK); R(x - 8, gy - 19, 16, 10, '#ffc6de'); R(x - 8, gy - 19, 8, 5, '#e89ab8');
    R(x + 8, gy - 28, 2, 12, INK); R(x + 6, gy - 28, 6, 2, INK);
    R(x - 1, gy - 17, 6, 5, '#f6c9a0'); R(x - 1, gy - 17, 6, 1, '#6b4226'); R(x + 1, gy - 15, 1, 1, INK); R(x + 3, gy - 15, 1, 1, INK);
    R(x - 7, gy - 8, 2, 4, INK); R(x + 5, gy - 8, 2, 4, INK);
    R(x - 9, gy - 4, 5, 4, INK); R(x + 4, gy - 4, 5, 4, INK); R(x - 8, gy - 3, 3, 2, '#8a93a7'); R(x + 5, gy - 3, 3, 2, '#8a93a7');
    if (Math.floor(t * 2) % 2) R(x + 2, gy - 23, 2, 2, PINK);
  }
}

export class Bolo extends Act {
  constructor(scene, cfg) {
    super(scene, cfg);
    this.ines = getCharacter('ines', 'festa');
    this.crowd = (cfg.crowd || []).map(([who, outfit]) => getCharacter(who, outfit));
  }

  get max() { return 3; }

  start() {
    this.state = 'sing';       // sing → blow → wish
    this.timer = 0;
    this.out = 0;              // velas apagadas (de 40)
    this.puff = 0;
    this.hint('Todos cantam os parabéns à Inês!');
    this.sfx('fanfare');
  }

  update(dt, I, v) {
    this.timer += dt;
    this.puff = Math.max(0, this.puff - dt);
    if (this.state === 'sing') {
      if (this.timer > 3.2) { this.state = 'blow'; this.timer = 0; this.hint('Toca muitas vezes para ajudar a Inês a soprar as 40 velas!'); }
    } else if (this.state === 'blow') {
      if (I.actionPressed) {
        this.out = Math.min(40, this.out + 3);
        this.puff = 0.25;
        this.sfx('pop');
      }
      if (this.out >= 40 || this.timer > 20) {
        const secs = this.timer;
        this.out = 40;
        this.state = 'wish';
        this.timer = 0;
        this.heart(secs < 7 ? 3 : secs < 12 ? 2 : 1, v.w / 2, v.h * 0.5);
        this.sfx('catchWin');
        this.hint('Quarenta velas apagadas de uma vez! Agora pede um desejo, Inês...');
      }
    } else {
      if (Math.floor(this.timer * 5) !== Math.floor((this.timer - dt) * 5)) this.fx.burst(v.w * (0.2 + Math.random() * 0.6), v.h * (0.3 + Math.random() * 0.25), 10, [GOLD, PINK, MINT, '#ffffff'], 60);
      if (this.timer > 4) this.done();
    }
  }

  bot(I) { if (this.state === 'blow' && Math.floor(this.timer * 60) % 8 === 0) I.actionPressed = true; }

  draw(ctx, v, R) {
    const gy = Math.round(v.h * (v.portrait ? 0.78 : 0.88)), top = this.top(v), t = this.t;
    recreio(ctx, v, R, gy, 300, top, t);
    // os convidados atrás, aos saltinhos
    const n = this.crowd.length;
    this.crowd.forEach((f, i) => {
      const x = Math.round(((i + 0.5) / n) * (v.w - 10)) + 5, hop = Math.round(Math.abs(Math.sin(t * 6 + i * 1.1)) * (this.state === 'wish' ? 5 : 2));
      const img = f.stand[x < v.w / 2 ? 'r' : 'l'];
      ctx.drawImage(img, x - 8, gy - 30 - img.height - hop);
    });
    // a mesa e o bolo de dois andares
    const cx = Math.round(v.w / 2), cw = Math.min(150, v.w - 60), ty = gy - 26;
    R(cx - cw / 2 - 14, ty, cw + 28, 5, INK); R(cx - cw / 2 - 13, ty + 1, cw + 26, 3, ROSA); R(cx - cw / 2 - 8, ty + 5, 3, 21, INK); R(cx + cw / 2 + 5, ty + 5, 3, 21, INK);
    R(cx - cw / 2 - 1, ty - 19, cw + 2, 19, INK); R(cx - cw / 2, ty - 18, cw, 18, '#fff6e6'); R(cx - cw / 2, ty - 18, cw, 5, PINK);
    for (let x = cx - cw / 2 + 4; x < cx + cw / 2 - 2; x += 8) R(x, ty - 13, 4, 3, PINK);
    for (let x = cx - cw / 2 + 6; x < cx + cw / 2 - 2; x += 12) R(x, ty - 7, 2, 2, GOLD);
    text(ctx, '40', cx, ty - 9, '#c0392b', { align: 'center' });
    // as 40 velas, em duas filas de 20
    for (let i = 0; i < 40; i++) {
      const row = i % 2, k = Math.floor(i / 2);
      const x = Math.round(cx - cw / 2 + 5 + (k + 0.5) * ((cw - 10) / 20)) - 1 + row, y = ty - 18 - 7 - row * 2;
      R(x, y, 2, 7 + row * 2, BALLOONS[i % 5]);
      if (i >= this.out) { const f = Math.floor(t * 10 + i * 3) % 3; R(x, y - 3 - (f === 0 ? 1 : 0), 2, 3 + (f === 0 ? 1 : 0), '#ffd23e'); R(x, y - 1, 2, 1, '#ff8a3a'); } else if (hash(i) > 0.5 && this.state !== 'wish') R(x + Math.round(Math.sin(t * 3 + i)), y - 4, 1, 2, '#c8ccd8');
    }
    // a Inês ao lado do bolo, a soprar
    const ix = cx - cw / 2 - 26, lean = this.puff > 0 ? 2 : 0;
    shadow(ctx, ix, gy, 14);
    ctx.drawImage(this.ines.stand.r, ix - 16 + lean, gy - 48, 32, 48);
    if (this.puff > 0) for (let k = 0; k < 4; k++) R(ix + 20 + k * 7 + Math.round((0.25 - this.puff) * 60), gy - 36 - (k % 2) * 2, 4, 1, '#ffffff');
    if (this.state === 'blow') text(ctx, `${40 - this.out} VELAS`, cx, Math.max(top + 4, ty - 52), '#2f6f62', { align: 'center', scale: 2 });
    if (this.state === 'wish') text(ctx, 'PARABÉNS INÊS!', cx, Math.max(top + 4, ty - 56), '#c0392b', { align: 'center', scale: v.w > 300 ? 2 : 1, shadow: '#ffffff' });
  }
}
