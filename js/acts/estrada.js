// A «estrada»: corrida lateral automática, com duas faixas. O veículo avança sozinho; um toque
// (ou Espaço) muda de faixa, para fugir aos obstáculos e apanhar os corações. As setas ↑ ↓
// escolhem a faixa diretamente. Nunca se perde: bater num obstáculo só atordoa um instante e
// parte o coração que vinha a seguir.
//
// A mesma mecânica serve vários níveis, cada um com a sua «pele» (veículo, fundo, obstáculos):
//
//   { act: Estrada, skin: pele, secs: 34, intro: 'Toca para mudar de faixa...', arrive: 'Chegaram!',
//     course: [
//       { at: 3.6, obs: 'buraco', lane: 0 },     // obstáculo na faixa 0 (a de baixo) ou 1 (a de cima)
//       { at: 3.7, heart: 1 },                    // coração na faixa 1
//       { at: 5, say: 'Ana: «Cuidado!»' },        // fala ou instrução
//       { at: 12, prop: 'placa', label: 'OSLO' }, // coisa do cenário, à beira da estrada
//       { at: 20, stop: 'porta' },                // paragem (entrega): dá um coração se o troço correu bem
//     ] }
//
// `at` é o instante (em segundos de viagem) em que o veículo passa por essa coisa: assim o percurso
// é igual nos dois formatos de ecrã, e só muda o espaço entre as coisas. O ato dá tantos corações
// quantos os `heart` e os `stop` do percurso.
//
// A pele: { intro, vehicle: { w, draw(ctx, R, x, y, a, act) }, back(ctx, R, a), road(ctx, R, a)?,
//   front(ctx, R, a)?, obs: { tipo: { w, msg, soft?, draw(ctx, R, x, y, o, a) } },
//   props: { tipo(ctx, R, x, a, item) }, stop(act, item, ok)? → texto, start(act)?, update(act, dt)? }
// `a` (o que a pele recebe para desenhar): { w, h, top, roadTop, roadBot, cx, speed, t, time, cam,
//   X(at) → x no ecrã, laneY(faixa) → y do chão dessa faixa, act }.
// Ao alto, tudo é desenhado ao dobro do tamanho (w e h já vêm divididos por 2).
import { Act } from './base.js';
import { getSprites } from '../sprites.js';
import { INK, PAPER, GOLD, PINK, clamp, hash, mkR, text, textW, sky, stars, disc, hills, mark } from '../draw.js';

export const ROAD_H = 40;      // altura da estrada (as duas faixas)
const LANE_GAP = 18;           // distância entre as faixas

export class Estrada extends Act {
  get max() { return (this.cfg.course || []).filter((i) => i.heart !== undefined || i.stop).length; }

  start() {
    const sk = this.sk = this.cfg.skin, course = (this.cfg.course || []).map((i) => ({ ...i }));
    this.secs = this.cfg.secs || 30;
    this.obs = course.filter((i) => i.obs && sk.obs[i.obs]).map((o) => ({ ...o, def: sk.obs[o.obs] }));
    this.hearts = course.filter((i) => i.heart !== undefined).map((h) => ({ at: h.at, lane: h.heart }));
    this.says = course.filter((i) => i.say);
    this.stops = course.filter((i) => i.stop);
    this.things = course.filter((i) => i.prop || i.stop);
    this.spr = getSprites();
    this.time = 0;            // segundos de viagem
    this.dist = 0;            // píxeis andados (para as rodas)
    this.lane = this.cfg.lane || 0;
    this.lp = this.lane;      // posição entre faixas (0 a 1), para a mudança ser suave
    this.stun = 0;
    this.hop = 0; this.hopV = 0;
    this.hits = 0;            // toques em obstáculos, no total
    this.seg = 0;             // ... e desde a última paragem
    this.mode = 'run';        // run ⇄ stop → arrive
    this.wait = 0;
    this.mem = {};            // estado próprio da pele
    if (sk.start) sk.start(this);
    this.hint(this.cfg.intro || sk.intro || 'Toca para mudar de faixa: foge aos obstáculos e apanha os corações!');
  }

