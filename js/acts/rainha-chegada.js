// «O Rainha», ato 1: o primeiro dia. A Inês chega à Rua da Junqueira com a Ana, a Soft e a
// Isabel e vai conhecendo as novas colegas à frente do palácio: anda-se mantendo premido (ou com
// a seta para a direita) e cumprimenta-se com um toque.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { clamp, person, shadow, mark } from '../draw.js';
import { rua, geo } from './rainha-cenario.js';

const WORLD = 520, SPEED = 48;
const NOVAS = [
  { who: 'mi', name: 'Mi', x: 190, line: 'Mi: «Olá! Sou a Mariana, mas toda a gente me chama Mi.»' },
  { who: 'maria', name: 'Maria', x: 290, line: 'Maria: «Maria Sampaio Melo, muito prazer! Guardo-te um lugar ao pé de mim?»' },
  { who: 'tete', name: 'Tété', x: 390, line: 'Tété: «Sou a Teresa! Tété para as amigas... e nós já somos amigas!»' },
];
const ANDAR = 'Mantém premido (ou a seta para a direita) para andares até às novas colegas.';

export class Chegada extends Act {
  get max() { return this.cfg.hearts || 3; }

  start() {
    this.x = 92; this.dist = 0; this.moving = false;
    this.k = 0;                 // quantas colegas novas já conheceu
    this.state = 'walk';        // walk → meet → say → walk ... → bell
    this.st = 0; this.idle = 0;
    this.ines = getCharacter('ines', 'teen');
    this.tail = ['ana', 'soft', 'isabel'].map((who, i) => ({ frames: getCharacter(who, 'teen'), x: this.x - 21 * (i + 1), dist: i * 5, moving: false }));
    this.novas = NOVAS.map((n) => ({ ...n, frames: getCharacter(n.who, 'teen') }));
    this.hint(ANDAR);
  }

  update(dt, I, v) {
    this.st += dt;
    this.moving = false;
    if (this.state === 'walk') {
      const stop = this.novas[this.k].x - 30;
      // se ninguém a fizer andar durante uns segundos, a Inês vai andando sozinha (nunca se fica preso)
      if (I.action || I.right || I.left) this.idle = 0; else this.idle += dt;
      const dir = (I.action || I.right || this.idle > 9) ? 1 : I.left ? -1 : 0;
      if (dir) {
        this.x = clamp(this.x + dir * SPEED * dt, 80, stop);
        this.dist += SPEED * dt; this.moving = true;
      }
      if (this.x >= stop) {
        this.state = 'meet'; this.st = 0;
        this.hint('Toca para dizeres olá à ' + this.novas[this.k].name + '!');
      }
    } else if (this.state === 'meet') {
      if (I.actionPressed && this.st > 0.25) this.say(true, v);
      else if (this.st > 7) this.say(false, v);
    } else if (this.state === 'say') {
      if ((I.actionPressed && this.st > 0.6) || this.st > 3.4) {
        const n = this.novas[this.k];
        this.tail.push({ frames: n.frames, x: n.x, dist: 0, moving: false });
        n.joined = true;
        this.k++; this.st = 0;
        if (this.k >= this.novas.length) {
          this.state = 'bell';
          this.sfx('ring');
          this.hint('Trrrim! É a campainha: todas lá para dentro, que a primeira aula vai começar!');
        } else {
          this.state = 'walk';
          this.hint('Continua a andar: há mais colegas novas à porta do liceu.');
        }
      }
    } else if (this.state === 'bell') {
      this.x += 64 * dt; this.dist += 64 * dt; this.moving = true;
      if (this.st > 2.6) this.done();
    }
    // as amigas vão atrás, em fila
    const sp = v.portrait ? 18 : 22;
    this.tail.forEach((m, i) => {
      const target = this.x - sp * (i + 1), d = clamp(target - m.x, -90 * dt, 90 * dt);
      m.moving = Math.abs(target - m.x) > 0.5;
      m.x += d; m.dist += Math.abs(d);
    });
  }

  say(tapped, v) {
    const n = this.novas[this.k], g = geo(v);
    this.state = 'say'; this.st = 0;
    this.hint(n.line);
    if (tapped) { this.heart(1, n.x - this.cam(v), g.gy - 56); this.sfx('chirp'); } else this.sfx('click');
  }

  cam(v) { return clamp(this.x - v.w * 0.45, 0, Math.max(0, WORLD - v.w)); }

  draw(ctx, v, R) {
    const g = geo(v), cam = Math.round(this.cam(v)), t = this.t;
    rua(ctx, v, R, g, cam, t);
    // as colegas novas, à espera
    this.novas.forEach((n, i) => {
      if (n.joined) return;
      const x = n.x - cam, talking = this.state === 'say' && i === this.k;
      shadow(ctx, x, g.gy, 14);
      person(ctx, n.frames, x, g.gy, { face: -1, scale: 2, hop: talking ? Math.round(Math.abs(Math.sin(t * 7)) * 2) : 0 });
      if (!talking && i === this.k) mark(ctx, x, g.gy - 52 - Math.round(Math.abs(Math.sin(t * 4)) * 2), '!');
    });
    // a fila das amigas (a mais afastada primeiro) e a Inês à frente
    for (let i = this.tail.length - 1; i >= 0; i--) {
      const m = this.tail[i];
      shadow(ctx, m.x - cam, g.gy, 14);
      person(ctx, m.frames, m.x - cam, g.gy, { face: 1, scale: 2, moving: m.moving, dist: m.dist });
    }
    shadow(ctx, this.x - cam, g.gy, 14);
    person(ctx, this.ines, this.x - cam, g.gy, { face: 1, scale: 2, moving: this.moving, dist: this.dist });
  }

  bot(I) {
    if (this.state === 'walk') I.action = true;
    else if (this.state === 'meet' && this.st > 0.5) I.actionPressed = true;
    else if (this.state === 'say' && this.st > 1.4) I.actionPressed = true;
  }
}
