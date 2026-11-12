// «Verões em Santo Amaro», à noite: a fuga. O avô da Isabel adormeceu na poltrona, de guarda à
// porta barricada. As quatro amigas atravessam a sala em bicos de pés até à janela: cada toque é
// um passinho, e só se pode andar enquanto o avô ressona. Se ele acordar e alguém se mexer,
// resmunga, elas recuam um pouco e o coração seguinte perde-se (à 3.ª vez adormece de vez).
import { Act } from './base.js';
import { getCharacter, getSprites } from '../sprites.js';
import { INK, GOLD, PAPER, clamp, hash, disc, person, shadow, text, mark } from '../draw.js';

const PASSOS = 26;      // toques para atravessar a sala
const QUIETAS = 'Toca para dar passinhos em bicos de pés enquanto o avô ressona. Se ele acordar, quietas!';
const RESMUNGA = [
  'Avô: «Quem anda aí?!... Deve ter sido o gato.»',
  'Avô: «Meninas, isto são horas?... Zzz...»',
  'Avô: «A porta está trancada e o carro à frente. Daqui ninguém sai!... Zzz...»',
];

export class VeraoFuga extends Act {
  get max() { return this.cfg.hearts || 4; }

  start() {
    this.girls = ['ines', 'isabel', 'ana', 'soft'].map((w) => getCharacter(w, 'night'));
    this.avo = getCharacter('avo', 'pijama');
    this.p = 0;             // passos dados (0 a PASSOS)
    this.shown = -3;        // posição desenhada (vai atrás de p, suavemente)
    this.dist = 0;
    this.hearts = Array.from({ length: this.max }, () => 'on');   // on → got / lost
    this.catches = 0;
    this.cool = 0;          // intervalo mínimo entre dois passinhos
    this.st = 'sleep'; this.stT = 0; this.stDur = 2.8;    // o avô: sleep → stir → awake → sleep ; grumble
    this.time = 0; this.over = 0;
    this.hint(QUIETAS);
  }

  layout(v) {
    const top = this.top(v), gy = Math.round(v.h * (v.portrait ? 0.5 : 0.62)), fy = v.portrait ? gy + 64 : v.h - 9;
    const x0 = 44, x1 = v.w - 34;
    return { top, gy, fy, x0, x1, ax: Math.round(v.w * 0.43), wx: v.w - 34 };
  }

  setAvo(st, dur = 0) { this.st = st; this.stT = 0; this.stDur = dur; }

  update(dt, I, v) {
    this.time += dt; this.cool -= dt;
    const move = clamp(this.p - this.shown, -dt * 9, dt * 9);
    this.shown += move; this.dist += Math.abs(move) * 8;
    if (this.over) { this.over += dt; if (this.over > 2.2) this.done(); return; }
    // o avô
    this.stT += dt;
    const deep = this.catches >= 3 || this.time > 55;
    if (this.st === 'sleep') { if (this.stT > this.stDur && !deep) this.setAvo('stir'); }
    else if (this.st === 'stir') { if (this.stT > 0.7) { this.setAvo('awake', 1.3 + Math.random() * 0.6); this.sfx('toc'); } }
    else if (this.st === 'awake') { if (this.stT > this.stDur) this.setAvo('sleep', 2 + Math.random() * 1.4); }
    else if (this.stT > 2.4) { this.setAvo('sleep', 3.2); this.hint(QUIETAS); }
    if (this.st === 'grumble' || !I.actionPressed) return;
    if (this.st === 'awake' && this.stT > 0.12) {
      // apanhadas: recuam e o próximo coração perde-se
      this.setAvo('grumble'); this.sfx('buzz');
      this.hint(RESMUNGA[this.catches % RESMUNGA.length]); this.catches++;
      this.p = Math.max(0, this.p - 4);
      const k = this.hearts.indexOf('on');
      if (k >= 0) this.hearts[k] = 'lost';
      return;
    }
    if (this.cool > 0) return;
    this.cool = 0.25;
    this.p = Math.min(PASSOS, this.p + 1);
    this.sfx('click');
    const L = this.layout(v), n = this.hearts.length;
    for (let k = 0; k < n; k++) {
      if (this.p >= Math.round(((k + 1) * PASSOS) / n) && this.hearts[k] !== 'got') {
        if (this.hearts[k] === 'on') this.heart(1, L.x0 + ((L.x1 - L.x0) * (k + 1)) / n, L.fy - 54);
        this.hearts[k] = this.hearts[k] === 'on' ? 'got' : 'gone';
      }
    }
    if (this.p >= PASSOS) { this.over = 0.01; this.sfx('check'); this.hint('Inês: «Chiu... Pela janela, uma de cada vez!»'); }
  }

