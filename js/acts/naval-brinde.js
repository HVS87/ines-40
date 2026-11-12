// O brinde na esplanada do Clube Naval: todos levantam as imperiais e os copos aproximam-se e
// afastam-se; tocar no momento em que se encontram. Em cada ronda chegam mais amigos à mesa e o
// céu vai mudando de cor. Nunca se perde: à segunda tentativa falhada brinda-se na mesma.
//   { act: Brinde, hearts: 4 }
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, GOLD, clamp, lerp, person, sign } from '../draw.js';
import { docaBelem } from './naval-fundo.js';

// por ordem de chegada; slot = lugar à mesa (0 a 5, da esquerda para a direita)
const AMIGOS = [
  { who: 'ines', slot: 2 }, { who: 'lourenco', slot: 3 }, { who: 'pipoca', slot: 1 }, { who: 'ana', slot: 4 },
  { who: 'mi', slot: 0 }, { who: 'leal', slot: 5 },
];
const RONDAS = [
  { n: 2, per: 2.0, diz: 'Um brinde a dois! Toca quando os copos se encontrarem.' },
  { n: 4, per: 1.85, diz: 'Chegaram o Pipoca e a Ana! Toca quando os copos se encontrarem.' },
  { n: 6, per: 1.7, diz: 'E a Mi e o Leal! Toca quando os copos se encontrarem.' },
  { n: 6, per: 1.55, diz: 'O último brinde, com o sol a pôr-se: toca quando os copos se encontrarem!' },
];
const JANELA = 0.16;      // segundos de tolerância, para cada lado

export class Brinde extends Act {
  get max() { return this.cfg.hearts || 4; }

  start() {
    this.gente = AMIGOS.map((a, i) => ({ ...a, frames: getCharacter(a.who, 'casual'), chega: i < 2 ? 1 : 0 }));   // a Inês e o Lourenço já lá estão
    this.r = -1; this.dusk = 0.05; this.tchim = 0;
    this.ronda();
  }

  ronda() {
    this.r++;
    if (this.r >= RONDAS.length) { this.ph = 'fim'; this.pt = 0; this.hint('Ana: «Saúde! Aos fins de tarde no Clube Naval.»'); return; }
    this.ph = 'chega'; this.pt = 0; this.falhas = 0; this.ciclo = 0;
    this.hint(RONDAS[this.r].diz);
  }

  update(dt, I) {
    const R0 =RONDAS[Math.min(this.r, RONDAS.length - 1)];
    this.pt += dt;
    if (this.tchim > 0) this.tchim -= dt;
    this.dusk += clamp((this.r + (this.ph === 'fim' ? 1 : 0)) * 0.17 + 0.05 - this.dusk, -dt * 0.1, dt * 0.1);
    for (let i = 0; i < R0.n; i++) this.gente[i].chega = Math.min(1, this.gente[i].chega + dt / 1.1);
    if (this.ph === 'chega') {
      if (this.pt > (this.r === 0 || this.r === 3 ? 0.5 : 1.3)) { this.ph = 'brinde'; this.pt = 0; }
    } else if (this.ph === 'brinde') {
      const fase = (this.pt / R0.per) % 1, dist = Math.abs(fase - 0.5) * R0.per;
      this.ciclo = Math.floor(this.pt / R0.per);
      if (I.actionPressed && this.pt > 0.2) {
        if (dist <= JANELA) this.acerta(true);
        else if (++this.falhas >= 2) this.acerta(false);
        else { this.sfx('toc'); this.hint('Quase! Outra vez: toca mesmo quando os copos se encontrarem.'); }
      } else if (this.ciclo >= 5) this.acerta(false);          // ninguém tocou: brindam sozinhos
    } else if (this.ph === 'saude') {
      if (this.pt > 1.5) this.ronda();
    } else if (this.pt > 2) this.done();
  }

