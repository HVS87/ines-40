// Nível 23 «Madrinha do Micas», ato 3: a fotografia de grupo à saída da igreja, debaixo de
// pétalas e arroz. A máquina está no tripé; toca-se para disparar quando TODOS estão virados
// para a câmara e o Micas está a sorrir (balão com coração). São quatro fotografias; cada uma
// bem apanhada vale um coração. As outras também ficam para o álbum (nunca se perde).
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, PINK, clamp, person, text, shadow, mark } from '../draw.js';
import { fachada, petalas, bebe } from './madrinha-comum.js';

const GRUPO = [
  { who: 'padre', outfit: 'casual', nome: 'O padre' },
  { who: 'leal', outfit: 'festa', nome: 'O Leal' },
  { who: 'ines', outfit: 'festa', nome: 'A Inês', fixa: true },   // a madrinha nunca se distrai: tem o Micas ao colo
  { who: 'mi', outfit: 'festa', nome: 'A Mi' },
  { who: 'lourenco', outfit: 'festa', nome: 'O Lourenço' },
];
const FOTOS = 4, JANELA = 1.6;
const DICA = 'Toca quando todos olharem para a câmara e o Micas sorrir!';

export class Foto extends Act {
  get max() { return this.cfg.hearts || FOTOS; }

  start() {
    this.n = 0;                    // fotografias tiradas
    this.fora = [1, 3];            // quem está distraído (índices do GRUPO; 5 = o Micas)
    this.fase = 'caos';            // caos ⇄ ok → (toque) pausa → ...
    this.ft = 0; this.dur = 2.4; this.troca = 0;
    this.espera = 0;               // tempo desta fotografia sem disparar
    this.flash = 0; this.res = null;
    this.over = 0;
    this.gente = GRUPO.map((g) => getCharacter(g.who, g.outfit));
    this.hint(DICA);
  }

  baralha(n) {
    const livres = [0, 1, 3, 4, 5], fora = [];
    while (fora.length < n) { const k = livres[Math.floor(Math.random() * livres.length)]; if (!fora.includes(k)) fora.push(k); }
    this.fora = fora;
  }

  lay(v) {
    const P = v.portrait, top = this.top(v), w = v.w;
    const gy = Math.round(v.h * (P ? 0.74 : 0.86));
    const passo = Math.min(48, w * (P ? 0.148 : 0.14)), meio = w * (P ? 0.626 : 0.61);
    const xs = GRUPO.map((_, i) => Math.round(meio + (i - 2) * passo));
    return { top, gy, xs, cam: Math.round(w * (P ? 0.1 : 0.12)) };
  }

  dispara(auto) {
    const boa = this.fase === 'ok' && !auto;
    this.flash = 0.25; this.sfx('click');
    this.n++;
    this.res = { boa, t: 0 };
    if (boa) { this.heart(1); this.sfx('pop'); this.hint(['Perfeita! Todos a olhar e o Micas a rir.', 'Mi: «Esta vai para a moldura!»', 'Leal: «Outra igual, para pôr no frigorífico!»', 'Inês: «Ficámos tão bem!»'][(this.n - 1) % 4]); }
    else if (this.fase === 'ok') this.hint('O temporizador disparou sozinho... Ficou boa, mas não foi graças a ti!');
    else {
      const k = this.fora[0];
      this.hint(k === 5 ? 'Ups... O Micas estava a bocejar!' : `Ups... ${GRUPO[k].nome} estava a olhar para o lado!`);
    }
    this.fase = 'pausa'; this.ft = 0;
  }

  update(dt, I, v) {
    this.flash = Math.max(0, this.flash - dt);
    if (this.res) this.res.t += dt;
    if (this.over) { this.over += dt; if (this.over > 2.6) this.done(); return; }
    this.ft += dt;
    if (this.fase === 'pausa') {
      if (this.ft > 1.9) {
        if (this.n >= FOTOS) { this.over = 0.01; this.sfx('win'); this.fora = []; this.hint('Inês: «Quatro fotografias e o afilhado mais bonito do mundo!»'); return; }
        this.fase = 'caos'; this.ft = 0; this.dur = 2 + Math.random() * 1.4; this.espera = 0; this.res = null; this.baralha(2); this.hint(DICA);
      }
      return;
    }
    this.espera += dt;
    if (this.fase === 'caos') {
      this.troca += dt;
      const falta = this.dur - this.ft;
      if (this.troca > 0.6 && falta > 0.1) { this.troca = 0; this.baralha(falta < 0.75 ? 1 : 1 + Math.floor(Math.random() * 2)); }
      if (falta <= 0) { this.fase = 'ok'; this.ft = 0; this.fora = []; this.sfx('plim'); }
    } else if (this.fase === 'ok') {
      if (this.espera > 15) { this.dispara(true); return; }                 // o temporizador da máquina
      if (this.ft > JANELA) { this.fase = 'caos'; this.ft = 0; this.dur = 1.8 + Math.random() * 1.2; this.troca = 0; this.baralha(1); }
    }
    if (I.actionPressed && this.fase !== 'pausa') this.dispara(false);
  }

