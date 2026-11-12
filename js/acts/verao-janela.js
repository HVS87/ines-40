// «Verões em Santo Amaro»: a janela. Visto do jardim: a casa, o portão e o carro do avô
// estacionado mesmo à frente dele. À ida (de noite), cada toque faz saltar uma amiga pela
// janela e ela contorna o carro em bicos de pés. Com `back: true` é o regresso, de madrugada:
// chegam da rua e cada toque faz trepar uma para dentro, com o avô a ressonar lá dentro.
// Não dá corações (é um momento da história); se ninguém tocar, saltam sozinhas.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, GOLD, PAPER, clamp, lerp, hash, sky, stars, disc, person, shadow, text } from '../draw.js';

const QUEM = ['ines', 'isabel', 'ana', 'soft'];

export class VeraoJanela extends Act {
  get max() { return this.cfg.hearts || 0; }

  start(v) {
    this.back = !!this.cfg.back;
    const L = this.layout(v);
    this.girls = QUEM.map((w, k) => ({ frames: getCharacter(w, 'night'), st: this.back ? 'come' : 'in', t: 0, x: this.back ? v.w + 20 + k * 30 : L.wxc, dist: k * 9 }));
    this.idle = 0; this.over = 0; this.n = 0;
    this.hint(this.back ? 'Toca para cada uma trepar pela janela. Chiu... devagarinho!' : 'Toca para cada uma saltar pela janela, sem fazer barulho!');
  }

  layout(v) {
    const top = this.top(v), gy = v.portrait ? Math.round(v.h * 0.64) : v.h - 24, hw = Math.round(v.w * 0.6);
    const hh = clamp(gy - top - 22, 70, 150), wxc = Math.round(hw * 0.64);
    return { top, gy, hw, hh, wxc, sill: gy - 28, fy: gy + 7, gx: Math.round(hw + (v.w - hw) * 0.52) };
  }

  update(dt, I, v) {
    const L = this.layout(v), G = this.girls;
    if (this.over) { this.over += dt; if (this.over > (this.back ? 3 : 2)) this.done(); return; }
    this.idle += dt;
    const next = G.find((g) => g.st === (this.back ? 'wait' : 'in')), busy = G.some((g) => g.st === 'jump' && g.t < 0.35);
    if (next && !busy && (I.actionPressed || this.idle > 3.5)) { next.st = 'jump'; next.t = 0; this.idle = 0; this.sfx('jump'); }
    G.forEach((g, k) => {
      g.t += dt;
      if (g.st === 'jump' && g.t >= 0.55) {
        this.sfx('toc'); this.n++;
        if (this.back) g.st = 'gone'; else { g.st = 'run'; g.x = L.wxc + 24; }
        if (!this.back && this.n === 1) this.hint('Inês: «Cuidado com o carro do avô... Mesmo à frente do portão!»');
      } else if (g.st === 'run') { g.x += 66 * dt; g.dist += 66 * dt; if (g.x > v.w + 20) g.st = 'gone'; }
      else if (g.st === 'come') {
        const tx = L.wxc + 24 + (k - this.n) * 20;
        g.x -= 70 * dt; g.dist += 70 * dt;
        if (g.x <= tx) { g.x = tx; g.st = 'wait'; }
      } else if (g.st === 'wait') { const tx = L.wxc + 24 + (k - this.n) * 20; if (g.x > tx) { g.x = Math.max(tx, g.x - 60 * dt); g.dist += 60 * dt; } }
    });
    if (G.every((g) => g.st === 'gone')) {
      this.over = 0.01;
      this.hint(this.back ? 'Avô: «Zzzz... zzzz...»' : 'Isabel: «Depressa, que o comboio não espera!»');
    }
  }

