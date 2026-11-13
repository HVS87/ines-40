// Ato «telefonema da Austrália»: a Inês em Lisboa (de noite) e o Lourenço na Austrália (de dia),
// cada um no seu lado do ecrã. Os corações viajam pela linha: toca quando chegam ao telefone da
// Inês para os apanhar. A meio, a Austrália intromete-se — um canguru, uma aranha gigante, um
// bando de emus, um coala ou um bumerangue que volta — e é preciso tocar muitas vezes para
// enxotar o intruso antes que a chamada caia.
//
//   { act: Call, animal: 'canguru' | 'aranha' | 'emus' | 'coala' | 'bumerangue', lines: [3 falas],
//     win: 'fala', lose: 'fala', alert: 'instrução da interrupção' (opcional), label: 'ENXOTA!' }
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, GOLD, PINK, PAPER, clamp, lerp, sky, stars, disc, text, hash } from '../draw.js';

const NAMES = { canguru: 'o canguru', aranha: 'a aranha', emus: 'os emus', coala: 'o coala' };
const SPAWNS = [1, 3.6, 6.2, 8.8];     // quando parte cada coração
const FLY = 2.3;                       // segundos de viagem de um coração
const HIT = 0.9;                       // ponto da viagem em que chega ao telefone da Inês

export class Call extends Act {
  constructor(scene, cfg) {
    super(scene, cfg);
    this.ines = getCharacter('ines', cfg.outfit || 'casual');
    this.lou = getCharacter('lourenco', 'aussie');
  }

  get max() { return 3; }

  start() {
    this.state = 'talk';       // talk → animal → end
    this.timer = 0;
    this.hearts = [];          // corações em viagem: { f (0–1), got }
    this.sent = 0;
    this.caughtN = 0;
    this.line = -1;
    this.meter = 0;
    this.left = 6.5;
    this.won = false;
    this.flash = 0;
    this.sfx('ring');
  }

  // Os dois painéis: lado a lado (deitado) ou um por cima do outro (ao alto).
  geo(v) {
    const top = this.top(v);
    const L = v.portrait ? { x: 0, y: Math.round(v.h * 0.56), w: v.w, h: v.h - Math.round(v.h * 0.56) } : { x: 0, y: 0, w: Math.floor(v.w / 2), h: v.h };
    const A = v.portrait ? { x: 0, y: 0, w: v.w, h: Math.round(v.h * 0.56) } : { x: Math.floor(v.w / 2), y: 0, w: v.w - Math.floor(v.w / 2), h: v.h };
    L.gy = L.y + Math.round(L.h * 0.86); A.gy = A.y + Math.round(A.h * 0.86);
    L.px = L.x + Math.round(L.w * 0.5); A.px = A.x + Math.round(A.w * (v.portrait ? 0.4 : 0.42));
    // os telefones (junto à orelha de cada um)
    L.tel = { x: L.px + 11, y: L.gy - 36 }; A.tel = { x: A.px - 11, y: A.gy - 36 };
    return { L, A, top };
  }

  heartPos(g, f) {
    return { x: lerp(g.A.tel.x, g.L.tel.x, f), y: lerp(g.A.tel.y, g.L.tel.y, f) - Math.sin(f * Math.PI) * 34 };
  }

