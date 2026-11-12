// Nível 11, ato 1: a receita. No escritório-cozinha da Vorwerk chovem ingredientes (e tralha de
// escritório): a Inês anda de um lado para o outro com o copo da Bimby e apanha os ingredientes
// pela ordem da receita. Apanhar uma meia ou um agrafador custa o coração desse ingrediente.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, PINK, SKIN, clamp, lerp, person, shadow } from '../draw.js';
import { cached, cozinha, bancada, bimby, copo, box, VERDE, INOX_D } from './bimby-comum.js';

const RECEITA = ['cebola', 'cenoura', 'batata', 'courgette', 'azeite'];
const NOMES = { cebola: 'a cebola', cenoura: 'a cenoura', batata: 'a batata', courgette: 'a courgette', azeite: 'o azeite' };
const CORES = { cebola: '#a84a8a', cenoura: '#ff8a2b', batata: '#c9a468', courgette: '#3f8f4a', azeite: '#b8b82e' };
const TRALHA = ['meia', 'agrafador', 'rato', 'postit'];
const PIADAS = {
  meia: 'Bárbara: «Uma meia?! Isso não vem na receita!»',
  agrafador: 'Isabel: «O agrafador não, que ainda faz falta!»',
  rato: 'Bárbara: «O rato do computador não se come, Inês!»',
  postit: 'Isabel: «Creme de post-its? Hmm... é melhor não.»',
};
const QUEDA = 2.3;      // segundos que uma coisa demora a cair
const LIMITE = 55;      // ao fim deste tempo, as colegas tratam do resto

// Ingredientes e tralha, com o centro em (x, y) (cerca de 12 x 14 píxeis).
export function coisa(R, k, x, y) {
  x = Math.round(x); y = Math.round(y);
  if (k === 'cebola') {
    R(x - 4, y - 5, 8, 11, INK); R(x - 6, y - 3, 12, 7, INK); R(x - 1, y - 8, 3, 4, INK);
    R(x - 3, y - 4, 6, 9, '#a84a8a'); R(x - 5, y - 2, 10, 5, '#a84a8a'); R(x - 3, y - 3, 2, 5, '#d88ac0'); R(x, y - 7, 1, 3, '#7ab84a');
  } else if (k === 'cenoura') {
    R(x - 4, y - 4, 8, 5, INK); R(x - 3, y, 6, 4, INK); R(x - 2, y + 3, 4, 3, INK); R(x - 1, y + 5, 2, 3, INK); R(x - 3, y - 8, 6, 5, INK);
    R(x - 3, y - 3, 6, 4, '#ff8a2b'); R(x - 2, y, 4, 3, '#ff8a2b'); R(x - 1, y + 3, 2, 2, '#ff8a2b'); R(x, y + 5, 1, 2, '#e06a1b'); R(x - 2, y - 2, 1, 3, '#ffb86a');
    R(x - 2, y - 7, 4, 3, '#4fb84a'); R(x - 1, y - 7, 1, 2, '#8ad87a');
  } else if (k === 'batata') {
    R(x - 6, y - 4, 12, 8, INK); R(x - 5, y - 5, 10, 10, INK);
    R(x - 5, y - 3, 10, 6, '#c9a468'); R(x - 4, y - 4, 8, 8, '#c9a468'); R(x - 3, y - 3, 3, 1, '#e8cc98'); R(x - 2, y, 1, 1, '#8a6a3a'); R(x + 2, y + 1, 1, 1, '#8a6a3a'); R(x + 1, y - 2, 1, 1, '#8a6a3a');
  } else if (k === 'courgette') {
    R(x - 7, y - 3, 14, 6, INK); R(x + 6, y - 2, 3, 4, INK);
    R(x - 6, y - 2, 12, 4, '#3f8f4a'); R(x - 5, y - 2, 9, 1, '#7ac87a'); R(x + 6, y - 1, 2, 2, '#c9b86a');
  } else if (k === 'azeite') {
    R(x - 4, y - 2, 8, 10, INK); R(x - 2, y - 8, 4, 7, INK);
    R(x - 3, y - 1, 6, 8, '#b8b82e'); R(x - 1, y - 5, 2, 4, '#b8b82e'); R(x - 1, y - 7, 2, 2, '#2f5a2a'); R(x - 3, y + 1, 6, 3, PAPER); R(x - 2, y - 1, 1, 2, '#e8e87a');
  } else if (k === 'meia') {
    R(x - 3, y - 7, 7, 10, INK); R(x - 3, y + 1, 10, 6, INK);
    R(x - 2, y - 6, 5, 9, '#ffffff'); R(x - 2, y + 2, 8, 4, '#ffffff'); R(x - 2, y - 5, 5, 1, PINK); R(x - 2, y - 3, 5, 1, PINK); R(x + 4, y + 2, 2, 4, PINK);
  } else if (k === 'agrafador') {
    R(x - 7, y - 3, 14, 8, INK);
    R(x - 6, y - 2, 12, 3, '#d43d3d'); R(x - 6, y + 2, 12, 2, '#5a6072'); R(x - 5, y - 2, 4, 1, '#ff8a8a');
  } else if (k === 'rato') {
    R(x - 4, y - 5, 8, 11, INK); R(x - 5, y - 3, 10, 7, INK); R(x, y - 8, 1, 3, INK);
    R(x - 3, y - 4, 6, 9, '#e8e8f0'); R(x - 4, y - 2, 8, 5, '#e8e8f0'); R(x, y - 4, 1, 4, INOX_D); R(x - 3, y, 6, 1, INOX_D);
  } else {
    box(R, x - 5, y - 5, 10, 10, '#ffe45a');
    R(x + 2, y + 2, 3, 3, '#d8b82e'); R(x - 3, y - 3, 6, 1, '#8a6a3a'); R(x - 3, y - 1, 4, 1, '#8a6a3a');
  }
}

