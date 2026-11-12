// Nível 5, à porta do Paradise Garage: a fila é enorme, mas o porteiro (careca, amigo da Inês)
// deixa-a sempre entrar com as amigas. Toca-se para acenar quando ele olha para a fila; a cada
// aceno visto, o grupo avança, até entrar («Ladies Night: as raparigas não pagam!»).
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, lerp, person, shadow, text, textW, mark } from '../draw.js';
import { portaBg, portaGeo, portaCorda, extra, shade } from './garage-cenario.js';

const GROUP = [['ines', 'Inês'], ['ana', 'Ana'], ['maisa', 'Maísa'], ['soft', 'Soft'], ['isabel', 'Isabel']];
const SAID = [
  'Porteiro: «Hum... aquela ali ao fundo da fila... é a Inês?»',
  'Porteiro: «Inês! Anda cá para a frente, tu e as tuas amigas!»',
  'Porteiro: «Ladies Night: as raparigas não pagam! Entrem, entrem.»',
];

// Chão da rua (o mesmo no ato e nas falas antes dele).
export const portaChao = (v) => Math.round(v.h * (v.portrait ? 0.74 : 0.86));

// Fundo para um Talk à porta: a rua, a fila e o porteiro.
export function portaFundo(ctx, v, R, t, act) {
  const gy = act.ground(v);
  portaBg(ctx, v, R, t, { gy, top: act.top(v) });
  drawFila(ctx, v, R, gy, 0, t);
  const { guard } = portaGeo(v, gy);
  shadow(ctx, guard, gy, 14);
  person(ctx, getCharacter('porteiro'), guard, gy, { face: -1, scale: 2 });
}

// A fila (gente desconhecida, na penumbra) e a corda.
function drawFila(ctx, v, R, gy, shift, t) {
  const { guard } = portaGeo(v, gy), gap = 17;
  for (let k = 12; k >= 0; k--) {
    const x = guard - 30 - k * gap + shift;
    if (x < -16 || x > guard - 24) continue;
    const f = extra(k + 3), bob = Math.round(Math.abs(Math.sin(t * 1.3 + k * 1.9)) * 1.2 - 0.6);
    const img = shade(f.stand[k % 4 === 1 ? 'l' : 'r'], 0.45);
    ctx.drawImage(img, Math.round(x - 16), gy - 3 - 48 - Math.max(0, bob), 32, 48);
  }
  portaCorda(R, guard - 30 - Math.floor((guard - 30) / 30) * 30, guard - 20, gy + 1);
}

export class GaragePorta extends Act {
  get max() { return this.cfg.hearts || 3; }

  start() {
    this.stage = 0;          // acenos vistos pelo porteiro (0 a 3)
    this.pos = 0;            // avanço do grupo (0 a 3, animado)
    this.look = false;       // o porteiro está a olhar para a fila?
    this.lookT = 1.2;        // tempo até mudar
    this.lookAge = 0;
    this.wave = 0; this.lock = 0.6; this.seen = 0;
    this.idle = 0;           // segundos desde o último aceno visto
    this.fails = 0;
    this.walk = 0;           // no fim: o grupo entra pela porta
    this.over = 0;
    this.group = GROUP.map(([who]) => getCharacter(who, 'night'));
    this.guard = getCharacter('porteiro');
    this.hint('Toca para acenar ao porteiro quando ele olhar para a fila!');
  }

