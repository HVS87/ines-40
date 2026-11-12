// Ato «mergulho» (nível 20): o chalé vermelho à beira do fiorde. Um de cada vez, o Tomás, o
// Lourenço e a Inês saltam do pontão para a água gelada: mantém-se premido para encher a barra
// da coragem e larga-se na zona verde (mergulho perfeito = coração; fora dela, chapão, mas vai
// à água na mesma). Depois, aguentar o frio: tocar quando a onda chega ao círculo. No fim,
// chocolate quente no alpendre.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, PINK, clamp, lerp, hash, person, shadow, sky, text } from '../draw.js';

const QUEM = [
  { who: 'tomas', outfit: 'casual', say: 'Tomás: «O último a saltar faz o jantar!»' },
  { who: 'lourenco', outfit: 'praia', say: 'Lourenço: «Na Austrália a água era bem mais quentinha...»' },
  { who: 'ines', outfit: 'praia', say: 'Inês: «Se eles saltaram, eu também salto. Um, dois...»' },
];
const BEATS = 8, BEAT = 0.85, WINDOW = 0.2;
const RED = '#b8392e', RED_D = '#96281f';

function tri(R, cx, topY, half, h, color) {
  for (let i = 0; i < h; i++) { const hw = Math.round((half * (i + 1)) / h); R(cx - hw, topY + i, hw * 2, 1, color); }
}

export class Mergulho extends Act {
  get max() { return 5; }

  start() {
    this.who = QUEM.map((q) => ({ ...q, frames: getCharacter(q.who, q.outfit), warm: getCharacter(q.who, 'inverno') }));
    this.n = 0;              // quem salta agora
    this.ph = 'ready';       // ready → charge → jump (x3) → cold → porch
    this.pt = 0; this.bar = 0; this.dir = 1; this.idle = 0; this.armed = false; this.res = '';
    this.beats = []; this.good = 0; this.flash = 0;
    this.hint('Mantém o dedo no ecrã (ou o Espaço) para ganhar coragem e larga na zona verde!');
  }

  zone() { return [0.7, 0.15 - this.n * 0.02]; }      // centro e meia largura da zona verde

  geo(v) {
    const wy = Math.round(v.h * (v.portrait ? 0.6 : 0.76)), sx = Math.round(v.w * 0.3), px = Math.round(v.w * 0.62);
    return { wy, sx, px, py: wy - 8, slot: (k) => Math.round(px + (v.w - px) * (0.22 + 0.3 * k)) };
  }

  release(v) {
    const [c, hw] = this.zone();
    this.res = Math.abs(this.bar - c) <= hw ? 'ok' : this.bar < c ? 'low' : 'high';
    this.ph = 'jump'; this.pt = 0; this.wet = false;
    this.sfx('jump');
  }

