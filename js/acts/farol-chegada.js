// Ilha do Farol, ato 1: a caminhada pela areia, em fila, até ao sítio do acampamento.
// Um toque faz a Inês saltar (para apanhar os corações); de vez em quando o trolley da Isabel
// encalha na areia e é preciso puxá-lo com vários toques.
import { Act } from './base.js';
import { getSprites } from '../sprites.js';
import { INK, GOLD, clamp, hash, hills, mark, person, shadow } from '../draw.js';
import { chao, praia, farol, casinha, tufo, trolley, riscos, raparigas, barcoCarreira } from './farol-comum.js';

const VEL = 46;                    // velocidade da caminhada (px/s)
const FIM = 1240;                  // comprimento do caminho
const CORACOES = [230, 600, 1010]; // onde estão os corações (no ar)
const ENCALHES = [400, 800];       // onde o trolley encalha
const PUXOES = 5;                  // toques para o desencalhar
const DICA = 'Toca para a Inês saltar e apanhar os corações. Lá ao fundo, o farol!';

export class FarolChegada extends Act {
  get max() { return this.cfg.hearts || 4; }

  start() {
    this.g = raparigas();
    this.spr = getSprites();
    this.x = 0; this.jy = 0; this.vy = 0; this.air = false;
    this.hearts = CORACOES.map((x) => ({ x, got: false }));
    this.stuck = null; this.nStuck = 0; this.pull = 0; this.msg = 0; this.over = 0; this.botN = 0;
    this.hint(DICA);
  }

  // posições no ecrã: a Inês à frente, a Isabel logo atrás (com o trolley), a Ana a seguir (é
  // ela que ajuda quando o trolley encalha) e as outras em fila
  lay(v) {
    const P = v.portrait, gy = chao(v), ix = Math.round(v.w * (P ? 0.68 : 0.72)), sp = P ? 27 : 30;
    const gx = (k) => ix - (k === 0 ? 0 : k === 1 ? sp : k * sp + 24);
    return { P, gy, ix, gx, tx: gx(1) - 30 };
  }

  update(dt, I, v) {
    const L = this.lay(v);
    if (this.over) { this.over += dt; if (this.over > 2.8) this.done(); return; }
    if (this.msg > 0) { this.msg -= dt; if (this.msg <= 0 && !this.stuck) this.hint(DICA); }
    if (this.air) {
      this.vy -= 420 * dt; this.jy += this.vy * dt;
      if (this.jy <= 0) { this.jy = 0; this.air = false; }
    }
    this.pull = Math.max(0, this.pull - dt * 5);
    if (this.stuck) {
      const s = this.stuck;
      s.t += dt;
      if (I.actionPressed) {
        s.n++; this.pull = 1; this.sfx('toc');
        this.fx.burst(L.tx, L.gy, 6, ['#dcbf80', '#fbeec8', '#c9a868'], 40);
      }
      if (s.n >= PUXOES || s.t > 7) {
        this.sfx('pop');
        if (s.n >= PUXOES) {
          this.heart(1, L.tx, L.gy - 30);
          this.hint(this.nStuck ? 'Isabel: «Outra vez?! Para a próxima... trago rodas maiores.»' : 'Isabel: «Obrigada! Eu disse que as rodinhas davam jeito... no alcatrão.»');
        } else this.hint('A Ana dá uma ajuda e o trolley lá sai da areia!');
        this.stuck = null; this.nStuck++; this.msg = 3.2;
      }
      return;
    }
    if (I.actionPressed && !this.air) { this.air = true; this.vy = 150; this.sfx('jump'); }
    this.x += VEL * dt;
    for (const h of this.hearts) {
      if (!h.got && Math.abs(h.x - this.x) < 13 && this.jy > 9) { h.got = true; this.heart(1, L.ix, L.gy - 62); }
    }
    if (this.nStuck < ENCALHES.length && this.x >= ENCALHES[this.nStuck] && !this.air) {
      this.stuck = { n: 0, t: 0 };
      this.sfx('stomp');
      this.hint('O trolley da Isabel encalhou! Toca para o puxar, várias vezes, até sair da areia!');
    }
    if (this.x >= FIM) {
      this.over = 0.01;
      this.sfx('check');
      this.hint('Inês: «É aqui, mesmo ao pé do farol! Vamos montar o acampamento.»');
    }
  }

