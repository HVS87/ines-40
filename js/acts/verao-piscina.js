// «Verões em Santo Amaro», de dia: bombas na piscina da casa dos avós da Isabel. Cada amiga
// balança no trampolim; toca-se no instante em que ela bate na prancha para a bomba sair
// perfeita (salpico enorme, notas 10 e o jornal do avô molhado). Quatro saltos, um coração por
// cada bomba perfeita; quem não tocar salta sozinha ao fim de uns segundos.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, GOLD, PAPER, clamp, lerp, hash, sky, disc, person, shadow, text, mark } from '../draw.js';

const QUEM = [
  { who: 'ines', name: 'a Inês', T: 0.95 },
  { who: 'isabel', name: 'a Isabel', T: 0.86 },
  { who: 'ana', name: 'a Ana', T: 0.78 },
  { who: 'soft', name: 'a Soft', T: 0.7 },
];
const NOTAS = { perfect: [10, 10, 10], good: [7, 8, 7], weak: [4, 5, 3] };
const AVO = [
  'Avô: «Ai, o meu jornal!... Nota 10, vá.»',
  'Avô: «Lá se foi a página do desporto!»',
  'Avô: «Meninas! Deixem alguma água na piscina!»',
  'Avô: «Desisto. Leio o jornal amanhã.»',
];

export class VeraoPiscina extends Act {
  get max() { return this.cfg.hearts || 4; }

  start() {
    this.girls = QUEM.map((q) => ({ ...q, frames: getCharacter(q.who, 'praia') }));
    this.avo = getCharacter('avo', 'casual');
    this.j = 0;              // quem salta
    this.mode = 'walk';      // walk → bounce → fly → splash → (seguinte) ... → over
    this.mt = 0; this.ph = 0; this.q = 'good'; this.wet = 0; this.perfects = 0; this.auto = false;
    this.hint(this.ask());
  }

  ask() { return `Toca quando ${this.girls[this.j].name} bater no trampolim, para dar balanço à bomba!`; }

  layout(v) {
    const top = this.top(v), gy = v.portrait ? Math.round(v.h * 0.56) : v.h - 42;
    const poolL = Math.round(v.portrait ? v.w * 0.37 : v.w * 0.36);
    const tipX = poolL + 20, tipY = gy - 16;
    const jx = (i) => Math.round(poolL + 54 + (i * (v.w - 20 - poolL - 54)) / 3);
    return { top, gy, poolL, tipX, tipY, jx, apex: clamp(tipY - 48 - top - 6, 18, 84), waterY: gy + (v.portrait ? 34 : 14) };
  }

  // posição (pés) de quem salta, durante o voo: u de 0 a 1
  flight(L, v, u) {
    const k = this.q === 'perfect' ? 1 : this.q === 'good' ? 0.72 : 0.45;
    const x1 = L.poolL + (v.w - L.poolL) * (0.3 + 0.22 * k), h = L.apex * k;
    const y = lerp(L.tipY, L.waterY + 20, u) - 4 * h * u * (1 - u) - (L.waterY + 20 - L.tipY) * u * (1 - u);
    return { x: lerp(L.tipX, x1, u), y, x1 };
  }

