// Nível 15 «Viver Juntos», ato 2: decorar a sala.
//   1. A tinta: a seta passa pelas latas; toca-se na cor de que se gosta (qualquer uma serve).
//   2. O sofá: o Lourenço e o Tomás andam com ele de um lado para o outro; toca-se quando
//      está em cima da marca (vale um coração).
//   3. Os quadros: cada um balança no prego; tocar quando está direito vale um coração (se
//      ficar torto, fica torto até ao fim do nível).
//   4. A planta: manter premido para regar e largar quando a água chega à marca.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, clamp, person, text, shadow } from '../draw.js';
import { CORES, novaCasa, salaLayout, drawSala, drawQuadro, sofa, planta } from './casa-comum.js';

const PASSO = 0.8;                       // segundos que a seta fica em cada lata
const SOFA_OK = 10;                      // folga do sofá em relação à marca (px)
const BALANCO = 15, DIREITO = 4.5;       // balanço dos quadros e folga para ficarem direitos (graus)
const VEL_QUADRO = [1.7, 2.1, 2.5];
const AGUA_LO = 0.66, AGUA_HI = 0.9;     // marca da rega

export class Decorar extends Act {
  get max() { return this.cfg.hearts || 5; }

  start() {
    this.st = novaCasa(this.s);
    this.fase = 'cor';       // cor → pinta → sofa → quadro (x3) → planta → fim
    this.ft = 0;
    this.lock = 0.5;
    this.idx = 0;            // lata apontada
    this.sx = 0; this.sph = -Math.PI / 2;   // sofá: posição e fase do vaivém
    this.k = 0; this.ang = 0; this.qph = 0;
    this.agua = 0; this.rega = false; this.entornou = false;
    this.ines = getCharacter('ines', 'casual');
    this.lou = getCharacter('lourenco', 'casual');
    this.tom = getCharacter('tomas', 'teen');
    this.hint('Toca quando a seta estiver na cor de que mais gostas para a parede!');
  }

  go(fase, lock = 0.5) { this.fase = fase; this.ft = 0; this.lock = lock; }

  lay(v) { return salaLayout(v, Math.round(v.h * (v.portrait ? 0.7 : 0.8)), this.top(v)); }

