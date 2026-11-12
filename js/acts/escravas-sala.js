// «As Escravas», sala de aula: passar bilhetinhos às amigas sem a Irmã ver. Mantém-se premido
// para o bilhete ir de carteira em carteira enquanto a Irmã escreve a tabuada no quadro; quando
// ela se vira, larga-se. Se for apanhado, o bilhete volta à última carteira e esse bilhete já não
// dá coração (à 3.ª vez a Irmã passa a escrever mais tempo). Nunca se perde.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, GOLD, PAPER, PINK, lerp, person, text, mark, hash } from '../draw.js';

const HOP = 0.8;        // segundos que o bilhete demora de uma carteira à seguinte
const PASSA = 'Mantém premido para passar o bilhete. Larga quando a Irmã se virar!';
// carteiras, pela ordem do caminho do bilhete: a Inês e depois cada amiga (a Ana é a mais perto da Irmã)
const TURMA = [
  { who: 'inesc', name: 'Inês' },
  { who: 'isabelc', name: 'Isabel', msg: 'Bilhete para a Isabel: «Trocas um cromo comigo no recreio?»' },
  { who: 'softc', name: 'Soft', msg: 'Bilhete para a Soft: «Guardas-me um lugar ao teu lado na fila?»' },
  { who: 'maisac', name: 'Maísa', msg: 'Bilhete para a Maísa: «Logo jogamos à macaca? Eu levo a pedrinha!»' },
  { who: 'anac', name: 'Ana', msg: 'Bilhete para a Ana: «Amigas para sempre? Sim ou... claro que sim?»' },
];
const RALHA = [
  'Irmã: «Menina Inês! Os olhos no quadro, se faz favor!»',
  'Irmã: «Que papelinho é esse, meninas?»',
  'Irmã: «Ai, ai, ai... No recreio é que se conversa!»',
];

// Escreve a giz (as letras em píxeis não têm o sinal de igual).
function giz(ctx, R, str, x, y, c) {
  for (const ch of str) {
    if (ch === '=') { R(x, y + 1, 3, 1, c); R(x, y + 3, 3, 1, c); } else if (ch !== ' ') text(ctx, ch, x, y, c);
    x += 4;
  }
}

export class EscravasSala extends Act {
  get max() { return this.cfg.hearts || 4; }

  start() {
    this.girls = TURMA.map((g) => ({ ...g, frames: getCharacter(g.who, 'farda') }));
    this.irma = getCharacter('freira', 'casual');
    this.k = 0;             // bilhete atual (vai para a carteira k + 1)
    this.pos = 0;           // onde vai o bilhete (0 = Inês; 1,5 = entre a 1.ª e a 2.ª amiga)
    this.clean = true;      // este bilhete ainda não foi apanhado
    this.catches = 0;
    this.mode = 'pass';     // pass → read (a amiga lê) → pass ... → over
    this.mt = 0;
    this.st = 'write';      // a Irmã: write → warn → look → write ; scold quando apanha
    this.stT = 0; this.stDur = 3.2;
    this.chars = 0; this.time = 0;
    this.hint(PASSA);
  }

  // Disposição: deitado, uma fila de cinco carteiras; ao alto, duas filas (o bilhete faz um «S»).
  layout(v) {
    const top = this.top(v);
    if (!v.portrait) {
      const gy = v.h - 26, bx = 10, bw = 92, ix = bx + bw + 18, last = v.w - 22, gap = (last - (ix + 50)) / 4;
      return { gy, bx, by: Math.max(top + 16, gy - 84), bw, bh: 46, ix, low: gy, desks: TURMA.map((g, i) => ({ x: Math.round(last - i * gap), y: gy })) };
    }
    const gy = Math.round(v.h * 0.5), bx = 6, bw = Math.min(92, Math.round(v.w * 0.36)), ix = bx + bw + 16, yb = gy + 74, x0 = 40, x2 = v.w - 26;
    return {
      gy, bx, by: Math.max(top + 16, gy - 84), bw, bh: 46, ix, low: yb,
      desks: [{ x: x0, y: yb }, { x: Math.round((x0 + x2) / 2), y: yb }, { x: x2, y: yb }, { x: x2, y: gy }, { x: x2 - 56, y: gy }],
    };
  }

  setIrma(st, dur = 0) { this.st = st; this.stT = 0; this.stDur = dur; }

