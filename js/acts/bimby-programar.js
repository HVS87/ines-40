// Nível 10, ato 2: programar a Bimby. Três mostradores seguidos (tempo, temperatura e
// velocidade): tocar quando o marcador passa na marca verde. Depois a máquina trabalha
// sozinha (vapor, contagem decrescente) e apita: «pi-pi-pi».
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, clamp, person, shadow, text } from '../draw.js';
import { cached, cozinha, bancada, bimby, vapor, box, VERDE } from './bimby-comum.js';

const DIALS = [
  { nome: 'TEMPO', alvo: '10 MIN', de: '0', ate: '20', val: (p) => Math.round(p * 20) + ' MIN', lo: 0.39, hi: 0.61, vel: 0.75,
    pede: 'Toca quando o marcador passar na marca verde: 10 minutos!' },
  { nome: 'TEMPERATURA', alvo: '100 C', de: '40', ate: '120', val: (p) => 40 + Math.round(p * 16) * 5 + ' C', lo: 0.66, hi: 0.84, vel: 0.65,
    pede: 'Agora a temperatura: toca quando o marcador chegar aos 100 graus!' },
  { nome: 'VELOCIDADE', alvo: 'VEL 5', de: '1', ate: '10', val: (p) => 'VEL ' + (1 + Math.round(p * 9)), lo: 0.37, hi: 0.52, vel: 0.5,
    pede: 'Por fim, a velocidade: toca quando o marcador passar no 5!' },
];
const TRABALHO = 3.6;   // segundos que a máquina trabalha no fim

export class BimbyProgramar extends Act {
  get max() { return this.cfg.hearts || DIALS.length; }

  start() {
    this.step = 0; this.pos = 0; this.dir = 1; this.tries = 0; this.idle = 0;
    this.wait = 1.2;          // tempo para ler a instrução
    this.advance = false;     // passar ao mostrador seguinte quando a espera acabar
    this.set = [];            // mostradores já acertados
    this.phase = 'dial';      // dial → work → pi
    this.pt = 0; this.beeps = 0;
    this.ines = getCharacter('ines', 'work');
    this.barbara = getCharacter('barbara', 'casual');
    this.isabel = getCharacter('isabelv', 'casual');
    this.hint(DIALS[0].pede);
  }

  update(dt, I) {
    if (this.phase === 'work') {
      this.pt += dt;
      if (this.pt > TRABALHO) { this.phase = 'pi'; this.pt = 0; this.hint('Pi-pi-pi! Está pronto... e cheira tão bem!'); }
      return;
    }
    if (this.phase === 'pi') {
      if (this.beeps < 3 && this.pt >= this.beeps * 0.32) { this.sfx('plim'); this.beeps++; }
      this.pt += dt;
      if (this.pt > 2.4) this.done();
      return;
    }
    const d = DIALS[this.step];
    if (this.wait > 0) {
      this.wait -= dt;
      if (this.wait <= 0 && this.advance) {
        this.advance = false; this.step++;
        if (this.step >= DIALS.length) { this.phase = 'work'; this.pt = 0; this.sfx('saw'); this.hint('A Bimby começa a trabalhar: 10 minutos, 100 °C, velocidade 5...'); return; }
        this.pos = 0; this.dir = 1; this.tries = 0; this.idle = 0; this.wait = 0.5;
        this.hint(DIALS[this.step].pede);
      }
      return;
    }
    this.pos += this.dir * d.vel * dt;
    if (this.pos >= 1) { this.pos = 1; this.dir = -1; } else if (this.pos <= 0) { this.pos = 0; this.dir = 1; }
    this.idle += dt;
    const auto = this.idle > 12;      // ninguém toca: a máquina acerta-se sozinha
    if (!I.actionPressed && !auto) return;
    const ok = !auto && this.pos >= d.lo && this.pos <= d.hi;
    this.tries++; this.idle = 0;
    if (ok || auto || this.tries >= 3) {
      // à terceira tentativa, a Inês acerta a roda à mão (sem coração)
      if (ok) { this.sfx('check'); this.heart(1, this.okX, this.okY); }
      else { this.sfx('click'); this.hint('Inês: «Pronto, este acerto eu à mão.»'); }
      this.set[this.step] = true; this.pos = (d.lo + d.hi) / 2; this.wait = 0.9; this.advance = true;
    } else {
      this.sfx('toc'); this.wait = 0.4;
      this.hint(this.tries === 1 ? 'Quase! Outra vez: toca quando o marcador estiver em cima do verde.' : 'Ainda não... Só mais uma: toca quando o marcador estiver no verde!');
    }
  }

