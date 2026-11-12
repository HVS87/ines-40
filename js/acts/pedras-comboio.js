// Pedras d'El Rei, ato 1: o comboiozinho antigo da Praia do Barril, pela ria e pelas dunas.
// Um toque faz apitar a locomotiva, para espantar as gaivotas pousadas na linha (o apito gasta
// o vapor, que demora a voltar). Se uma gaivota não sair a tempo, o comboio trava e espera.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, GOLD, PAPER, clamp, hash, hills, mark, person, sign, sky } from '../draw.js';
import { chao, tufo, DIA } from './farol-comum.js';
import { familia, gaivotas, comboio, linha } from './pedras-comum.js';

const VEL = 60;                        // velocidade do comboio (px/s)
const FIM = 1500;                      // comprimento da viagem
const GAIVOTAS = [330, 580, 830, 1070, 1310];
const ALCANCE = 78;                    // a que distância o apito espanta a gaivota
const RECARGA = 1.5;                   // segundos para o vapor voltar
const DICA = 'Toca para apitar e espantar as gaivotas da linha. Atenção: o apito gasta o vapor!';

export class PedrasComboio extends Act {
  get max() { return this.cfg.hearts || 4; }

  start() {
    this.fam = familia();
    this.gv = gaivotas();
    this.gente = ['professora', 'avo', 'empregado', 'professora'].map((q) => getCharacter(q, 'casual'));
    this.x = 0; this.vel = VEL; this.vapor = 1; this.apito = 0; this.over = 0;
    this.g = GAIVOTAS.map((x) => ({ x, voa: 0, espera: 0, sx: 0, sy: 0 }));
    this.hint(DICA);
  }

  alvo() { return this.g.find((g) => !g.voa && g.x - this.x > -6); }

  update(dt, I, v) {
    if (this.over) { this.over += dt; this.x += Math.max(0, VEL * (1 - this.over)) * dt; if (this.over > 2.8) this.done(); return; }
    this.vapor = Math.min(1, this.vapor + dt / RECARGA);
    this.apito = Math.max(0, this.apito - dt * 1.6);
    const a = this.alvo(), d = a ? a.x - this.x : 1e9;
    const fx = Math.round(v.w * (v.portrait ? 0.56 : 0.6)), gy = chao(v);
    if (I.actionPressed) {
      if (this.vapor >= 1) {
        this.vapor = 0; this.apito = 1; this.sfx('inject');
        if (a && d <= ALCANCE) {
          a.voa = 0.01; this.sfx('chirp');
          if (!a.espera) this.heart(1, fx + d + 12, gy - 26);
        }
      } else this.sfx('click');
    }
    // a gaivota não saiu: o comboio trava e espera que ela se decida
    if (a && d < 18) {
      this.vel = Math.max(0, this.vel - 260 * dt);
      a.espera += dt;
      if (a.espera > 1.7) { a.voa = 0.01; this.sfx('chirp'); }
    } else this.vel = Math.min(VEL, this.vel + 70 * dt);
    this.x += this.vel * dt;
    for (const g of this.g) if (g.voa) { g.voa += dt; g.sx += (40 + hash(g.x) * 30) * dt; g.sy += (48 + g.voa * 30) * dt; }
    if (this.x >= FIM) {
      this.over = 0.01; this.sfx('check');
      this.hint('Inês: «Praia do Barril! Última paragem: toalhas na areia e mergulho!»');
    }
  }

