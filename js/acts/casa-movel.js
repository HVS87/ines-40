// Nível 16 «Viver Juntos», ato 3: montar a estante das instruções impossíveis. A folha mostra
// uma sequência de peças (tábua, parafuso, chave, martelo); depois repete-se a ordem tocando
// nas peças (ou com as setas + Espaço). Cada passo certo à primeira vale um coração; ao
// segundo engano, o Tomás resolve o passo (nunca se fica preso). No fim sobra uma peça...
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, MINT, clamp, person, text, shadow, mark } from '../draw.js';
import { casaPronta, salaLayout, drawSala, sofaBack, sofaFront } from './casa-comum.js';

const PASSOS = [2, 3, 3, 4];             // quantas peças tem a sequência de cada passo
const T_MOSTRA = 0.7;                    // segundos por peça, a mostrar
const FUNDO = [MINT, '#ffb0c8', GOLD, '#9fc8f5'];
const DICA_VER = 'Decora a ordem das peças que aparece nas instruções...';
const DICA_JOGAR = 'Toca nas peças pela mesma ordem (ou usa as setas e Espaço)!';

// O desenho de cada peça, centrado em (x, y); s = tamanho do píxel.
function peca(R, i, x, y, s = 1) {
  const P = (dx, dy, w, h, c) => R(x + dx * s, y + dy * s, w * s, h * s, c);
  if (i === 0) {          // tábua
    P(-9, -3, 18, 7, INK); P(-8, -2, 16, 5, '#e3c48a'); P(-8, -2, 16, 1, '#f2dcae'); P(-5, 0, 4, 1, '#b8935a'); P(2, 1, 4, 1, '#b8935a'); P(-7, -1, 1, 1, INK); P(6, -1, 1, 1, INK);
  } else if (i === 1) {   // parafuso
    P(-5, -5, 10, 4, INK); P(-4, -4, 8, 2, '#d8d8e6'); P(-2, -1, 4, 8, INK); P(-1, -2, 2, 8, '#a8a8bc'); P(-1, 0, 2, 1, '#6a6a80'); P(-1, 2, 2, 1, '#6a6a80'); P(-1, 4, 2, 1, '#6a6a80'); P(-2, -4, 4, 1, '#6a6a80');
  } else if (i === 2) {   // chave sextavada (em L)
    P(-6, -5, 4, 11, INK); P(-6, 2, 13, 4, INK); P(-5, -4, 2, 9, '#5a5a70'); P(-5, 3, 11, 2, '#5a5a70'); P(-5, -4, 1, 9, '#8a8aa0');
  } else {                // martelo
    P(-7, -6, 14, 6, INK); P(-6, -5, 12, 4, '#8a8aa0'); P(-6, -5, 12, 1, '#c9c9d8'); P(-2, -1, 4, 8, INK); P(-1, -1, 2, 7, '#c0392b'); P(-1, 4, 2, 2, '#96281b');
  }
}

export class Movel extends Act {
  get max() { return this.cfg.hearts || PASSOS.length; }

  start() {
    this.st = casaPronta(this.s);
    this.st.estante = 0;
    this.n = 0;               // passo atual
    this.fase = 'mostra';     // mostra → joga → monta → (mostra ...) → sobra
    this.ft = -0.8;
    this.erros = 0;
    this.pos = 0;             // quantas peças da sequência já foram dadas
    this.cur = 0;             // cursor do teclado
    this.tec = false;         // está a jogar com o teclado?
    this.luz = -1; this.luzT = 0;
    this.prev = {};
    this.fala = 0;
    this.seq = this.nova(PASSOS[0]);
    this.ines = getCharacter('ines', 'casual');
    this.lou = getCharacter('lourenco', 'casual');
    this.tom = getCharacter('tomas', 'teen');
    this.hint(DICA_VER);
  }

  nova(n) {
    const s = [];
    while (s.length < n) { const p = Math.floor(Math.random() * 4); if (!s.length || p !== s[s.length - 1]) s.push(p); }
    return s;
  }

  // Sala em cima, peças em baixo (uma fila deitado; 2 x 2 ao alto).
  lay(v) {
    const P = v.portrait, top = this.top(v);
    const cols = P ? 2 : 4, rows = 4 / cols;
    const tw = P ? Math.floor((v.w - 30) / 2) : Math.min(64, Math.floor((v.w - 20 - 18) / 4)), th = P ? 40 : 30, gap = P ? 10 : 6;
    const gy = P ? Math.round(v.h * 0.66) : v.h - th - 14;
    const x0 = Math.round((v.w - cols * tw - (cols - 1) * gap) / 2), y0 = P ? gy + Math.max(16, Math.round((v.h - gy - 2 * th - gap) / 2)) : v.h - th - 5;
    const tiles = [0, 1, 2, 3].map((i) => ({ x: x0 + (i % cols) * (tw + gap), y: y0 + Math.floor(i / cols) * (th + gap), w: tw, h: th }));
    const S = salaLayout(v, gy, top);
    const fw = 88, fh = 36;
    const folha = { x: P ? Math.round((v.w - fw) / 2) + 20 : 6, y: top + (P ? 10 : 4), w: fw, h: fh };
    return { S, gy, top, tiles, cols, rows, folha };
  }

