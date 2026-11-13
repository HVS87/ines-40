// Nível 12, ao balcão do Xafarix: fazer um Long Island Iced Tea. Partes iguais de cinco garrafas
// (vodka, tequila, rum branco, gin e licor de laranja): mantém-se premido para deitar e larga-se
// na marca dourada, cinco vezes. Depois o barman junta o limão e a cola, mexe, e dá a nota.
// Nunca se perde: quem deita de mais não ganha o coração dessa parte, e o barman acerta o copo.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, clamp, person, shadow, text, sign } from '../draw.js';
import { parede, LETREIRO } from './xafarix-cenario.js';

const PARTS = [
  { name: 'VODKA', label: 'vodka', color: '#dcecff', glass: '#eaf6ff', cap: '#c0392b' },
  { name: 'TEQUILA', label: 'tequila', color: '#f3e08a', glass: '#f0d890', cap: '#b8862e' },
  { name: 'RUM BRANCO', label: 'rum branco', color: '#fff6e6', glass: '#ffffff', cap: '#2b2b3a' },
  { name: 'GIN', label: 'gin', color: '#bfe8d2', glass: '#a8e0c8', cap: '#3f9f6a' },
  { name: 'LICOR DE LARANJA', label: 'licor de laranja', color: '#ffb347', glass: '#ff9a3a', cap: '#e0572f' },
];
const TOL = 0.24;        // tolerância (em partes) para acertar na marca
const TOP = 6.6;         // altura do copo cheio, em partes (5 + limão + cola)
const HOW = 'Mantém o dedo no ecrã (ou Espaço) para deitar; larga na marca dourada!';

export class LongIsland extends Act {
  get max() { return this.cfg.hearts || 5; }

  start() {
    this.step = 0;           // garrafa atual (0 a 4)
    this.level = 0;          // líquido no copo, em partes
    this.state = 'ready';    // ready → pour → judge → ... → limao → cola → mexer → nota
    this.timer = 0; this.idle = 0;
    this.down = false; this.pouring = false;
    this.good = 0; this.res = '';
    this.mix = 0;
    this.ines = getCharacter('ines', 'night');
    this.barman = getCharacter('empregado');
    this.hint(`1 de 5: ${PARTS[0].label}. ${HOW}`);
  }

  update(dt, I) {
    const down = I.action || I.actionPressed, pressed = down && !this.down;
    this.down = down;
    this.timer += dt;
    this.pouring = false;
    const target = this.step + 1;
    if (this.state === 'ready' || this.state === 'pour') {
      this.idle += dt;
      if (this.state === 'ready' && pressed && this.timer > 0.25) this.state = 'pour';
      if (this.state === 'pour' && down) {
        this.pouring = true; this.idle = 0;
        this.level += dt * (0.62 + this.step * 0.07);
        if (Math.floor(this.timer * 9) !== Math.floor((this.timer - dt) * 9)) this.sfx('slurp');
        if (this.level > target + 0.6) this.judge();              // a transbordar da marca: chega!
      } else if (this.state === 'pour' && this.level >= target - TOL) this.judge();   // largou: avalia
      // ainda abaixo da marca: pode continuar a deitar; parado muito tempo, o barman ajuda
      if (this.idle > 9) { this.level = target; this.judge(true); }
    } else if (this.state === 'judge') {
      if (this.timer > 1.1) {
        this.level = target;                 // o barman acerta a medida
        this.step++;
        this.timer = 0; this.idle = 0;
        if (this.step >= PARTS.length) { this.state = 'limao'; this.hint('Agora o sumo de limão, um pouco de açúcar...'); this.sfx('pop'); } else {
          this.state = 'ready';
          this.hint(`${this.step + 1} de 5: ${PARTS[this.step].label}. ${HOW}`);
        }
      }
    } else if (this.state === 'limao') {
      this.level = Math.min(5.3, this.level + dt * 0.3);
      if (this.timer > 1.5) { this.state = 'cola'; this.timer = 0; this.hint('... e cola por cima, até acima!'); }
    } else if (this.state === 'cola') {
      this.level = Math.min(TOP, this.level + dt * 0.9);
      if (Math.floor(this.timer * 9) !== Math.floor((this.timer - dt) * 9) && this.level < TOP) this.sfx('slurp');
      if (this.timer > 2) { this.state = 'mexer'; this.timer = 0; }
    } else if (this.state === 'mexer') {
      this.mix = clamp(this.timer / 1.2, 0, 1);
      if (this.timer > 1.4) {
        this.state = 'nota'; this.timer = 0;
        this.sfx(this.good >= 3 ? 'win' : 'check');
        this.hint(this.good >= 5 ? 'Barman: «Perfeito! Nem eu fazia melhor.»'
          : this.good >= 3 ? 'Barman: «Muito bom! Está quase como os nossos.»'
            : 'Barman: «Bebe-se bem! Acertar nas medidas é que é difícil...»');
      }
    } else if (this.timer > 3.4 || (this.timer > 1.2 && pressed)) this.done();
  }

