// Ato «nascimento»: na maternidade, a mãe está na cama de partos, a parteira faz a contagem
// («Faça força! Três, dois, um!!») e o bebé salta pelo ar: quem está à espera tem de se pôr
// debaixo dele (a sombra no chão mostra onde vai cair) e apanhá-lo com o lençol. O chão é todo
// almofadado: se falhar, o bebé ressalta e há nova oportunidade (à terceira, a parteira trata disso).
//
//   { act: Catch, mother: ['tiafatima', 'casual'], catcher: ['tio', 'casual'],
//     helper: ['tomas', 'casual'],          // opcional: alguém que também ajuda a apanhar
//     helperName: 'O Tomás',
//     baby: { name: 'Inês', article: 'a', blanket: '#ffc6de', born: 'Bem-vinda ao mundo, Inês!' } }
//
// Controlos: arrastar o dedo (ou setas) para mover quem apanha.
import { Act } from './base.js';
import { getCharacter, charFrame, getSprites } from '../sprites.js';
import { INK, GOLD, PINK, SKIN, clamp } from '../draw.js';

const MATS = ['#a8d8f0', '#ffe9a8', '#ffc6de', '#bfe6c8'];
// Os números da contagem, em grande (5x7 píxeis cada)
const DIGITS = {
  3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  2: ['11110', '00001', '00001', '01110', '10000', '10000', '11111'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
};

export class Catch extends Act {
  constructor(scene, cfg) {
    super(scene, cfg);
    this.spr = getSprites();
    this.mother = getCharacter(...(cfg.mother || ['ines', 'bata']));
    this.catcher = getCharacter(...(cfg.catcher || ['lourenco', 'bata']));
    this.helper = cfg.helper ? getCharacter(...cfg.helper) : null;
    this.midwife = getCharacter('parteira');
    this.babyCfg = Object.assign({ name: 'bebé', article: 'o', blanket: '#8fc4ff', born: 'Bem-vindo!' }, cfg.baby);
  }

  get max() { return 3; }

  start() {
    this.state = 'push';       // push → fly → caught
    this.timer = 0;
    this.sx = 0.6;             // posição de quem apanha (fração do espaço livre da sala)
    this.hx = 0.95;            // posição de quem ajuda
    this.hdist = 0;
    this.dist = 0;
    this.moving = false;
    this.face = -1;
    this.baby = null;
    this.bounces = 0;
    this.count = 0;
    this.countT = 0;
    this.by = '';              // quem apanhou: 'me', 'helper' ou 'nurse'
  }

  geo(v) {
    const gy = Math.round(v.h * (v.portrait ? 0.66 : 0.8));
    const x0 = 108, x1 = v.w - 18;       // por onde se pode andar (à direita da cama)
    return { gy, x0, x1, X: (f) => x0 + f * (x1 - x0) };
  }

  // Lança o bebé num arco até um sítio ao acaso; T é o tempo que fica no ar.
  launch(v, fromX, fromY, T) {
    const g = this.geo(v);
    const lo = g.x0 + 8, hi = g.x1 - 8, sx = g.X(this.sx);
    let target = -1;
    for (let k = 0; k < 20 && target < 0; k++) {
      const t = lo + Math.random() * (hi - lo);
      if (Math.abs(t - sx) >= 40) target = t;
    }
    if (target < 0) target = sx - lo > hi - sx ? lo : hi;
    const b = this.baby || {};
    b.x = fromX; b.y = fromY;
    b.tx = target;
    b.g = (8 * clamp(g.gy - 95, 50, 170)) / (T * T);
    b.vx = (target - fromX) / T;
    b.vy = (g.gy - 58 - fromY) / T - (b.g * T) / 2;
    this.baby = b;
  }

  update(dt, I, v) {
    const g = this.geo(v), r = this.babyCfg;
    this.timer += dt;

    if (this.state === 'push' || this.state === 'fly') {
      const old = this.sx, span = g.x1 - g.x0;
      const dir = (I.right ? 1 : 0) - (I.left ? 1 : 0);
      if (dir) this.sx += (dir * 155 * dt) / span;
      else if (I.pointerX >= 0) this.sx += clamp((I.pointerX * v.w - g.x0) / span - this.sx, (-270 * dt) / span, (270 * dt) / span);
      this.sx = clamp(this.sx, 0, 1);
      this.moving = Math.abs(this.sx - old) > 0.0005;
      if (this.moving) { this.dist += Math.abs(this.sx - old) * span; this.face = this.sx > old ? 1 : -1; }
    }

    if (this.state === 'push') {
      const n = Math.max(1, 3 - Math.floor(this.timer / 1.1));
      if (n !== this.count) {
        this.count = n;
        this.countT = 0;
        this.sfx('click');
        this.hint('Parteira: «Faça força! ' + ['Três...', 'Três, dois...', 'Três, dois, um!!'][3 - n] + '»');
      }
      this.countT += dt;
      if (this.timer > 3.3) {
        this.state = 'fly';
        this.timer = 0;
        this.sfx('plim');
        this.launch(v, 80, g.gy - 58, 2.2);
        this.fx.burst(82, g.gy - 56, 14, ['#ffffff', GOLD, r.blanket], 70);
        this.hint(`Lá vai ${r.article} ${r.name}! Arrasta o dedo (ou usa as setas) para ${r.article} apanhar!`);
      }
    } else if (this.state === 'fly') {
      const b = this.baby;
      b.vy += b.g * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x > v.w - 8) { b.x = v.w - 8; b.vx = -Math.abs(b.vx); }
      // quem ajuda vai devagar para onde o bebé vai cair
      if (this.helper) {
        const span = g.x1 - g.x0, want = (b.tx - g.x0) / span, old = this.hx;
        this.hx += clamp(want - this.hx, (-48 * dt) / span, (48 * dt) / span);
        this.hdist += Math.abs(this.hx - old) * span;
      }
      const falling = b.vy > 0 && b.y >= g.gy - 66 && b.y <= g.gy - 44;
      if (falling && Math.abs(b.x - g.X(this.sx)) < 18) this.caught('me', g);
      else if (falling && this.helper && Math.abs(b.x - g.X(this.hx)) < 14) this.caught('helper', g);
      else if (b.y >= g.gy - 8) {
        this.bounces++;
        this.sfx('stomp');
        this.fx.burst(b.x, g.gy - 4, 10, ['#ffffff', ...MATS], 50);
        if (this.bounces >= 3) this.caught('nurse', g);
        else {
          this.launch(v, b.x, g.gy - 10, 1.6);
          this.hint('Ups! Ainda bem que o chão é almofadado... Outra vez!');
        }
      }
    } else if (this.state === 'caught') {
      const hx = this.by === 'helper' ? g.X(this.hx) : g.X(this.sx);
      if (Math.floor(this.timer * 6) !== Math.floor((this.timer - dt) * 6)) this.fx.heart(hx - 12 + Math.random() * 24, g.gy - 60, Math.random() < 0.3 ? GOLD : PINK);
      if (this.timer > 3.6) this.done();
    }
  }

  caught(by, g) {
    const r = this.babyCfg, b = this.baby;
    this.by = by;
    this.state = 'caught';
    this.timer = 0;
    if (by === 'nurse') {
      this.sfx('check');
      this.heart(1, 60, g.gy - 60);
      this.hint(`A parteira apanhou ${r.article} ${r.name}! Ufa... ${r.born}`);
      return;
    }
    this.sfx('catchWin');
    this.heart(Math.max(1, 3 - this.bounces), b.x, b.y - 10);
    this.fx.burst(b.x, b.y, 16, [GOLD, '#ffffff', r.blanket], 70);
    const done = r.article === 'a' ? 'Apanhada' : 'Apanhado';
    if (by === 'helper') this.hint(`${this.cfg.helperName || 'A ajuda'} apanhou ${r.article} ${r.name}! ${r.born}`);
    else this.hint((this.bounces ? done + '! ' : done + ' à primeira! ') + r.born);
  }

  bot(I, v) {
    if (this.state !== 'fly' || !this.baby) return;
    const d = this.baby.tx - this.geo(v).X(this.sx);
    if (d > 3) I.right = true; else if (d < -3) I.left = true;
  }

  // ---------- Desenho ----------
  draw(ctx, v, R) {
    const g = this.geo(v), t = this.t, r = this.babyCfg, gy = g.gy, st = this.state;

    // Sala de partos: parede clara, janela, e chão todo almofadado
    R(0, 0, v.w, gy, '#fde8d8');
    for (let x = 0; x < v.w; x += 24) R(x, 0, 1, gy, '#f6d8c4');
    R(0, gy - 22, v.w, 22, '#f3c9b0');
    R(0, gy - 22, v.w, 2, '#e8b89a');
    const wx = Math.round(v.w * 0.55), wy = Math.max(this.top(v) + 2, gy - 110);
    R(wx - 2, wy - 2, 44, 34, '#ffffff');
    R(wx, wy, 40, 30, '#a8dcf7');
    R(wx + 19, wy, 2, 30, '#ffffff');
    R(wx + 6, wy + 6, 10, 4, '#ffffff');
    for (let x = 0, i = 0; x < v.w; x += 20, i++) for (let y = gy, j = 0; y < v.h; y += 14, j++) {
      R(x, y, 20, 14, MATS[(i + j) % 4]);
      R(x, y, 20, 1, 'rgba(255,255,255,0.5)');
      R(x + 19, y, 1, 14, 'rgba(0,0,0,0.08)');
    }
    // berço à espera, ao canto
    const cxr = v.w - 22;
    R(cxr - 14, gy - 22, 28, 14, INK);
    R(cxr - 13, gy - 21, 26, 12, '#c98f52');
    R(cxr - 11, gy - 20, 22, 8, '#ffffff');
    R(cxr - 12, gy - 8, 3, 8, '#8a5a34');
    R(cxr + 9, gy - 8, 3, 8, '#8a5a34');

    this.drawBed(ctx, R, gy, st, t);

    // quem ajuda (mais ao fundo, de braços no ar)
    if (this.helper) {
      const hx = Math.round(g.X(this.hx)), joy = st === 'caught' ? Math.round(Math.abs(Math.sin(t * 8)) * 3) : 0;
      ctx.drawImage(charFrame(this.helper, -1, st === 'fly', false, this.hdist), hx - 16, gy - 48 - joy, 32, 48);
      if (st === 'caught' && this.by === 'helper') this.drawBaby(R, hx, gy - 17, r.blanket, 0);
    }

    // quem apanha, de braços estendidos com o lençol
    const sx = Math.round(g.X(this.sx));
    const frame = st === 'caught' ? this.catcher.stand.l : charFrame(this.catcher, this.face, this.moving, false, this.dist);
    ctx.drawImage(frame, sx - 16, gy - 48, 32, 48);
    if (st !== 'caught') {
      R(sx - 15, gy - 54, 4, 32, INK);
      R(sx + 11, gy - 54, 4, 32, INK);
      R(sx - 14, gy - 53, 2, 30, '#eebb8e');
      R(sx + 12, gy - 53, 2, 30, '#eebb8e');
      R(sx - 18, gy - 58, 36, 5, INK);
      R(sx - 17, gy - 57, 34, 3, '#ffffff');
    }

    // o bebé: no ar (com a sombra no chão), ao colo, ou nos braços da parteira
    const b = this.baby;
    if (st === 'fly' && b) {
      const hgt = clamp((gy - b.y) / 130, 0, 1), sw = Math.round(22 - hgt * 12);
      R(b.tx - sw / 2, gy + 2, sw, 3, 'rgba(43,29,46,0.5)');
      R(b.tx - sw / 2 + 2, gy + 1, sw - 4, 1, 'rgba(43,29,46,0.5)');
      R(b.tx - sw / 2 + 2, gy + 5, sw - 4, 1, 'rgba(43,29,46,0.5)');
      this.drawBaby(R, b.x, b.y, r.blanket, Math.floor(t * 8) % 4);
    } else if (st === 'caught' && this.by === 'me') this.drawBaby(R, sx, gy - 17, r.blanket, 0);
    else if (st === 'caught' && this.by === 'nurse') this.drawBaby(R, 60, gy - 54, r.blanket, 0);

    // o número da contagem, em grande, a saltar quando aparece
    if (st === 'push' && this.count) {
      const rows = DIGITS[this.count], sc = 5, pop = Math.max(0, 1 - this.countT * 4);
      const dx = Math.round(v.w * 0.55) - Math.round((5 * sc) / 2), dy = Math.max(this.top(v) + 12, Math.round(gy * 0.3)) - Math.round(pop * 10);
      rows.forEach((row, ry) => [...row].forEach((c, rx) => { if (c === '1') R(dx + rx * sc - 1, dy + ry * sc - 1, sc + 2, sc + 2, INK); }));
      rows.forEach((row, ry) => [...row].forEach((c, rx) => { if (c === '1') R(dx + rx * sc, dy + ry * sc, sc, sc, this.count === 1 ? PINK : GOLD); }));
    }
  }

  // A cama de partos vista de lado, com a mãe deitada: o encosto levantado com a almofada, a
  // cabeça na almofada, a camisa do hospital, a barriga redonda e os joelhos levantados debaixo
  // do lençol, até aos pés. Atrás, o soro e o monitor; ao lado, a parteira, que durante o salto
  // do bebé agita os braços em pânico.
  drawBed(ctx, R, gy, st, t) {
    const busy = st === 'push', flying = st === 'fly';
    const push = busy ? Math.round(Math.abs(Math.sin(t * 9)) * 2) : 0;
    const bx = 6, T = gy - 30;                               // canto da cama e topo do colchão
    const SHEET = '#a8dcf7', SHEETD = '#6fb0dc', SHEETL = '#dff3ff', GOWN = '#ffc6de', GOWND = '#e89ab8';
    const STEEL = '#8a93a7', STEELD = '#5a6478';
    const disc = (cx, cy, r, c, to = r) => { for (let dy = -r; dy < to; dy++) { const hw = Math.round(Math.sqrt(r * r - (dy + 0.5) ** 2)); R(cx - hw, cy + dy, 2 * hw, 1, c); } };

    // o soro e o monitor, atrás da cabeceira
    R(1, gy - 84, 2, 80, STEEL); R(0, gy - 84, 5, 2, STEEL); R(0, gy - 5, 8, 2, STEEL);
    R(4, gy - 81, 8, 12, INK); R(5, gy - 80, 6, 10, '#eaf8ff'); R(5, gy - 75, 6, 5, '#8fd0f5'); R(8, gy - 69, 1, 30, '#bfe9ff');
    R(12, gy - 94, 26, 18, INK); R(13, gy - 93, 24, 14, '#0f2a2a');
    for (let x = 0; x < 24; x++) { const ph = (x + Math.floor(t * (busy ? 40 : 18))) % 12; const d = ph === 5 ? -4 : ph === 6 ? 2 : 0; R(13 + x, gy - 86 + Math.min(0, d), 1, Math.abs(d) + 1, '#5cf08a'); }
    R(24, gy - 76, 2, 12, STEELD);

    // a parteira (desenhada antes da cama, para o colchão lhe tapar as pernas)
    const mx = 44, my = gy - 70, bob = busy ? Math.floor(t * 6) % 2 : 0;
    ctx.drawImage(this.midwife.stand.l, mx, my - bob, 32, 48);
    if (flying) {
      const a = Math.sin(t * 22);
      for (const [ax, dir] of [[mx + 5, -1], [mx + 27, 1]]) {
        for (let k = 0; k < 8; k++) {
          const x = ax + Math.round(dir * (1 + k * 1.6) + a * 2 * dir), y = my + 25 - Math.round(k * 2.4) - Math.round(a * 2);
          R(x - 1, y, 4, 3, INK); R(x, y + 1, 2, 2, SKIN);
        }
      }
      if (Math.floor(t * 8) % 2) { R(mx + 12, my - 13, 2, 6, '#ff3b3b'); R(mx + 12, my - 5, 2, 2, '#ff3b3b'); R(mx + 18, my - 15, 2, 6, GOLD); R(mx + 18, my - 7, 2, 2, GOLD); }
    }

    // a cabeceira: o varão da cama e, apoiada nele, a almofada grande do encosto, branca e inclinada
    R(bx, T - 38, 5, 40, INK); R(bx + 1, T - 37, 3, 38, STEEL); R(bx + 2, T - 37, 1, 38, '#b8c4d6');
    for (let i = 0; i < 34; i++) R(bx + 4, T - 33 + i, Math.round(i * 0.45) + 2, 1, '#ffffff');
    for (let i = 0; i < 34; i++) R(bx + 3 + Math.round(i * 0.45), T - 33 + i, 12, 1, INK);
    for (let i = 1; i < 34; i++) R(bx + 4 + Math.round(i * 0.45), T - 33 + i, 10, 1, i % 7 === 0 ? '#e8ecf4' : '#ffffff');
    disc(bx + 17, T - 20, 9, INK); disc(bx + 17, T - 20, 8, '#ffffff'); R(bx + 11, T - 23, 6, 2, '#e8ecf4');

    // a camisa do hospital (às pintinhas), desde debaixo da cabeça até à barriga
    R(bx + 20, T - 11, 31, 12, INK); R(bx + 21, T - 10, 29, 10, GOWN);
    for (let k = 0; k < 7; k++) R(bx + 24 + k * 4, T - 8 + (k % 2) * 3, 1, 1, GOWND);

    // a mãe: a cabeça (a do boneco dela) deitada na almofada, com gotas de esforço quando faz força
    ctx.drawImage(this.mother.stand.r, 2, 3, 12, 11, bx + 9, T - 29 + push, 24, 22);
    if (busy) { R(bx + 35, T - 26 - (Math.floor(t * 8) % 3), 2, 3, '#8fd0f5'); R(bx + 6, T - 30 + (Math.floor(t * 8 + 2) % 3), 2, 3, '#8fd0f5'); }

    // o braço pousado em cima do lençol
    R(bx + 34, T - 7, 18, 5, INK); R(bx + 35, T - 6, 16, 3, SKIN); R(bx + 49, T - 7, 5, 5, INK); R(bx + 50, T - 6, 3, 3, SKIN);

    // a barriga redonda, debaixo do lençol
    disc(bx + 58, T - 1, 13, INK, 0); disc(bx + 58, T - 1, 12, SHEET, 0); disc(bx + 54, T - 3, 6, SHEETL, 0);

    // os joelhos levantados (um atrás do outro) e o lençol a descer até aos pés
    const kx = bx + 74, ky = T - 24 - push;
    const tent = (ox, oy, c, line) => {
      for (let y = 0; y <= 23 - oy; y++) {
        const l = Math.round(y * 0.8), rr = Math.round(y * 0.6);
        R(kx + ox - l, ky + oy + y, l + rr + 2, 1, c);
        if (line && y) { R(kx + ox - l, ky + oy + y, 1, 1, line); R(kx + ox + rr + 1, ky + oy + y, 1, 1, line); }
      }
    };
    tent(-6, 3, INK); tent(-6, 3, SHEETD);
    tent(0, 0, INK); tent(0, 0, SHEET, SHEETD);
    R(kx - 2, ky + 1, 4, 1, SHEETL); R(kx - 1, ky + 2, 2, 1, SHEETL);
    R(bx + 86, T - 9, 8, 9, INK); R(bx + 87, T - 8, 6, 7, SHEET); R(bx + 88, T - 9, 2, 1, SHEET);
    R(bx + 91, T - 7, 2, 1, SHEETD); R(bx + 91, T - 5, 2, 1, SHEETD);

    // o colchão, o lençol a cair sobre ele, os pés da cama, o estrado e as rodas
    R(bx + 2, T, 96, 11, INK); R(bx + 3, T + 1, 94, 9, '#ffffff'); R(bx + 3, T + 7, 94, 3, '#d8dce6');
    R(bx + 44, T, 52, 7, SHEET); R(bx + 44, T + 6, 52, 1, SHEETD);
    for (let x = bx + 50; x < bx + 94; x += 9) R(x, T + 1, 1, 5, SHEETD);
    R(bx + 96, T - 18, 4, 30, INK); R(bx + 97, T - 17, 2, 28, STEEL);
    R(bx + 1, T + 11, 98, 4, STEELD); R(bx + 1, T + 11, 98, 1, STEEL);
    R(bx + 8, T + 15, 4, gy - T - 19, STEEL); R(bx + 88, T + 15, 4, gy - T - 19, STEEL);
    for (const w of [bx + 6, bx + 86]) { R(w, gy - 5, 8, 5, INK); R(w + 2, gy - 4, 4, 3, '#4a4458'); }
    if (st === 'caught') ctx.drawImage(this.spr.heart, bx + 20, T - 42 + Math.round(Math.sin(t * 4) * 2));
  }

  // Um bebé embrulhado numa mantinha; `spin` roda-o enquanto voa.
  drawBaby(R, x, y, blanket, spin) {
    const flip = spin === 1 || spin === 2 ? -1 : 1, up = spin >= 2 ? -1 : 1;
    const bx = (dx, w) => (flip > 0 ? x + dx : x - dx - w), by = (dy, h) => (up > 0 ? y + dy : y - dy - h);
    R(bx(-8, 16), by(-6, 13), 16, 13, INK);
    R(bx(-7, 9), by(-5, 11), 9, 11, blanket);
    R(bx(-7, 9), by(-5, 2), 9, 2, 'rgba(255,255,255,0.5)');
    R(bx(1, 6), by(-5, 9), 6, 9, SKIN);
    R(bx(1, 6), by(-5, 2), 6, 2, '#6b4a2e');
    R(bx(4, 1), by(-1, 2), 1, 2, INK);
    R(bx(3, 2), by(2, 1), 2, 1, '#f09a8c');
  }
}