  fundo(ctx, v, R, L, t) {
    const { gy, hw, hh, top, wxc, sill, gx } = L, w = v.w, day = this.back, hy = gy - hh;
    if (day) sky(ctx, w, v.h, gy, ['#39407e', '#b85a86', '#f6a86a', '#fbd89a']);
    else { sky(ctx, w, v.h, gy, ['#0b0f2c', '#161b48', '#2a2f66']); stars(ctx, w, gy - 30, t, 7, 50); }
    const mx = w - 34, my = top + 16;
    if (day) { disc(ctx, mx, gy - 66, 13, '#ffd98a'); disc(ctx, mx, gy - 66, 9, '#fff6d0'); }
    else { disc(ctx, mx, my, 10, '#fff6d0'); disc(ctx, mx + 4, my - 3, 8, '#0f1436'); }
    // muro do jardim, com o portão de ferro
    const wallC = day ? '#f4dcc8' : '#b8b6d4', tile = day ? '#c96f4a' : '#7a4a5a';
    for (let x = hw; x < w; x += 16) { R(x + 2, gy - 44 - Math.round(hash(x) * 10), 12, 30, day ? '#3f7a4a' : '#1c3a3a'); }
    R(hw, gy - 22, w - hw, 22, wallC); R(hw, gy - 25, w - hw, 4, tile); R(hw, gy - 21, w - hw, 1, INK);
    R(gx - 20, gy - 30, 5, 30, INK); R(gx - 19, gy - 29, 3, 29, wallC); R(gx + 15, gy - 30, 5, 30, INK); R(gx + 16, gy - 29, 3, 29, wallC);
    R(gx - 15, gy - 24, 30, 24, day ? '#5a4a5a' : '#1a1838');
    for (let x = gx - 14; x < gx + 15; x += 4) R(x, gy - 26, 2, 26, '#2f6a4a');
    R(gx - 15, gy - 24, 30, 2, '#2f6a4a'); R(gx - 15, gy - 10, 30, 2, '#2f6a4a');
    // a casa: branca, de telha, com portadas verdes
    const wall = day ? '#fbeede' : '#c9c8e4', wallD = day ? '#e4d2bc' : '#a4a2c4';
    R(0, hy, hw, hh, wall); R(hw - 3, hy, 3, hh, wallD); R(0, gy - 8, hw, 8, wallD);
    R(0, hy - 7, hw + 5, 8, tile); R(0, hy + 1, hw + 5, 1, INK);
    for (let x = 2; x < hw + 4; x += 6) R(x, hy - 7, 1, 7, day ? '#a85a3a' : '#5a3a4a');
    if (hh > 110) for (let x = 16; x + 16 < hw; x += 40) { R(x - 1, hy + 13, 18, 24, INK); R(x, hy + 14, 16, 22, '#2f6a4a'); for (let y = hy + 17; y < hy + 35; y += 3) R(x + 1, y, 14, 1, '#24553a'); R(x + 8, hy + 14, 1, 22, INK); }
    if (hw - wxc > 74) { const x = wxc + 44; R(x - 1, sill - 38, 26, 40, INK); R(x, sill - 37, 24, 38, '#2f6a4a'); for (let y = sill - 34; y < sill; y += 4) R(x + 1, y, 22, 1, '#24553a'); R(x + 12, sill - 37, 1, 38, INK); R(x - 3, sill, 30, 3, INK); R(x - 2, sill + 1, 28, 1, wallD); }
    // a porta da rua (fechada à chave, com a luz acesa)
    const dx = Math.round(hw * 0.2);
    R(dx - 11, gy - 44, 22, 44, INK); R(dx - 10, gy - 43, 20, 43, '#2f6a4a'); R(dx - 7, gy - 39, 14, 14, '#24553a'); R(dx - 7, gy - 21, 14, 16, '#24553a'); R(dx + 6, gy - 22, 2, 3, GOLD);
    R(dx - 13, gy - 1, 26, 2, '#8a8590');
    R(dx + 15, gy - 46, 5, 7, INK); R(dx + 16, gy - 45, 3, 5, '#ffe9a8'); if (!day) R(dx + 11, gy - 50, 13, 15, 'rgba(255,233,168,0.16)');
    // a janela, de portadas abertas
    R(wxc - 17, sill - 38, 34, 40, INK); R(wxc - 15, sill - 36, 30, 36, '#1a1838');
    if (Math.floor(t * 8) % 5 < 3) R(wxc - 15, sill - 36, 30, 36, 'rgba(120,160,255,0.16)');     // a televisão ligada lá dentro
    for (const s of [-1, 1]) { const x = s < 0 ? wxc - 28 : wxc + 17; R(x, sill - 38, 12, 40, INK); R(x + 1, sill - 37, 10, 38, '#2f6a4a'); for (let y = sill - 34; y < sill; y += 4) R(x + 2, y, 8, 1, '#24553a'); }
    R(wxc - 19, sill, 38, 4, INK); R(wxc - 18, sill + 1, 36, 2, wallD);
    // o avô a ressonar lá dentro
    for (let k = 0; k < 3; k++) { const u = (t * 0.6 + k / 3) % 1; text(ctx, 'Z', wxc - 4 + u * 14, sill - 40 - u * 24, u > 0.8 ? wallD : PAPER, { scale: k === 0 ? 2 : 1, shadow: INK }); }
    // canteiro por baixo da janela e chão
    R(0, gy, w, v.h - gy, day ? '#b8a890' : '#4a4868'); R(0, gy, w, 1, INK);
    for (let i = 0; i < 60; i++) R(Math.floor(hash(i * 1.7) * w), gy + 3 + Math.floor(hash(i * 3.3) * (v.h - gy - 4)), 2, 1, day ? '#a09078' : '#3c3a58');
    if (v.h - gy > 60) { R(0, gy + 30, w, 2, day ? '#8a8078' : '#34324e'); R(0, gy + 32, w, v.h - gy - 32, day ? '#7a7480' : '#2c2a48'); for (let x = 8; x < w; x += 34) R(x, gy + 32 + Math.round((v.h - gy - 32) / 2), 16, 2, day ? '#a8a2ac' : '#4a4868'); }
    for (let x = 6; x < wxc - 34; x += 11) { if (Math.abs(x - dx) < 18) continue; R(x, gy - 7, 9, 7, day ? '#3f8a4a' : '#24553a'); R(x + 3, gy - 9, 3, 3, x % 2 ? '#ff8ab8' : '#ffe066'); }
  }