  // Medidas do ecrã. Ao alto desenha-se tudo ao dobro (S = 2), para o veículo não ficar minúsculo.
  geo(v) {
    const S = v.portrait ? 2 : 1;
    const w = Math.ceil(v.w / S), h = Math.ceil(v.h / S), top = Math.ceil(this.top(v) / S);
    const roadTop = v.portrait ? Math.round(h * 0.6) : h - ROAD_H - 24;
    const vw = this.sk.vehicle.w;
    const cx = v.portrait ? Math.round(this.sk.vehicle.back || vw / 2) + 3 : Math.round(w * 0.2);     // `back`: o que o veículo ocupa para trás do centro
    // a velocidade depende do espaço à frente: há sempre uns 2 segundos para ver o que aí vem
    const speed = clamp((w - cx - 20) / 2.1, 36, 104);
    return { S, w, h, top, roadTop, roadBot: roadTop + ROAD_H, cx, speed, half: vw * 0.32 };
  }

  update(dt, I, v) {
    const g = this.geo(v), sk = this.sk;
    if (this.mode !== 'arrive') {
      let want = this.lane;
      if (I.up) want = 1; else if (I.down) want = 0; else if (I.actionPressed) want = 1 - this.lane;
      if (want !== this.lane) { this.lane = want; this.sfx('click'); }
    }
    this.lp += clamp(this.lane - this.lp, -dt * 6.5, dt * 6.5);
    if (this.stun > 0) this.stun -= dt;
    if (this.hop > 0 || this.hopV > 0) {
      this.hop += this.hopV * dt; this.hopV -= 520 * dt;
      if (this.hop <= 0) { this.hop = 0; this.hopV = 0; }
    }
    if (sk.update) sk.update(this, dt, g);
    if (this.mode === 'run') this.run(dt, g);
    else if (this.mode === 'stop') {
      this.wait += dt;
      if (this.wait > 1.8) { this.mode = 'run'; this.seg = 0; }
    } else {
      this.wait += dt;
      if (Math.floor(this.wait * 6) !== Math.floor((this.wait - dt) * 6)) this.fx.heart((g.cx - 14 + Math.random() * 40) * g.S, (g.roadTop - 10 + Math.random() * 20) * g.S, Math.random() < 0.3 ? GOLD : PINK);
      if (this.wait > 2.8) this.done();
    }
  }

  run(dt, g) {
    const sk = this.sk, t = this.time = Math.min(this.secs, this.time + dt);
    this.dist += g.speed * dt;
    for (const s of this.says) if (!s.shown && t >= s.at) { s.shown = true; this.hint(s.say); }
    const sy = (lane) => (g.roadTop + 34 - lane * LANE_GAP - 12) * g.S;

    for (const o of this.obs) {
      if (o.done) continue;
      const dx = (o.at - t) * g.speed, reach = o.def.w / 2 + g.half;
      if (dx < -reach) { o.done = true; continue; }
      if (dx > reach) continue;
      if (o.def.soft) {
        // lomba: não faz mal, mas o veículo dá um salto
        if (dx <= 2) { o.done = true; this.hopV = 95; this.hop = 0.01; this.sfx('toc'); if (sk.bump) sk.bump(this, o); }
      } else if (Math.abs(this.lp - o.lane) < 0.5) {
        o.done = true; o.hit = this.t;
        this.hits++; this.seg++;
        this.stun = 0.9;
        this.sfx('buzz');
        this.fx.burst((g.cx + g.half) * g.S, sy(o.lane), 12, ['#ffffff', GOLD, PINK], 70);
        const m = o.def.msg;
        if (this.hits === 3) this.hint('Toca para mudar de faixa antes de chegares ao obstáculo!');
        else if (m) this.hint(Array.isArray(m) ? m[this.hits % m.length] : m);
        if (sk.crash) sk.crash(this, o);
        // cada toque custa o coração que vinha a seguir (fica partido)
        const lost = this.hearts.find((h) => !h.got && !h.gone && !h.broken && h.at > t && h.at - t < 4);
        if (lost) lost.broken = true;
      }
    }

    for (const h of this.hearts) {
      if (h.got || h.gone || h.broken) continue;
      const dx = (h.at - t) * g.speed;
      if (dx < -(g.half + 8)) { h.gone = true; continue; }
      if (Math.abs(dx) < g.half + 6 && Math.abs(this.lp - h.lane) < 0.5 && this.stun <= 0) {
        h.got = true;
        this.heart(1, (g.cx + dx) * g.S, sy(h.lane));
      }
    }

    for (const s of this.stops) {
      if (s.done || t < s.at) continue;
      s.done = true; s.t0 = this.t;
      this.time = s.at;
      this.mode = 'stop'; this.wait = 0;
      const ok = this.seg <= (this.cfg.tolerance === undefined ? 1 : this.cfg.tolerance);
      s.ok = ok;
      this.sfx('ring');
      if (ok) this.heart(1, g.cx * g.S, (g.roadTop - 20) * g.S);
      if (sk.stop) this.hint(sk.stop(this, s, ok));
      return;
    }

    if (t >= this.secs) {
      this.mode = 'arrive'; this.wait = 0;
      this.sfx('win');
      this.hint(this.cfg.arrive || sk.arrive || 'Chegaram!');
    }
  }