  update(dt, I, v) {
    const g = this.girls[this.j], L = this.layout(v);
    this.mt += dt;
    if (this.wet > 0) this.wet -= dt;
    if (this.mode === 'over') { if (this.mt > 2.8) this.done(); return; }
    if (this.mode === 'walk') { if (this.mt > 0.9) { this.mode = 'bounce'; this.mt = 0; this.ph = 0.5; } return; }
    if (this.mode === 'bounce') {
      const before = this.ph;
      this.ph += dt / g.T;
      if (Math.floor(this.ph) !== Math.floor(before)) this.sfx('toc');
      const e = Math.abs(this.ph - Math.round(this.ph));
      let go = I.actionPressed && this.ph > 0.8;
      if (this.mt > 9 && e < 0.03) { go = true; this.auto = true; }    // ninguém tocou: salta sozinha
      if (go) {
        this.q = this.auto ? 'good' : e < 0.14 ? 'perfect' : e < 0.28 ? 'good' : 'weak';
        this.auto = false; this.mode = 'fly'; this.mt = 0; this.sfx('jump');
      }
      return;
    }
    if (this.mode === 'fly') {
      const dur = this.q === 'perfect' ? 1.15 : this.q === 'good' ? 0.95 : 0.75;
      if (this.mt >= dur) {
        // entra na água
        const p = this.flight(L, v, 1), n = this.q === 'perfect' ? 46 : this.q === 'good' ? 24 : 12;
        this.splashX = p.x1; this.mode = 'splash'; this.mt = 0;
        this.fx.burst(p.x1, L.waterY, n, ['#ffffff', '#bff0ff', '#6fd0f4'], this.q === 'perfect' ? 130 : 80);
        this.sfx(this.q === 'weak' ? 'stomp' : 'boom');
        if (this.q === 'perfect') {
          this.heart(1, p.x1, L.waterY - 30); this.wet = 3;
          this.hint(AVO[this.perfects % AVO.length]); this.perfects++;
        } else this.hint(this.q === 'good' ? 'Bom mergulho! Mas uma bomba a sério pede mais balanço.' : 'Chapa! Ui... essa doeu só de ver.');
      }
      return;
    }
    // splash: as amigas dão as notas
    if (this.mt > 2.6 || (this.mt > 1.2 && I.actionPressed)) {
      this.j++; this.mt = 0;
      if (this.j >= this.girls.length) {
        this.j = this.girls.length - 1; this.mode = 'over'; this.sfx('check');
        this.hint('Isabel: «E logo à noite... vamos ao Garage?»');
      } else { this.mode = 'walk'; this.hint(this.ask()); }
    }
  }

  // boneco rodado (a bomba dá cambalhotas no ar)
  spin(ctx, frames, x, y, ang, face = 1) {
    const img = frames.a[face < 0 ? 'l' : 'r'];
    ctx.save(); ctx.translate(Math.round(x), Math.round(y - img.height)); ctx.rotate(ang);
    ctx.drawImage(img, -img.width, -img.height, img.width * 2, img.height * 2);
    ctx.restore();
  }

  fundo(ctx, v, R, L, t) {
    const { gy, poolL, top } = L, w = v.w;
    sky(ctx, w, v.h, gy, ['#3fa8ec', '#8fd4f8', '#e4f7ff']);
    disc(ctx, w - 30, top + 16, 11, '#fff3b0'); disc(ctx, w - 30, top + 16, 8, '#ffe066');
    for (let i = 0; i < 3; i++) { const x = ((hash(i + 2) * (w + 60) + t * (2 + i)) % (w + 60)) - 30, y = top + 8 + i * 13; R(x, y, 24, 4, '#ffffff'); R(x + 5, y - 3, 12, 3, '#ffffff'); }
    // a casa (branca, de telha, portadas verdes), à esquerda
    const hh = clamp(gy - top - 34, 56, 120), hw = Math.round(poolL * 0.95), hy = gy - hh;
    R(0, hy, hw, hh, '#fbf6ea'); R(hw - 3, hy, 3, hh, '#e0d8c4');
    R(0, hy - 6, hw + 5, 7, '#c96f4a'); R(0, hy, hw + 5, 1, '#a85a3a');
    for (let x = 2; x < hw + 4; x += 6) R(x, hy - 6, 1, 6, '#a85a3a');
    for (let k = 0; hy + 12 + k * 40 < gy - 34; k++) for (let x = 10; x + 14 < hw - 4; x += 30) {
      const y = hy + 12 + k * 40;
      R(x - 1, y - 1, 16, 20, '#6a8a6a'); R(x + 3, y, 8, 18, '#5a7fb5'); R(x, y, 3, 18, '#3f8a4a'); R(x + 11, y, 3, 18, '#3f8a4a'); R(x - 2, y + 19, 18, 2, '#e0d8c4');
    }
    R(0, gy - 10, hw, 4, '#e8b04a');
    // sebe e palmeira ao fundo
    R(hw, gy - 30, w - hw, 30, '#2f7f44'); R(hw, gy - 30, w - hw, 3, '#4fa85a');
    for (let x = hw + 4; x < w; x += 9) R(x, gy - 33 + Math.round(hash(x) * 3), 5, 4, '#4fa85a');
    for (let i = 0; i < 14; i++) R(hw + Math.floor(hash(i * 3.3) * (w - hw - 4)), gy - 24 + Math.floor(hash(i * 5.1) * 16), 2, 2, i % 2 ? '#ff8ab8' : '#ffe066');
    const px = Math.round(w * 0.78), ph = Math.min(74, gy - top - 34);
    R(px - 2, gy - ph, 5, ph - 4, INK); R(px - 1, gy - ph, 3, ph - 4, '#a8794a');
    for (const [dx, dy] of [[-16, 2], [-11, -5], [-4, -9], [4, -9], [11, -5], [16, 2]]) { R(px + dx - 5, gy - ph + dy - 1, 11, 5, INK); R(px + dx - 4, gy - ph + dy, 9, 3, '#3f9a52'); }
    // o deque de pedra: uma faixa ao fundo e todo o lado esquerdo
    R(0, gy - 6, w, 9, '#eadcc0'); R(0, gy - 6, w, 1, '#c9b894');
    R(0, gy + 3, poolL, v.h - gy - 3, '#eadcc0');
    for (let y = gy + 3; y < v.h; y += 14) R(0, y, poolL, 1, '#d4c4a0');
    for (let x = ((gy % 7) + 6); x < poolL; x += 22) R(x, gy + 3, 1, v.h - gy, '#d4c4a0');
  }