export class BimbyReceita extends Act {
  get max() { return this.cfg.hearts || RECEITA.length; }

  start(v) {
    this.px = v.w * 0.35; this.face = 1; this.dist = 0; this.moving = false;
    this.n = 0;             // ingredientes já no copo
    this.clean = true;      // ainda não apanhou tralha desde o último ingrediente
    this.items = [];        // o que vai a cair
    this.toss = [];         // tralha a saltar para fora do copo
    this.spawn = 1.3; this.misses = 0; this.time = 0; this.over = 0;
    this.cheer = 0; this.shake = 0;
    this.ines = getCharacter('ines', 'work');
    this.barbara = getCharacter('barbara', 'casual');
    this.isabel = getCharacter('isabelv', 'casual');
    this.hint('Arrasta o dedo (ou usa as setas) e apanha os ingredientes pela ordem. Primeiro, a cebola!');
  }

  geo(v) {
    const top = this.top(v), gy = Math.round(v.h * (v.portrait ? 0.8 : 0.9));
    const y0 = top + 26, cy = gy - 21;
    return { top, gy, y0, cy, speed: (cy - y0) / QUEDA };
  }

  update(dt, I, v) {
    const g = this.geo(v);
    if (this.cheer > 0) this.cheer -= dt;
    if (this.shake > 0) this.shake -= dt;
    for (let i = this.toss.length - 1; i >= 0; i--) {
      const o = this.toss[i];
      o.vy += 420 * dt; o.x += o.vx * dt; o.y += o.vy * dt;
      if (o.y > v.h + 10) this.toss.splice(i, 1);
    }
    if (this.over) { this.over += dt; if (this.over > 2.6) this.done(); return; }
    this.time += dt;

    // a Inês anda atrás do dedo (ou das setas)
    let dx = 0;
    if (I.pointerX >= 0) { const tx = I.pointerX * v.w; if (Math.abs(tx - this.px) > 2) dx = clamp(tx - this.px, -240 * dt, 240 * dt); }
    else if (I.left) dx = -150 * dt;
    else if (I.right) dx = 150 * dt;
    this.moving = dx !== 0;
    if (dx) { this.face = dx > 0 ? 1 : -1; this.px = clamp(this.px + dx, 16, v.w - 16); this.dist += Math.abs(dx); }

    // o que cai
    this.spawn -= dt;
    if (this.spawn <= 0) { this.drop(v, g); this.spawn = 0.8; }
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.y += g.speed * dt;
      if (it.y >= g.cy - 2 && it.y <= g.cy + 6 && Math.abs(it.x - this.px) <= (it.ok ? 11 : 8)) {
        this.items.splice(i, 1);
        this.caught(it, g);
        if (this.over) return;
      } else if (it.y > g.gy - 5) {
        this.items.splice(i, 1);
        this.fx.burst(it.x, g.gy - 3, 5, ['#ffffff', '#d8d3e6'], 30);
        if (it.ok) this.misses++;
      }
    }
    if (this.time > LIMITE) this.finish(true);
  }

  // Larga mais uma coisa: o ingrediente que falta (se não houver nenhum a cair) ou tralha.
  drop(v, g) {
    const ok = !this.items.some((it) => it.ok);
    if (!ok && Math.random() < 0.25) return;
    let x = 0;
    for (let k = 0; k < 6; k++) {
      // à terceira falha, o ingrediente cai mesmo por cima da Inês
      if (ok) x = this.misses >= 3 ? this.px : this.px + (Math.random() * 2 - 1) * 190;
      else x = Math.random() < 0.35 ? this.px + Math.random() * 30 - 15 : 20 + Math.random() * (v.w - 40);
      x = clamp(x, 20, v.w - 20);
      if (!this.items.some((it) => it.y < g.y0 + (g.cy - g.y0) * 0.5 && Math.abs(it.x - x) < 28)) break;
    }
    this.items.push({ kind: ok ? RECEITA[this.n] : TRALHA[Math.floor(Math.random() * TRALHA.length)], ok, x, y: g.y0 });
  }

  caught(it, g) {
    if (it.ok) {
      this.sfx('pop');
      this.fx.burst(this.px, g.cy, 8, [GOLD, '#ffffff', VERDE], 50);
      if (this.clean) this.heart(1, this.px, g.cy - 10);
      this.n++; this.clean = true; this.misses = 0; this.cheer = 0.8;
      if (this.n >= RECEITA.length) this.finish(false);
      else this.hint(`Boa! Agora, ${NOMES[RECEITA[this.n]]}.`);
    } else {
      this.sfx('buzz');
      this.clean = false; this.shake = 0.5;
      this.toss.push({ kind: it.kind, x: this.px, y: g.cy - 4, vx: (this.px > 60 ? -1 : 1) * (60 + Math.random() * 50), vy: -170 });
      this.hint(PIADAS[it.kind]);
    }
  }

  finish(forced) {
    this.n = RECEITA.length; this.items = []; this.over = 0.01; this.cheer = 3;
    this.sfx('win');
    this.hint(forced ? 'Bárbara: «O resto ponho eu!» Tudo no copo... agora é com a Bimby.' : 'Tudo no copo, pela ordem certa! Agora é com a Bimby.');
  }

  draw(ctx, v, R) {
    const g = this.geo(v), t = this.t, w = v.w, by = g.gy - 24, bx = Math.round(w / 2);
    ctx.drawImage(cached(this, 'coz' + g.top, v, (c, r) => cozinha(c, r, v, g.top, g.gy)), 0, 0);
    // as colegas, atrás da bancada, a torcer
    const hop = (k) => (this.cheer > 0 ? Math.round(Math.abs(Math.sin(t * 9 + k)) * 3) : 0);
    person(ctx, this.barbara, w * 0.17, g.gy - 12, { scale: 2, face: 1, hop: hop(0) });
    person(ctx, this.isabel, w * 0.83, g.gy - 12, { scale: 2, face: -1, hop: hop(1.5) });
    bancada(R, v, g.gy);
    // a Bimby, à espera do copo
    const fly = this.over ? clamp(this.over / 0.9, 0, 1) : 0;
    bimby(ctx, R, bx, by, 2, { cup: fly >= 1, screen: fly >= 1 ? 'OLÁ!' : '' });

    // a receita: os ingredientes pela ordem, com o que falta em destaque
    const rx = 4, ry = g.top + 1;
    box(R, rx, ry, RECEITA.length * 16 + 4, 18, PAPER);
    RECEITA.forEach((k, i) => {
      const cx = rx + 10 + i * 16, cy = ry + 9;
      if (i === this.n && !this.over) { const p = Math.floor(t * 4) % 2; R(cx - 8, ry + 1, 16, 16, p ? GOLD : '#ffe9a8'); }
      coisa(R, k, cx, cy);
      if (i < this.n) { R(cx - 8, ry + 1, 16, 16, 'rgba(255,246,230,0.6)'); R(cx - 4, cy + 1, 2, 2, VERDE); R(cx - 2, cy + 3, 2, 2, VERDE); R(cx, cy + 1, 2, 2, VERDE); R(cx + 2, cy - 1, 2, 2, VERDE); R(cx + 4, cy - 3, 2, 2, VERDE); }
    });

    // a Inês com o copo ao colo
    shadow(ctx, this.px, g.gy, 14);
    person(ctx, this.ines, this.px, g.gy, { scale: 2, face: this.face, moving: this.moving, dist: this.dist });
    if (fly < 1) {
      const sh = this.shake > 0 ? Math.round(Math.sin(t * 50) * 2) : 0;
      const cx = lerp(this.px, bx, fly) + sh, cb = lerp(g.gy - 8, by - 22, fly) - Math.sin(fly * Math.PI) * 22, u = fly > 0.6 ? 2 : 1;
      copo(R, cx, cb, u, { lid: false, handle: true });
      for (let i = 0; i < this.n; i++) R(cx - 6 * u + i * 2.5 * u, cb - 12 * u - u, 2 * u, 2 * u, CORES[RECEITA[i]]);
      if (!fly) { box(R, cx - 10, cb - 7, 3, 4, SKIN); box(R, cx + 7, cb - 7, 3, 4, SKIN); }
    }

    // o que vai a cair
    for (const it of this.items) coisa(R, it.kind, it.x + Math.sin(t * 5 + it.x) * 1.5, it.y);
    for (const o of this.toss) coisa(R, o.kind, o.x, o.y);
  }

  bot(I, v) {
    if (this.over) return;
    const g = this.geo(v), want = this.items.find((it) => it.ok);
    let tx = want ? want.x : this.px;
    // foge da tralha que está quase a cair dentro do copo
    for (const it of this.items) {
      if (it.ok || it.y < g.cy - 30 || it.y > g.cy + 6 || Math.abs(it.x - tx) > 13) continue;
      if (want && want.y > it.y - 6) continue;      // o ingrediente chega primeiro: apanha-o e foge depois
      tx = it.x + (this.px >= it.x ? 17 : -17);
      if (tx < 18) tx = it.x + 17; else if (tx > v.w - 18) tx = it.x - 17;
    }
    if (tx > this.px + 2) I.right = true; else if (tx < this.px - 2) I.left = true;
  }
}