  draw(ctx, v, R) {
    const L = this.lay(v), gy = L.gy, t = this.t, w = v.w;
    const meio = L.xs[2];
    fachada(ctx, v, R, gy, L.top, meio);
    // o grupo, virado para a máquina (à esquerda); quem se distrai vira-se para o outro lado
    GRUPO.forEach((g, i) => {
      const x = L.xs[i], dist = this.fora.includes(i);
      shadow(ctx, x, gy, 14);
      person(ctx, this.gente[i], x, gy, { scale: 2, face: dist ? 1 : -1, hop: this.over ? Math.round(Math.abs(Math.sin(t * 7 + i)) * 3) : 0 });
      if (dist) { const bx = x + 12, by = gy - 50 + Math.round(Math.sin(t * 5 + i) * 1); R(bx, by, 2, 2, PINK); R(bx + 4, by - 3, 2, 2, '#ffffff'); R(bx + 7, by + 1, 2, 2, PINK); }
    });
    // o Micas ao colo da madrinha
    const riso = !this.fora.includes(5);
    const bx = meio - 10, by = gy - 19;
    bebe(R, bx, by, 1, riso ? 'riso' : 'sono', 1, t);
    if (riso) mark(ctx, bx - 8, by - 6, '♥', PINK); else { text(ctx, 'Z', bx - 12 + (Math.floor(t * 2) % 2), by - 12, PAPER, { shadow: INK }); text(ctx, 'Z', bx - 17, by - 19, PAPER, { shadow: INK }); }
    // a máquina no tripé
    const cx = L.cam, cy = gy - 30;
    R(cx - 1, cy + 6, 2, 24, INK); R(cx - 7, gy - 2, 3, 2, INK); R(cx + 5, gy - 2, 3, 2, INK);
    for (let k = 0; k < 8; k++) { R(cx - 1 - k, cy + 8 + k * 3, 2, 3, INK); R(cx + k, cy + 8 + k * 3, 2, 3, INK); }
    R(cx - 9, cy - 5, 18, 13, INK); R(cx - 8, cy - 4, 16, 11, '#5a5a70'); R(cx - 8, cy - 4, 16, 2, '#8a8aa0'); R(cx - 5, cy - 8, 6, 4, INK);
    R(cx + 3, cy - 2, 7, 7, INK); R(cx + 4, cy - 1, 5, 5, '#9fe8ff'); R(cx + 5, cy, 2, 2, '#ffffff');
    R(cx - 6, cy - 2, 3, 3, this.fase === 'ok' ? '#5cf08a' : Math.floor(t * 4) % 2 ? '#e0572f' : '#7a2e2a');
    petalas(R, v, t);
    // contador de fotografias
    for (let k = 0; k < FOTOS; k++) { const x = Math.round(w / 2 - FOTOS * 7 + k * 14), y = L.top + 4; R(x, y, 11, 9, INK); R(x + 1, y + 1, 9, 7, k < this.n ? PAPER : '#6a6480'); if (k < this.n) R(x + 3, y + 3, 5, 3, '#8fcdf0'); }
    if (this.flash > 0) R(0, 0, w, v.h, `rgba(255,255,255,${clamp(this.flash / 0.25, 0, 1).toFixed(2)})`);
    // a fotografia acabada de tirar
    if (this.res && this.res.t > 0.25 && this.res.t < 1.9 && !this.over) {
      const pw = 64, ph = 40, px = Math.round(w / 2 - pw / 2), py = Math.max(L.top + 18, Math.round(gy - 110));
      R(px - 4, py - 4, pw + 8, ph + 20, INK); R(px - 3, py - 3, pw + 6, ph + 18, PAPER); R(px, py, pw, ph, '#8fcdf0'); R(px, py + ph - 10, pw, 10, '#cfc8ba');
      R(px + 20, py + 6, 24, 24, '#fbf6ea');
      GRUPO.forEach((g, i) => person(ctx, this.gente[i], px + 12 + i * 10, py + ph - 3, { scale: 1, face: -1 }));
      text(ctx, this.res.boa ? 'PERFEITA!' : 'QUASE...', w / 2, py + ph + 5, this.res.boa ? '#c0392b' : '#6a6480', { align: 'center' });
    }
  }

  bot(I) {
    if (!this.over && this.fase === 'ok' && this.ft > 0.3) I.actionPressed = true;
  }
}