  agua(ctx, v, R, L, t) {
    const { gy, poolL } = L, w = v.w, y0 = gy + 3, h = v.h - y0;
    R(poolL, y0, w - poolL, h, '#2fb0e4'); R(poolL, y0, w - poolL, 3, '#9fe6ff');
    R(poolL, y0 + 3, w - poolL, Math.min(8, h), '#48c0ee');
    for (let i = 0; i < 46; i++) {
      const x = poolL + 4 + hash(i * 1.7) * (w - poolL - 14) + Math.sin(t * 1.3 + i) * 3, y = y0 + 6 + hash(i * 3.9) * (h - 18);
      R(x, y, 5 + (i % 3) * 3, 1, i % 4 ? '#7fd8f8' : '#d6f6ff');
    }
    R(poolL - 3, y0 - 1, 3, h + 1, '#fffaf0'); R(poolL - 4, y0 - 1, 1, h + 1, '#c9b894');
    R(poolL - 3, v.h - 7, w - poolL + 3, 7, '#fffaf0'); R(poolL - 3, v.h - 8, w - poolL + 3, 1, '#c9b894');
    if (h > 80) {   // ao alto há espaço para uma boia e uma bola
      const bx = w - 46 + Math.sin(t * 0.7) * 5, by = y0 + h * 0.62 + Math.sin(t * 1.1) * 2;
      disc(ctx, bx, by, 11, INK); disc(ctx, bx, by, 10, '#ff5d8f'); disc(ctx, bx, by, 5, '#2fb0e4'); R(bx - 2, by - 10, 4, 5, '#ffffff'); R(bx - 2, by + 5, 4, 5, '#ffffff');
      const cx = poolL + 34 + Math.sin(t * 0.5) * 4, cy = y0 + h * 0.8;
      disc(ctx, cx, cy, 7, INK); disc(ctx, cx, cy, 6, '#ffe066'); R(cx - 5, cy - 1, 11, 2, '#e0527a');
    }
  }

