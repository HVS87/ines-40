// Sair da marina e navegar: o barco segue sozinho para a direita e o jogador desvia-o para
// cima e para baixo (arrastar o dedo, ou setas ↑ ↓), a apanhar corações e a desviar-se das
// traineiras e das gaivotas pousadas na água. Bater não faz perder: só atrasa o barco.
//   { act: Navegar, hearts: 5 }
import { Act } from './base.js';
import { getCharacter, getSprites } from '../sprites.js';
import { INK, clamp, lerp, hash, person } from '../draw.js';
import { tom } from './pesca.js';
import { costa, lancha, TRIPULACAO } from './barco-cenario.js';

const LEN = 92;        // comprimento do barco
const FIM = 2250;      // comprimento do percurso
// o percurso: [distância, faixa (0 = longe, 1 = perto), tipo]
const PERCURSO = [
  [170, 0.5, 'h'], [150, 0.06, 'bv'], [150, 0.96, 'be'], [330, 0.06, 'bv'], [330, 0.96, 'be'],
  [430, 0.25, 'h'], [600, 0.7, 't'], [700, 0.2, 'h'], [880, 0.3, 'g'], [960, 0.75, 'h'],
  [1150, 0.25, 't'], [1260, 0.8, 'h'], [1420, 0.7, 'g'], [1500, 0.45, 'h'], [1680, 0.6, 't'],
  [1780, 0.15, 'h'], [1960, 0.2, 'g'], [2010, 0.88, 't'], [2090, 0.5, 'h'],
];
const TAM = { h: [7, 14], t: [22, 13], g: [6, 9] };    // meia largura e tolerância na vertical
const DICA = 'Arrasta o dedo para cima e para baixo (ou setas ↑ ↓): apanha os corações e desvia-te!';

export class Navegar extends Act {
  get max() { return this.cfg.hearts || 5; }

  start() {
    this.x = 0; this.y = 0.5; this.slow = 0; this.fim = 0; this.msg = 0;
    this.objs = PERCURSO.map(([d, ly, kind]) => ({ d, ly, kind }));
    this.crew = TRIPULACAO.map((c) => getCharacter(c.who, c.outfit));
    this.hint(DICA);
  }

  geo(v) {
    const top = this.top(v), y1 = v.h - 12, y0 = Math.max(top + 56, y1 - 200);
    return { y0, y1, hy: y0 - 34, sx: Math.round(v.w * 0.06), speed: clamp(v.w * 0.21, 54, 80) };
  }

  update(dt, I, v) {
    const g = this.geo(v), band = g.y1 - g.y0;
    if (this.fim) { this.fim += dt; this.x += g.speed * 0.3 * dt; if (this.fim > 2.2) this.done(); return; }
    if (this.slow > 0) this.slow -= dt;
    if (this.msg > 0) { this.msg -= dt; if (this.msg <= 0) this.hint(DICA); }
    this.x += g.speed * (this.slow > 0 ? 0.35 : 1) * dt;
    // leme: o dedo manda diretamente; as setas movem aos poucos
    let alvo = this.y;
    if (I.pointerY >= 0) alvo = clamp((I.pointerY * v.h - g.y0) / band, 0, 1);
    else if (I.up) alvo = 0; else if (I.down) alvo = 1;
    this.y += clamp(alvo - this.y, -dt * 100 / band, dt * 100 / band);
    const by = lerp(g.y0, g.y1, this.y);
    for (const o of this.objs) {
      const tam = TAM[o.kind];
      if (!tam || o.off) continue;
      const oy = lerp(g.y0, g.y1, o.ly);
      if (o.d + tam[0] < this.x + 4 || o.d - tam[0] > this.x + LEN || Math.abs(oy - by) > tam[1]) continue;
      o.off = true;
      if (o.kind === 'h') this.heart(1, g.sx + o.d - this.x, oy - 10);
      else {
        this.slow = 1.1; this.msg = 2.6;
        if (o.kind === 't') { this.sfx('hurt'); this.hint('Carlos: «Cuidado com a traineira! Leme a bombordo!»'); }
        else { this.sfx('chirp'); o.voa = 0.01; this.hint('Mi: «Coitada da gaivota! Estava tão sossegada...»'); }
      }
    }
    for (const o of this.objs) if (o.voa) o.voa += dt;
    if (this.x >= FIM) { this.fim = 0.01; this.sfx('win'); this.hint('Pi: «É aqui que eles andam! Motor desligado e canas na água.»'); }
  }