  acerta(ok) {
    const v = this.game.view, g = this.geo(v);
    this.ph = 'saude'; this.pt = 0; this.tchim = 1.1; this.ok = ok;
    this.sfx(ok ? 'plim' : 'toc');
    this.fx.burst(g.cx, g.cy, ok ? 18 : 6, ['#ffffff', GOLD, '#fff3a8'], 70);
    if (ok) this.heart(1, g.cx, g.cy - 8);
    this.hint(ok ? ['Inês: «Saúde!»', 'Pipoca: «Tchim-tchim!»', 'Leal: «À nossa!»', 'Lourenço: «A nós, e aos fins de tarde!»'][this.r] : 'Brindaram fora de tempo... mas saúde na mesma!');
  }

  geo(v) {
    const gy = Math.round(v.h * (v.portrait ? 0.72 : 0.86));
    const passo = Math.min(40, (v.w - 30) / 6), x0 = v.w / 2 - passo * 2.5;
    return { gy, passo, x0, cx: Math.round(v.w / 2), cy: gy - 62 };
  }

  draw(ctx, v, R) {
    const g = this.geo(v), t = this.t, R0 = RONDAS[Math.min(this.r, RONDAS.length - 1)];
    docaBelem(ctx, v, R, t, { gy: g.gy, dusk: this.dusk, lights: 0 });
    // quanto os copos estão juntos (0 = na mão, 1 = a tocar)
    let k = 0;
    if (this.ph === 'brinde') k = 1 - Math.abs(((this.pt / R0.per) % 1) * 2 - 1);
    else if (this.ph === 'saude') k = this.pt < 0.5 ? 1 : Math.max(0, 1 - (this.pt - 0.5) * 2);
    // os amigos, atrás da mesa
    const copos = [];
    for (const p of this.gente) {
      if (p.chega <= 0) continue;
      const lado = p.slot < 3 ? -1 : 1, xf = g.x0 + p.slot * g.passo, x = Math.round(lerp(lado < 0 ? -20 : v.w + 20, xf, p.chega));
      const hop = this.ph === 'saude' && this.ok ? Math.round(Math.abs(Math.sin(t * 9 + p.slot)) * 3) : 0;
      person(ctx, p.frames, x, g.gy, { scale: 2, face: -lado, moving: p.chega < 1, dist: p.chega * 60, hop });
      if (p.chega >= 1) copos.push([lerp(x - lado * 9, g.cx + (p.slot - 2.5) * 5, k), lerp(g.gy - 30, g.cy + Math.abs(p.slot - 2.5) * 2, k)]);
    }
    // a mesa
    const mw = Math.min(v.w - 16, g.passo * 6 + 10), mx = Math.round(v.w / 2 - mw / 2), my = g.gy - 14;
    R(mx - 1, my - 1, mw + 2, 6, INK); R(mx, my, mw, 4, '#f2f2f7'); R(mx, my + 3, mw, 1, '#c9c9d8');
    for (const lx of [mx + 6, mx + mw - 9]) { R(lx - 1, my + 5, 5, g.gy - my - 2, INK); R(lx, my + 5, 3, g.gy - my - 3, '#8a8794'); }
    R(mx + mw * 0.3, my - 4, 12, 4, INK); R(mx + mw * 0.3 + 1, my - 3, 10, 2, '#ffd166');           // tremoços
    for (const [x, y] of copos) this.copo(R, Math.round(x), Math.round(y));
    if (this.tchim > 0 && this.ok) sign(ctx, 'TCHIM!', g.cx, Math.max(this.top(v) + 2, g.cy - 34), { scale: 2 });
  }

  // Uma imperial: copo alto com cerveja dourada e espuma.
  copo(R, x, y) {
    R(x - 5, y - 11, 10, 20, INK); R(x - 4, y - 6, 8, 14, '#f2b632'); R(x - 4, y - 10, 8, 4, '#ffffff'); R(x - 3, y - 4, 2, 10, '#ffd97a'); R(x + 2, y - 8, 2, 1, '#e8e8f0');
  }

  bot(I) {
    if (this.ph !== 'brinde' || this.pt < 0.3) return;
    const per = RONDAS[this.r].per;
    if (Math.abs(((this.pt / per) % 1) - 0.5) * per < 0.03) I.actionPressed = true;
  }
}
