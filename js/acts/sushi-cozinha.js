// Ato «cozinha» (nível 14): a cozinha do Sushi@Home. As peças passam num tapete; quando uma
// peça do pedido (o talão, em cima) passar debaixo dos hashi do Lourenço, toca: ele apanha-a e
// a Inês arruma-a na caixa. Cada pedido completo dá um coração (se não houver mais de um engano).
// Nunca encrava: ao fim de uns segundos, a Inês acaba o pedido (sem coração).
//   { act: Cozinha, orders: [['salmao', 'maki', 'temaki'], ...] }
import { Act } from './base.js';
import { getCharacter, makeSprite } from '../sprites.js';
import { INK, PAPER, GOLD, PINK, clamp, lerp, person, text } from '../draw.js';
import { logo } from './sushi-entrega.js';

const NIGIRI = ['..oooooooooo..', '.oaabaabaabao.', 'oaabaabaabaaao', 'oaaaaaaaaaaaao', 'owwwwwwwwwwwwo', 'owwwwwwwwwwwwo', 'ogwwwwwwwwwwgo', '.oggggggggggo.', '..oooooooooo..'];
const MAKI = ['...oooooo...', '..onnnnnno..', '.onwwwwwwno.', 'onwwwccwwwno', 'onwwccgcwwno', 'onwwcgccwwno', 'onwwwccwwwno', '.onwwwwwwno.', '..onnnnnno..', '...oooooo...'];
const TEMAKI = ['..oooooooo..', '.owcwwgwcwo.', 'owwccwggwwwo', 'onnnnnnnnnno', '.onnnnnnnno.', '.onnNnnnnno.', '..onnNnnno..', '...onnnno...', '....onno....', '.....oo.....'];
const KINDS = ['salmao', 'atum', 'maki', 'temaki'];
const ORDERS = [['salmao', 'maki', 'salmao'], ['temaki', 'atum', 'maki'], ['maki', 'salmao', 'temaki', 'atum'], ['atum', 'temaki', 'maki', 'salmao']];
const LIMIT = 16;      // segundos por pedido, antes de a Inês ajudar

export class Cozinha extends Act {
  get max() { return (this.cfg.orders || ORDERS).length; }

  start() {
    const rice = { o: INK, w: '#ffffff', g: '#d8dce6' };
    this.spr = {
      salmao: makeSprite(NIGIRI, { ...rice, a: '#ff8a4b', b: '#ffd0a8' }),
      atum: makeSprite(NIGIRI, { ...rice, a: '#d43d51', b: '#e85f72' }),
      maki: makeSprite(MAKI, { ...rice, n: '#1f3a30', c: '#ff8a4b', g: '#7be07a' }),
      temaki: makeSprite(TEMAKI, { o: INK, w: '#ffffff', n: '#1f3a30', N: '#3a5a4a', c: '#ff8a4b', g: '#7be07a' }),
    };
    this.lou = getCharacter('lourenco', 'sushi');
    this.ines = getCharacter('ines', 'casual');
    this.orders = this.cfg.orders || ORDERS;
    this.k = -1;
    this.belt = [];        // { kind, f }: f = posição no tapete (1 = direita, 0 = esquerda)
    this.fly = [];         // peças a voar: para a caixa (slot) ou para fora
    this.spawn = 0.2; this.dry = 0;
    this.dip = 0; this.pause = 0; this.over = 0;
    this.next();
    this.hint('Toca quando uma peça do pedido passar debaixo dos hashi!');
  }

  next() {
    this.k++;
    this.need = this.orders[this.k].slice();
    this.have = this.need.map(() => false);
    this.errs = 0; this.clock = 0; this.helped = false;
  }

  missing() { return this.need.filter((kind, i) => !this.have[i]); }

  // medidas (mudam com o formato do ecrã)
  geo(v) {
    const u = v.portrait ? 3 : 2, bh = 11 * u + 4;
    const cy = v.portrait ? Math.round(v.h * 0.56) : v.h - 60;
    const zx = Math.round(v.w * (v.portrait ? 0.5 : 0.6));
    return { u, bh, cy, zx, zone: 7 * u, speed: v.portrait ? 0.2 : 0.17, gap: v.portrait ? 1.05 : 0.85 };
  }

  inZone(v, g) {
    let best = null;
    for (const p of this.belt) { const d = Math.abs(p.f * v.w - g.zx); if (d < g.zone && (!best || d < best.d)) best = { p, d }; }
    return best && best.p;
  }