  draw(ctx, v, R) {
    const { P, gy, ix, gx, tx } = this.lay(v), t = this.t, cam = this.x, top = this.top(v);
    const f = clamp(cam / FIM, 0, 1);
    praia(ctx, v, R, t, {
      gy, cam, sy: gy - (P ? 46 : 20), hy: gy - (P ? 96 : 40),
      fundo: (L) => {
        // o barco de carreira, que volta para Olhão
        barcoCarreira(ctx, R, v.w * 0.16 - cam * 0.5, L.sy - 5, 1, t);
        // dunas da ilha, a aldeia e o farol
        hills(ctx, v.w, L.sy, L.sy, cam, 0.3, 7, 3, '#ecd79c', 3);
        for (let i = 0; i < 7; i++) {
          const span = v.w + 220, x = ((i * 97 + 150 - cam * 0.3) % span + span) % span - 30;
          if (i % 3 !== 2) casinha(R, x, L.sy - 5, 12 + (i % 2) * 4);
          tufo(R, x + 30, L.sy - 4); tufo(R, x + 62, L.sy - 6, '#89a85a');
        }
        const H = Math.min(P ? 170 : 110, L.sy - top - 2) * (0.62 + 0.38 * f);
        farol(ctx, R, v.w * (0.9 - 0.42 * f), L.sy - 4, H);
        hills(ctx, v.w, L.sy, L.sy, cam, 0.55, 2, 2, '#e6cf90', 9);
      },
    });
    // conchas e estrelas-do-mar pelo caminho
    for (let i = 0; i < 9; i++) {
      const span = v.w + 60, x = ((hash(i * 9.1) * 1400 - cam) % span + span) % span - 30, y = gy + 8 + hash(i * 2.7) * (v.h - gy - 12);
      if (i % 3 === 0) { R(x, y, 5, 1, '#e0572f'); R(x + 2, y - 2, 1, 5, '#e0572f'); } else { R(x, y, 4, 2, '#fff6e6'); R(x + 1, y - 1, 2, 1, '#f09a8c'); }
    }
    // os riscos do trolley na areia
    const sunk = this.stuck ? 2 : 0, shake = Math.round(this.pull * 2);
    riscos(R, 0, tx - 6, gy, cam);
    // corações no ar
    for (const h of this.hearts) {
      if (h.got) continue;
      const x = ix + (h.x - cam);
      if (x < -20 || x > v.w + 20) continue;
      ctx.drawImage(this.spr.heart, Math.round(x - 9), Math.round(gy - 71 + Math.sin(t * 4 + h.x) * 2), 18, 16);
    }
    // a fila
    const walking = !this.stuck && !this.over;
    for (let k = 8; k >= 0; k--) {
      const x = gx(k);
      if (x < -20) continue;
      shadow(ctx, x, gy, 14);
      if (k === 0) person(ctx, this.g[0], x, gy, { face: 1, moving: walking, dist: cam, scale: 2, hop: Math.round(this.jy), air: this.air });
      else if (k === 1 && this.stuck) person(ctx, this.g[1], x + shake, gy, { face: -1, scale: 2, hop: shake });
      else person(ctx, this.g[k], x, gy, { face: 1, moving: walking, dist: cam + k * 5, scale: 2, hop: this.stuck && k === 2 ? Math.round(Math.abs(Math.sin(t * 6)) * 2) : 0 });
    }
    // o trolley (enterrado na areia quando encalha)
    trolley(R, tx + shake, gy + sunk, 2, 1);
    if (this.stuck) {
      R(tx - 12, gy - 2, 12, 3, '#dcbf80'); R(tx - 10, gy - 4, 8, 2, '#dcbf80'); R(tx - 9, gy - 4, 6, 1, '#fbeec8');
      mark(ctx, tx - 2, gy - 30 - Math.round(Math.abs(Math.sin(t * 6)) * 2), '!');
      // quantos puxões faltam
      for (let k = 0; k < PUXOES; k++) {
        R(tx - 16 + k * 7, gy + 9, 6, 5, INK);
        R(tx - 15 + k * 7, gy + 10, 4, 3, k < this.stuck.n ? GOLD : '#fff6e6');
      }
    }
  }

  bot(I) {
    if (this.over) return;
    this.botN++;
    if (this.stuck) { if (this.botN % 12 === 0) I.actionPressed = true; return; }
    const h = this.hearts.find((q) => !q.got && q.x > this.x - 4);
    if (h && !this.air && h.x - this.x < 20 && h.x - this.x > 3) I.actionPressed = true;
  }
}