  // o avô na espreguiçadeira, a ler o jornal debaixo do guarda-sol
  avoDraw(ctx, v, R, L, t) {
    const x = Math.round(L.poolL * 0.34), y = L.gy + (v.portrait ? 44 : 24), wet = this.wet > 0;
    const jump = wet && this.wet > 2.6 ? 3 : 0;
    // guarda-sol
    const ux = Math.max(33, x - 12), uy = y - 78;
    R(ux - 1, uy + 4, 2, 78, INK);
    for (let i = 0; i < 5; i++) R(ux - 7 - i * 6, uy + i * 3 - 1, 14 + i * 12, 4, INK);
    for (let i = 0; i < 5; i++) { const half = 6 + i * 6; R(ux - half, uy + i * 3, half * 2, 3, '#ff5d8f'); for (const sx of [-22, -8, 6, 20]) if (Math.abs(sx + 2) < half - 2) R(ux + sx, uy + i * 3, 4, 3, '#fff6e6'); }
    shadow(ctx, x + 6, y, 44);
    // espreguiçadeira
    R(x - 18, y - 10, 46, 4, INK); R(x - 17, y - 9, 44, 2, '#f2f2f7'); R(x - 14, y - 6, 3, 6, INK); R(x + 20, y - 6, 3, 6, INK);
    R(x - 20, y - 28, 5, 20, INK); R(x - 19, y - 27, 3, 18, '#f2f2f7');
    R(x - 17, y - 12, 44, 3, '#5a8fd0');
    // o avô: tronco direito, pernas esticadas
    const img = this.avo.stand.r;
    ctx.drawImage(img, 0, 0, 16, 17, x - 22, y - 46 - jump, 32, 34);
    R(x - 2, y - 17 - jump, 24, 6, INK); R(x - 2, y - 16 - jump, 23, 4, '#6b5a3e'); R(x + 20, y - 19 - jump, 6, 8, INK); R(x + 21, y - 18 - jump, 4, 6, '#5a3a22');
    // o jornal
    const jx = x + 2, jy = y - 34 - jump + (wet ? 3 : 0);
    R(jx - 1, jy - 1, 20, 17, INK); R(jx, jy, 18, 15, wet ? '#cfe0ea' : PAPER); R(jx + 8, jy, 1, 15, '#b8b0a0');
    for (let k = 0; k < 4; k++) { R(jx + 2, jy + 3 + k * 3, 5, 1, '#8a8590'); R(jx + 11, jy + 3 + k * 3, 5, 1, '#8a8590'); }
    if (wet) { for (let k = 0; k < 5; k++) R(jx + 2 + k * 3, jy + 15 + ((Math.floor(t * 6) + k) % 4), 1, 2, '#6fd0f4'); mark(ctx, x - 6, y - 50 - jump, '!'); }
  }