  acende(i) { this.luz = i; this.luzT = 0.3; }

  certo(v) {
    const L = this.lay(v);
    this.st.estante = this.n + 1;
    this.sfx('saw');
    this.fx.burst(L.S.estanteX, L.gy - 30, 12, ['#e3c48a', PAPER, GOLD], 50);
    if (this.erros === 0) this.heart(1, L.S.estanteX, L.gy - 50);
    this.fase = 'monta'; this.ft = 0;
  }

  escolhe(i, v) {
    this.acende(i);
    if (i === this.seq[this.pos]) {
      this.pos++;
      this.sfx('plim');
      if (this.pos >= this.seq.length) { this.hint(['Lourenço: «Encaixou! Afinal isto é fácil.»', 'Inês: «Já tem prateleiras!»', 'Tomás: «Até já parece uma estante.»', 'Lourenço: «Está pronta! E nem olhei para as instruções...»'][this.n]); this.certo(v); }
      return;
    }
    this.erros++;
    this.sfx('buzz');
    if (this.erros >= 2) {
      this.hint('Tomás: «Deixem lá, eu vi um vídeo: é assim!»');
      this.certo(v);
    } else {
      this.hint('Lourenço: «Não era essa... Vê lá outra vez as instruções!»');
      this.fase = 'mostra'; this.ft = -1.4; this.pos = 0;
    }
  }

  update(dt, I, v) {
    this.ft += dt;
    this.luzT = Math.max(0, this.luzT - dt);
    const L = this.lay(v), pv = this.prev;
    const novo = (k) => I[k] && !pv[k];
    if (this.fase === 'mostra') {
      const i = Math.floor(this.ft / T_MOSTRA), antes = Math.floor((this.ft - dt) / T_MOSTRA);
      if (this.ft >= 0 && i !== antes && i < this.seq.length) { this.acende(this.seq[i]); this.sfx('click'); if (i === 0) this.hint(DICA_VER); }
      if (this.ft >= this.seq.length * T_MOSTRA + 0.2) { this.fase = 'joga'; this.ft = 0; this.pos = 0; this.hint(DICA_JOGAR); }
    } else if (this.fase === 'joga') {
      if (I.left || I.right || I.up || I.down) this.tec = true;
      if (novo('left')) this.cur = (this.cur + 3) % 4;
      if (novo('right')) this.cur = (this.cur + 1) % 4;
      if (novo('up') || novo('down')) this.cur = (this.cur + L.cols) % 4;
      if (I.actionPressed) {
        if (I.pointerX >= 0) {
          const px = I.pointerX * v.w, py = I.pointerY * v.h;
          const i = L.tiles.findIndex((q) => px >= q.x - 3 && px <= q.x + q.w + 3 && py >= q.y - 3 && py <= q.y + q.h + 3);
          if (i >= 0) { this.tec = false; this.escolhe(i, v); }
        } else { this.tec = true; this.escolhe(this.cur, v); }
      }
      if (this.fase === 'joga' && this.ft > 14) { this.erros = 2; this.hint('Tomás: «Deixem lá, eu vi um vídeo: é assim!»'); this.certo(v); }
    } else if (this.fase === 'monta') {
      if (this.ft > 1.5) {
        this.n++;
        if (this.n >= PASSOS.length) { this.fase = 'sobra'; this.ft = 0; this.fala = -1; } else { this.seq = this.nova(PASSOS[this.n]); this.erros = 0; this.pos = 0; this.fase = 'mostra'; this.ft = -0.5; this.hint(DICA_VER); }
      }
    } else if (this.fase === 'sobra') {
      // a discussão sobre a peça que sobra (um toque passa à fala seguinte)
      const FALAS = ['Lourenço: «Esperem... Sobrou uma peça.»', 'Tomás: «Deve ser suplente. Vem sempre uma a mais!»', 'Inês: «Vai para a gaveta. E ninguém se encosta à estante!»'];
      const i = Math.floor(this.ft / 2.6);
      if (i !== this.fala && i < FALAS.length) { this.fala = i; this.hint(FALAS[i]); this.sfx('click'); }
      if (I.actionPressed && this.ft > 0.5) this.ft = (Math.floor(this.ft / 2.6) + 1) * 2.6;
      if (this.ft >= FALAS.length * 2.6) this.done();
    }
    this.prev = { left: I.left, right: I.right, up: I.up, down: I.down };
  }