  update(dt, I, v) {
    const g = this.geo(v);
    if (this.dip > 0) this.dip -= dt;
    for (let i = this.fly.length - 1; i >= 0; i--) { this.fly[i].t += dt * 2.2; if (this.fly[i].t >= 1) this.fly.splice(i, 1); }
    if (this.over) { this.over += dt; if (this.over > 2) this.done(); return; }
    // o tapete anda sempre
    for (let i = this.belt.length - 1; i >= 0; i--) { this.belt[i].f -= g.speed * dt; if (this.belt[i].f < -0.1) this.belt.splice(i, 1); }
    this.spawn -= dt;
    if (this.spawn <= 0) {
      this.spawn = g.gap;
      const miss = this.missing(), useful = miss.length && (this.dry >= 1 || Math.random() < 0.55);
      const others = KINDS.filter((kind) => !miss.includes(kind));
      const kind = useful || !others.length ? miss[Math.floor(Math.random() * miss.length)] || KINDS[0] : others[Math.floor(Math.random() * others.length)];
      this.dry = useful ? 0 : this.dry + 1;
      this.belt.push({ kind, f: 1.08 });
    }
    if (this.pause > 0) {
      // pedido fechado: um instante para o ver sair
      this.pause -= dt;
      if (this.pause <= 0) {
        if (this.k + 1 >= this.orders.length) { this.over = 0.01; this.sfx('win'); this.hint('Lourenço: «Tudo pronto e fresquinho. Agora, as entregas!»'); } else { this.next(); this.hint(`Lourenço: «Pedido n.º ${this.k + 1}! Olha o talão, Inês.»`); }
      }
      return;
    }
    this.clock += dt;
    if (I.actionPressed) {
      const p = this.inZone(v, g);
      this.dip = 0.25;
      if (!p) this.sfx('toc');
      else {
        const i = this.need.findIndex((kind, j) => kind === p.kind && !this.have[j]);
        this.belt.splice(this.belt.indexOf(p), 1);
        if (i >= 0) { this.have[i] = true; this.sfx('pop'); this.fly.push({ kind: p.kind, f: p.f, slot: i, t: 0 }); } else {
          this.errs++; this.sfx('buzz'); this.fly.push({ kind: p.kind, f: p.f, slot: -1, t: 0 });
          this.hint('Inês: «Essa não é do pedido! Vê o talão.»');
        }
      }
    }
    if (this.clock > LIMIT && !this.helped) {
      // a Inês acaba o pedido
      this.helped = true;
      this.have = this.have.map(() => true);
    }
    if (this.have.every(Boolean)) {
      this.pause = 1.3;
      const ok = !this.helped && this.errs <= 1;
      if (ok) { this.heart(1, v.w / 2, g.cy + g.bh + 10); this.sfx('check'); }
      this.hint(this.helped ? 'Inês: «Deixa, este acabo eu! O próximo é teu.»' : ok ? 'Inês: «Pedido pronto! Para a caixa e siga.»' : 'Inês: «Pedido pronto... depois de alguns enganos!»');
    }
  }

  piece(ctx, kind, cx, cy, u) {
    const s = this.spr[kind];
    ctx.drawImage(s, Math.round(cx - (s.width * u) / 2), Math.round(cy - (s.height * u) / 2), s.width * u, s.height * u);
  }

  // onde fica a peça i do pedido, na caixa
  slot(v, g, i) {
    const n = this.need.length, sw = 15 * g.u;
    return [Math.round(v.w / 2 - (n * sw) / 2 + sw * (i + 0.5)), g.cy + g.bh + 5 + Math.round(6.5 * g.u)];
  }

