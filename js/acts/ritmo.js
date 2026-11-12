// Dançar ao ritmo: as notas descem por 1 a 3 colunas e toca-se quando chegam ao círculo, enquanto
// os bonecos dançam no cenário. A mecânica é sempre a mesma; cada nível dá-lhe uma «pele»
// (cenário, quem dança, cores, andamento, textos). O relógio do ritmo é próprio (não segue a música).
//
//   { act: Ritmo, hearts: 4, lanes: 1 | 2 | 3, bpm: 120, lead: 1.5 (segundos que a nota demora a descer),
//     pattern: ['1...1...', '1.2.1...', ...]   um compasso por linha, 8 colcheias: '.' pausa, '1'–'3' coluna
//     bg(ctx, v, R, t, st), fg(ctx, v, R, t, st)   cenário atrás / à frente de quem dança
//     ground(v)            → linha do chão (y dos pés)
//     dancers: [{ who, outfit, x (0–1, deitado), px (0–1, ao alto), dy (altura acima do chão, número
//                 ou função (v, st)), scale, face, off }]
//     colors: [cor por coluna], note(ctx, R, x, y, coluna, cor)   desenho da nota (por omissão, um disco)
//     sounds: [som por coluna], songs: [{ label: 'A TOCAR AGORA', title: '...' }], songAt(v, st) → { x, y }
//     intro: 'instrução inicial', end: 'frase final' }
//
// st (estado dado ao cenário): { beat, pulse (1 no tempo → 0), energy (0–1), combo, playing, over,
//   gy, hx, hw, y0, y1 (retângulo das colunas), song, flash }.
// Cada «frase» (número de compassos / corações) vale um coração se o jogador acertar metade.
// Toque: conta a coluna onde se toca; tocar à esquerda ou à direita das colunas vale pela primeira
// ou pela última. Teclado: setas (← ↓ →) para escolher a coluna, ou Espaço/Enter, que acerta na
// nota mais próxima seja qual for a coluna.
import { Act } from './base.js';
import { getCharacter, getSprites } from '../sprites.js';
import { INK, PAPER, PINK, GOLD, MINT, clamp, disc, text, textW, shadow } from '../draw.js';

const PERFECT = 0.085, GOOD = 0.2, EASY = 0.3;   // janelas de tempo (s); EASY: depois de 3 falhas seguidas
const COLORS = [PINK, GOLD, '#6fd0ff'];
const DEFAULT = ['1...1...', '1...1...', '1.1.1...', '1...1.1.', '1.1.1.1.', '1...1...', '1.1.1.1.', '1.1.1...'];
const HELP = [
  'Toca quando a nota chegar ao círculo!',
  'Toca do lado da nota (ou usa as setas ← →) quando ela chegar ao círculo!',
  'Toca na coluna da nota (ou usa as setas ← ↓ →) quando ela chegar ao círculo!',
];

export class Ritmo extends Act {
  get max() { return this.cfg.hearts || 4; }

  start() {
    const c = this.cfg, H = this.max, bars = c.pattern || DEFAULT;
    this.lanes = clamp(c.lanes || 1, 1, 3);
    this.beatLen = 60 / (c.bpm || 120);
    this.lead = c.lead || 1.5;
    this.notes = [];
    this.ph = [];
    for (let k = 0; k < H; k++) this.ph.push({ n: 0, pts: 0, judged: 0, res: 0 });
    bars.forEach((bar, b) => {
      for (let s = 0; s < bar.length; s++) {
        const ch = bar[s];
        if (ch < '1' || ch > '3') continue;
        const phrase = Math.min(H - 1, Math.floor((b * H) / bars.length));
        this.notes.push({ t: ((b * 8 + s) * this.beatLen) / 2, lane: Math.min(this.lanes, +ch) - 1, phrase, state: 0, at: 0 });
        this.ph[phrase].n++;
      }
    });
    this.len = bars.length * 4 * this.beatLen;
    this.time = -(this.lead + 1);
    this.phrase = 0;
    this.combo = 0; this.best = 0;
    this.missRow = 0; this.assist = false;
    this.energy = 0.3; this.stumble = 0; this.flash = 0;
    this.press = [0, 0, 0];
    this.pop = null;
    this.prev = { l: false, r: false, u: false, d: false };
    this.over = 0;
    this.dancers = (c.dancers || []).map((d) => ({ ...d, frames: getCharacter(d.who, d.outfit) }));
    this.hearts = getSprites();
    this.help = c.intro || HELP[this.lanes - 1];
    this.hint(this.help);
  }