  update(dt, I) {
    this.wave = Math.max(0, this.wave - dt);
    this.seen = Math.max(0, this.seen - dt);
    this.pos = Math.min(this.stage, this.pos + dt * 0.9);
    if (this.over) {
      this.over += dt;
      this.walk += dt * 44;
      if (this.over > 4.6 || (this.over > 2.4 && I.actionPressed)) this.done();
      return;
    }
    this.lock = Math.max(0, this.lock - dt);
    this.idle += dt;
    // o porteiro olha ora para a porta, ora para a fila (mais tempo se o jogador estiver com dificuldade)
    const help = this.fails >= 3 || this.idle > 9;
    this.lookT -= dt;
    this.lookAge += dt;
    if (this.lookT <= 0 && this.lock <= 0.3) {
      this.look = !this.look;
      this.lookAge = 0;
      this.lookT = this.look ? (help ? 2.6 : 1.5) : 0.8 + Math.random() * (help ? 0.4 : 1.1);
    }
    if (I.actionPressed && this.lock <= 0) {
      this.wave = 0.5;
      if (this.look) this.advance(true);
      else {
        this.fails++;
        this.lock = 0.45;
        this.sfx('toc');
        this.hint('Ele não estava a olhar... Acena quando o porteiro se virar para a fila!');
      }
    } else if (this.idle > 16) this.advance(false);   // nunca fica preso: o porteiro acaba por reparar
  }

  advance(byPlayer) {
    const gy = portaChao(this.game.view), { guard } = portaGeo(this.game.view, gy);
    if (byPlayer) { this.heart(1, guard, gy - 60); this.sfx('check'); this.fails = 0; }
    this.hint(SAID[this.stage]);
    this.stage++;
    this.idle = 0;
    this.seen = 1.2;
    this.lock = 1.5;
    this.look = true; this.lookT = 1.7; this.lookAge = 0;
    if (this.stage >= 3) { this.over = 0.01; this.sfx('win'); }
  }

  // x da Inês (à frente do grupo) conforme o avanço
  leadX(v, gy) {
    const { guard } = portaGeo(v, gy), x0 = v.portrait ? 64 : Math.round(v.w * 0.26), x1 = guard - 30;
    return lerp(x0, x1, this.pos / 3) + this.walk;
  }

  draw(ctx, v, R) {
    const gy = portaChao(v), t = this.t, { guard, door } = portaGeo(v, gy);
    portaBg(ctx, v, R, t, { gy, top: this.top(v) });
    drawFila(ctx, v, R, gy, 0, t);
    // o porteiro
    const face = this.over ? 1 : this.look ? -1 : 1;
    shadow(ctx, guard, gy, 14);
    person(ctx, this.guard, guard, gy, { face, scale: 2 });
    if (this.look && !this.over) {
      // linha do olhar
      for (let k = 0; k < 6; k++) R(guard - 16 - k * 9 - Math.floor((t * 20) % 9), gy - 31, 4, 1, 'rgba(255,209,102,0.7)');
    }
    if (this.seen > 0) mark(ctx, guard, gy - 50, '!');
    else if (this.look && !this.over) mark(ctx, guard, gy - 50, '?', '#3f6fb5');
    // a Inês e as amigas, fora da corda, a avançar ao lado da fila
    const lead = this.leadX(v, gy), gap = v.portrait ? 13 : 16, moving = this.pos < this.stage || this.walk > 0;
    for (let k = this.group.length - 1; k >= 0; k--) {
      const x = lead - k * gap;
      if (x > door - 4) continue;                 // já entrou
      const hop = k === 0 && this.wave > 0 ? Math.round(Math.abs(Math.sin(this.wave * 18)) * 3) : 0;
      const y = gy + 5 + (k % 2);
      shadow(ctx, x, y, 14);
      person(ctx, this.group[k], x, y, { face: 1, scale: 2, moving, dist: x * 0.6 + k * 4, hop });
    }
    if (this.wave > 0 && lead < door - 4) {
      const bw = textW('OLÁ!') + 6, bx = Math.round(lead + 6), by = gy - 56;
      R(bx - 1, by - 1, bw + 2, 11, INK); R(bx, by, bw, 9, PAPER); R(bx + 2, by + 9, 3, 2, PAPER);
      text(ctx, 'OLÁ!', bx + 3, by + 2, '#c2185b');
    }
  }

  bot(I) {
    if (this.over) { if (this.over > 2.6) I.actionPressed = true; return; }
    if (this.look && this.lookAge > 0.3 && this.lock <= 0) I.actionPressed = true;
  }
}