  draw(ctx, v, R) {
    const g = this.geo(v), { u, bh, cy, zx } = g, t = this.t, top = this.top(v), w = v.w;
    // parede de azulejo branco, prateleira e letreiro
    R(0, 0, w, cy, '#eef2f0');
    for (let x = 0; x < w; x += 12) R(x, 0, 1, cy, '#d4dcd8');
    for (let y = 4; y < cy; y += 12) R(0, y, w, 1, '#d4dcd8');
    R(0, cy - 30 * u, w, 2, '#1c1c28'); R(0, cy - 30 * u + 2, w, 1, '#c0392b');
    const sc = v.portrait ? 2 : 1, signX = Math.round(v.portrait ? w / 2 : w * 0.82), signY = v.portrait ? top + 42 : top + 5;
    R(signX - 27 * sc - 1, signY - 1, 54 * sc + 2, 11 * sc + 2, '#c0392b'); R(signX - 27 * sc, signY, 54 * sc, 11 * sc, '#1c1c28');
    logo(ctx, signX, signY + 3 * sc, sc);
    // na prateleira: molho de soja, taças, um gato da sorte (a acenar) e bambu
    const shy = cy - 30 * u, wave = Math.floor(t * 3) % 2;
    for (const ox of v.portrait ? [Math.round(w * 0.08), Math.round(w * 0.6)] : [Math.round(w * 0.44)]) {
      const P = (x, y, pw, ph, c) => R(ox + x * sc, shy + y * sc, pw * sc, ph * sc, c);
      P(0, -9, 4, 9, '#2a1a14'); P(1, -12, 2, 3, '#c0392b'); P(0, -6, 4, 2, '#f4dcae');
      P(9, -4, 9, 4, '#3f6fb5'); P(10, -5, 7, 1, '#ffffff'); P(9, -8, 9, 3, '#c0392b'); P(10, -9, 7, 1, '#ffffff');
      P(23, -11, 11, 11, INK); P(24, -10, 9, 10, '#ffffff'); P(23, -13, 3, 3, INK); P(31, -13, 3, 3, INK); P(24, -12, 1, 2, '#ffffff'); P(32, -12, 1, 2, '#ffffff');
      P(26, -8, 1, 1, INK); P(30, -8, 1, 1, INK); P(28, -7, 1, 1, '#ff8a6a'); P(24, -5, 9, 1, '#c0392b'); P(27, -4, 3, 3, GOLD);
      P(34, -13 - wave * 2, 3, 6, INK); P(34, -12 - wave * 2, 2, 4, '#ffffff');
      P(42, -4, 6, 4, '#8a5a34'); P(43, -13, 1, 9, '#4fb888'); P(46, -10, 1, 6, '#4fb888'); P(44, -12, 2, 1, '#7be07a'); P(47, -9, 2, 1, '#7be07a'); P(41, -8, 2, 1, '#7be07a');
    }
    // o talão do pedido
    const n = this.need.length, tw = n * 30 + 8, tx = v.portrait ? Math.round((w - tw) / 2) : 5, ty = top + 3;
    R(tx - 1, ty - 1, tw + 2, 34, INK); R(tx, ty, tw, 32, PAPER);
    text(ctx, `PEDIDO ${this.k + 1}/${this.orders.length}`, tx + 4, ty + 3, '#c0392b');
    this.need.forEach((kind, i) => {
      const px = tx + 19 + i * 30, py = ty + 20;
      if (this.have[i]) { ctx.globalAlpha = 0.3; this.piece(ctx, kind, px, py, 2); ctx.globalAlpha = 1; R(px - 4, py, 3, 3, '#2f9f52'); R(px - 1, py + 2, 3, 3, '#2f9f52'); R(px + 2, py - 2, 3, 4, '#2f9f52'); R(px + 4, py - 5, 3, 4, '#2f9f52'); } else this.piece(ctx, kind, px, py + Math.round(Math.sin(t * 5 + i) * 1), 2);
    });
    // o Lourenço (com os hashi) e a Inês, atrás do balcão
    const lx = zx - 9 * u, ix = zx + 15 * u;
    person(ctx, this.lou, lx, cy + 5 * u, { face: 1, scale: u });
    person(ctx, this.ines, ix, cy + 5 * u, { face: -1, scale: u, hop: this.pause > 0 ? Math.round(Math.abs(Math.sin(t * 9)) * 2) : 0 });
    // balcão e tapete rolante
    R(0, cy - 2, w, 3, '#8a5a34'); R(0, cy + 1, w, bh, '#3a3f55'); R(0, cy + 1, w, 2, '#5a6078'); R(0, cy + bh - 1, w, 2, '#22263a');
    const off = Math.round((t * g.speed * w) % 16);
    for (let x = w - off; x > -16; x -= 16) R(x, cy + 3, 2, bh - 4, '#4a5068');
    R(0, cy + bh + 1, w, v.h - cy - bh, '#a8743c'); R(0, cy + bh + 1, w, 2, '#c8944c');
    for (let x = 10; x < w; x += 46) R(x, cy + bh + 3, 1, v.h, '#8a5a2c');
    // a zona dos hashi
    const p = this.pause > 0 ? null : this.inZone(v, g), good = p && this.missing().includes(p.kind);
    R(zx - g.zone - 2, cy + 1, 2, bh, good ? '#5cf08a' : GOLD); R(zx + g.zone, cy + 1, 2, bh, good ? '#5cf08a' : GOLD);
    R(zx - g.zone - 2, cy + 1, 6, 2, good ? '#5cf08a' : GOLD); R(zx + g.zone - 4, cy + 1, 6, 2, good ? '#5cf08a' : GOLD);
    R(zx - g.zone - 2, cy + bh - 1, 6, 2, good ? '#5cf08a' : GOLD); R(zx + g.zone - 4, cy + bh - 1, 6, 2, good ? '#5cf08a' : GOLD);
    for (const b of this.belt) this.piece(ctx, b.kind, b.f * w, cy + 1 + bh / 2, u);
    // os hashi: descem quando se toca
    const dip = this.dip > 0 ? Math.round(Math.sin((this.dip / 0.25) * Math.PI) * 4 * u) : 0;
    for (let k = 0; k < 9 * u; k++) {
      const f = k / (9 * u), hx = lerp(lx + 5 * u, zx - 2, f), hy = lerp(cy - 9 * u, cy - 2 * u + dip, f);
      R(hx, hy, 2, 2, INK); R(hx + 4, hy - 1, 2, 2, INK); R(hx, hy, 1, 1, '#e8c890'); R(hx + 4, hy - 1, 1, 1, '#e8c890');
    }
    // a caixa de entrega, à frente
    const sw = 15 * u, bx = Math.round(w / 2 - (n * sw) / 2) - 4, by = cy + bh + 5, bw = n * sw + 8, bhh = 13 * u;
    R(bx - 1, by - 1, bw + 2, bhh + 2, INK); R(bx, by, bw, bhh, '#1c1c28'); R(bx, by, bw, 2, '#c0392b');
    for (let i = 0; i < n; i++) {
      const [sx, sy] = this.slot(v, g, i);
      R(sx - 6 * u, sy - 5 * u, 12 * u, 10 * u, '#2e2e40');
      if (this.have[i] && !this.fly.some((f) => f.slot === i)) this.piece(ctx, this.need[i], sx, sy, u);
    }
    // os pedidos já fechados, empilhados e prontos a sair
    const ready = this.k + (this.pause > 0 || this.over ? 1 : 0), pw = 54 * sc, ph = 9 * sc;
    const pcx = Math.round(v.portrait ? w / 2 : w - 34), pby = v.portrait ? v.h - 16 : v.h - 1;
    for (let i = 0; i < ready; i++) {
      const yy = pby - (i + 1) * ph, xx = pcx - pw / 2 + (i % 2) * sc;
      R(xx - 1, yy - 1, pw + 2, ph + 1, INK); R(xx, yy, pw, ph - 1, '#1c1c28'); R(xx, yy, pw, sc, '#c0392b');
      logo(ctx, pcx + (i % 2) * sc, yy + 2 * sc, sc);
    }
    // peças a voar: para a caixa, ou pela janela fora (enganos)
    for (const f of this.fly) {
      const x0 = f.f * w, y0 = cy + 1 + bh / 2;
      if (f.slot >= 0) { const [sx, sy] = this.slot(v, g, f.slot); this.piece(ctx, f.kind, lerp(x0, sx, f.t), lerp(y0, sy, f.t) - Math.sin(f.t * Math.PI) * 14 * u, u); } else { ctx.globalAlpha = clamp(1 - f.t, 0, 1); this.piece(ctx, f.kind, x0 - f.t * 30, y0 - f.t * 26 * u, u); ctx.globalAlpha = 1; }
    }
    if (this.over) text(ctx, 'PEDIDOS PRONTOS!', w / 2, cy - 36 * u, PINK, { align: 'center', scale: v.portrait ? 2 : 1, shadow: INK });
  }

  bot(I, v) {
    if (this.over || this.pause > 0) return;
    const g = this.geo(v), p = this.inZone(v, g);
    if (p && Math.abs(p.f * v.w - g.zx) < g.zone * 0.5 && this.missing().includes(p.kind)) I.actionPressed = true;
  }
}