  // Onde fica tudo, conforme o formato do ecrã (deitado: colunas ao centro, por cima do cenário;
  // ao alto: cenário em cima e colunas em baixo).
  geo(v) {
    const c = this.cfg, top = this.top(v), L = this.lanes;
    const lw = v.portrait ? (L === 1 ? 44 : L === 2 ? 40 : 52) : (L === 1 ? 34 : L === 2 ? 30 : 40);
    const hw = L * lw, hx = Math.round((v.w - hw) / 2);
    const gy = c.ground ? c.ground(v) : Math.round(v.h * (v.portrait ? 0.5 : 0.86));
    const y1 = v.h - (v.portrait ? 36 : 22);
    const y0 = v.portrait ? gy + (c.songs ? 30 : 14) : top + 2;
    return { top, lw, hw, hx, gy, y0, y1 };
  }

  state(v) {
    const g = this.geo(v), beat = this.time / this.beatLen, fr = beat - Math.floor(beat);
    const songs = this.cfg.songs;
    return {
      ...g, beat, pulse: Math.max(0, 1 - fr * 3), energy: this.energy, combo: this.combo, flash: this.flash,
      playing: this.time > -this.lead * 0.5 && !this.over, over: this.over, lanes: this.lanes,
      song: songs ? songs[Math.min(songs.length - 1, Math.floor((this.phrase * songs.length) / this.max))] : null,
    };
  }

  update(dt, I, v) {
    if (this.over) {
      this.over += dt;
      this.time += dt;
      if (this.over > 3.2 || (this.over > 1 && I.actionPressed)) this.done();
      return;
    }
    this.time += dt;
    const now = this.time, L = this.lanes, g = this.geo(v);
    this.stumble = Math.max(0, this.stumble - dt);
    this.flash = Math.max(0, this.flash - dt * 4);
    this.energy = clamp(this.energy - dt * 0.06, 0, 1);
    for (let k = 0; k < 3; k++) this.press[k] = Math.max(0, this.press[k] - dt);
    if (this.pop) { this.pop.age += dt; if (this.pop.age > 0.6) this.pop = null; }

    // toque → coluna (-1: qualquer coluna; -2: não tocou)
    let tap = -2;
    const p = this.prev;
    if (I.actionPressed) tap = L > 1 && I.pointerX >= 0 ? clamp(Math.floor((I.pointerX * v.w - g.hx) / g.lw), 0, L - 1) : -1;
    else if (I.left && !p.l) tap = L > 1 ? 0 : -1;
    else if (I.right && !p.r) tap = L > 1 ? L - 1 : -1;
    else if ((I.down && !p.d) || (I.up && !p.u)) tap = L === 3 ? 1 : -1;
    p.l = I.left; p.r = I.right; p.u = I.up; p.d = I.down;

    const win = this.assist ? EASY : GOOD;
    if (tap !== -2) {
      let best = null, bd = win + 0.001, other = null, od = win + 0.001;
      for (const n of this.notes) {
        if (n.state) continue;
        if (n.t > now + win) break;
        const d = Math.abs(n.t - now);
        if (d > win) continue;
        if (tap < 0 || n.lane === tap) { if (d < bd) { best = n; bd = d; } } else if (d < od) { other = n; od = d; }
      }
      if (tap >= 0) this.press[tap] = 0.14; else if (best) this.press[best.lane] = 0.14; else this.press[0] = this.press[1] = this.press[2] = 0.1;
      if (best) this.hit(best, bd <= PERFECT ? 1 : 0.75, g);
      else if (other) this.hit(other, 0.5, g);     // no tempo certo, mas do lado errado: vale metade
    }
    // notas que passaram sem toque
    for (const n of this.notes) {
      if (n.state) continue;
      if (n.t > now) break;
      if (now - n.t > win) this.miss(n);
    }
    // fim de cada frase: metade dos pontos dá um coração
    const ph = this.ph[this.phrase];
    if (ph && ph.judged >= ph.n) {
      ph.res = ph.pts >= ph.n * 0.5 ? 1 : -1;
      if (ph.res > 0) this.heart(1, v.w / 2, g.y1 - 14); else this.say('QUASE...', '#c9c9d8');
      this.phrase++;
    }
    if (this.phrase >= this.max && now > this.len - this.beatLen) {
      this.over = 0.01;
      this.sfx('win');
      this.hint(this.cfg.end || 'Que bem que se dança!');
    }
  }

  say(txt, color) { this.pop = { txt, color, age: 0 }; }