  update(dt, I, v) {
    this.timer += dt;
    this.flash = Math.max(0, this.flash - dt);
    const g = this.geo(v), lines = this.cfg.lines || [];

    if (this.state === 'talk') {
      const li = Math.min(lines.length - 1, Math.floor(this.timer / 3.8));
      if (li !== this.line && lines[li]) { this.line = li; this.hint(lines[li]); }
      if (this.sent < SPAWNS.length && this.timer >= SPAWNS[this.sent]) { this.hearts.push({ f: 0, got: false }); this.sent++; this.sfx('pop'); }
      for (const h of this.hearts) h.f += dt / FLY;
      if (I.actionPressed) {
        const h = this.hearts.find((x) => !x.got && Math.abs(x.f - HIT) < 0.1);
        if (h) {
          h.got = true;
          this.caughtN++;
          this.flash = 0.3;
          this.sfx('kiss');
          if (this.caughtN <= 2) this.heart(1, g.L.tel.x, g.L.tel.y - 8);
          else this.fx.heart(g.L.tel.x, g.L.tel.y - 8);
        } else this.sfx('toc');
      }
      this.hearts = this.hearts.filter((h) => !h.got && h.f < 1.15);
      if (this.timer > SPAWNS[SPAWNS.length - 1] + FLY + 0.6) {
        this.state = 'animal';
        this.timer = 0;
        this.sfx('buzz');
        this.hint(this.cfg.alert || `Oh, não! Toca muitas vezes para enxotar ${NAMES[this.cfg.animal] || 'o bicho'}!`);
      }
    } else if (this.state === 'animal') {
      this.left -= dt;
      this.meter = Math.max(0, this.meter - dt * 0.12);
      if (I.actionPressed && this.timer > 0.5) { this.meter += 0.085; this.sfx('toc'); this.fx.burst(g.A.px + 20, g.A.gy - 30, 3, [GOLD, PAPER], 40); }
      if (this.meter >= 1 || this.left <= 0) {
        this.won = this.meter >= 1;
        this.state = 'end';
        this.timer = 0;
        if (this.won) { this.heart(1, g.A.px, g.A.gy - 50); this.sfx('check'); } else this.sfx('hurt');
        this.hint((this.won ? this.cfg.win : this.cfg.lose) || 'A chamada caiu... Até amanhã!');
      }
    } else if (this.timer > 4.2) this.done();
  }

  bot(I) {
    if (this.state === 'talk') { if (this.hearts.some((h) => !h.got && Math.abs(h.f - HIT) < 0.04)) I.actionPressed = true; } else if (this.state === 'animal' && Math.floor(this.timer * 60) % 7 === 0) I.actionPressed = true;
  }

  // ---------- Desenho ----------
  draw(ctx, v, R) {
    const g = this.geo(v), { L, A } = g, t = this.t, st = this.state;
    const clip = (P, fn) => { ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip(); fn(); ctx.restore(); };

    // --- Lisboa, de noite: o quarto da Inês, com a janela para a lua ---
    clip(L, () => {
      R(L.x, L.y, L.w, L.h, '#2f2a52');
      for (let x = L.x + 6; x < L.x + L.w; x += 14) R(x, L.y, 1, L.h, '#37315e');
      const wx = L.x + Math.round(L.w * 0.14), wy = Math.max(L.y + 8, v.portrait ? L.y + 10 : g.top + 4);
      R(wx - 2, wy - 2, 40, 34, '#8a7868'); R(wx, wy, 36, 30, '#12143a');
      ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, 36, 30); ctx.clip(); ctx.translate(wx, wy); stars(ctx, 36, 30, t, 9, 10); ctx.restore();
      disc(ctx, wx + 26, wy + 9, 5, '#fff3c4'); disc(ctx, wx + 24, wy + 8, 4, '#12143a');
      R(wx + 17, wy, 2, 30, '#8a7868'); R(wx, wy + 14, 36, 2, '#8a7868');
      R(L.x, L.gy, L.w, L.y + L.h - L.gy, '#5a4a40'); R(L.x, L.gy, L.w, 2, '#6b5a4e');
      // candeeiro
      const cx = L.x + Math.round(L.w * 0.84);
      R(cx, L.gy - 44, 2, 44, INK); R(cx - 7, L.gy - 54, 16, 11, '#ffd166'); R(cx - 5, L.gy - 2, 12, 2, INK);
      ctx.drawImage(this.ines.stand.r, L.px - 16, L.gy - 48, 32, 48);
      R(L.tel.x - 2, L.tel.y - 5, 5, 10, INK); R(L.tel.x - 1, L.tel.y - 4, 3, 8, '#c9c9d8');
      text(ctx, 'LISBOA', L.x + 5, L.y + L.h - 9, '#c9c9d8');
    });