  draw(ctx, v, R) {
    const g = this.geo(v), sk = this.sk, t = this.time;
    const a = {
      ...g, t: this.t, time: t, cam: t * g.speed, act: this,
      X: (at) => Math.round(g.cx + (at - t) * g.speed),
      laneY: (lane) => g.roadTop + 34 - Math.round(lane * LANE_GAP),
    };
    ctx.save();
    ctx.scale(g.S, g.S);
    sk.back(ctx, R, a);
    (sk.road || road)(ctx, R, a);
    for (const p of this.things) {
      const x = a.X(p.at) + (p.dx || 0), fn = sk.props[p.prop || p.stop];
      if (fn && x > -150 && x < g.w + 150) fn(ctx, R, x, a, p);
    }
    const vl = this.lp >= 0.5 ? 1 : 0;
    for (const lane of [1, 0]) {
      for (const o of this.obs) {
        if (o.def.soft ? lane !== 1 : o.lane !== lane) continue;
        const x = a.X(o.at);
        if (x < -60 || x > g.w + 60) continue;
        o.def.draw(ctx, R, x, a.laneY(o.lane || 0), o, a);
        // depois de dois toques, um aviso por cima do que vem na nossa faixa
        if (this.hits >= 2 && !o.done && !o.def.soft && o.lane === this.lane && x > g.cx && Math.floor(this.t * 5) % 2) mark(ctx, x, a.laneY(lane) - (o.def.h || 14) - 4);
      }
      for (const h of this.hearts) {
        if (h.got || h.lane !== lane) continue;
        const x = a.X(h.at);
        if (x < -10 || x > g.w + 10) continue;
        if (h.broken) { ctx.drawImage(this.spr.heartOff, x - 4, a.laneY(lane) - 15); R(x, a.laneY(lane) - 14, 1, 2, INK); R(x - 1, a.laneY(lane) - 12, 1, 2, INK); R(x, a.laneY(lane) - 10, 1, 2, INK); } else ctx.drawImage(this.spr.heart, x - 4, a.laneY(lane) - 17 + Math.round(Math.sin(this.t * 4 + h.at) * 1.5));
      }
      if (vl === lane) {
        const wob = this.stun > 0 ? Math.round(Math.sin(this.t * 40) * 1.5) : 0;
        const x = g.cx + wob, y = a.laneY(this.lp) - Math.round(this.hop);
        sk.vehicle.draw(ctx, R, x, y, a, this);
        if (this.stun > 0.2) for (let k = 0; k < 3; k++) {
          const an = this.t * 9 + k * 2.1;
          R(x + Math.round(Math.cos(an) * 12), y - (sk.vehicle.h || 28) - 3 + Math.round(Math.sin(an) * 3), 2, 2, k % 2 ? GOLD : PAPER);
        }
      }
    }
    if (sk.front) sk.front(ctx, R, a);

    // o percurso: barra em baixo, com as paragens
    const pw = Math.min(100, g.w - 24), px = Math.round((g.w - pw) / 2), py = g.h - 5;
    R(px - 1, py - 1, pw + 2, 4, INK);
    R(px, py, pw, 2, PAPER);
    R(px, py, Math.round(pw * clamp(t / this.secs, 0, 1)), 2, PINK);
    for (const s of this.stops) R(px + Math.round((pw * s.at) / this.secs) - 1, py - 2, 2, 6, s.done ? (s.ok ? '#5cf08a' : '#9a93ad') : GOLD);
    ctx.restore();
  }