  hit(n, pts, g) {
    n.state = 1; n.at = this.time;
    const ph = this.ph[n.phrase];
    ph.pts += pts; ph.judged++;
    this.combo++; this.best = Math.max(this.best, this.combo);
    this.missRow = 0;
    this.energy = clamp(this.energy + 0.1, 0, 1);
    this.flash = 1;
    const col = (this.cfg.colors || COLORS)[n.lane] || GOLD;
    this.say(pts >= 1 ? 'PERFEITO!' : pts >= 0.75 ? 'BOA!' : 'QUASE!', pts >= 1 ? GOLD : pts >= 0.75 ? MINT : '#c9c9d8');
    this.sfx((this.cfg.sounds || [])[n.lane] || 'click');
    this.fx.burst(g.hx + (n.lane + 0.5) * g.lw, g.y1, pts >= 1 ? 8 : 4, [col, PAPER], 50);
  }

  miss(n) {
    n.state = 2; n.at = this.time;
    this.ph[n.phrase].judged++;
    this.combo = 0;
    this.missRow++;
    this.stumble = 0.45;
    this.energy = clamp(this.energy - 0.15, 0, 1);
    this.say('UPS!', '#ff8a6a');
    if (this.missRow >= 3 && !this.assist) { this.assist = true; this.hint(this.help); }
  }

  draw(ctx, v, R) {
    const c = this.cfg, st = this.state(v), t = this.t;
    if (c.bg) c.bg(ctx, v, R, t, st); else { R(0, 0, v.w, st.gy, '#1a1030'); R(0, st.gy, v.w, v.h - st.gy, '#3a2f4f'); }
    this.drawDancers(ctx, v, st);
    if (c.fg) c.fg(ctx, v, R, t, st);
    this.drawTrack(ctx, v, R, st);
    this.drawSong(ctx, v, R, st);
  }

  drawDancers(ctx, v, st) {
    const party = this.over > 0, dancing = (st.playing && this.stumble <= 0) || party;
    this.dancers.forEach((d, i) => {
      const x = Math.round((v.portrait && d.px !== undefined ? d.px : d.x) * v.w);
      const dy = typeof d.dy === 'function' ? d.dy(v, st) : (d.dy || 0);
      const sc = d.scale || 2, b = Math.floor(st.beat * (party ? 2 : 1) + (d.off || 0));
      const leg = dancing ? (b % 2 ? 'a' : 'b') : 'stand';
      const face = (Math.floor((b + i) / 2) % 2 ? -1 : 1) * (d.face || 1);
      const hop = dancing ? Math.round(st.pulse * (2 + st.energy * 3)) + (party ? 1 : 0) : 0;
      const img = (d.frames[leg] || d.frames.stand)[face < 0 ? 'l' : 'r'];
      const w = img.width * sc, h = img.height * sc, y = st.gy - dy;
      shadow(ctx, x, y, sc * 7);
      ctx.drawImage(img, Math.round(x - w / 2), Math.round(y - h - hop), w, h);
    });
  }