  judge(helped) {
    const err = this.level - (this.step + 1), v = this.game.view;
    this.state = 'judge'; this.timer = 0;
    if (!helped && Math.abs(err) <= TOL) {
      this.good++;
      this.res = 'NA MARCA!';
      this.heart(1, v.w / 2, this.geo(v).gb - 40);
      this.sfx('check');
    } else {
      this.res = helped ? 'O BARMAN AJUDA' : 'DE MAIS!';
      this.sfx('toc');
      if (!helped) this.hint('Barman: «Ui, foi de mais! Deixa, que eu acerto isso.»');
    }
  }

  // balcão, copo e medidas, conforme o ecrã
  geo(v) {
    const top = this.top(v), P = v.portrait;
    const cy = Math.round(v.h * (P ? 0.76 : 0.8));              // tampo do balcão
    const ph = clamp(Math.floor((cy - top - (P ? 70 : 24)) / TOP), 8, 24);   // altura de uma parte
    const gw = P ? 52 : 32, cx = Math.round(v.w / 2);
    return { top, cy, ph, gw, cx, gb: cy - 3, gt: cy - 3 - Math.round(TOP * ph) - 4 };
  }

  draw(ctx, v, R) {
    const g = this.geo(v), { top, cy, ph, gw, cx, gb, gt } = g, t = this.t, P = v.portrait;
    // parede caiada, prateleira de garrafas e letreiro
    R(0, 0, v.w, top, '#1f1a2a');
    parede(R, 0, Math.max(0, top - 30), v.w, cy - Math.max(0, top - 30), 8);
    R(0, 0, v.w, cy, 'rgba(120,40,120,0.12)');
    if (P) {
      sign(ctx, 'XAFARIX', cx, top + 6, LETREIRO);
      const sy = top + 46;
      R(8, sy, v.w - 16, 3, '#4a3020'); R(8, sy + 3, v.w - 16, 1, INK);
      for (let x = 14, i = 0; x < v.w - 18; x += 11, i++) this.bottle(R, x, sy, PARTS[i % 5], 0.75);
    } else {
      // deitado: prateleira à esquerda e letreiro à direita do copo
      const sy = top + 30, sw = cx - gw - 40;
      R(8, sy, sw, 3, '#4a3020'); R(8, sy + 3, sw, 1, INK);
      for (let x = 14, i = 0; x < sw - 2; x += 11, i++) this.bottle(R, x, sy, PARTS[i % 5], 0.75);
      sign(ctx, 'XAFARIX', Math.round(v.w * 0.82), top + 6, LETREIRO);
    }
    // o barman, atrás do balcão
    const bx = cx + (P ? 76 : 96);
    person(ctx, this.barman, bx, cy + 8, { face: -1, scale: 2, hop: this.state === 'nota' ? Math.round(Math.abs(Math.sin(t * 6)) * 2) : 0 });
    // balcão de madeira
    R(0, cy, v.w, v.h - cy, '#6a4428'); R(0, cy - 2, v.w, 5, '#b07a44'); R(0, cy - 3, v.w, 1, INK); R(0, cy + 3, v.w, 1, INK);
    for (let x = 12; x < v.w; x += 34) R(x, cy + 8, 2, v.h - cy - 8, '#553620');
    // as cinco garrafas, em fila no balcão; a da vez inclina-se sobre o copo
    const pouringStep = (this.state === 'ready' || this.state === 'pour' || this.state === 'judge') ? this.step : -1;
    for (let k = 0; k < PARTS.length; k++) {
      if (k === pouringStep) continue;
      const x = cx - gw / 2 - 16 - (PARTS.length - 1 - k) * (P ? 15 : 17);
      this.bottle(R, x, cy - 3, PARTS[k], 1, k < this.step);
    }
    // a Inês, do lado de cá do balcão
    const ix = P ? 26 : Math.round(v.w * 0.09);
    const iy = Math.min(v.h - 4, cy + 38);
    shadow(ctx, ix, iy, 14);
    person(ctx, this.ines, ix, iy, { face: 1, scale: 2, hop: this.state === 'nota' ? Math.round(Math.abs(Math.sin(t * 6 + 1)) * 2) : 0 });
    // ----- o copo -----
    const x0 = cx - gw / 2, yOf = (parts) => gb - Math.round(parts * ph);
    R(x0 - 2, gt, gw + 4, gb - gt + 2, INK);
    R(x0, gt, gw, gb - gt, '#3a3448');
    R(x0, gt, gw, gb - gt, 'rgba(200,230,255,0.18)');
    // camadas
    const lev = this.level;
    if (this.mix >= 1) R(x0, yOf(lev), gw, gb - yOf(lev), '#b8672e');
    else {
      for (let k = 0; k < 5; k++) {
        const a = Math.min(lev, k + 1);
        if (a > k) R(x0, yOf(a), gw, yOf(k) - yOf(a), PARTS[k].color);
      }
      if (lev > 5) R(x0, yOf(Math.min(lev, 5.3)), gw, yOf(5) - yOf(Math.min(lev, 5.3)), '#f4e04a');
      if (lev > 5.3) R(x0, yOf(lev), gw, yOf(5.3) - yOf(lev), '#4a2416');
      if (this.mix > 0) R(x0, yOf(lev), gw, gb - yOf(lev), `rgba(184,103,46,${this.mix.toFixed(2)})`);
    }
    if (lev > 0.05) R(x0, yOf(lev), gw, 1, 'rgba(255,255,255,0.7)');
    // gelo e brilho do vidro
    for (let k = 0; k < 4; k++) { const iy = gb - 8 - k * Math.round(ph * 1.5), ixx = x0 + 4 + ((k * 13) % (gw - 14)); if (iy > gt + 2) { R(ixx, iy, 8, 7, 'rgba(255,255,255,0.35)'); R(ixx, iy, 8, 1, 'rgba(255,255,255,0.6)'); } }
    R(x0 + 2, gt + 2, 2, gb - gt - 4, 'rgba(255,255,255,0.35)');
    // marcas das cinco partes; a da vez é dourada, com a zona boa a verde
    for (let k = 1; k <= 5; k++) R(x0 - 6, yOf(k), 4, 1, k <= this.step ? '#5a5468' : PAPER);
    if (pouringStep >= 0) {
      const ty = yOf(this.step + 1), band = Math.round(TOL * ph);
      R(x0 - 9, ty - band, 5, band * 2 + 1, '#5cf08a');
      R(x0 - 12, ty - 1, gw + 14, 1, INK); R(x0 - 12, ty, gw + 14, 1, GOLD);
      const blink = Math.floor(t * 4) % 2;
      R(x0 - 17 - blink, ty - 2, 4, 5, GOLD); R(x0 - 13 - blink, ty - 1, 2, 3, GOLD); R(x0 - 11 - blink, ty, 1, 1, GOLD);
    }
    // a garrafa da vez, inclinada, e o fio de líquido
    if (pouringStep >= 0) {
      const p = PARTS[this.step], byy = Math.max(top + 6, gt - 14), bxx = cx + 4;
      if (this.pouring) {
        R(bxx - 9, byy, 22, 9, INK); R(bxx - 8, byy + 1, 20, 7, p.glass); R(bxx - 15, byy + 2, 7, 5, INK); R(bxx - 14, byy + 3, 6, 3, p.glass); R(bxx + 2, byy + 1, 6, 7, PAPER);
        R(bxx - 15, byy + 6, 2, yOf(lev) - byy - 6, p.color);
        if (Math.floor(t * 12) % 2) R(bxx - 17, yOf(lev) - 2, 6, 2, PAPER);
      } else this.bottle(R, bxx + 10, byy + 22, p, 1, false, true);
      const lw = P ? 0 : 0;
      text(ctx, p.name, cx + lw, gb + 8, GOLD, { align: 'center', shadow: INK });
    }
    // no fim: limão na borda, palhinha e o resultado
    if (this.state === 'limao' || this.state === 'cola' || this.state === 'mexer' || this.state === 'nota') {
      R(x0 + gw - 6, gt - 6, 9, 8, INK); R(x0 + gw - 5, gt - 5, 7, 6, '#f4e04a'); R(x0 + gw - 3, gt - 3, 3, 2, '#fff6b0');
    }
    if (this.state === 'mexer' || this.state === 'nota') {
      const sw = this.state === 'mexer' ? Math.round(Math.sin(t * 14) * 4) : 3;
      R(cx + sw - 1, gt - 14, 3, gb - gt + 8, INK); R(cx + sw, gt - 13, 1, gb - gt + 6, '#ff5d8f');
    }
    if (this.state === 'judge') {
      const col = this.res === 'NA MARCA!' ? '#5cf08a' : '#ff8a6a';
      sign(ctx, this.res, cx, Math.max(top + 4, gt - 16), { color: col });
    }
    if (this.state === 'nota') sign(ctx, 'LONG ISLAND ICED TEA', cx, Math.max(top + 4, gt - 30), { color: GOLD, bg: '#4a2018' });
  }

  // Garrafa de pé, com a base em (x, y). used: já foi deitada (fica mais apagada).
  bottle(R, x, y, p, sc = 1, used = false, big = false) {
    const h = Math.round((big ? 22 : 20) * sc), w = big ? 9 : 8;
    R(x - 1, y - h, w + 2, h + 1, INK); R(x, y - h + 1, w, h - 1, p.glass);
    R(x + 1, y - h - 6, w - 2, 7, INK); R(x + 2, y - h - 5, w - 4, 6, p.glass); R(x + 2, y - h - 6, w - 4, 2, p.cap);
    R(x, y - Math.round(h * 0.6), w, Math.round(h * 0.35), PAPER); R(x + 1, y - Math.round(h * 0.5), w - 2, 2, p.cap);
    if (used) R(x - 1, y - h - 6, w + 2, h + 7, 'rgba(60,40,40,0.5)');
  }

  bot(I) {
    if (this.state === 'nota') { if (this.timer > 1.4) I.actionPressed = true; return; }
    if (this.state === 'ready' && this.timer > 0.3) { I.actionPressed = true; I.action = true; }
    if (this.state === 'pour' && this.level < this.step + 1 - 0.03) I.action = true;
  }
}