  draw(ctx, v, R) {
    const L = this.lay(v), S = L.S, gy = L.gy, t = this.t, f = this.fase, st = this.st;
    drawSala(ctx, v, R, S, st, { semSofa: true, semJanela: !v.portrait });   // deitado, a folha das instruções tapa a janela
    // o Tomás no sofá, ao telemóvel (só se levanta para resolver)
    sofaBack(R, S.sofaX, gy, S.sofaW);
    const ajuda = f === 'monta' && this.erros >= 2;
    person(ctx, this.tom, S.sofaX, gy - 10, { scale: 2, face: 1, hop: ajuda ? Math.round(Math.abs(Math.sin(t * 8)) * 3) : 0 });
    if (!ajuda) { R(S.sofaX + 9, gy - 41, 5, 9, INK); R(S.sofaX + 10, gy - 40, 3, 7, Math.floor(t * 3) % 2 ? '#9fe8ff' : '#d6f6ff'); }
    sofaFront(R, S.sofaX, gy, S.sofaW);
    // a Inês (com as instruções) e o Lourenço (a montar)
    const lx = S.estanteX - 34, ix = lx - (v.portrait ? 30 : 34), bate = f === 'monta' && this.ft < 0.8;
    shadow(ctx, ix, gy, 14); person(ctx, this.ines, ix, gy, { scale: 2, face: 1, hop: f === 'monta' && this.erros === 0 ? Math.round(Math.abs(Math.sin(t * 8)) * 2) : 0 });
    R(ix + 8, gy - 30, 9, 11, INK); R(ix + 9, gy - 29, 7, 9, PAPER); R(ix + 10, gy - 27, 5, 1, '#9a93ad'); R(ix + 10, gy - 25, 5, 1, '#9a93ad'); R(ix + 10, gy - 23, 3, 1, '#9a93ad');
    shadow(ctx, lx, gy, 14); person(ctx, this.lou, lx, gy, { scale: 2, face: 1, hop: bate ? Math.round(Math.abs(Math.sin(t * 16)) * 2) : 0 });
    if (bate) peca(R, 3, lx + 15, gy - 30 + Math.round(Math.sin(t * 16) * 3), 1);
    if (f === 'sobra') {
      // a peça que sobrou, no chão
      const sx = S.estanteX - 16, sy = gy + 5;
      peca(R, 0, sx, sy, 1);
      if (Math.floor(t * 3) % 2) mark(ctx, sx, sy - 6, '?', '#e0572f');
    }

    // a folha das instruções
    const F = L.folha, n = this.seq.length;
    R(F.x - 1, F.y - 1, F.w + 2, F.h + 2, INK); R(F.x, F.y, F.w, F.h, PAPER); R(F.x, F.y, F.w, 9, '#3a2f4f');
    text(ctx, 'INSTRUÇÕES', F.x + 3, F.y + 2, GOLD);
    text(ctx, `${Math.min(this.n + 1, PASSOS.length)}/${PASSOS.length}`, F.x + F.w - 3, F.y + 2, PAPER, { align: 'right' });
    const cw = 20, sx0 = F.x + Math.round((F.w - n * cw) / 2);
    const visto = f === 'mostra' ? clamp(Math.floor(this.ft / T_MOSTRA) + 1, 0, n) : 0;
    for (let k = 0; k < n; k++) {
      const cx = sx0 + k * cw + cw / 2, cy = F.y + 22;
      const mostra = f === 'mostra' ? k < visto : f === 'joga' ? k < this.pos : true;
      const atual = f === 'mostra' && k === visto - 1;
      R(cx - 10, cy - 9, 20, 18, atual ? GOLD : '#d8d0c0'); R(cx - 9, cy - 8, 18, 16, mostra ? FUNDO[this.seq[k]] : PAPER);
      if (mostra) peca(R, this.seq[k], cx, cy, 1); else text(ctx, '?', cx - 1, cy - 2, '#9a93ad');
    }

    // as peças em que se toca
    const ativo = f === 'joga';
    L.tiles.forEach((q, i) => {
      const lit = this.luz === i && this.luzT > 0, up = lit ? 2 : 0;
      R(q.x - 2, q.y - 2 - up, q.w + 4, q.h + 4, INK);
      R(q.x, q.y - up, q.w, q.h, lit ? '#ffffff' : ativo ? FUNDO[i] : '#b9b2c4'); R(q.x, q.y + q.h - 3 - up, q.w, 3, 'rgba(43,29,46,0.25)');
      if (!lit && ativo) R(q.x, q.y - up, q.w, 2, 'rgba(255,255,255,0.5)');
      peca(R, i, q.x + q.w / 2, q.y + q.h / 2 - up, 2);
      if (ativo && this.tec && this.cur === i && Math.floor(t * 4) % 2) {
        // cursor do teclado
        for (const [cx, cy, dx, dy] of [[q.x - 4, q.y - 4, 1, 1], [q.x + q.w + 3, q.y - 4, -1, 1], [q.x - 4, q.y + q.h + 3, 1, -1], [q.x + q.w + 3, q.y + q.h + 3, -1, -1]]) { R(dx > 0 ? cx : cx - 5, cy, 6, 2, GOLD); R(cx, dy > 0 ? cy : cy - 5, 2, 6, GOLD); }
      }
    });
  }

  bot(I, v) {
    if (this.fase === 'joga') {
      if (this.ft < 0.4 || this.luzT > 0) return;
      const q = this.lay(v).tiles[this.seq[this.pos]];
      I.pointerX = (q.x + q.w / 2) / v.w; I.pointerY = (q.y + q.h / 2) / v.h; I.actionPressed = true;
    } else if (this.fase === 'sobra' && this.ft % 2.6 > 1.2) I.actionPressed = true;
  }
}