  update(dt, I, v) {
    this.ft += dt;
    this.lock = Math.max(0, this.lock - dt);
    const L = this.lay(v), st = this.st, toque = I.actionPressed && this.lock <= 0;
    if (this.fase === 'cor') {
      this.idx = Math.floor(this.ft / PASSO) % CORES.length;
      if (toque || this.ft > 14) {
        this.cor = CORES[this.idx];
        this.sfx('pop');
        this.hint(`Inês: «${this.cor.fala}! Vai ficar mesmo bem.»`);
        this.go('pinta');
      }
    } else if (this.fase === 'pinta') {
      if (Math.floor(this.ft * 5) !== Math.floor((this.ft - dt) * 5) && this.ft < 1.6) this.sfx('slurp');
      if (this.ft > 2.4) {
        st.cor = this.cor.c;
        this.go('sofa', 0.6);
        this.hint('Toca quando o sofá estiver mesmo em cima da marca!');
      }
    } else if (this.fase === 'sofa') {
      const amp = Math.min(50, v.w * 0.15);
      this.sph += dt * 1.3;
      this.sx = Math.sin(this.sph) * amp;
      if (toque || this.ft > 16) {
        const ok = Math.abs(this.sx) <= SOFA_OK && toque;
        this.sofaDe = this.sx;
        if (ok) { this.heart(1, L.sofaX, L.gy - 40); this.sfx('check'); this.hint('Lourenço: «Aí mesmo! Nem um milímetro ao lado.»'); } else { this.sfx('toc'); this.hint('Tomás: «Mais para aqui... Pronto, já está no sítio!»'); }
        this.go('pousa');
      }
    } else if (this.fase === 'pousa') {
      this.sx = this.sofaDe * clamp(1 - this.ft / 0.6, 0, 1);
      if (this.ft > 1.5) { st.sofa = true; this.go('quadro', 0.5); this.qph = 0; this.hint('Toca quando o quadro estiver direito!'); }
    } else if (this.fase === 'quadro') {
      this.qph += dt * VEL_QUADRO[this.k];
      this.ang = Math.sin(this.qph) * BALANCO;
      if (toque || this.ft > 12) {
        const ok = Math.abs(this.ang) <= DIREITO && toque;
        st.quadros[this.k] = ok ? 0 : Math.round(this.ang * 0.7);
        if (ok) { this.heart(1, L.quadros[this.k], L.quadroY); this.sfx('check'); } else { this.sfx('toc'); this.hint(this.k % 2 ? 'Tomás: «Está torto... Diz que é arte moderna!»' : 'Lourenço: «Hum... ligeiramente torto. Dá-lhe personalidade!»'); }
        this.k++;
        if (this.k >= 3) { this.go('planta', 0.9); } else { this.go('quadro', 0.6); this.qph = 0; }
      }
    } else if (this.fase === 'planta') {
      if (!st.planta && this.ft > 0.7) { st.planta = true; this.sfx('toc'); this.hint('Mantém premido (o ecrã ou Espaço) para regar a planta e larga quando a água chegar à marca!'); }
      if (!st.planta) return;
      const premido = I.action && this.lock <= 0;
      if (premido) {
        this.rega = true;
        this.agua = Math.min(1, this.agua + dt * 0.42);
        if (Math.random() < dt * 20) this.fx.add({ x: L.plantaX + 14 - Math.random() * 6, y: L.gy - 30, vx: -8, vy: 30, life: 0.4, color: '#8fd0f5', size: 1 });
        if (this.agua >= 1) { this.entornou = true; this.sfx('buzz'); this.fx.burst(L.plantaX, L.gy - 4, 14, ['#8fd0f5', '#ffffff'], 60); this.hint('Inês: «Chega, chega! Já está a nadar...»'); this.go('fim', 0); }
      } else if (this.rega) {
        this.rega = false;
        if (this.agua >= AGUA_LO && this.agua <= AGUA_HI) { this.heart(1, L.plantaX, L.gy - 44); this.sfx('check'); this.hint('Inês: «Agora sim: está a ficar com cara de casa!»'); this.go('fim', 0); } else if (this.agua > AGUA_HI) { this.sfx('toc'); this.hint('Inês: «Um bocadinho de água a mais... Ela aguenta!»'); this.go('fim', 0); } else this.sfx('click');
      }
      if (this.fase === 'planta' && this.ft > 18) { this.hint('Inês: «Agora sim: está a ficar com cara de casa!»'); this.go('fim', 0); }
    } else if (this.fase === 'fim') {
      if (this.ft > 2.4) this.done();
    }
  }