  // O robô: muda de faixa quando vem aí um obstáculo e vai buscar os corações que puder.
  bot(I, v) {
    if (this.mode === 'arrive' || this.lp !== this.lane) return;
    const g = this.geo(v), t = this.time, danger = [false, false];
    for (const o of this.obs) if (!o.done && !o.def.soft && o.at - t < (o.def.w / 2 + g.half) / g.speed + 0.45) danger[o.lane] = true;
    let want = this.lane;
    const h = this.hearts.find((x) => !x.got && !x.gone && !x.broken && x.at - t < (g.half + 6) / g.speed + 0.5);
    if (h && !danger[h.lane]) want = h.lane;
    if (danger[want] && !danger[1 - want]) want = 1 - want;
    if (want !== this.lane) I.actionPressed = true;
  }
}

// ---------- Peças comuns às peles ----------

// A estrada: alcatrão e tracejado entre as duas faixas. c: { asphalt, edge, line }.
export function road(ctx, R, a, c = {}) {
  R(0, a.roadTop, a.w, ROAD_H, c.asphalt || '#5c5c68');
  R(0, a.roadTop, a.w, 1, c.edge || '#84848f');
  R(0, a.roadBot - 1, a.w, 1, c.edge || '#84848f');
  const y = a.roadTop + 20, off = ((Math.round(a.cam) % 24) + 24) % 24;
  for (let x = -off; x < a.w; x += 24) R(x, y, 12, 1, c.line || '#eae6d8');
}

// Roda (raio 4) com um raio a rodar.
export function roda(R, x, y, spin, hub = '#b8bcc8') {
  R(x - 3, y - 4, 6, 8, INK); R(x - 4, y - 3, 8, 6, INK);
  R(x - 2, y - 2, 4, 4, hub);
  const k = Math.floor(spin / 3) % 4;
  R(x - 1 + (k === 1 ? 1 : 0) - (k === 3 ? 1 : 0), y - 1 + (k === 2 ? 1 : 0) - (k === 0 ? 1 : 0), 2, 2, '#5a5e6c');
}

// Só a cabeça de um boneco (12 x 11 píxeis), com o queixo em `by` — para as janelas dos carros.
const tops = new WeakMap();
function topRow(img) {
  if (!tops.has(img)) {
    const d = img.getContext('2d').getImageData(0, 0, img.width, 8).data;
    let row = 0;
    while (row < 7) { let any = false; for (let x = 0; x < img.width; x++) if (d[(row * img.width + x) * 4 + 3]) any = true; if (any) break; row++; }
    tops.set(img, row);
  }
  return tops.get(img);
}
export function cabeca(ctx, frames, cx, by, face = 1, rows = 11) {
  const img = frames.stand[face < 0 ? 'l' : 'r'];
  ctx.drawImage(img, 2, topRow(img), 12, rows, Math.round(cx) - 6, Math.round(by) - rows, 12, rows);
}

// Balãozinho de fala com letras de píxeis («AI!», «MIAU!»), centrado em cx, com a base em y.
export function balao(ctx, R, str, cx, y, color = '#c0392b') {
  const w = textW(str) + 6, x = Math.round(cx - w / 2);
  R(x - 1, y - 11, w + 2, 11, INK);
  R(x, y - 10, w, 9, PAPER);
  R(x + 4, y, 3, 2, INK); R(x + 5, y - 1, 1, 2, PAPER);
  text(ctx, str, x + 3, y - 8, color);
}