  update(dt, I) {
    this.time += dt;
    if (this.mode === 'over') { this.mt += dt; if (this.mt > 2.6) this.done(); return; }
    // a Irmã
    this.stT += dt;
    if (this.st === 'write') {
      this.chars += dt * 6;
      if (this.stT > this.stDur && this.mode === 'pass' && this.time < 80) this.setIrma('warn');
    } else if (this.st === 'warn') { if (this.stT > 0.6) this.setIrma('look', 1.2 + Math.random() * 0.5); }
    else if (this.st === 'look') { if (this.stT > this.stDur) this.setIrma('write', (this.catches >= 3 ? 4.5 : 2.2) + Math.random() * 1.2); }
    else if (this.stT > 2.2) { this.setIrma('write', this.catches >= 3 ? 5.5 : 3.4); this.hint(PASSA); }

    const target = this.k + 1;
    if (this.mode === 'read') {
      this.mt += dt;
      if (this.mt > 2.6 || (this.mt > 0.8 && I.actionPressed)) {
        this.k++; this.pos = 0; this.clean = true; this.mt = 0;
        if (this.k >= this.girls.length - 1) {
          this.mode = 'over'; this.sfx('ring');
          this.hint(this.catches ? 'Trrrim! Toque de saída. Salvas pela campainha!' : 'Trrrim! Toque de saída. E a Irmã não deu por nada!');
        } else { this.mode = 'pass'; this.hint(PASSA); }
      }
      return;
    }
    if (this.st === 'scold') return;
    if (this.st === 'look') {
      if (I.action && this.stT > 0.15) {
        // apanhada!
        this.setIrma('scold'); this.clean = false; this.pos = Math.floor(this.pos);
        this.hint(RALHA[this.catches % RALHA.length]); this.catches++; this.sfx('buzz');
      }
      return;
    }
    if (I.action) this.pos += dt / HOP;
    else if (this.pos % 1 > 0.001) this.pos = Math.min(Math.ceil(this.pos), this.pos + (dt * 3) / HOP);   // a amiga agarra-o
    if (this.pos >= target) {
      this.pos = target; this.mode = 'read'; this.mt = 0;
      const v = this.game.view, d = this.layout(v).desks[target];
      if (this.clean) this.heart(1, d.x, d.y - 40);
      this.sfx('plim');
      this.hint(this.girls[target].msg);
    }
  }

  desk(R, x, y) {
    R(x - 22, y - 19, 22, 4, INK); R(x - 21, y - 18, 20, 2, '#d8a868');
    R(x - 19, y - 15, 16, 15, INK); R(x - 18, y - 15, 14, 14, '#b8854e'); R(x - 18, y - 15, 14, 2, '#96691e');
    R(x - 4, y - 7, 18, 3, INK); R(x - 3, y - 6, 16, 1, '#b8854e'); R(x + 11, y - 4, 3, 4, INK);   // o banco
  }

  note(R, x, y) {
    R(x - 4, y - 3, 8, 7, INK); R(x - 3, y - 2, 6, 5, '#ffffff'); R(x - 2, y - 1, 2, 1, PINK); R(x, y - 1, 2, 1, PINK); R(x - 1, y, 2, 1, PINK);
  }