  draw(ctx, v, R) {
    const L = this.lay(v), st = this.st, gy = L.gy, t = this.t, f = this.fase, w = v.w;
    const pintura = f === 'pinta' ? clamp(this.ft / 1.6, 0, 1) : undefined;
    const vico = f === 'planta' || f === 'fim' ? 0.2 + this.agua * 0.8 : 1;
    drawSala(ctx, v, R, L, st, { pintura, corNova: this.cor && this.cor.c, vico, semSofa: true });

    if (f === 'cor') {
      // amostra da cor na parede e as latas em fila no chão
      const c = CORES[this.idx], ax = Math.round(w / 2), ay = L.quadroY;
      R(ax - 23, ay - 15, 46, 30, PAPER); R(ax - 21, ay - 13, 42, 26, c.c);
      text(ctx, c.nome, ax, ay + 19, INK, { align: 'center' });
      const passo = Math.min(34, (w - 30) / CORES.length), x0 = Math.round(w / 2 - (passo * (CORES.length - 1)) / 2), ly = gy + Math.min(18, Math.round((v.h - gy) * 0.5));
      CORES.forEach((cor, i) => {
        const x = Math.round(x0 + i * passo), sel = i === this.idx, up = sel ? 3 : 0;
        R(x - 10, ly - 16 - up, 20, 19, INK); R(x - 9, ly - 15 - up, 18, 17, '#e8e8f0'); R(x - 9, ly - 15 - up, 18, 5, cor.c); R(x - 9, ly - 10 - up, 18, 1, '#8a8794');
        R(x - 6, ly - 9 - up, 3, 4, cor.c); R(x + 2, ly - 9 - up, 2, 2, cor.c);
        R(x - 6, ly - 4 - up, 12, 5, INK); R(x - 5, ly - 3 - up, 10, 3, cor.c);
        R(x - 11, ly - 13 - up, 1, 6, '#8a8794'); R(x + 10, ly - 13 - up, 1, 6, '#8a8794');
        if (sel) { const by = ly - 25 - Math.round(Math.abs(Math.sin(t * 6)) * 2); R(x - 4, by - 3, 9, 5, INK); R(x - 3, by - 2, 7, 2, GOLD); R(x - 2, by, 5, 1, GOLD); R(x - 1, by + 1, 3, 1, GOLD); R(x, by + 2, 1, 1, GOLD); }
      });
    }

    // as pessoas (e o sofá, que anda de um lado para o outro até ficar no sítio)
    const sofaNoSitio = st.sofa, sxx = L.sofaX + Math.round(this.sx);
    if (f === 'sofa' || f === 'pousa') {
      // a marca no chão
      for (let x = -L.sofaW / 2; x < L.sofaW / 2; x += 6) R(L.sofaX + x, gy + 2, 3, 1, f === 'sofa' && Math.abs(this.sx) <= SOFA_OK ? GOLD : PAPER);
      R(L.sofaX - L.sofaW / 2, gy - 1, 1, 5, PAPER); R(L.sofaX + L.sofaW / 2 - 1, gy - 1, 1, 5, PAPER);
      const andar = f === 'sofa' || this.ft < 0.6;
      person(ctx, this.lou, sxx - L.sofaW / 2 - 9, gy, { scale: 2, face: 1, moving: andar, dist: t * 60 });
      person(ctx, this.tom, sxx + L.sofaW / 2 + 9, gy, { scale: 2, face: -1, moving: andar, dist: t * 60 + 7 });
      sofa(R, sxx, gy - (andar ? 2 : 0), L.sofaW);
      if (f === 'sofa') { R(sxx - 1, gy - 46, 3, 6, GOLD); R(sxx - 3, gy - 42, 7, 2, GOLD); R(sxx - 2, gy - 40, 5, 1, GOLD); R(sxx - 1, gy - 39, 3, 1, GOLD); }
    } else if (sofaNoSitio) sofa(R, L.sofaX, gy, L.sofaW);

    if (f === 'cor' || f === 'pinta') {
      // o Lourenço de rolo na mão (a pintar, vai à frente da tinta)
      const lx = f === 'pinta' ? clamp(Math.round(w * pintura) + 14, 20, w - 16) : Math.round(w * 0.22);
      shadow(ctx, lx, gy, 14);
      person(ctx, this.lou, lx, gy, { scale: 2, face: -1, moving: f === 'pinta' && pintura < 1, dist: t * 70 });
      const ry = f === 'pinta' && pintura < 1 ? gy - 62 + Math.round(Math.sin(t * 9) * 14) : gy - 50;
      R(lx - 11, ry + 6, 2, gy - 28 - ry - 6, '#8a5a34'); R(lx - 16, ry, 12, 7, INK); R(lx - 15, ry + 1, 10, 5, this.cor ? this.cor.c : CORES[this.idx].c);
      const ix = Math.round(w * 0.8), tx = Math.round(w * 0.9);
      shadow(ctx, ix, gy, 14); person(ctx, this.ines, ix, gy, { scale: 2, face: -1 });
      if (!v.portrait || w > 240) { shadow(ctx, tx, gy, 14); person(ctx, this.tom, tx, gy, { scale: 2, face: -1 }); }
    } else if (f === 'quadro' || f === 'planta' || f === 'fim') {
      if (f === 'quadro' && this.k < 3) {
        drawQuadro(ctx, R, this.k, L.quadros[this.k], L.quadroY, this.ang);
        if (Math.abs(this.ang) <= DIREITO) { const qx = L.quadros[this.k], qy = L.quadroY; R(qx - 17, qy - 14, 4, 1, GOLD); R(qx - 17, qy - 14, 1, 4, GOLD); R(qx + 13, qy - 14, 4, 1, GOLD); R(qx + 16, qy - 14, 1, 4, GOLD); R(qx - 17, qy + 13, 4, 1, GOLD); R(qx - 17, qy + 10, 1, 4, GOLD); R(qx + 13, qy + 13, 4, 1, GOLD); R(qx + 16, qy + 10, 1, 4, GOLD); }
      }
      // a Inês junto à planta; o Lourenço e o Tomás a ver
      const ix = f === 'quadro' ? Math.round(w * 0.2) : L.plantaX + 26;
      shadow(ctx, ix, gy, 14);
      person(ctx, this.ines, ix, gy, { scale: 2, face: f === 'quadro' ? 1 : -1, hop: f === 'fim' && !this.entornou ? Math.round(Math.abs(Math.sin(t * 7)) * 2) : 0 });
      const lx = Math.round(w * (v.portrait ? 0.84 : 0.82)), tx = Math.round(w * 0.93);
      shadow(ctx, lx, gy, 14); person(ctx, this.lou, lx, gy, { scale: 2, face: -1 });
      if (!v.portrait) { shadow(ctx, tx, gy, 14); person(ctx, this.tom, tx, gy, { scale: 2, face: -1 }); }
      if ((f === 'planta' && st.planta) || f === 'fim') {
        // o regador e o nível da água
        const rx = ix - 13, ry = gy - 32, inclina = this.rega ? 3 : 0;
        R(rx - 1, ry - 1 + inclina, 11, 9, INK); R(rx, ry + inclina, 9, 7, '#6fb0f0'); R(rx - 6, ry + 2 + inclina * 2, 6, 2, INK); R(rx - 7, ry + 3 + inclina * 2, 2, 2, '#6fb0f0');
        const bh = clamp(gy - L.quadroY - 28, 40, 84), bx = v.portrait ? 6 : ix + 20, by = gy - 6 - bh;
        R(bx - 1, by - 1, 10, bh + 2, INK); R(bx, by, 8, bh, '#3a2f4f');
        R(bx, by + Math.round(bh * (1 - AGUA_HI)), 8, Math.round(bh * (AGUA_HI - AGUA_LO)), '#5cf08a');
        const ah = Math.round(bh * this.agua);
        R(bx + 2, by + bh - ah, 4, ah, '#8fd0f5'); R(bx - 2, by + bh - ah - 1, 12, 2, PAPER);
      }
    }
    if (f === 'planta' && !st.planta) planta(R, L.plantaX, gy - Math.round((1 - clamp(this.ft / 0.7, 0, 1)) * 30), 0.2);
  }

  bot(I) {
    if (this.lock > 0) return;
    const f = this.fase;
    if (f === 'cor') { if (this.ft > 1.2) I.actionPressed = true; } else if (f === 'sofa') { if (Math.abs(this.sx) < 4) I.actionPressed = true; } else if (f === 'quadro') { if (Math.abs(this.ang) < 1.6) I.actionPressed = true; } else if (f === 'planta') { if (this.st.planta && this.agua < 0.78) I.action = true; }
  }
}