// ---------- Lisboa: prédios de azulejo, candeeiros e calçada (de dia ou de noite) ----------
const AZ = [['#e6edf5', '#3f6fb5', '#8fb0dc'], ['#f3efd8', '#3f9f6a', '#9fcfae'], ['#f8e8c4', '#c0792b', '#e0b070'], ['#f4dcdc', '#a8324a', '#d88a98'], ['#dcefe8', '#2f7f8a', '#8cc0c4']];
const PAINT = ['#f2c8a0', '#f5e0a0', '#e8a8a0', '#c8d8e8', '#f0ead8', '#d8c0d8'];
const LOJAS = ['CAFÉ', 'TALHO', 'PADARIA', 'FLORISTA', 'LEITARIA', 'DROGARIA', 'MERCEARIA'];
const DOORS = ['#2f5f4a', '#7a2e2a', '#3a4a6a', '#5a3a22'];
const STONE = '#ded6c6', IRON = '#2b3a30';

function predio(i, night) {
  const r = (k) => hash(i * 9.7 + k * 3.3 + 1);
  const w = 34 + Math.floor(r(1) * 7) * 4, floors = 2 + Math.floor(r(2) * 3);
  const FH = 15, GF = 19, top = 8, h = top + floors * FH + GF;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d'), R = mkR(g), lit = [];
  const tiled = r(3) < 0.62, az = AZ[Math.floor(r(4) * AZ.length)];
  // fachada: azulejo de padrão ou reboco pintado
  R(0, top, w, h - top, tiled ? az[0] : PAINT[Math.floor(r(5) * PAINT.length)]);
  if (tiled) for (let y = top + 2; y < h - GF; y += 4) for (let x = 2; x < w - 2; x += 4) { R(x + 1, y + 1, 2, 2, az[1]); if (((x + y) >> 2) % 2) R(x + 3, y + 3, 1, 1, az[2]); }
  // cunhais de pedra, cornija e telhado de telha
  R(0, top, 2, h - top, STONE); R(w - 2, top, 2, h - top, STONE); R(0, top, w, 2, STONE); R(0, top + 2, w, 1, 'rgba(43,29,46,0.25)');
  R(0, 2, w, 6, '#c2603a'); R(0, 2, w, 1, '#e28c5c');
  for (let x = 1; x < w; x += 3) R(x, 4, 1, 4, '#a04a2c');
  if (r(6) < 0.6) { const cx = 6 + Math.floor(r(7) * (w - 16)); R(cx, 0, 5, 5, '#d8cfc0'); R(cx - 1, 0, 7, 1, '#8a6a5a'); }
  R(0, top, 1, h - top, 'rgba(43,29,46,0.35)');
  // janelas (algumas de sacada, com grade de ferro; outras com roupa a secar)
  const n = Math.max(2, Math.floor((w - 4) / 13)), gap = (w - n * 9) / (n + 1);
  for (let f = 0; f < floors; f++) {
    const y = top + 4 + f * FH, sacada = r(10 + f) < 0.5;
    for (let k = 0; k < n; k++) {
      const x = Math.round(gap + k * (9 + gap)), on = night && r(20 + f * 5 + k) < 0.4;
      R(x, y, 9, 11, STONE);
      R(x + 1, y + 1, 7, 9, night ? '#1c2238' : '#6a8fb0');
      if (!night) { R(x + 1, y + 1, 3, 3, '#a8cde0'); if (r(30 + f * 5 + k) < 0.3) R(x + 1, y + 1, 7, 4, '#f4eedc'); }
      R(x + 4, y + 1, 1, 9, STONE); R(x + 1, y + 4, 7, 1, STONE);
      if (on) lit.push([x + 1, y + 1]);
      if (sacada) {
        R(x - 2, y + 11, 13, 1, STONE); R(x - 2, y + 6, 13, 1, IRON);
        for (let j = 0; j < 7; j++) R(x - 2 + j * 2, y + 6, 1, 5, IRON);
        if (r(40 + f * 5 + k) < 0.5) { R(x, y + 5, 2, 1, '#e0527a'); R(x + 6, y + 5, 2, 1, '#ff8a4b'); R(x + 3, y + 5, 2, 1, '#4f9a5a'); }
      } else if (r(50 + f * 5 + k) < 0.22) {
        R(x - 1, y + 11, 11, 1, '#8a8794');
        R(x, y + 12, 3, 3, '#ffffff'); R(x + 4, y + 12, 2, 4, '#e0527a'); R(x + 7, y + 12, 3, 3, '#7ec8f0');
      }
    }
  }
  // rés-do-chão em pedra: porta e, muitas vezes, uma loja com tabuleta
  const y0 = h - GF, door = DOORS[Math.floor(r(8) * DOORS.length)];
  R(0, y0, w, GF, '#d2c9b8'); R(0, y0, w, 1, 'rgba(43,29,46,0.3)'); R(0, h - 3, w, 3, '#b8ae9c');
  const dx = r(9) < 0.5 ? 4 : w - 13;
  R(dx - 1, y0 + 3, 11, 16, STONE); R(dx, y0 + 4, 9, 15, door); R(dx + 4, y0 + 4, 1, 15, 'rgba(0,0,0,0.3)'); R(dx + 1, y0 + 5, 7, 3, night ? '#2a3050' : '#a8cde0'); R(dx + 6, y0 + 12, 1, 1, GOLD);
  const sx = dx < 10 ? 17 : 3, sw = w - 20;
  const names = LOJAS.filter((s) => textW(s) + 4 <= sw);
  if (r(11) < 0.7 && names.length) {
    const name = names[Math.floor(Math.sqrt(r(12)) * names.length)], open = night && r(13) < 0.3;
    R(sx, y0 + 10, sw, 7, night ? (open ? '#ffd98a' : '#1c2238') : '#8fb8d0'); R(sx, y0 + 10, sw, 1, 'rgba(43,29,46,0.4)');
    if (!night) { R(sx + 2, y0 + 12, 3, 4, '#f0c8a0'); R(sx + 7, y0 + 13, 4, 3, '#e0d0a0'); }
    R(sx, y0 + 1, sw, 9, '#3a2f4f');
    text(g, name, sx + Math.round(sw / 2), y0 + 4, '#ffe9b0', { align: 'center' });
    if (open) lit.push([sx, y0 + 10, sw, 7]);
  } else {
    R(sx + 2, y0 + 5, 8, 9, STONE); R(sx + 3, y0 + 6, 6, 7, night ? '#1c2238' : '#6a8fb0');
    for (let j = 0; j < 3; j++) R(sx + 4 + j * 2, y0 + 6, 1, 7, IRON);
  }
  if (night) {
    // de noite: tudo escurecido, com algumas janelas acesas
    g.globalCompositeOperation = 'source-atop';
    R(0, 0, w, h, 'rgba(18,14,50,0.6)');
    g.globalCompositeOperation = 'source-over';
    for (const [x, y, lw, lh] of lit) { R(x, y, lw || 7, lh || 9, '#ffd98a'); if (!lw) { R(x + 3, y, 1, 9, '#8a6a3a'); R(x, y + 3, 7, 1, '#8a6a3a'); R(x, y + 5, 3, 4, '#e0a860'); } }
  }
  return c;
}