    // --- Austrália, de dia: terra vermelha, sol e um eucalipto ---
    clip(A, () => {
      ctx.save(); ctx.translate(A.x, A.y); sky(ctx, A.w, A.gy - A.y, A.gy - A.y, ['#5ab8f0', '#9fd8f5', '#ffe9a8', '#ffc978']); ctx.restore();
      disc(ctx, A.x + Math.round(A.w * 0.8), Math.max(A.y + 20, g.top + 12), 9, '#fff3c4');
      // um rochedo vermelho ao longe
      const ux = A.x + Math.round(A.w * 0.62);
      R(ux - 30, A.gy - 14, 60, 14, '#b8502e'); R(ux - 24, A.gy - 19, 48, 6, '#b8502e'); R(ux - 24, A.gy - 19, 48, 2, '#d8683e');
      R(A.x, A.gy, A.w, A.y + A.h - A.gy, '#c8643a'); R(A.x, A.gy, A.w, 2, '#e08a52');
      for (let i = 0; i < 9; i++) R(A.x + hash(i + 2) * A.w, A.gy + 4 + hash(i * 5) * (A.y + A.h - A.gy - 6), 3, 1, '#a84e2a');
      // eucalipto
      const ex = A.x + Math.round(A.w * 0.12);
      R(ex, A.gy - 46, 4, 46, '#d8cfc0'); R(ex + 1, A.gy - 46, 1, 46, '#b8ac98');
      disc(ctx, ex + 2, A.gy - 52, 11, '#5a8a5a'); disc(ctx, ex - 7, A.gy - 44, 7, '#6a9a62'); disc(ctx, ex + 11, A.gy - 46, 7, '#4f7a52');
      // sinal de estrada amarelo
      const sx = A.x + Math.round(A.w * 0.9);
      R(sx, A.gy - 30, 2, 30, '#8a93a7');
      for (let i = 0; i < 7; i++) { R(sx + 1 - i, A.gy - 44 + i, 2 * i + 1, 1, '#ffd23e'); R(sx + 1 - i, A.gy - 31 - i, 2 * i + 1, 1, '#ffd23e'); }
      R(sx - 1, A.gy - 39, 3, 3, INK); R(sx + 1, A.gy - 41, 2, 2, INK);

      const scared = st !== 'talk';
      const wob = st === 'animal' ? Math.round(Math.sin(t * 30) * 1) : 0;
      const gone = st === 'end' && !this.won && this.cfg.animal === 'emus';      // os emus levaram-no
      if (!gone) {
        ctx.drawImage(this.lou.stand.l, A.px - 16 + wob, A.gy - 48, 32, 48);
        const stolen = st === 'end' && !this.won;
        if (!stolen) { R(A.tel.x - 2 + wob, A.tel.y - 5, 5, 10, INK); R(A.tel.x - 1 + wob, A.tel.y - 4, 3, 8, '#c9c9d8'); }
        if (scared && Math.floor(t * 6) % 2) { R(A.px - 1, A.gy - 62, 2, 6, '#e0572f'); R(A.px - 1, A.gy - 54, 2, 2, '#e0572f'); }
      }
      if (st !== 'talk') this.drawAnimal(ctx, R, A, t);
      text(ctx, 'AUSTRÁLIA', A.x + A.w - 5, A.y + A.h - 9, '#7a3a1e', { align: 'right' });
      // a chamada caiu: riscas de estática
      if (st === 'end' && !this.won) for (let i = 0; i < 14; i++) R(A.x, A.y + ((i * 37 + Math.floor(t * 20) * 13) % A.h), A.w, 1, 'rgba(255,255,255,0.25)');
    });

    // a divisória em ziguezague entre os dois lados
    if (v.portrait) for (let x = 0; x < v.w; x += 8) { R(x, L.y - 2 + (Math.floor(x / 8) % 2) * 2, 8, 3, INK); R(x, L.y - 1 + (Math.floor(x / 8) % 2) * 2, 8, 1, GOLD); }
    else for (let y = 0; y < v.h; y += 8) { R(A.x - 2 + (Math.floor(y / 8) % 2) * 2, y, 3, 8, INK); R(A.x - 1 + (Math.floor(y / 8) % 2) * 2, y, 1, 8, GOLD); }