  // o carro do avô (um carro quadradão), atravessado à frente do portão
  carro(R, x, y) {
    const c = this.back ? '#d8b84a' : '#a89850', d = this.back ? '#b0902e' : '#80703a';
    R(x - 33, y - 15, 66, 12, INK); R(x - 22, y - 26, 40, 12, INK);
    R(x - 32, y - 14, 64, 10, c); R(x - 21, y - 25, 38, 11, c); R(x - 32, y - 7, 64, 3, d);
    R(x - 18, y - 23, 15, 8, '#2a3358'); R(x - 1, y - 23, 15, 8, '#2a3358'); R(x - 17, y - 23, 4, 2, '#6f8ad8'); R(x, y - 23, 4, 2, '#6f8ad8');
    R(x - 2, y - 14, 1, 9, d); R(x - 34, y - 9, 3, 4, '#c9c9d8'); R(x + 31, y - 9, 3, 4, '#c9c9d8'); R(x + 29, y - 13, 3, 3, '#ffe9a8'); R(x - 32, y - 13, 2, 3, '#e0527a');
    for (const wx of [x - 20, x + 19]) { R(wx - 6, y - 8, 12, 9, INK); R(wx - 4, y - 6, 8, 6, '#3a3550'); R(wx - 2, y - 4, 4, 3, '#c9c9d8'); }
  }

  draw(ctx, v, R) {
    const L = this.layout(v), t = this.t, { wxc, sill, fy, gx } = L;
    this.fundo(ctx, v, R, L, t);
    // quem está à janela (à espera de saltar): só a cabeça, por cima do parapeito
    const peek = !this.back && this.girls.find((g) => g.st === 'in');
    if (peek) { const img = peek.frames.stand.r; ctx.drawImage(img, 0, 0, 16, 16, wxc - 16, sill - 30 + Math.round(Math.sin(t * 3) * 1), 32, 32); R(wxc - 18, sill + 1, 36, 2, this.back ? '#e4d2bc' : '#a4a2c4'); R(wxc - 19, sill, 38, 1, INK); }
    for (let k = this.girls.length - 1; k >= 0; k--) {
      const g = this.girls[k];
      if (g.st === 'gone' || g.st === 'in') continue;
      if (g.st === 'jump') {
        const u = clamp(g.t / 0.55, 0, 1), a = this.back ? 1 - u : u;      // a = 0 na janela, 1 no chão
        const x = lerp(wxc, this.back ? g.x : wxc + 24, a), y = lerp(sill + 2, fy, a) - Math.sin(a * Math.PI) * 16;
        person(ctx, g.frames, x, y, { face: this.back ? -1 : 1, scale: 2, air: true });
      } else {
        shadow(ctx, g.x, fy, 13);
        person(ctx, g.frames, g.x, fy, { face: g.st === 'run' ? 1 : -1, scale: 2, moving: g.st !== 'wait' || Math.abs(g.x - (wxc + 24 + (k - this.n) * 20)) > 1, dist: g.dist });
      }
    }
    this.carro(R, gx, fy + (v.portrait ? 16 : 12));
  }

  bot(I) { if (!this.over && this.idle > 0.7) I.actionPressed = true; }
}