  draw(ctx, v, R) {
    const P = v.portrait, gy = chao(v), t = this.t, cam = this.x, top = this.top(v);
    const fx = Math.round(v.w * (P ? 0.56 : 0.6));
    const hy = gy - (P ? 150 : 76), my = gy - (P ? 96 : 50);
    // céu, dunas ao longe, a ria e o sapal
    sky(ctx, v.w, v.h, hy, DIA.ceu);
    for (let i = 0; i < 4; i++) { const span = v.w + 120, x = ((i * 130 + 40 - cam * 0.05) % span + span) % span - 60, y = hy - (P ? 60 : 20) - (i % 2) * 8; R(x, y, 34, 5, '#ffffff'); R(x + 6, y - 4, 20, 4, '#ffffff'); }
    hills(ctx, v.w, my, hy + 8, cam, 0.12, 6, 4, '#e8d8a0', 2);
    R(0, hy + 8, v.w, my - hy - 8, '#58b0c4');
    for (let i = 0; i < 10; i++) { const span = v.w + 80, x = ((hash(i * 5.3) * 900 - cam * 0.3) % span + span) % span - 40, y = hy + 12 + hash(i * 2.9) * (my - hy - 18); R(x, y, 26 + hash(i) * 24, 3, '#6f9a4a'); R(x + 4, y - 1, 14, 1, '#8ab85a'); R(x + 2, y + 3, 20, 1, '#3f8a9a'); }
    for (let i = 0; i < 8; i++) { const span = v.w + 60, x = ((hash(i * 8.1) * 700 - cam * 0.2) % span + span) % span - 30; R(x, hy + 10 + (i % 3) * 4, 8, 1, '#bfe6f0'); }
    // o chão: areia e erva das dunas
    R(0, my, v.w, v.h - my, '#e6d49a'); R(0, my, v.w, 2, '#c9b878');
    for (let i = 0; i < 16; i++) { const span = v.w + 40, x = ((hash(i * 4.7) * 800 - cam * (0.6 + (i % 3) * 0.2)) % span + span) % span - 20; tufo(R, x, my + 6 + (i % 3) * (P ? 22 : 9), i % 2 ? '#7a9a4a' : '#9ab060'); }
    // o passadiço, ao lado da linha, e quem vai a pé (acenam ao comboio)
    const py = gy - 20;
    R(0, py, v.w, 3, INK); R(0, py, v.w, 2, '#b8834a');
    for (let x = -((cam % 16) + 16) % 16; x < v.w; x += 16) { R(x, py + 3, 2, 14, '#6b4a2e'); R(x + 8, py, 1, 2, '#8a5a2e'); }
    this.gente.forEach((p, i) => {
      const wx = 260 + i * 330 + this.t * 14, x = fx + (wx - cam);
      if (x < -20 || x > v.w + 20) return;
      const perto = Math.abs(x - fx) < 70;
      person(ctx, p, x, py, { face: perto ? -1 : 1, moving: !perto, dist: wx, hop: perto ? Math.round(Math.abs(Math.sin(t * 8)) * 3) : 0 });
    });
    // areia à frente e a linha
    for (let i = 0; i < 40; i++) { const span = v.w + 16, x = ((hash(i * 3.3) * span - cam) % span + span) % span - 8; R(x, gy + 5 + hash(i * 7.1) * (v.h - gy - 6), 2, 1, i % 2 ? '#c9b878' : '#f6ecc0'); }
    linha(R, v.w, gy, cam);
    // a estação da praia, no fim
    const ex = fx + (FIM + 70 - cam);
    if (ex < v.w + 80) { R(ex - 34, gy - 44, 3, 44, INK); R(ex + 31, gy - 44, 3, 44, INK); sign(ctx, 'PRAIA DO BARRIL', ex, gy - 50, { bg: '#fff6e6', color: '#2f6fb5' }); }
    // o comboio, com a família
    const f = this.fam;
    comboio(ctx, R, fx, gy, 2, t, [f[0], f[1], f[2], f[3], f[4], f[5]], { dist: cam, apito: this.apito });
    // gaivotas
    const a = this.alvo();
    for (const g of this.g) {
      const x = fx + (g.x - cam) + 14 + g.sx, y = gy - g.sy;
      if (x < -30 || x > v.w + 30 || y < -20) continue;
      if (g.voa) ctx.drawImage(this.gv.voa[Math.floor(t * 8) % 2].r, Math.round(x - 12), Math.round(y - 16), 24, 14);
      else {
        ctx.drawImage(this.gv.pousada.l, Math.round(x - 12), gy - 20 + (Math.floor(t * 2 + g.x) % 2), 24, 20);
        if (g === a && g.x - cam <= ALCANCE) mark(ctx, x, gy - 24, '!', this.vapor >= 1 ? GOLD : '#9a93ad');
      }
    }
    // o vapor do apito
    const bw = 64, bx = Math.round(v.w / 2 - bw / 2 + 16), by = top + 7, cheio = this.vapor >= 1;
    sign(ctx, 'APITO', bx - 17, by - 2, { color: PAPER });
    R(bx - 2, by - 2, bw + 4, 9, INK); R(bx, by, bw, 5, '#3a2f4f');
    R(bx, by, bw * clamp(this.vapor, 0, 1), 5, cheio ? (Math.floor(t * 4) % 2 ? '#5cf08a' : '#a8ffc4') : '#9a93ad');
  }

  bot(I) {
    if (this.over) return;
    const a = this.alvo(), d = a ? a.x - this.x : 1e9;
    if (this.vapor >= 1 && d < 62 && d > 22) I.actionPressed = true;
  }
}