function calcada(night) {
  // calçada portuguesa, em ondas pretas e brancas
  const c = document.createElement('canvas');
  c.width = 24; c.height = 12;
  const g = c.getContext('2d');
  for (let x = 0; x < 24; x++) for (let y = 0; y < 12; y++) {
    const wv = Math.round(Math.sin((x / 24) * Math.PI * 2) * 2);
    g.fillStyle = Math.floor(((y + wv + 12) % 12) / 6) ? (night ? '#1f1c33' : '#4a4452') : (night ? '#6a6688' : '#efe8d8');
    g.fillRect(x, y, 1, 1);
  }
  return c;
}

const cities = {};
// cidade(false) = Lisboa de manhã; cidade(true) = Lisboa à noite. Devolve { back, front }.
export function cidade(night) {
  const key = night ? 'n' : 'd';
  if (cities[key]) return cities[key];
  const P = [];
  let period = 0;
  for (let i = 0; i < 12; i++) { const c = predio(i + (night ? 40 : 0), night); P.push(c); period += c.width; }
  const tile = calcada(night);
  const city = {
    back(ctx, R, a) {
      const base = a.roadTop - 8, cam = Math.round(a.cam);
      sky(ctx, a.w, a.h, base, night ? ['#120e30', '#2a2358', '#4a3a78'] : ['#7fb8e4', '#c4e2f0', '#ffe8c8']);
      const far = Math.max(a.top + 6, base - 104);
      if (night) {
        stars(ctx, a.w, base - 60, a.t, 5, 30);
        disc(ctx, Math.round(a.w * 0.78), far + 2, 6, '#fff3c4'); disc(ctx, Math.round(a.w * 0.78) + 3, far, 5, '#120e30');
      } else {
        disc(ctx, Math.round(a.w * 0.8), far + 4, 7, '#fff3b0');
        for (let k = 0; k < 3; k++) { const x = ((k * 97 - cam * 0.05) % (a.w + 60) + a.w + 60) % (a.w + 60) - 30, y = far - 2 + k * 9; R(x, y, 22, 4, '#ffffff'); R(x + 5, y - 3, 11, 3, '#ffffff'); }
      }
      // a cidade ao longe, numa colina
      hills(ctx, a.w, base, base - 78, cam, 0.12, 0, 9, night ? '#231d4a' : '#b4c4dc', 3);
      for (let k = 0; k < 14; k++) {
        const x = ((k * 31 - Math.round(cam * 0.12)) % (a.w + 40) + a.w + 40) % (a.w + 40) - 20;
        R(x, base - 76 + (k * 5) % 9, 5, 4, night ? (k % 3 ? '#2f2860' : '#ffd98a') : (k % 2 ? '#f0e4d0' : '#e8c8b8'));
      }
      // os prédios, encostados uns aos outros
      let x = -(((cam % period) + period) % period);
      for (let k = 0; x < a.w; k++) { const b = P[k % P.length]; if (x + b.width > 0) ctx.drawImage(b, x, base - b.height); x += b.width; }
      // passeio do lado de lá, com candeeiros e árvores
      R(0, base, a.w, 8, night ? '#4a4668' : '#e4dccc'); R(0, a.roadTop - 1, a.w, 1, night ? '#2a2648' : '#a8a094');
      for (let k = Math.floor((cam - 30) / 110); k * 110 + 60 < cam + a.w + 30; k++) {
        const tx = k * 110 + 60 - cam, lx = k * 110 + 5 - cam;
        // árvore de novembro: ainda verde, com folhas a amarelecer
        R(tx, base - 14, 2, 18, '#5a3a22');
        disc(ctx, tx + 1, base - 19, 8, night ? '#1f3a3a' : '#4f9a5a'); disc(ctx, tx - 2, base - 22, 4, night ? '#2a4a48' : '#7fc070');
        if (!night) { R(tx + 3, base - 17, 2, 2, '#e0a030'); R(tx - 4, base - 20, 2, 2, '#e8b848'); }
        // candeeiro de lanterna
        R(lx, base - 26, 2, 30, IRON); R(lx - 1, base + 2, 4, 2, IRON);
        R(lx - 2, base - 33, 6, 7, IRON); R(lx - 1, base - 32, 4, 5, night ? '#ffe9a0' : '#e8f0f0'); R(lx - 3, base - 34, 8, 1, IRON); R(lx, base - 36, 2, 2, IRON);
        if (night) { ctx.fillStyle = 'rgba(255,220,130,0.16)'; ctx.fillRect(lx - 9, base - 34, 20, 38); ctx.fillStyle = 'rgba(255,220,130,0.14)'; ctx.fillRect(lx - 5, base - 34, 12, 30); }
      }
    },
    // o passeio do lado de cá: lancil e calçada portuguesa
    front(ctx, R, a) {
      R(0, a.roadBot, a.w, 3, night ? '#55516e' : '#cfc8ba');
      const off = ((Math.round(a.cam) % 24) + 24) % 24;
      for (let y = a.roadBot + 3; y < a.h; y += 12) for (let x = -off; x < a.w; x += 24) ctx.drawImage(tile, x, y);
    },
  };
  cities[key] = city;
  return city;
}