  sala(ctx, v, R, L, t) {
    const { gy, top, wx } = L, w = v.w;
    R(0, 0, w, gy, '#34305e'); R(0, gy - 14, w, 14, '#2a2650'); R(0, gy - 14, w, 1, '#4a4580'); R(0, gy - 2, w, 2, '#1c1a38');
    R(0, gy, w, v.h - gy, '#4a3550');
    for (let y = gy + 11; y < v.h; y += 12) R(0, y, w, 1, '#3a2840');
    for (let i = 0; i < 30; i++) R(Math.floor(hash(i * 1.9) * w), gy + 12 * Math.floor(hash(i * 4.1) * ((v.h - gy) / 12)), 1, 11, '#3a2840');
    if (v.h - L.fy > 90) {   // ao alto sobra soalho: um tapete grande com o gato a dormir
      const ry = L.fy + 34, rh = Math.min(84, v.h - ry - 24), cx = Math.round(w * 0.36), cy = ry + Math.round(rh / 2) + 2;
      R(18, ry, w - 36, rh, '#2f5a6a'); R(22, ry + 4, w - 44, rh - 8, '#3f7a8a'); R(28, ry + 10, w - 56, rh - 20, '#2f5a6a');
      for (let x = 20; x < w - 20; x += 6) { R(x, ry - 2, 2, 2, '#c9d0ee'); R(x, ry + rh, 2, 2, '#c9d0ee'); }
      R(cx - 12, cy - 6, 24, 11, INK); R(cx - 11, cy - 5, 22, 9, '#e08a3a'); R(cx - 14, cy - 2, 8, 8, INK); R(cx - 13, cy - 1, 6, 6, '#e08a3a'); R(cx - 14, cy - 4, 3, 3, INK); R(cx - 9, cy - 4, 3, 3, INK);
      R(cx - 12, cy + 2, 2, 1, INK); R(cx + 8, cy + 3, 8, 3, INK); R(cx + 9, cy + 4, 6, 1, '#e08a3a'); R(cx - 4, cy - 5, 3, 9, '#c9703a'); R(cx + 3, cy - 5, 3, 9, '#c9703a');
    }
    if (gy - top > 150) {   // e parede: o candeeiro do teto (apagado) e as fotografias da família
      const lx = Math.round(w * 0.6);
      R(lx, 0, 1, top + 26, INK); R(lx - 9, top + 26, 19, 3, INK); R(lx - 7, top + 29, 15, 7, INK); R(lx - 8, top + 27, 17, 1, '#5a5690'); R(lx - 6, top + 29, 13, 6, '#4a4580');
      for (let k = 0; k < 3; k++) { const fx = Math.round(w * 0.2) + k * 30, fy2 = gy - 104 + (k % 2) * 8; R(fx, fy2, 20, 24, INK); R(fx + 1, fy2 + 1, 18, 22, '#c9a86a'); R(fx + 3, fy2 + 3, 14, 18, '#8a90c8'); R(fx + 7, fy2 + 8, 6, 6, '#f6c9a0'); R(fx + 6, fy2 + 6, 8, 3, k % 2 ? '#eceaf2' : '#6b4226'); R(fx + 5, fy2 + 14, 10, 7, k % 2 ? '#3f6fb5' : '#e0527a'); }
    }
    // a porta da rua, barricada com cadeiras, vasos e uma vassoura
    const dx = 24;
    R(dx - 13, gy - 58, 26, 58, INK); R(dx - 12, gy - 57, 24, 57, '#5a3a22'); R(dx - 9, gy - 53, 18, 20, '#6b4a2e'); R(dx - 9, gy - 29, 18, 24, '#6b4a2e'); R(dx + 7, gy - 30, 2, 3, GOLD);
    R(dx - 16, gy - 36, 34, 3, INK); R(dx - 15, gy - 35, 32, 1, '#c9a86a');                     // a tranca (vassoura)
    for (const [cx, cy] of [[dx - 9, gy], [dx + 5, gy - 13]]) {                                   // cadeiras empilhadas
      R(cx - 1, cy - 26, 4, 26, INK); R(cx, cy - 25, 2, 25, '#a8794a'); R(cx - 1, cy - 14, 15, 4, INK); R(cx, cy - 13, 13, 2, '#c9985a'); R(cx + 11, cy - 11, 3, 11, INK); R(cx + 12, cy - 10, 1, 10, '#a8794a');
    }
    R(dx + 16, gy - 12, 12, 12, INK); R(dx + 17, gy - 11, 10, 11, '#c96f4a'); R(dx + 15, gy - 13, 14, 3, INK); R(dx + 16, gy - 12, 12, 1, '#e08a5a');   // vaso
    R(dx + 19, gy - 24, 2, 11, '#3f8a4a'); R(dx + 15, gy - 26, 6, 5, '#4fa85a'); R(dx + 21, gy - 22, 6, 5, '#3f8a4a'); R(dx + 18, gy - 30, 5, 5, '#4fa85a');
    // quadro na parede e relógio
    const qx = Math.round(w * 0.24) + 22, qy = Math.max(top + 4, gy - 60);
    if (qx + 30 < L.ax - 26) { R(qx, qy, 30, 22, INK); R(qx + 1, qy + 1, 28, 20, '#c9a86a'); R(qx + 3, qy + 3, 24, 16, '#5a8fd0'); R(qx + 3, qy + 13, 24, 6, '#3f6fb5'); R(qx + 14, qy + 6, 1, 8, PAPER); R(qx + 15, qy + 7, 5, 5, PAPER); R(qx + 10, qy + 13, 10, 2, '#8a5a34'); }
    // a janela aberta, com a lua lá fora
    const wy = gy - 58;
    R(wx - 19, wy - 2, 38, 44, INK); R(wx - 17, wy, 34, 40, '#12173a');
    disc(ctx, wx + 5, wy + 12, 7, '#fff6d0'); disc(ctx, wx + 8, wy + 10, 6, '#12173a');
    for (let i = 0; i < 7; i++) R(wx - 15 + Math.floor(hash(i * 2.3) * 30), wy + 2 + Math.floor(hash(i * 5.7) * 30), 1, 1, '#ffffff');
    R(wx - 17, wy + 30, 34, 10, '#1f2a4a'); R(wx - 10, wy + 26, 8, 5, '#18203a'); R(wx + 4, wy + 24, 10, 7, '#18203a');
    const cw = 5 + Math.round(Math.sin(t * 2) * 1.5);
    R(wx - 17, wy, cw, 40, '#c9d0ee'); R(wx + 17 - cw, wy, cw, 40, '#c9d0ee'); R(wx - 17 + cw - 1, wy, 1, 40, '#9aa2c8'); R(wx + 17 - cw, wy, 1, 40, '#9aa2c8');
    R(wx - 21, wy + 40, 42, 4, INK); R(wx - 20, wy + 41, 40, 2, '#d8d8e8');
    // luar no chão
    for (let k = 0; k < 4; k++) R(wx - 24 - k * 5, gy + 3 + k * 7, 40, 7, 'rgba(160,180,255,0.12)');
    // a seta por cima da janela
    const ay = wy - 13 - Math.round(Math.abs(Math.sin(t * 4)) * 3);
    if (ay > top) { R(wx - 4, ay - 1, 9, 6, INK); R(wx - 3, ay, 7, 4, GOLD); R(wx - 2, ay + 5, 5, 2, INK); R(wx - 2, ay + 4, 5, 1, GOLD); R(wx - 1, ay + 5, 3, 1, GOLD); R(wx, ay + 6, 1, 1, GOLD); }
  }

