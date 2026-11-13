// Nível 13, ato 2: as urgências da CUF. A Inês, de dedo no ar e garrafa de vodka na outra mão
// («é para a dor»), com o Pipoca, a Ana e a Mi a rir. Duas partes:
//   1. a sala de espera — tocar quando o painel mostrar a senha dela;
//   2. os pontos — a cada toque a Inês aguenta o dedo: manter o marcador no verde enquanto a
//      enfermeira trabalha (as gargalhadas dos amigos fazem o dedo tremer).
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, SKIN, clamp, lerp, person, shadow, text, sign } from '../draw.js';
import { cached, box } from './bimby-comum.js';

const SENHA = 'A27';
const FILA = ['A24', 'A25', 'B27', 'A26', SENHA];
const DUR = 1.25;         // segundos de cada senha no painel
const PONTOS = 3;
const TEAL = '#1f8a8a';

// O dedo ligado, espetado no ar (x, y = base do braço).
export function dedoNoAr(R, x, y) {
  R(x - 1, y - 9, 5, 10, INK); R(x, y - 8, 3, 9, SKIN);
  box(R, x - 1, y - 15, 5, 7, '#ffffff');
  R(x - 1, y - 12, 5, 1, '#d8dce6');
}

// A garrafa de vodka (x = centro, y = base).
export function garrafa(R, x, y) {
  box(R, x - 2, y - 12, 5, 12, '#dff3fa');
  box(R, x - 1, y - 17, 3, 5, '#dff3fa');
  R(x - 1, y - 18, 3, 2, '#c0392b');
  R(x - 2, y - 8, 5, 4, '#ffffff'); R(x - 2, y - 7, 5, 1, '#3f6fb5');
  R(x - 1, y - 11, 1, 2, '#ffffff');
}

// A sala de espera: parede clara, letreiro, cadeiras, porta do gabinete e uma planta.
function sala(g, R, v, top, gy) {
  const w = v.w;
  R(0, 0, w, v.h, '#e6f3f1');
  R(0, gy - 34, w, 34, '#c4e0dc'); R(0, gy - 35, w, 1, '#9cc8c2');
  sign(g, 'CUF URGÊNCIAS', w / 2, top + 4, { scale: 2, bg: '#ffffff', color: TEAL, border: TEAL });
  // ao alto sobra parede: um janelão com estores (lá fora é de noite)
  const free = gy - 190 - (top + 30);
  if (free > 50) {
    const jy = top + 36, jh = Math.min(110, free);
    box(R, 24, jy, w - 48, jh, '#2a2358');
    R(w - 70, jy + 10, 8, 8, '#fff3c4'); R(40, jy + 16, 1, 1, '#ffffff'); R(90, jy + 30, 1, 1, '#ffffff'); R(140, jy + 12, 1, 1, '#ffffff');
    for (let y = jy; y < jy + jh * 0.45; y += 5) R(24, y, w - 48, 3, '#f4f4ec');
    R(Math.round(w / 2) - 1, jy, 2, jh, '#f4f4ec'); box(R, 20, jy + jh, w - 40, 3, '#f4f4ec');
  }
  // a porta do gabinete, à direita
  const dx = w - 44;
  box(R, dx, gy - 62, 30, 62, '#f4f4ec'); box(R, dx + 8, gy - 54, 14, 14, '#bfe6fa'); R(dx + 24, gy - 30, 3, 3, GOLD);
  sign(g, 'GABINETE', dx + 15, gy - 76, { bg: TEAL, color: '#ffffff' });
  // cadeiras ao longo da parede
  for (let x = 8; x + 22 < dx - 6; x += 26) {
    box(R, x, gy - 30, 20, 14, '#3f6fb5'); R(x, gy - 30, 20, 3, '#5a8fd0');
    box(R, x, gy - 15, 20, 4, '#3f6fb5'); R(x + 2, gy - 10, 2, 10, '#5a6072'); R(x + 16, gy - 10, 2, 10, '#5a6072');
  }
  // chão
  R(0, gy, w, v.h - gy, '#d0d4dc');
  for (let y = gy, k = 0; y < v.h; y += 12, k++) { R(0, y, w, 1, '#b8bcc8'); for (let x = (k % 2) * 16; x < w; x += 32) R(x, y, 1, 12, '#b8bcc8'); }
}