  // As colunas, as notas a descer, os círculos, os corações das frases e a avaliação do último toque.
  drawTrack(ctx, v, R, st) {
    const c = this.cfg, L = this.lanes, now = this.time, cols = c.colors || COLORS;
    const { hx, hw, lw, y0, y1 } = st, bot = Math.min(v.h, y1 + (v.portrait ? 30 : 21));
    // zonas de toque (2 ou 3 colunas): uma risca da cor de cada coluna ao fundo do ecrã
    if (L > 1) {
      for (let k = 0; k < L; k++) {
        const xa = k === 0 ? 0 : hx + k * lw, xb = k === L - 1 ? v.w : hx + (k + 1) * lw;
        R(xa + 1, v.h - 3, xb - xa - 2, 2, cols[k] || GOLD);
        if (this.press[k] > 0) R(xa + 1, v.h - 5, xb - xa - 2, 4, 'rgba(255,255,255,0.35)');
      }
    }
    R(hx - 3, y0 - 2, hw + 6, bot - y0 + 2, INK);
    R(hx - 2, y0 - 1, hw + 4, bot - y0, c.track || '#1c1433');
    for (let k = 0; k < L; k++) {
      const x = hx + k * lw;
      R(x + 1, y0, lw - 2, y1 + 9 - y0, k % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.09)');
      if (this.press[k] > 0) R(x + 1, y0, lw - 2, y1 + 9 - y0, 'rgba(255,255,255,0.12)');
    }
    // marcas do tempo a descer com as notas (dão a sensação de andamento)
    const pxs = (y1 - y0) / this.lead;
    for (let b = Math.ceil(now / this.beatLen); ; b++) {
      const y = y1 - (b * this.beatLen - now) * pxs;
      if (y < y0) break;
      R(hx, y, hw, 1, 'rgba(255,255,255,0.12)');
    }
    // círculos onde se toca
    const r = v.portrait ? 9 : 7;
    for (let k = 0; k < L; k++) {
      const cx = hx + Math.round((k + 0.5) * lw), on = this.press[k] > 0, col = cols[k] || GOLD;
      disc(ctx, cx, y1, r + 2, INK);
      disc(ctx, cx, y1, r + 1, on ? PAPER : col);
      disc(ctx, cx, y1, r - 1 - (st.pulse > 0.5 && !on ? 1 : 0), on ? col : '#1c1433');
    }
    // notas
    for (const n of this.notes) {
      const dt = n.t - now;
      if (dt > this.lead) break;
      const cx = hx + Math.round((n.lane + 0.5) * lw), col = cols[n.lane] || GOLD;
      if (n.state === 1) continue;
      let y = y1 - dt * pxs;
      if (n.state === 2) { if (now - n.at > 0.25) continue; y = Math.min(y, bot - 4); }
      if (y < y0 + 5) continue;
      if (c.note && n.state !== 2) c.note(ctx, R, cx, Math.round(y), n.lane, col);
      else {
        disc(ctx, cx, y, r, INK);
        disc(ctx, cx, y, r - 1, n.state === 2 ? '#6a6480' : col);
        if (n.state !== 2) R(cx - Math.round(r / 2), Math.round(y) - Math.round(r / 2), 2, 2, PAPER);
      }
    }
    // um coração por frase: apagado, a piscar (a decorrer) ou ganho
    const H = this.max, hy = y1 + (v.portrait ? 15 : 11), x0 = Math.round(v.w / 2 - (H * 11 - 2) / 2);
    for (let k = 0; k < H; k++) {
      const ph = this.ph[k], cur = k === this.phrase && !this.over;
      const img = ph.res > 0 ? this.hearts.heart : this.hearts.heartOff;
      if (cur && Math.floor(this.t * 3) % 2 && ph.judged > 0) continue;
      ctx.drawImage(img, x0 + k * 11, hy);
    }
    // avaliação do último toque e sequência de acertos
    if (this.pop) {
      const y = y1 - r - 12 - Math.round(this.pop.age * 14), w = textW(this.pop.txt) + 4;
      R(Math.round(v.w / 2 - w / 2) - 1, y - 2, w + 2, 9, 'rgba(20,12,36,0.75)');
      text(ctx, this.pop.txt, v.w / 2, y, this.pop.color, { align: 'center' });
    }
    if (this.combo >= 5 && !this.over) text(ctx, 'X' + this.combo, hx + hw + 5, y1 - 2, GOLD, { shadow: INK });
  }

  // «A tocar agora»: o título da canção (só o título), numa tabuleta.
  drawSong(ctx, v, R, st) {
    const s = st.song;
    if (!s) return;
    const c = this.cfg, w = Math.max(textW(s.title), textW(s.label || '')) + 10;
    const at = c.songAt ? c.songAt(v, st) : (v.portrait ? { x: v.w / 2, y: st.gy + 6 } : { x: 5 + w / 2, y: st.top + 3 });
    const x = Math.round(clamp(at.x, w / 2 + 2, v.w - w / 2 - 2) - w / 2), y = Math.round(at.y);
    R(x - 1, y - 1, w + 2, 20, INK);
    R(x, y, w, 18, '#241a3f');
    R(x, y, w, 1, st.pulse > 0.4 ? PINK : '#6a4a9a');
    text(ctx, s.label || 'A TOCAR AGORA', x + w / 2, y + 3, '#b8a8e0', { align: 'center' });
    text(ctx, s.title, x + w / 2, y + 11, GOLD, { align: 'center' });
  }

  bot(I, v) {
    if (this.over) { if (this.over > 1.2) I.actionPressed = true; return; }
    const g = this.geo(v), next = this.time + 1 / 60;
    for (const n of this.notes) {
      if (n.state) continue;
      if (n.t > next + 0.02) break;
      if (Math.abs(n.t - next) < 0.009) { I.actionPressed = true; I.pointerX = (g.hx + (n.lane + 0.5) * g.lw) / v.w; I.pointerY = 0.8; break; }
    }
  }
}