  draw(ctx, v, R) {
    const top = this.top(v), w = v.w, t = this.t, P = v.portrait;
    const gy = P ? Math.round(v.h * 0.8) : v.h - 13, by = gy - 24;
    ctx.drawImage(cached(this, 'prog' + top, v, (g, r) => cozinha(g, r, v, top, gy, { letreiro: P, prateleiras: !P })), 0, 0);
    if (!P && w >= 360) {
      person(ctx, this.barbara, 34, gy - 12, { scale: 2, face: 1 });
      person(ctx, this.isabel, w - 30, gy - 12, { scale: 2, face: -1 });
    }
    bancada(R, v, gy);
    const u = clamp(Math.floor((by - top - 22) / 28), 2, 4), cx = Math.round(w / 2), mt = by - 28 * u;
    const d = DIALS[Math.min(this.step, DIALS.length - 1)];
    const dial = this.phase === 'dial';

    // a Bimby em grande
    let screen = d.val(this.pos), color = '#9af0c0';
    if (dial && this.advance) { screen = d.alvo; color = Math.floor(t * 8) % 2 ? '#ffffff' : '#9af0c0'; }
    else if (this.phase === 'work') { const s = Math.ceil(600 * (1 - this.pt / TRABALHO)); screen = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
    else if (this.phase === 'pi') { screen = Math.floor(t * 4) % 2 ? 'PRONTO' : ''; color = GOLD; }
    const work = this.phase === 'work';
    bimby(ctx, R, cx, by, u, { screen, color, shake: work ? (Math.floor(t * 22) % 2 ? 1 : -1) : 0, knob: dial ? -2.6 + this.pos * 3.6 : t * (work ? 6 : 0) });
    if (!dial) vapor(R, cx, mt + 2, t, work ? 7 : 4);
    this.okX = cx; this.okY = mt + 10;

    // a receita, num papel pendurado na parede
    const nx = Math.min(cx + 13 * u + 8, w - 46), ny = by - 58;
    box(R, nx, ny, 42, 48, PAPER);
    R(nx + 18, ny - 3, 6, 5, '#c0392b');
    text(ctx, 'RECEITA', nx + 21, ny + 5, VERDE, { align: 'center' });
    R(nx + 4, ny + 12, 34, 1, '#d8c8a8');
    DIALS.forEach((q, i) => {
      const y = ny + 17 + i * 10;
      if (dial && i === this.step) R(nx + 1, y - 2, 40, 9, '#ffe9a8');
      text(ctx, q.alvo, nx + 12, y, INK);
      R(nx + 3, y, 6, 5, INK); R(nx + 4, y + 1, 4, 3, this.set[i] ? '#5cf08a' : PAPER);
    });

    // a Inês, de mão na roda
    const ix = cx - 13 * u - 16;
    shadow(ctx, ix, gy, 14);
    person(ctx, this.ines, ix, gy, { scale: 2, face: 1 });

    // o mostrador do momento
    if (dial) {
      const bw = Math.min(190, w - 60), bx = Math.round((w - bw) / 2), yb = mt - 14;
      text(ctx, d.nome, w / 2, yb - 8, INK, { align: 'center' });
      text(ctx, d.de, bx - 3, yb + 2, INK, { align: 'right' });
      text(ctx, d.ate, bx + bw + 4, yb + 2, INK);
      box(R, bx, yb, bw, 8, '#3a2f4f');
      R(bx + d.lo * bw, yb, (d.hi - d.lo) * bw, 8, '#5cf08a');
      R(bx + ((d.lo + d.hi) / 2) * bw, yb, 1, 8, '#ffffff');
      box(R, bx + this.pos * bw - 2, yb - 3, 4, 14, this.advance ? '#5cf08a' : GOLD);
    }
  }

  bot(I) {
    if (this.phase !== 'dial' || this.wait > 0) return;
    const d = DIALS[this.step];
    if (this.pos > d.lo + 0.04 && this.pos < d.hi - 0.04) I.actionPressed = true;
  }
}