export class JantaresCuf extends Act {
  get max() { return this.cfg.hearts || 1 + PONTOS; }

  start() {
    this.phase = 'senha';     // senha → ida → pontos → fim
    this.idx = -1; this.st = -1.6;   // índice na fila e tempo da senha atual (negativo: ainda a ler)
    this.wrong = false; this.pt = 0;
    this.m = 0.5; this.prog = 0; this.pts = 0; this.stT = 0;
    this.laugh = 0; this.lt = 1.5; this.lw = 0; this.sip = 0;
    this.ines = getCharacter('ines', 'casual');
    this.amigos = [getCharacter('pipoca', 'casual'), getCharacter('ana', 'casual'), getCharacter('mi', 'casual')];
    this.enf = getCharacter('parteira', 'casual');
    this.hint(`Toca quando aparecer no painel a senha da Inês: ${SENHA}!`);
  }

  get cur() { return this.idx < 0 ? 'A23' : FILA[Math.min(this.idx, FILA.length - 1)]; }

  update(dt, I) {
    if (this.laugh > 0) this.laugh -= dt;
    if (this.sip > 0) this.sip -= dt;
    this.pt += dt;
    if (this.phase === 'senha') {
      this.st += dt;
      if (I.actionPressed && this.st >= 0) {
        if (this.cur === SENHA) {
          if (!this.wrong) this.heart(1);
          this.sfx('check');
          this.go('Enfermeira: «Senha A27!» É a vez da Inês... e do dedo.');
          return;
        }
        if (!this.wrong) { this.wrong = true; this.sfx('buzz'); this.laugh = 0.8; this.lw = 2; this.hint(`Mi: «Calma, ainda não é a tua! A tua é a ${SENHA}.»`); }
      }
      const dur = this.idx < 0 ? 0 : this.cur === SENHA ? 2.2 : DUR;
      if (this.st >= dur) {
        if (this.cur === SENHA) { this.go('Enfermeira: «Senha A27?... A27?! Ah, é a menina do dedo!»'); return; }
        this.idx++; this.st = 0; this.sfx('plim');
      }
    } else if (this.phase === 'ida') {
      if (this.pt > 2.2) {
        this.phase = 'pontos'; this.pt = 0;
        this.hint('Toca para a Inês aguentar o dedo quieto: mantém o marcador no verde!');
      }
    } else if (this.phase === 'pontos') {
      // o dedo foge; cada toque aguenta-o
      this.m -= 0.3 * dt;
      if (I.actionPressed) this.m += 0.14;
      // as gargalhadas dos amigos fazem tremer
      this.lt -= dt;
      if (this.lt <= 0) { this.lt = 1.8 + Math.random() * 1.2; this.laugh = 0.7; this.lw = Math.floor(Math.random() * 3); this.m += (Math.random() < 0.5 ? -1 : 1) * 0.16; }
      this.m = clamp(this.m, 0, 1);
      this.stT += dt;
      if (this.m >= 0.3 && this.m <= 0.7) this.prog += dt / 2;
      if (this.prog >= 1 || this.stT > 9) {
        if (this.stT <= 5) this.heart(1);
        this.sfx('check');
        this.pts++; this.prog = 0; this.stT = 0;
        if (this.pts >= PONTOS) {
          this.phase = 'fim'; this.pt = 0; this.sfx('win');
          this.hint('Enfermeira: «Pronto, dedo ligado!» Inês: «Ótimo... então ainda vamos sair!»');
        } else {
          this.sip = 0.9; this.sfx('slurp');
          this.hint(this.pts === 1 ? 'Inês: «Mais um golinho... é para a dor!»' : 'Ana: «Ah ah ah! Só tu, Inês!» Falta pouco: aguenta!');
        }
      }
    } else if (this.pt > 3.4 || (this.pt > 1.4 && I.actionPressed)) this.done();
  }

  go(texto) { this.phase = 'ida'; this.pt = 0; this.hint(texto); }