  draw(ctx, v, R) {
    const L = this.layout(v), t = this.t, w = v.w, { gy, bx, by, bw, bh, ix } = L;
    // parede, rodapé e soalho
    R(0, 0, w, gy, '#f4e8c8'); R(0, gy - 16, w, 16, '#e0c898'); R(0, gy - 16, w, 1, '#c9a66a'); R(0, gy - 2, w, 2, '#8a5a34');
    R(0, gy, w, v.h - gy, '#c08a52');
    for (let y = gy + 9; y < v.h; y += 10) R(0, y, w, 1, '#a87440');
    for (let i = 0; i < 40; i++) R(Math.floor(hash(i * 1.9) * w), gy + 10 * Math.floor(hash(i * 4.1) * ((v.h - gy) / 10)), 1, 9, '#a87440');
    // janela com o céu lá fora
    const wx = Math.round(v.portrait ? w - 62 : w * 0.66), wy = Math.max(this.top(v) + 6, gy - 86);
    R(wx - 2, wy - 2, 44, 38, '#8a5a34'); R(wx, wy, 40, 34, '#9cd0f4'); R(wx, wy + 22, 40, 12, '#bfe4fa');
    R(wx + 6 + Math.round(Math.sin(t * 0.3) * 3), wy + 6, 14, 4, '#ffffff'); R(wx + 26, wy + 14, 10, 3, '#ffffff');
    R(wx + 19, wy, 2, 34, '#8a5a34'); R(wx, wy + 16, 40, 2, '#8a5a34'); R(wx - 4, wy + 36, 48, 3, '#b8854e');
    // abecedário por cima do quadro (onde houver parede livre)
    if (by - this.top(v) > 44) { const ay = by - 34; R(4, ay - 3, w - 8, 13, '#fff6e6'); R(4, ay - 3, w - 8, 1, '#c9a66a'); R(4, ay + 9, w - 8, 1, '#c9a66a'); 'ABCDEFGHIJLMNOPQRSTUVXZ'.split('').forEach((ch, i) => { if (10 + i * 11 < w - 14) text(ctx, ch, 10 + i * 11, ay, ['#e0527a', '#3f8fe0', '#4fb888', '#e0a820'][i % 4], { scale: 1 }); }); }
    // quadro, com a tabuada a giz, e a cruz por cima
    R(bx - 2, by - 2, bw + 4, bh + 4, INK); R(bx - 1, by - 1, bw + 2, bh + 2, '#8a5a34'); R(bx + 1, by + 1, bw - 2, bh - 2, '#2f5d4a');
    R(bx, by + bh + 2, bw, 3, '#b8854e'); R(bx + bw - 14, by + bh + 1, 5, 1, '#ffffff');
    const cxb = bx + Math.round(bw / 2);
    R(cxb - 1, by - 14, 2, 10, '#5a3a22'); R(cxb - 3, by - 12, 6, 2, '#5a3a22');
    // o que está escrito no quadro: cinco linhas da tabuada; quando enche, apaga e passa à seguinte
    let left = Math.floor(this.chars), tab = 2;
    const shown = [];
    for (let n = 0; n < 400; n++) {
      const rows = [];
      let used = 0;
      for (let b = 1; b <= 5; b++) { const s = `${tab} X ${b} = ${tab * b}`; rows.push(s); used += s.length + 2; }
      if (left >= used + 6) { left -= used + 6; tab = tab >= 9 ? 2 : tab + 1; continue; }
      for (const s of rows) { if (left <= 0) break; shown.push(s.slice(0, left)); left -= s.length + 2; }
      break;
    }
    shown.forEach((s, i) => giz(ctx, R, s, bx + 7, by + 5 + i * 8, '#f4f4ec'));
    // a Irmã
    const look = this.st === 'look' || this.st === 'scold', face = look ? 1 : -1;
    person(ctx, this.irma, ix, gy, { face, scale: 2 });
    if (this.st === 'write') { const cy = by + 8 + Math.min(4, shown.length ? shown.length - 1 : 0) * 8 + Math.round(Math.sin(t * 18) * 2); R(ix - 15, cy, 4, 2, INK); R(ix - 16, cy, 3, 1, '#ffffff'); }
    if (this.st === 'warn') mark(ctx, ix, gy - 50, '?', '#e0572f');
    if (look) mark(ctx, ix + 2, gy - 50, '!');
    // a turma (da fila de trás para a da frente)
    const target = this.k + 1, order = L.desks.map((d, i) => i).sort((a, b) => L.desks[a].y - L.desks[b].y || L.desks[a].x - L.desks[b].x);
    for (const i of order) {
      const d = L.desks[i], g = this.girls[i];
      const hop = this.mode === 'read' && i === target ? Math.round(Math.abs(Math.sin(t * 8)) * 3) : 0;
      person(ctx, g.frames, d.x + 2, d.y - 4, { face: -1, scale: 2, hop });
      this.desk(R, d.x, d.y);
      if (this.mode === 'pass' && i === target) {   // seta: para quem vai o bilhete
        const ay = d.y - 46 - Math.round(Math.abs(Math.sin(t * 4)) * 3);
        R(d.x - 2, ay - 1, 7, 6, INK); R(d.x - 1, ay, 5, 3, GOLD); R(d.x - 1, ay + 5, 5, 2, INK); R(d.x, ay + 3, 3, 2, GOLD); R(d.x, ay + 7, 3, 1, INK); R(d.x + 1, ay + 5, 1, 2, GOLD);
      }
    }
    // o bilhete
    const hand = (i) => ({ x: L.desks[i].x - 10, y: L.desks[i].y - 22 });
    if (this.mode === 'read') { const h = hand(target); this.note(R, h.x + 2, h.y - 6); }
    else if (this.mode === 'pass' && !(this.st === 'look')) {
      const i = Math.min(Math.floor(this.pos), L.desks.length - 2), u = this.pos - i, a = hand(i), b = hand(i + 1);
      this.note(R, Math.round(lerp(a.x, b.x, u)), Math.round(lerp(a.y, b.y, u) - Math.sin(u * Math.PI) * 13));
    }
    // ao alto, sobra chão: mostra-se o bilhete em grande
    if (v.portrait && L.low + 88 < v.h && this.mode !== 'over') {
      const pw = Math.min(190, w - 30), px = Math.round((w - pw) / 2), py = L.low + 34;
      R(px - 1, py - 1, pw + 2, 66, INK); R(px, py, pw, 64, PAPER); R(px, py, pw, 4, '#ffd1e0');
      for (let y = py + 24; y < py + 60; y += 18) R(px + 6, y, pw - 12, 1, '#b8d0e8');
      text(ctx, 'PARA: ' + this.girls[Math.min(target, this.girls.length - 1)].name, px + 10, py + 11, '#3a4a7a', { scale: 2 });
      text(ctx, 'DE: INÊS', px + 10, py + 30, '#3a4a7a', { scale: 2 });
      const hx = px + pw - 24, hy = py + 44;
      R(hx, hy, 4, 2, PINK); R(hx + 6, hy, 4, 2, PINK); R(hx - 1, hy + 2, 12, 4, PINK); R(hx + 1, hy + 6, 8, 2, PINK); R(hx + 3, hy + 8, 4, 2, PINK);
    }
  }

  bot(I) {
    if (this.mode === 'pass' && this.st === 'write') I.action = true;
    if (this.mode === 'read' && this.mt > 0.9) I.actionPressed = true;
  }
}