  update(dt, I, v) {
    const g = this.geo(v);
    this.pt += dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.ph === 'ready' || this.ph === 'charge') {
      if (!I.action) this.armed = true;
      if (I.action && this.armed) {
        if (this.ph === 'ready') { this.ph = 'charge'; this.bar = 0; this.dir = 1; }
        this.bar += this.dir * dt * (0.75 + this.n * 0.1);
        if (this.bar >= 1) { this.bar = 1; this.dir = -1; } else if (this.bar <= 0) { this.bar = 0; this.dir = 1; }
      } else if (this.ph === 'charge') this.release(v);
      else { this.idle += dt; if (this.idle > 8) { this.bar = 0.3; this.release(v); } }
    } else if (this.ph === 'jump') {
      if (!this.wet && this.pt > 1) {
        // entrou na água
        this.wet = true;
        const x = g.slot(this.n), ok = this.res === 'ok';
        this.fx.burst(x, g.wy, ok ? 14 : 30, ['#ffffff', '#bfe8f4', '#8fd0e8'], ok ? 70 : 120);
        this.sfx(ok ? 'pop' : 'boom');
        if (ok) this.heart(1, x, g.wy - 20);
        this.hint(ok ? 'Mergulho perfeito! E a água... geladinha!' : this.res === 'low' ? 'Entrou a medo, de nariz tapado... mas entrou!' : 'Coragem a mais: um chapão de barriga! Mas já lá está.');
      }
      if (this.pt > 2.3) {
        this.n++;
        this.idle = 0; this.armed = false; this.bar = 0;
        if (this.n >= QUEM.length) {
          this.ph = 'cold'; this.pt = 0;
          this.beats = Array.from({ length: BEATS }, (x, k) => ({ at: 1.6 + k * BEAT, hit: 0 }));
          this.hint('Brrr! Toca quando a onda chegar ao círculo, para aguentar o frio!');
        } else { this.ph = 'ready'; this.pt = 0; this.hint(QUEM[this.n].say); }
      }
    } else if (this.ph === 'cold') {
      if (I.actionPressed) {
        const b = this.beats.find((x) => !x.hit && Math.abs(x.at - this.pt) < WINDOW);
        if (b) {
          b.hit = 1; this.good++; this.flash = 0.25; this.sfx('plim');
          if (this.good === 3 || this.good === 6) this.heart(1, g.slot(1), g.wy - 24);
        } else this.sfx('toc');
      }
      for (const b of this.beats) if (!b.hit && this.pt > b.at + WINDOW) b.hit = -1;
      if (this.pt > 1.6 + BEATS * BEAT + 0.3) {
        this.ph = 'porch'; this.pt = 0; this.sfx('win');
        this.hint('E agora, chocolate quente no alpendre do chalé. Que bem que sabe!');
      }
    } else if (this.pt > 4) this.done();
  }

  // ---------- desenho ----------
  fjord(ctx, v, R, g) {
    const { wy } = g, w = v.w, t = this.t;
    sky(ctx, w, v.h, wy, ['#7ab8ea', '#bfe0f4', '#eef6ec']);
    // as paredes do fiorde, com neve lá em cima e uma cascata
    for (let x = 0; x < w; x += 2) {
      const f = x / w;
      const far = wy - 40 - Math.round(Math.sin(f * 5 + 1) * 10 + Math.sin(f * 13) * 5) - Math.round(wy * 0.12);
      R(x, far, 2, wy - far, '#8ea6c8'); R(x, far, 2, 6 + (x % 4), '#ffffff');
      const hl = Math.round((wy - 20) * clamp(1 - f * 2.2, 0, 1) ** 0.7), hr = Math.round((wy - 30) * clamp((f - 0.62) * 2.6, 0, 1) ** 0.8);
      if (hl > 0) { R(x, wy - hl, 2, hl, '#3f7458'); if (wy - hl < wy * 0.3) R(x, wy - hl, 2, 5, '#e6f0f8'); if ((x * 7) % 22 < 2 && hl > 30) R(x, wy - hl + 12 + (x % 9), 2, 5, '#2f5f48'); }
      if (hr > 0) { R(x, wy - hr, 2, hr, '#4a7f68'); if (wy - hr < wy * 0.3) R(x, wy - hr, 2, 5, '#e6f0f8'); if ((x * 5) % 26 < 2 && hr > 30) R(x, wy - hr + 14 + (x % 11), 2, 5, '#3a6a54'); }
    }
    const cx = Math.round(w * 0.93);
    R(cx, wy - Math.round(wy * 0.4), 3, Math.round(wy * 0.4), '#dff2fa');
    for (let k = 0; k < 5; k++) R(cx + (k % 2), wy - Math.round(wy * 0.4) + Math.floor((t * 40 + k * 23) % (wy * 0.4)), 2, 4, '#8fc8e8');
    // a água, com os reflexos
    R(0, wy, w, v.h - wy, '#2f8090'); R(0, wy, w, 2, '#57a8b4');
    for (let k = 0; k < 16; k++) {
      const rx = ((k * 47 + Math.sin(t * 0.8 + k) * 6) % w + w) % w, ry = wy + 6 + ((k * 19) % Math.max(6, v.h - wy - 10));
      R(rx, ry, 10 + (k % 3) * 5, 1, k % 2 ? '#8fd0d8' : '#1f6676');
    }
  }

  cabin(ctx, R, x, b) {
    R(x - 26, b - 26, 52, 26, INK); R(x - 25, b - 25, 50, 25, RED);
    for (let k = 0; k < 8; k++) R(x - 25, b - 23 + k * 3, 50, 1, RED_D);
    tri(R, x, b - 42, 31, 17, '#4f9a4a'); tri(R, x, b - 38, 23, 13, RED); R(x - 31, b - 26, 62, 2, '#3f7a3a');
    for (let k = 0; k < 9; k++) R(x - 22 + k * 5, b - 30 - Math.round(9 - Math.abs(k - 4) * 2.4), 1, 2, '#8cd070');
    R(x - 19, b - 18, 12, 11, '#ffffff'); R(x - 18, b - 17, 10, 9, '#ffe9a0'); R(x - 14, b - 17, 1, 9, '#ffffff'); R(x - 18, b - 13, 10, 1, '#ffffff');
    R(x + 5, b - 19, 11, 19, '#ffffff'); R(x + 6, b - 18, 9, 18, '#5a3a22'); R(x + 13, b - 9, 1, 2, GOLD);
    R(x + 14, b - 44, 5, 9, '#8a8f9c'); R(x + 13, b - 45, 7, 2, INK);
  }

  head(ctx, q, x, wy, bob, shiver) {
    const img = q.frames.stand.l, u = 2, top = q.who === 'ines' ? 3 : 1;
    ctx.drawImage(img, 0, top, 16, 12, Math.round(x - 8 * u + shiver), Math.round(wy + 3 - 12 * u + bob), 16 * u, 12 * u);
  }

  draw(ctx, v, R) {
    if (this.ph === 'porch') { this.porch(ctx, v, R); return; }
    const g = this.geo(v), { wy, sx, px, py } = g, t = this.t, w = v.w, top = this.top(v), u = 2;
    this.fjord(ctx, v, R, g);
    // a margem, o chalé e o pontão
    for (let x = 0; x < sx + 12; x += 2) { const d = Math.max(0, x - sx), yy = wy - 9 + Math.round(d * 0.9); R(x, yy, 2, v.h - yy, '#6f7686'); R(x, yy, 2, d ? 2 : 5, d ? '#8a9484' : '#6aaa5a'); if (!d) R(x, yy, 2, 1, '#8cc870'); if (hash(x) < 0.3) R(x, yy + 9 + Math.floor(hash(x * 3) * Math.max(4, v.h - yy - 14)), 4, 2, '#5c6272'); }
    this.cabin(ctx, R, Math.round(sx * 0.5), wy - 9);
    R(sx - 6, py, px - sx + 6, 4, INK); R(sx - 6, py, px - sx + 6, 3, '#c89a5c'); R(sx - 6, py, px - sx + 6, 1, '#e8c088');
    for (let x = sx + 4; x < px; x += 9) R(x, py + 1, 1, 2, '#8a6a3a');
    for (const x of [sx + 10, Math.round((sx + px) / 2), px - 5]) { R(x, py + 4, 3, v.h, '#5a3f2a'); R(x, wy, 3, 2, '#bfe8f4'); }
    // quem já está na água
    const cold = this.ph === 'cold';
    for (let k = 0; k < this.n + (this.ph === 'jump' && this.wet && this.pt > 1.35 ? 1 : 0) && k < QUEM.length; k++) {
      const x = g.slot(k), bob = Math.round(Math.sin(t * 3 + k * 2) * 1.5);
      this.head(ctx, this.who[k], x, wy, bob, cold ? Math.round(Math.sin(t * 38 + k)) : 0);
      R(x - 14, wy + 2 + bob, 28, 2, '#bfe8f4'); R(x - 18, wy + 4, 36, 1, '#57a8b4');
      if (cold && Math.floor(t * 2 + k) % 3 === 0) text(ctx, 'BRRR', x, wy - 34, '#dff2fa', { align: 'center', shadow: INK });
    }
    // os que esperam no pontão e quem vai saltar
    for (let k = QUEM.length - 1; k >= this.n; k--) {
      const q = this.who[k], cur = k === this.n;
      let x = px - 9 - (k - this.n) * 27, y = py, rot = 0, hop = 0;
      if (cur && this.ph === 'charge') { hop = Math.round(Math.abs(Math.sin(t * 14)) * (1 + this.bar * 2)); x += Math.round(Math.sin(t * 30) * (this.bar > 0.9 ? 1 : 0)); }
      if (cur && this.ph === 'jump') {
        if (this.pt > 1) continue;
        const f = clamp(this.pt / 1, 0, 1), x1 = g.slot(k), arc = this.res === 'low' ? 10 : this.res === 'ok' ? 46 : 34;
        x = lerp(x, x1, f); y = lerp(py, wy + 8, f * f) - Math.sin(f * Math.PI) * arc;
        rot = this.res === 'ok' ? f * Math.PI * 2.5 : this.res === 'high' ? Math.min(1, f * 1.6) * Math.PI * 0.5 : 0;
      } else shadow(ctx, x, y, 12);
      if (rot) {
        ctx.save(); ctx.translate(Math.round(x), Math.round(y - 12 * u)); ctx.rotate(rot);
        person(ctx, q.frames, 0, 12 * u, { face: 1, scale: u, air: true });
        ctx.restore();
      } else person(ctx, q.frames, x, y, { face: 1, scale: u, hop, air: cur && this.ph === 'jump' });
    }
    // a barra da coragem
    if (this.ph === 'ready' || this.ph === 'charge') {
      const bw = Math.min(170, w - 36), bx = Math.round((w - bw) / 2), by = top + 6, [c, hw] = this.zone();
      R(w / 2 - 17, by - 2, 34, 9, INK); text(ctx, 'CORAGEM', w / 2, by, GOLD, { align: 'center' });
      R(bx - 2, by + 7, bw + 4, 12, INK); R(bx, by + 9, bw, 8, '#3a2f4f');
      R(bx, by + 9, Math.round(bw * (c - hw)), 8, '#4a6a9a'); R(bx + Math.round(bw * (c + hw)), by + 9, bw - Math.round(bw * (c + hw)), 8, '#c0392b');
      R(bx + Math.round(bw * (c - hw)), by + 9, Math.round(bw * hw * 2), 8, '#5cf08a');
      R(bx + Math.round(this.bar * bw) - 2, by + 5, 4, 16, INK); R(bx + Math.round(this.bar * bw) - 1, by + 6, 2, 14, GOLD);
    }
    if (this.ph === 'jump' && this.wet && this.res !== 'ok' && this.pt < 1.8) text(ctx, this.res === 'high' ? 'CHAPA!' : 'PLOC!', g.slot(this.n), wy - 40, PAPER, { align: 'center', scale: 2, shadow: INK });
    // o frio: a onda encolhe até ao círculo; toca-se quando lá chega
    if (cold) {
      const cx = g.slot(1), rx = Math.round((w - px) * 0.45), ry = Math.round(rx * 0.3), cy = wy + 6;
      const ring = (r, col, n) => { for (let k = 0; k < n; k++) { const an = (k / n) * Math.PI * 2; R(cx + Math.cos(an) * r, cy + Math.sin(an) * r * (ry / rx), 2, 2, col); } };
      ring(rx, this.flash > 0 ? '#5cf08a' : GOLD, 80); ring(rx + 1, this.flash > 0 ? '#5cf08a' : GOLD, 80);
      const b = this.beats.find((x) => !x.hit);
      if (b) { const f = (b.at - this.pt) / BEAT; if (f < 1.6) { ring(rx * (1 + Math.max(-0.12, f) * 0.9), '#ffffff', 60); ring(rx * (1 + Math.max(-0.12, f) * 0.9) + 2, '#bfe8f4', 60); } }
      const bw = BEATS * 9, bx = Math.round((w - bw) / 2), by = top + 8;
      R(w / 2 - 33, by - 2, 66, 9, INK); text(ctx, 'AGUENTA O FRIO!', w / 2, by, GOLD, { align: 'center' });
      this.beats.forEach((x, k) => { R(bx + k * 9, by + 8, 8, 8, INK); R(bx + k * 9 + 1, by + 9, 6, 6, x.hit > 0 ? '#ff8a4b' : x.hit < 0 ? '#6a8fb0' : '#3a2f4f'); });
    }
  }

  // o fecho: os três no alpendre, de roupa quente e caneca na mão
  porch(ctx, v, R) {
    const w = v.w, t = this.t, u = v.portrait ? 3 : 2, fy = Math.round(v.h * (v.portrait ? 0.74 : 0.86)), wx = Math.round(w * (v.portrait ? 0.64 : 0.7));
    // o fiorde ao fim da tarde, à direita
    sky(ctx, w, v.h, fy, ['#5a6ab0', '#e89a8a', '#ffd9a0']);
    for (let x = wx; x < w; x += 2) { const f = (x - wx) / (w - wx), mh = Math.round(30 * u * (0.5 + 0.5 * Math.sin(f * 4 + 1))); R(x, fy - 18 * u - mh, 2, mh + 18 * u, '#4a5a80'); R(x, fy - 18 * u - mh, 2, 4, '#ffe9d8'); }
    R(wx, fy - 16 * u, w - wx, 16 * u, '#3f6f90');
    for (let k = 0; k < 6; k++) R(wx + ((k * 37 + Math.round(Math.sin(t + k) * 4)) % Math.max(10, w - wx - 12)), fy - 14 * u + k * 2 * u, 10, 1, '#ffd9a0');
    // a parede do chalé, com janela iluminada, e o telhado do alpendre
    R(0, 0, wx, fy, RED);
    for (let y = 2; y < fy; y += 5) R(0, y, wx, 1, RED_D);
    R(wx - 3, 0, 3, fy, '#ffffff');
    const jx = Math.round(wx * 0.5), jy = fy - 40 * u;
    R(jx - 8 * u - 2, jy - 2, 16 * u + 4, 13 * u + 4, '#ffffff'); R(jx - 8 * u, jy, 16 * u, 13 * u, '#ffe9a0'); R(jx - 1, jy, 2, 13 * u, '#ffffff'); R(jx - 8 * u, jy + 6 * u, 16 * u, 2, '#ffffff');
    R(0, fy - 52 * u, w, 3 * u, '#5a3a22'); R(0, fy - 52 * u - 3 * u, w, 3 * u, '#4f9a4a');
    for (let x = 0; x < w; x += 7) R(x, fy - 52 * u + 3 * u, 3, 2 + (x % 3), '#8cd070');
    R(w - 5 * u, fy - 52 * u, 3 * u, 52 * u, '#5a3a22');
    // chão de tábuas e gradeamento
    R(0, fy, w, v.h - fy, '#a87a48'); R(0, fy, w, 2, '#c89a5c');
    for (let y = fy + 8; y < v.h; y += 9) R(0, y, w, 1, '#8a5f34');
    R(wx, fy - 9 * u, w - wx, u, '#5a3a22'); for (let x = wx + 4; x < w; x += 4 * u) R(x, fy - 9 * u, u, 9 * u, '#5a3a22');
    // os três, de caneca fumegante
    const xs = v.portrait ? [0.2, 0.46, 0.72] : [0.2, 0.4, 0.6];
    this.who.forEach((q, k) => {
      const x = Math.round(w * xs[k]), face = k === 2 ? -1 : 1;
      shadow(ctx, x, fy, 7 * u);
      person(ctx, q.warm, x, fy, { face, scale: u, hop: Math.round(Math.abs(Math.sin(t * 2 + k * 1.3)) * 1) });
      const mx = x + face * 6 * u - (face < 0 ? 3 * u : 0), my = fy - 11 * u;
      R(mx - 1, my - 1, 3 * u + 2, 3 * u + 2, INK); R(mx, my, 3 * u, 3 * u, PAPER); R(mx, my, 3 * u, u, '#6b3f22');
      for (let j = 0; j < 3; j++) R(mx + u + Math.round(Math.sin(t * 3 + j + k) * 2), my - 3 * u - j * 2 * u - Math.floor((t * 6) % (2 * u)), u, u, 'rgba(255,255,255,0.7)');
    });
    for (let k = 0; k < 2; k++) if (Math.floor(t * 1.2 + k) % 2) { const hx = Math.round(w * (xs[k] + xs[k + 1]) / 2), hy = fy - 30 * u - k * 4; R(hx - 2, hy, 2, 2, PINK); R(hx + 1, hy, 2, 2, PINK); R(hx - 2, hy + 1, 5, 2, PINK); R(hx - 1, hy + 3, 3, 1, PINK); R(hx, hy + 4, 1, 1, PINK); }
  }

  bot(I) {
    if (this.ph === 'ready' || this.ph === 'charge') {
      const [c] = this.zone();
      I.action = this.armed && !(this.ph === 'charge' && Math.abs(this.bar - c) < 0.03);
    } else if (this.ph === 'cold') {
      if (this.beats.some((b) => !b.hit && Math.abs(b.at - this.pt) < 0.03)) I.actionPressed = true;
    }
  }
}