    if (st === 'talk') {
      // o alvo no telefone da Inês e os corações em viagem
      const p = this.heartPos(g, HIT), near = this.hearts.some((h) => Math.abs(h.f - HIT) < 0.1);
      const c = this.flash > 0 ? '#ffffff' : near ? GOLD : '#c9c9d8';
      R(p.x - 8, p.y - 8, 16, 1, c); R(p.x - 8, p.y + 7, 16, 1, c); R(p.x - 8, p.y - 8, 1, 16, c); R(p.x + 7, p.y - 8, 1, 16, c);
      for (const h of this.hearts) {
        const q = this.heartPos(g, h.f), x = Math.round(q.x), y = Math.round(q.y);
        R(x - 4, y - 4, 9, 9, INK);
        R(x - 3, y - 3, 3, 2, PINK); R(x + 1, y - 3, 3, 2, PINK); R(x - 3, y - 1, 7, 2, PINK); R(x - 2, y + 1, 5, 1, PINK); R(x - 1, y + 2, 3, 1, PINK); R(x, y + 3, 1, 1, PINK);
        R(x - 2, y - 2, 1, 1, '#ffffff');
      }
    } else if (st === 'animal') {
      // a barra do «enxota!» e o tempo que falta
      const bw = Math.min(120, A.w - 20), bx = A.x + Math.round((A.w - bw) / 2), by = Math.max(A.y + 6, g.top + 4) + (v.portrait ? 0 : 22);
      R(bx - 1, by - 1, bw + 2, 9, INK); R(bx, by, bw, 7, '#3a2f4f'); R(bx, by, Math.round(bw * clamp(this.meter, 0, 1)), 7, '#5cf08a');
      text(ctx, this.cfg.label || 'ENXOTA!', bx + bw / 2, by + 1, PAPER, { align: 'center' });
      R(bx, by + 9, Math.round(bw * clamp(this.left / 6.5, 0, 1)), 2, GOLD);
    }
  }

  // O bicho que interrompe a chamada, ao lado do Lourenço. Entra durante a fase «animal»; no
  // fim, foge (se foi enxotado) ou leva a melhor. É pintado numa camada à parte e ampliado
  // (a aranha é mesmo gigante), para se ver bem ao lado do Lourenço.
  drawAnimal(ctx, R, A, t) {
    const v = this.game.view;
    if (!this.layer || this.layer.width !== v.w || this.layer.height !== v.h) {
      this.layer = document.createElement('canvas');
      this.layer.width = v.w; this.layer.height = v.h;
    }
    const lc = this.layer.getContext('2d');
    lc.clearRect(0, 0, v.w, v.h);
    const LR = (x, y, w, h, c) => { lc.fillStyle = c; lc.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
    const a = this.paintAnimal(lc, LR, A, t);
    ctx.drawImage(this.layer, 0, 0, v.w, v.h, Math.round(a.x - a.x * a.k), Math.round(a.y - a.y * a.k), v.w * a.k, v.h * a.k);
    // se os emus ganham, levam o Lourenço às costas
    if (a.rider) ctx.drawImage(this.lou.stand.l, Math.round(a.x + (a.rider.x - a.x) * a.k) - 16, Math.round(a.y + (a.rider.y - a.y) * a.k) - 44, 32, 48);
  }

  paintAnimal(ctx, R, A, t) {
    const st = this.state, kind = this.cfg.animal;
    const inF = st === 'animal' ? clamp(this.timer / 0.9, 0, 1) : 1;                    // a entrar
    const outF = st === 'end' ? clamp(this.timer / 1.6, 0, 1) : 0;                      // a sair
    const hop = Math.round(Math.abs(Math.sin(t * 9)) * 5);
    if (kind === 'aranha') {
      // desce por um fio até mesmo por cima do chapéu dele; enxotada, volta a subir
      const yTop = A.y - 20, yLow = A.gy - 66;
      const y = Math.round(st === 'end' && this.won ? lerp(yLow, yTop, outF) : lerp(yTop, yLow, inF) + Math.sin(t * 5) * 2);
      const x = A.px + 2;
      R(x, A.y, 1, y - A.y, '#e8ecf4');
      for (let k = 0; k < 4; k++) for (const d of [-1, 1]) {
        const lx = x + d * (7 + k * 2), wig = Math.round(Math.sin(t * 12 + k * 1.3) * 1);
        R(Math.min(x, lx), y - 2 + k * 2, Math.abs(lx - x), 1, INK); R(lx, y - 2 + k * 2, 1, 6 + k + wig, INK);
      }
      disc(ctx, x, y - 4, 7, INK); disc(ctx, x, y + 4, 5, INK);
      R(x - 2, y - 7, 4, 2, '#c0392b'); R(x - 3, y + 3, 2, 2, '#ff3b3b'); R(x + 1, y + 3, 2, 2, '#ff3b3b'); R(x - 2, y + 7, 1, 2, PAPER); R(x + 1, y + 7, 1, 2, PAPER);
      return { x, y: yLow + 8, k: 2 };
    }
    if (kind === 'coala') {
      // salta do eucalipto para a cabeça dele e agarra-se-lhe à cara; enxotado, volta para a árvore
      const tx = A.x + Math.round(A.w * 0.12) + 10, ty = A.gy - 46, hx = A.px, hy = A.gy - 36;
      let f = inF, jump = Math.sin(inF * Math.PI) * 16;
      if (st === 'end' && this.won) { f = 1 - outF; jump = Math.sin(outF * Math.PI) * 16; }
      const cx = Math.round(lerp(tx, hx, f)), cy = Math.round(lerp(ty, hy, f) - jump);
      const G = '#9aa0aa', asleep = st === 'end' && !this.won;
      for (const d of [-1, 1]) { disc(ctx, cx + d * 6, cy - 5, 4, INK); disc(ctx, cx + d * 6, cy - 5, 3, G); R(cx + d * 6 - 1, cy - 6, 2, 2, '#e8d8d8'); }
      R(cx - 5, cy + 5, 10, 7, INK); R(cx - 4, cy + 5, 8, 6, '#8a909a');
      disc(ctx, cx, cy, 7, INK); disc(ctx, cx, cy, 6, G);
      R(cx - 1, cy - 1, 3, 4, INK);
      if (asleep) { R(cx - 5, cy - 2, 2, 1, INK); R(cx + 3, cy - 2, 2, 1, INK); text(ctx, 'Z', cx + 9, cy - 13 - (Math.floor(t * 2) % 2), PAPER); text(ctx, 'Z', cx + 13, cy - 19, PAPER); } else { R(cx - 4, cy - 3, 1, 2, INK); R(cx + 3, cy - 3, 1, 2, INK); }
      for (const d of [-1, 1]) { R(cx + d * 8 - 2, cy + 2, 4, 4, INK); R(cx + d * 8 - 1, cy + 3, 2, 2, G); }
      return { x: hx, y: hy, k: 2 };
    }
    if (kind === 'bumerangue') {
      // o bumerangue que ele atirou volta e anda às voltas à cabeça dele; se ganha, leva o telefone
      const cx0 = A.px, cy0 = A.gy - 40;
      let x, y;
      if (st === 'animal') { const a = t * 6; x = cx0 + Math.cos(a) * 34 + (1 - inF) * 70; y = cy0 + Math.sin(a) * 12 - 6; }
      else if (this.won) { x = lerp(cx0 + 34, A.x + A.w + 40, outF); y = cy0 - 10 - outF * 24; }
      else if (outF < 0.3) { x = lerp(cx0 + 34, A.tel.x, outF / 0.3); y = lerp(cy0, A.tel.y, outF / 0.3); }
      else { x = lerp(A.tel.x, A.x - 40, (outF - 0.3) / 0.7); y = A.tel.y - (outF - 0.3) * 30; }
      x = Math.round(x); y = Math.round(y);
      const d = [[1, 0, 0, 1], [0, 1, -1, 0], [-1, 0, 0, -1], [0, -1, 1, 0]][Math.floor(t * 14) % 4];
      for (let k = 0; k < 7; k++) { R(x + d[0] * k - 1, y + d[1] * k - 1, 4, 4, INK); R(x + d[2] * k - 1, y + d[3] * k - 1, 4, 4, INK); }
      for (let k = 0; k < 7; k++) { R(x + d[0] * k, y + d[1] * k, 2, 2, k % 3 === 1 ? '#e0392b' : '#d8a050'); R(x + d[2] * k, y + d[3] * k, 2, 2, k % 3 === 1 ? PAPER : '#d8a050'); }
      if (st === 'end' && !this.won && outF >= 0.3) { R(x + 2, y + 2, 5, 10, INK); R(x + 3, y + 3, 3, 8, '#c9c9d8'); }
      return { x: A.px + 10, y: A.gy - 30, k: 1.5 };
    }
    if (kind === 'emus') {
      // um bando a atravessar o ecrã a correr; se ganham, levam o Lourenço às costas
      const far = A.x + A.w + 20, near = A.px + 26;
      let rider = null;
      for (let i = 0; i < 4; i++) {
        let x = lerp(far + i * 26, near + i * 20, inF);
        if (st === 'end') x = this.won ? lerp(near + i * 20, far + i * 26, outF) : lerp(near + i * 20, A.x - 60 - i * 6, outF);
        x = Math.round(x);
        const y = A.gy - (i % 2) * 3, step = Math.floor(t * 12 + i) % 2, face = st === 'end' && this.won ? 1 : -1;
        R(x - 2 + step * 3, y - 14, 2, 14, '#6b5a4e'); R(x + 3 - step * 3, y - 14, 2, 14, '#6b5a4e');
        R(x - 9, y - 27, 18, 14, INK); R(x - 8, y - 26, 16, 12, '#7a6a5a'); R(x - 6, y - 25, 10, 4, '#96826e');
        R(x + face * 7 - 1, y - 42, 3, 18, INK); R(x + face * 7, y - 41, 1, 17, '#9fb8c8');
        R(x + face * 7 - 3, y - 47, 7, 6, INK); R(x + face * 7 - 2, y - 46, 5, 4, '#5a4a40'); R(x + face * 10, y - 44, 3, 2, '#e0a030'); R(x + face * 8, y - 45, 1, 1, '#ffffff');
        if (st === 'end' && !this.won && i === 1) rider = { x, y: y - 27 };
      }
      return { x: A.px + 10, y: A.gy, k: 1.5, rider };
    }
    // canguru: chega aos saltos, de luvas de boxe; se ganha, leva o telefone
    const far = A.x + A.w + 24, near = A.px + 30;
    let x = lerp(far, near, inF), face = -1;
    if (st === 'end') { x = lerp(near, far + 10, outF); face = 1; }
    x = Math.round(x);
    const y = A.gy - (st === 'animal' && inF >= 1 ? Math.round(Math.abs(Math.sin(t * 6)) * 2) : hop);
    const B = '#b8794a', BD = '#96603a', BL = '#e0b088';
    R(x - face * 16, y - 8, 12, 5, INK); R(x - face * 16 + 1, y - 7, 10, 3, B);                          // cauda
    R(x - 8, y - 30, 16, 26, INK); R(x - 7, y - 29, 14, 24, B); R(x - 3 + face * 2, y - 24, 7, 16, BL);  // corpo e barriga
    R(x - 9, y - 4, 18, 4, INK); R(x - 8, y - 3, 16, 2, BD);                                           // patas grandes
    R(x + face * 2 - 5, y - 42, 11, 13, INK); R(x + face * 2 - 4, y - 41, 9, 11, B);                    // cabeça
    R(x + face * 2 - 4, y - 48, 3, 7, INK); R(x + face * 2 + 2, y - 48, 3, 7, INK); R(x + face * 2 - 3, y - 47, 1, 5, BL); R(x + face * 2 + 3, y - 47, 1, 5, BL);
    R(x + face * 7, y - 37, 4, 5, INK); R(x + face * 7, y - 36, 3, 3, BL); R(x + face * 4, y - 39, 2, 2, INK);
    const punch = st === 'animal' ? Math.round(Math.abs(Math.sin(t * 14)) * 5) : 0;
    R(x + face * (8 + punch) - 3, y - 26, 7, 7, INK); R(x + face * (8 + punch) - 2, y - 25, 5, 5, '#e0392b');   // luvas de boxe
    R(x + face * 5 - 3, y - 19, 7, 7, INK); R(x + face * 5 - 2, y - 18, 5, 5, '#e0392b');
    if (st === 'end' && !this.won) { R(x + face * 9, y - 34, 5, 10, INK); R(x + face * 9 + 1, y - 33, 3, 8, '#c9c9d8'); }  // foge com o telefone
    return { x: A.px + 14, y: A.gy, k: 1.5 };
  }
}