  draw(ctx, v, R) {
    const g = this.geo(v), t = this.t, hy = g.hy;
    costa(ctx, v, R, t, hy, this.x);
    // a marina a ficar para trás: molhe, farolim e mastros
    const mx = Math.round(60 - this.x * 0.5);
    if (mx > -80) {
      for (let i = 0; i < 5; i++) { const x = mx - 70 + i * 14; R(x, hy - 24 - (i % 2) * 6, 1, 24 + (i % 2) * 6, '#f2f2f7'); R(x - 3, hy - 3, 8, 3, i % 2 ? '#2a3358' : '#f2f2f7'); }
      R(mx - 90, hy - 5, 110, 6, '#8a8794'); R(mx - 90, hy - 5, 110, 1, '#b8b4c0');
      R(mx + 12, hy - 19, 6, 14, '#f2f2f7'); R(mx + 12, hy - 15, 6, 3, '#e0182a'); R(mx + 12, hy - 9, 6, 3, '#e0182a'); R(mx + 13, hy - 22, 4, 3, '#ffd166');
    }
    // o mar, com ondinhas que passam mais depressa à frente do que ao fundo
    const n = 8, H = v.h - hy;
    for (let i = 0; i < n; i++) R(0, hy + Math.floor((i * H) / n), v.w, Math.ceil(H / n) + 1, tom('#5ab8e0', '#1f5fa8', i / (n - 1)));
    for (let i = 0; i < 26; i++) {
      const k = hash(i + 1), y = hy + 4 + k * (H - 8), W = v.w + 30, x = (((hash(i * 3 + 2) * W - this.x * (0.4 + k * 0.6)) % W) + W) % W - 15;
      R(x, y, 5 + k * 8, 1, k > 0.5 ? '#cfeaff' : '#8fd0f0');
    }
    // golfinhos a acompanhar, lá ao fundo
    if (this.x > 700) for (let i = 0; i < 2; i++) {
      const ph = (t * 0.55 + i * 0.45) % 1, x = g.sx + LEN + 10 + i * 34 + ph * 30, y = g.y0 - 16;
      if (ph < 0.6) { const k = ph / 0.6, yy = y - Math.sin(Math.PI * k) * 16; this.golfinho(R, x, yy, k); } else R(x + 10, y + 1, 8, 1, '#ffffff');
    }
    // tudo o que está na água, de longe para perto (o barco no meio)
    const by = Math.round(lerp(g.y0, g.y1, this.y));
    const lista = this.objs.filter((o) => { const sx = g.sx + o.d - this.x; return sx > -40 && sx < v.w + 40; })
      .map((o) => ({ o, y: lerp(g.y0, g.y1, o.ly) })).concat([{ boat: true, y: by }]).sort((a, b) => a.y - b.y);
    for (const it of lista) {
      if (it.boat) { this.barco(ctx, R, g.sx, by, t); continue; }
      const o = it.o, x = Math.round(g.sx + o.d - this.x), y = Math.round(it.y);
      if (o.kind === 'h') { if (!o.off) this.coracao(ctx, R, x, y, t); } else if (o.kind === 't') this.traineira(R, x, y, t, o.d);
      else if (o.kind === 'g') this.gaivota(R, x, y, t, o);
      else this.boia(R, x, y, t, o.kind === 'bv' ? '#3fae5a' : '#e0182a');
    }
    // quanto falta
    const pw = Math.min(120, v.w - 60), px = Math.round((v.w - pw) / 2), py = v.h - 6;
    R(px - 1, py - 1, pw + 2, 4, INK); R(px, py, pw, 2, '#22314f'); R(px, py, pw * clamp(this.x / FIM, 0, 1), 2, '#7be0b0');
  }

  barco(ctx, R, sx, by, t) {
    const sh = this.slow > 0 ? Math.round(Math.sin(t * 50) * 1.5) : 0, bob = Math.round(Math.sin(t * 3) * 1), wl = by + bob;
    // esteira
    for (let i = 0; i < 6; i++) R(sx - 6 - i * 8 - ((t * 40) % 8), by + (i % 2 ? 1 : -1) * (1 + i * 0.6), 6, 1, '#ffffff');
    lancha(R, sx + sh, wl, LEN, 1, 'tras');
    const xs = [10, 22, 46, 57, 70, 80];
    this.crew.forEach((f, i) => person(ctx, f, sx + sh + xs[i], wl - 3, { scale: 1, face: 1 }));
    lancha(R, sx + sh, wl, LEN, 1, 'frente');
    R(sx + LEN - 6, by, 10 + Math.round(Math.sin(t * 9) * 2), 1, '#ffffff'); R(sx + sh - 2, by + 1, LEN, 1, '#cfeaff');
  }