  avoDraw(ctx, v, R, L, t) {
    const { gy, ax } = L, st = this.st, asleep = st === 'sleep' || st === 'stir';
    // televisão ligada (foi a ver televisão que ele adormeceu)
    const tx = ax + 44;
    if (tx + 16 < L.wx - 24) {
      R(tx - 2, gy - 12, 22, 12, INK); R(tx - 1, gy - 11, 20, 11, '#6b4a2e');
      R(tx - 4, gy - 34, 26, 23, INK); R(tx - 3, gy - 33, 24, 21, '#3a3550'); R(tx - 1, gy - 31, 17, 17, Math.floor(t * 9) % 3 ? '#9fc8ff' : '#d6ecff');
      for (let k = 0; k < 5; k++) R(tx - 1, gy - 30 + ((Math.floor(t * 12) + k * 4) % 16), 17, 1, '#6f9ad8');
      R(tx + 18, gy - 30, 2, 2, GOLD); R(tx + 4, gy - 40, 1, 6, INK); R(tx + 12, gy - 41, 1, 7, INK);
      R(tx - 22, gy + 2, 26, 3, 'rgba(160,200,255,0.18)');
    }
    // tapete e poltrona
    R(ax - 34, gy + 3, 72, 9, '#6a3a5a'); R(ax - 30, gy + 5, 64, 5, '#8a4a6a');
    R(ax - 22, gy - 44, 22, 44, INK); R(ax - 21, gy - 43, 20, 42, '#8a3a4a'); R(ax - 21, gy - 43, 20, 4, '#a84a5a');
    R(ax - 22, gy - 20, 42, 20, INK); R(ax - 21, gy - 19, 40, 18, '#7a2f40');
    // o avô, sentado, de pijama e chinelos
    const bob = asleep ? Math.round(Math.sin(t * 2.2) * 1) : 0, lean = asleep ? 0 : 2, img = this.avo.stand.r;
    const bx = ax - 22 + lean, by = gy - 52 + bob + (asleep ? 2 : 0);
    ctx.drawImage(img, 0, 0, 16, 17, bx, by, 32, 34);
    if (asleep) { R(bx + 16, by + 14, 2, 4, '#f6c9a0'); R(bx + 22, by + 14, 2, 4, '#f6c9a0'); R(bx + 16, by + 17, 3, 1, INK); R(bx + 22, by + 17, 3, 1, INK); }
    R(ax - 6, gy - 22, 22, 8, INK); R(ax - 6, gy - 21, 21, 6, '#a8c8f0'); R(ax + 10, gy - 16, 8, 14, INK); R(ax + 11, gy - 16, 6, 12, '#a8c8f0');
    R(ax + 9, gy - 4, 13, 4, INK); R(ax + 10, gy - 3, 11, 2, '#8a5a34');
    R(ax - 24, gy - 26, 8, 26, INK); R(ax - 23, gy - 25, 6, 24, '#8a3a4a'); R(ax + 2, gy - 28, 20, 5, INK); R(ax + 3, gy - 27, 18, 3, '#a84a5a');   // braços da poltrona
    // o estado dele, bem à vista
    const hx = ax + 6, hy = gy - 56;
    if (st === 'sleep') {
      for (let k = 0; k < 3; k++) { const u = (t * 0.7 + k / 3) % 1; text(ctx, 'Z', hx + 6 + u * 16, hy - u * 22, u > 0.75 ? '#8a90c8' : PAPER, { scale: k === 0 ? 2 : 1, shadow: INK }); }
    } else if (st === 'stir') mark(ctx, hx, hy, '?', '#e0572f');
    else {
      mark(ctx, hx, hy, '!');
      R(hx + 8, hy - 12, 2, 5, GOLD); R(hx + 12, hy - 8, 5, 2, GOLD); R(hx - 10, hy - 12, 2, 5, GOLD);
    }
  }