  draw(ctx, v, R) {
    const L = this.layout(v), t = this.t, { gy, poolL, tipX, tipY } = L, g = this.girls[this.j];
    this.fundo(ctx, v, R, L, t);
    // as outras amigas, do lado de lá da piscina (são o júri)
    const showCards = this.mode === 'splash' && this.mt > 0.5;
    let c = 0;
    this.girls.forEach((o, i) => {
      const busy = i === this.j && this.mode !== 'over';
      if (busy) return;
      const x = L.jx(i), hop = showCards || this.mode === 'over' ? Math.round(Math.abs(Math.sin(t * 7 + i)) * 2) : 0;
      shadow(ctx, x, gy + 1, 12);
      person(ctx, o.frames, x, gy + 1, { face: -1, scale: 2, hop });
      if (showCards) {
        const n = NOTAS[this.q][c % 3], cy = gy - 62 - hop; c++;
        R(x - 9, cy - 1, 18, 14, INK); R(x - 8, cy, 16, 12, n === 10 ? GOLD : PAPER);
        text(ctx, String(n), x, cy + 3, n === 10 ? '#a8324a' : '#3a4a7a', { align: 'center' });
        R(x - 1, cy + 13, 2, 5, INK);
      }
    });
    this.agua(ctx, v, R, L, t);
    this.avoDraw(ctx, v, R, L, t);
    // trampolim: a prancha verga quando a saltadora lhe bate
    const hgt = this.mode === 'bounce' ? Math.abs(Math.sin(Math.PI * this.ph)) : this.mode === 'walk' ? 1 : 1;
    const bend = this.mode === 'bounce' && hgt < 0.35 ? Math.round((0.35 - hgt) * 12) : 0;
    R(poolL - 22, gy - 12, 10, 15, INK); R(poolL - 21, gy - 11, 8, 14, '#d8dce6');
    R(poolL - 26, tipY - 1, 30, 5, INK); R(poolL - 25, tipY, 29, 3, '#3f8fe0');
    R(poolL + 4, tipY - 1 + Math.round(bend / 2), 14, 5, INK); R(poolL + 4, tipY + Math.round(bend / 2), 13, 3, '#3f8fe0');
    R(poolL + 17, tipY - 1 + bend, 11, 5, INK); R(poolL + 17, tipY + bend, 10, 3, '#6fb0f0');
    // quem salta
    if (this.mode === 'walk') {
      const u = clamp(this.mt / 0.8, 0, 1), x = lerp(poolL - 60, tipX, u), onBoard = x > poolL - 24;
      person(ctx, g.frames, x, onBoard ? tipY : gy + 3, { face: 1, scale: 2, moving: u < 1, dist: u * 50 });
    } else if (this.mode === 'bounce') {
      const h = Math.round(Math.abs(Math.sin(Math.PI * this.ph)) * 15);
      person(ctx, g.frames, tipX, tipY + (h < 2 ? bend : 0), { face: 1, scale: 2, hop: h, air: h > 2 });
      // régua do balanço: o traço chega ao verde quando ela bate na prancha
      const bw = Math.min(118, v.w - 60), bx = Math.round((v.w - bw) / 2), by = L.top + 4, ph = (this.ph + 0.5) % 1;
      R(bx - 2, by - 2, bw + 4, 10, INK); R(bx, by, bw, 6, '#3a2f4f');
      R(bx + bw * 0.22, by, bw * 0.56, 6, '#e0a820'); R(bx + bw * 0.36, by, bw * 0.28, 6, '#5cf08a');
      R(bx + ph * bw - 1, by - 3, 3, 12, INK); R(bx + ph * bw, by - 2, 1, 10, '#ffffff');
    } else if (this.mode === 'fly') {
      const dur = this.q === 'perfect' ? 1.15 : this.q === 'good' ? 0.95 : 0.75, u = clamp(this.mt / dur, 0, 1), p = this.flight(L, v, u);
      const turns = this.q === 'perfect' ? 2 : this.q === 'good' ? 1 : 0.25;
      this.spin(ctx, g.frames, p.x, p.y, u * turns * Math.PI * 2);
    } else if (this.mode === 'splash') {
      // coluna de água e ondas em anel
      const u = this.mt, big = this.q === 'perfect' ? 1 : this.q === 'good' ? 0.6 : 0.3, x = this.splashX, y = L.waterY;
      if (u < 0.7) {
        const hh = Math.sin((u / 0.7) * Math.PI) * 46 * big;
        R(x - 5, y - hh, 10, hh, '#d6f6ff'); R(x - 9, y - hh * 0.6, 18, hh * 0.6, '#ffffff'); R(x - 14, y - hh * 0.3, 28, hh * 0.3, '#bff0ff');
      }
      for (let k = 0; k < 3; k++) { const r = (u * 34 + k * 9) * (0.5 + big * 0.5); if (r < 60 && u < 2) { R(x - r, y + k, 6, 1, '#d6f6ff'); R(x + r - 6, y + k, 6, 1, '#d6f6ff'); } }
      if (u > 1.1) {   // a cabeça a aparecer à tona
        const img = g.frames.stand.l;
        ctx.drawImage(img, 0, 0, 16, 14, Math.round(x - 16), Math.round(y - 22 + Math.sin(t * 5) * 1.5), 32, 28);
        R(x - 16, y + 5, 32, 3, '#9fe6ff');
      }
    }
  }

  bot(I) {
    if (this.mode === 'bounce' && this.ph > 0.9 && Math.abs(this.ph - Math.round(this.ph)) < 0.035) I.actionPressed = true;
    if (this.mode === 'splash' && this.mt > 1.4) I.actionPressed = true;
  }
}