  coracao(ctx, R, x, y, t) {
    const img = getSprites().heart, yy = y - 12 + Math.round(Math.sin(t * 4 + x * 0.05) * 2);
    R(x - 5, y, 10, 1, 'rgba(18,58,102,0.5)');
    ctx.drawImage(img, x - 9, yy - 8, 18, 16);
  }

  traineira(R, x, y, t, seed) {
    const c = ['#e0182a', '#2f8a4a', '#2a5ab8'][Math.floor(hash(seed) * 3)], b = Math.round(Math.sin(t * 2.4 + seed) * 1), wl = y + b;
    R(x - 23, wl - 9, 46, 11, INK); R(x - 22, wl - 8, 44, 4, '#f2f2f7'); R(x - 22, wl - 4, 44, 3, c); R(x - 22, wl - 1, 44, 2, '#2b2b3a');
    R(x + 20, wl - 11, 5, 4, INK); R(x + 20, wl - 10, 4, 3, c);                                  // proa
    R(x - 15, wl - 20, 14, 12, INK); R(x - 14, wl - 19, 12, 11, '#f2f2f7'); R(x - 12, wl - 17, 4, 4, '#5ab8e0'); R(x - 6, wl - 17, 3, 4, '#5ab8e0'); R(x - 14, wl - 19, 12, 2, c);
    R(x + 4, wl - 26, 1, 18, INK); R(x + 5, wl - 24, 9, 1, INK); R(x + 13, wl - 24, 1, 8, '#8a8794');   // mastro e pau de carga
    R(x - 24, y + 2, 48, 1, '#cfeaff');
  }

  gaivota(R, x, y, t, o) {
    if (o.voa) { const k = o.voa, up = Math.floor(t * 10) % 2; x += k * 30; y -= 6 + k * 50; R(x - 5, y - (up ? 3 : -1), 4, 2, '#ffffff'); R(x + 2, y - (up ? 3 : -1), 4, 2, '#ffffff'); R(x - 1, y - 1, 3, 3, '#ffffff'); return; }
    const b = Math.round(Math.sin(t * 3 + x * 0.1) * 1);
    R(x - 6, y - 6 + b, 11, 7, INK); R(x - 5, y - 5 + b, 9, 5, '#ffffff'); R(x - 5, y - 4 + b, 5, 2, '#a8b0c0');
    R(x + 2, y - 10 + b, 5, 5, INK); R(x + 3, y - 9 + b, 3, 4, '#ffffff'); R(x + 6, y - 7 + b, 2, 1, '#ffb347'); R(x + 4, y - 8 + b, 1, 1, INK);
    R(x - 7, y + 1, 14, 1, '#cfeaff');
  }

  boia(R, x, y, t, c) {
    const b = Math.round(Math.sin(t * 2.5 + x) * 1);
    R(x - 4, y - 9 + b, 8, 10, INK); R(x - 3, y - 8 + b, 6, 8, c); R(x - 1, y - 13 + b, 2, 5, INK); R(x - 1, y - 14 + b, 2, 2, '#ffd166'); R(x - 3, y - 5 + b, 6, 1, '#ffffff');
    R(x - 5, y + 1, 10, 1, '#cfeaff');
  }

  golfinho(R, x, y, k) {
    const c = '#5a7a9a', inc = Math.round((k - 0.5) * 6);
    R(x - 1, y + inc - 1, 14, 6, INK); R(x, y + inc, 12, 4, c); R(x + 11, y + inc * 2 + 1, 4, 2, c); R(x - 3, y - inc + 1, 4, 2, c); R(x - 5, y - inc - 1, 2, 4, c);
    R(x + 5, y + inc - 3, 3, 3, c); R(x + 2, y + inc + 3, 8, 1, '#cfd8e6');
  }

  bot(I, v) {
    if (this.fim) return;
    const g = this.geo(v), band = g.y1 - g.y0, by = lerp(g.y0, g.y1, this.y);
    const frente = this.objs.filter((o) => !o.off && TAM[o.kind] && o.d + TAM[o.kind][0] > this.x && o.d < this.x + LEN + 130);
    const h = frente.find((o) => o.kind === 'h');
    let alvo = h ? lerp(g.y0, g.y1, h.ly) : by;
    for (const o of frente) {
      if (o.kind === 'h' || o.d > this.x + LEN + 70) continue;
      const oy = lerp(g.y0, g.y1, o.ly), folga = TAM[o.kind][1] + 6;
      if (Math.abs(alvo - oy) < folga) alvo = oy + (oy > g.y0 + band / 2 ? -folga : folga);
    }
    if (alvo < by - 2) I.up = true; else if (alvo > by + 2) I.down = true;
  }
}