  draw(ctx, v, R) {
    const top = this.top(v), w = v.w, t = this.t, gy = Math.round(v.h * (v.portrait ? 0.74 : 0.88));
    ctx.drawImage(cached(this, 'cuf' + top, v, (g, r) => sala(g, r, v, top, gy)), 0, 0);
    const ix = Math.round(w * 0.5), senha = this.phase === 'senha' || this.phase === 'ida';

    // os amigos, a rir
    this.amigos.forEach((f, i) => {
      const x = Math.round(w * (0.1 + i * 0.12)), on = this.laugh > 0 && (this.lw === i || this.phase === 'fim');
      shadow(ctx, x, gy, 14);
      person(ctx, f, x, gy, { scale: 2, face: 1, hop: on ? Math.round(Math.abs(Math.sin(t * 12)) * 3) : 0 });
      if (on) text(ctx, 'AH AH!', x, gy - 60, INK, { align: 'center' });
    });

    // a enfermeira: vem da porta até à Inês
    const walk = this.phase === 'ida' ? clamp(this.pt / 1.6, 0, 1) : senha ? 0 : 1;
    const ex = Math.round(lerp(w - 62, ix + 38, walk));
    shadow(ctx, ex, gy, 14);
    person(ctx, this.enf, ex, gy, { scale: 2, face: -1, moving: walk > 0 && walk < 1, dist: walk * 80 });

    // a Inês: dedo ligado no ar, garrafa na outra mão
    shadow(ctx, ix, gy, 14);
    const trem = this.phase === 'pontos' ? Math.round((this.m - 0.5) * 6) : 0;
    person(ctx, this.ines, ix, gy, { scale: 2, face: 1 });
    dedoNoAr(R, ix + 11 + trem, gy - 30);
    if (this.sip > 0) garrafa(R, ix + 2, gy - 22); else garrafa(R, ix - 13, gy - 12);
    if (this.phase === 'pontos') {
      // a agulha e a linha
      const nx = ix + 15 + trem, ny = gy - 44 + Math.round(Math.sin(t * 9) * 2);
      R(nx, ny, 9, 1, INK); R(nx + 9, ny - 1, 2, 3, '#ff5d8f'); R(nx + 11, ny, ex - 8 - nx - 11, 1, '#ff5d8f');
    }

    const py = v.portrait ? gy - 150 : top + 28;
    if (senha) {
      // o painel das senhas e a senha da Inês
      const px = ix - 38;
      box(R, px - 32, py, 64, 26, '#1c1c28');
      text(ctx, 'SENHA', px, py + 3, '#8a93a7', { align: 'center' });
      const blink = this.st < 0.25 && this.idx >= 0 && Math.floor(t * 12) % 2;
      if (!blink) text(ctx, this.cur, px, py + 11, this.cur === SENHA ? '#5cf08a' : '#ffb347', { align: 'center', scale: 2 });
      const tx = ix + 40;
      box(R, tx - 26, py + 1, 52, 24, PAPER);
      text(ctx, 'A TUA SENHA', tx, py + 4, TEAL, { align: 'center' });
      text(ctx, SENHA, tx, py + 12, INK, { align: 'center', scale: 2 });
      for (let x = tx - 26; x < tx + 26; x += 4) R(x, py + 25, 2, 1, PAPER);
    } else {
      // o marcador do dedo quieto e os pontos que faltam
      const bw = Math.min(170, w - 40), bx = Math.round((w - bw) / 2);
      text(ctx, 'DEDO QUIETO!', w / 2, py - 1, INK, { align: 'center' });
      box(R, bx, py + 8, bw, 9, '#3a2f4f');
      R(bx + bw * 0.3, py + 8, bw * 0.4, 9, '#5cf08a');
      box(R, bx + this.m * (bw - 4), py + 5, 4, 15, GOLD);
      for (let i = 0; i < PONTOS; i++) {
        const x = Math.round(w / 2) - 26 + i * 20;
        box(R, x, py + 23, 14, 5, '#3a2f4f');
        R(x, py + 23, i < this.pts ? 14 : i === this.pts ? Math.round(14 * clamp(this.prog, 0, 1)) : 0, 5, '#ff5d8f');
      }
    }
  }

  bot(I) {
    if (this.phase === 'senha') { if (this.cur === SENHA && this.st > 0.3) I.actionPressed = true; }
    else if (this.phase === 'pontos') { if (this.m < 0.47) I.actionPressed = true; }
  }
}