  draw(ctx, v, R) {
    const L = this.layout(v), t = this.t, { fy, x0, x1 } = L, sp = getSprites();
    this.sala(ctx, v, R, L, t);
    this.avoDraw(ctx, v, R, L, t);
    // corações pelo caminho
    const n = this.hearts.length;
    this.hearts.forEach((h, k) => {
      if (h === 'got' || h === 'gone') return;
      const x = Math.round(x0 + ((x1 - x0) * (k + 1)) / n), y = fy - 62 + Math.round(Math.sin(t * 3 + k) * 2);
      ctx.drawImage(h === 'on' ? sp.heart : sp.heartOff, x - 4, y);
    });
    // as quatro, em fila
    const step = (x1 - x0) / PASSOS, frozen = this.st === 'awake' || this.st === 'grumble', moving = Math.abs(this.p - this.shown) > 0.05;
    for (let k = this.girls.length - 1; k >= 0; k--) {
      const x = Math.round(x0 + this.shown * step - k * (v.portrait ? 15 : 19));
      if (x < -16) continue;
      const shake = frozen && this.st === 'grumble' ? Math.round(Math.sin(t * 40 + k) * 1) : 0;
      shadow(ctx, x, fy, 13);
      person(ctx, this.girls[k], x + shake, fy, { face: this.p < this.shown - 0.05 ? -1 : 1, scale: 2, moving, dist: this.dist + k * 5, air: frozen && !moving });
      if (frozen && k === 0) { R(x + 9, fy - 44, 2, 3, '#9fe6ff'); R(x + 9, fy - 41, 3, 2, '#9fe6ff'); }
    }
  }

  bot(I) {
    if (this.over || this.st !== 'sleep') return;
    if (this.cool <= 0 && this.stT > 0.1) I.actionPressed = true;
  }
}
