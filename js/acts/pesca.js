// Pesca: uma mecânica de um só botão, usada em vários níveis com «peles» diferentes.
//   1. tocar para lançar a linha;
//   2. esperar pela picada e tocar quando a boia afunda;
//   3. puxar o peixe: manter premido aumenta a tensão da linha, largar alivia-a; o peixe só
//      vem enquanto a tensão estiver na zona verde (que anda para cima e para baixo, conforme
//      a força do peixe).
// Nunca se perde: se o peixe demorar demasiado, os amigos ajudam e ele vem na mesma (sem coração).
//
//   { act: Pesca, hearts: 4, fim: 'frase final',
//     skin: {                                  // a «pele»: cenário, barco e tripulação
//       back(ctx, v, R, t, wl),                // céu e paisagem até à linha de água (y = wl)
//       under(ctx, v, R, t, wl),               // (opcional) enfeites debaixo de água
//       boatBack(ctx, R, bx, wl, len, t),      // (opcional) partes do barco atrás das pessoas
//       boat(ctx, R, bx, wl, len, t),          // o casco, à frente das pessoas
//       sea: ['#cor à superfície', '#cor no fundo', '#cor dos reflexos'], bed: '#areia',
//       len: 150, deck: 6,                     // comprimento do barco; altura do convés
//       crew: [{ who, outfit, name }],         // quem vai a bordo
//       ajuda: 'Pi: «Eu dou uma ajuda!»' },
//     fish: [{ who: 'ines', fish: 'dourado', turn: 'É a vez da Inês.', cheer: 'Inês: «...»', alt: 'LETREIRO' }] }
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, MINT, clamp, lerp, mix, hash, person, sign, mark, sky } from '../draw.js';

const SOBE = 0.62, DESCE = 0.52;   // velocidade da tensão (por segundo) a puxar e a largar
const ZONA = 0.17;                 // metade da altura da zona verde
const LIMITE = 14;                 // segundos a puxar até os amigos ajudarem

// Segmento de reta, píxel a píxel.
export function seg(R, x0, y0, x1, y1, c, th = 1) {
  const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
  for (let i = 0; i <= n; i++) { const k = n ? i / n : 0; R(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, 1, th, c); }
}

// Os peixes. len/tall: comprimento e meia altura em píxeis · need: segundos na zona verde até
// vir · force (0 a 1): quanto a zona verde se mexe.
export const PEIXES = {
  // ----- Moçambique -----
  dourado: { nome: 'DOURADO', len: 34, tall: 6, back: '#1f9a8a', body: '#f2d23e', belly: '#fff3a8', fin: '#2f6fd0', blunt: true, dorsal: 'long', need: 3.6, force: 0.35 },
  xareu: { nome: 'XARÉU', len: 28, tall: 8, back: '#7f97ad', body: '#d2dde8', belly: '#f6fafc', fin: '#f2c230', need: 4, force: 0.55 },
  barracuda: { nome: 'BARRACUDA', len: 46, tall: 4, back: '#56708a', body: '#b9c7d6', belly: '#eef3f7', fin: '#3f4f66', stripes: 'v', stripe: '#3f4f66', need: 4.4, force: 0.75 },
  atum: { nome: 'ATUM', len: 42, tall: 9, back: '#1f3460', body: '#5f7ea8', belly: '#e6edf5', fin: '#f2c230', need: 5, force: 0.95 },
  // ----- mar português -----
  robalo: { nome: 'ROBALO', len: 34, tall: 5, back: '#6a7a8a', body: '#c2ccd6', belly: '#f4f6f8', fin: '#7a8a9a', stripes: 'line', stripe: '#55606e', need: 3.2, force: 0.35 },
  dourada: { nome: 'DOURADA', len: 26, tall: 8, back: '#8a9aa8', body: '#d8dfe6', belly: '#f6f8fa', fin: '#9aa8b5', stripes: 'gold', need: 3.4, force: 0.5 },
  sargo: { nome: 'SARGO', len: 24, tall: 8, back: '#8a96a2', body: '#dfe5ea', belly: '#f6f8fa', fin: '#55606e', stripes: 'v', stripe: '#2b2b3a', need: 3.4, force: 0.65 },
  cavala: { nome: 'CAVALA', len: 28, tall: 4, back: '#1f7a8a', body: '#9fd0d8', belly: '#eef6f8', fin: '#2a5a6a', stripes: 'wavy', stripe: '#123a4a', need: 3.2, force: 0.85 },
  polvo: { nome: 'POLVO', kind: 'polvo', len: 16, tall: 8, body: '#d0553f', belly: '#f09a7a', need: 4.6, force: 0.5, teimoso: true },
};

// Desenha um peixe com o centro em (cx, cy), virado para dir (1 = direita). `dark`: só a silhueta.
export function peixe(R, cx, cy, sp, dir = 1, t = 0, dark = null) {
  if (sp.kind === 'polvo') { polvo(R, cx, cy, sp, t, dark); return; }
  const L = sp.len, H = sp.tall, cut = sp.blunt ? 0.8 : 0.96, parts = [];
  const fh = H >= 8 ? 3 : 2, d0 = sp.dorsal === 'long' ? 0.22 : 0.4, d1 = sp.dorsal === 'long' ? 0.92 : 0.7;
  let eye = null;
  for (let i = 0; i < L; i++) {
    const u = i / (L - 1);
    const hh = Math.max(1, Math.round(H * Math.sin(Math.PI * Math.pow(u * cut, 0.8))));
    const x = Math.round(cx + dir * (i - L / 2)), y = Math.round(cy + Math.sin(t * 9 - u * 4) * (1 - u) * 1.6);
    const bl = Math.max(1, Math.round(hh * 0.6));
    if (u >= d0 && u <= d1) parts.push([x, y - hh - fh, 1, fh, sp.fin]);
    if (u >= 0.34 && u <= 0.5) parts.push([x, y + hh + 1, 1, 2, sp.fin]);
    parts.push([x, y - hh, 1, hh * 2 + 1, sp.body]);
    parts.push([x, y - hh, 1, Math.max(1, Math.round(hh * 0.7)), sp.back]);
    parts.push([x, y + hh - bl + 1, 1, bl, sp.belly]);
    if (sp.stripes === 'v' && i % 5 === 2 && u > 0.2 && u < 0.85) parts.push([x, y - hh, 1, Math.round(hh * 1.5), sp.stripe]);
    if (sp.stripes === 'wavy' && i % 3 === 0 && u > 0.12 && u < 0.82) parts.push([x, y - hh, 1, hh + (i % 2), sp.stripe]);
    if (sp.stripes === 'line' && u < 0.82) parts.push([x, y, 1, 1, sp.stripe]);
    if (sp.stripes === 'gold' && u > 0.84 && u < 0.92) parts.push([x, y - hh, 1, hh + 1, '#f2c230']);
    if (!eye && u >= 0.84) eye = [x, y - Math.max(1, Math.round(hh * 0.5))];
  }
  // cauda em forquilha
  const T = Math.max(4, Math.round(H * 0.9) + 2), tx = cx - dir * (L / 2), ty = Math.round(cy + Math.sin(t * 9) * 1.6);
  for (let j = 1; j <= T; j++) {
    const half = 1 + Math.round((j * (H + 1)) / T * 0.9), gap = Math.max(0, Math.round((j - T * 0.5) * 1.1));
    const x = Math.round(tx - dir * j);
    if (gap) { parts.push([x, ty - half, 1, half - gap + 1, sp.fin]); parts.push([x, ty + gap, 1, half - gap + 1, sp.fin]); } else parts.push([x, ty - half, 1, half * 2 + 1, sp.fin]);
  }
  if (dark) { for (const p of parts) R(p[0], p[1], p[2], p[3], dark); return; }
  for (const p of parts) R(p[0] - 1, p[1] - 1, p[2] + 2, p[3] + 2, INK);
  for (const p of parts) R(p[0], p[1], p[2], p[3], p[4]);
  if (eye) { R(eye[0] - 1, eye[1] - 1, 3, 3, '#ffffff'); R(eye[0], eye[1], 1, 1, INK); R(eye[0] + dir, eye[1], 1, 1, INK); }
}

function polvo(R, cx, cy, sp, t, dark) {
  const parts = [[cx - 4, cy - 10, 9, 1], [cx - 5, cy - 9, 11, 7], [cx - 4, cy - 2, 9, 2]];
  for (let k = 0; k < 5; k++) for (let j = 0; j < 8; j++) parts.push([Math.round(cx - 7 + k * 3 + Math.sin(t * 5 + k * 1.3 + j * 0.8) * (1 + j * 0.25)), cy + j, 2, 1]);
  if (dark) { for (const p of parts) R(p[0], p[1], p[2], p[3], dark); return; }
  for (const p of parts) R(p[0] - 1, p[1] - 1, p[2] + 2, p[3] + 2, INK);
  for (const p of parts) R(p[0], p[1], p[2], p[3], sp.body);
  R(cx - 3, cy - 9, 3, 1, sp.belly); R(cx + 2, cy - 7, 2, 1, sp.belly); R(cx - 4, cy - 3, 2, 1, sp.belly);
  for (let k = 0; k < 5; k++) R(Math.round(cx - 7 + k * 3 + Math.sin(t * 5 + k * 1.3 + 4) * 2), cy + 5, 1, 1, sp.belly);
  R(cx - 3, cy - 6, 2, 3, '#ffffff'); R(cx + 2, cy - 6, 2, 3, '#ffffff'); R(cx - 3, cy - 5, 1, 2, INK); R(cx + 2, cy - 5, 1, 2, INK);
}

// Casco de um barco visto de lado, com a proa para a direita. A borda fica `alto` píxeis acima
// da linha de água (wl). o: { alto, cor, sombra, borda, risca, riscaY, riscaH }.
export function casco(R, bx, wl, len, o = {}) {
  const a = o.alto || 12, cor = o.cor || '#f6f6fa', n = a + 2, ry = o.riscaY || 3, rh = o.riscaH || 2;
  for (let r = -1; r <= n; r++) {
    const q = clamp(r, 0, n - 1), y = wl - a + r;
    const proa = Math.round((n - q) * 1.3 + Math.max(0, 4 - q) * 1.5), x0 = bx + Math.round(q * 0.3), x1 = bx + len - 16 + proa;
    if (r < 0 || r === n) { R(x0, y, x1 - x0, 1, INK); continue; }
    R(x0 - 1, y, x1 - x0 + 2, 1, INK);
    R(x0, y, x1 - x0, 1, r === 0 ? o.borda || '#8a5a34' : r >= ry && r < ry + rh ? o.risca || cor : r >= a - 1 ? o.sombra || '#c9cfdc' : cor);
  }
}

export class Pesca extends Act {
  get max() { return this.cfg.hearts || (this.cfg.fish || []).length; }

  start() {
    this.sk = this.cfg.skin || {};
    this.crew = (this.sk.crew || [{ who: 'ines', outfit: 'praia' }]).map((c) => ({ ...c, frames: getCharacter(c.who, c.outfit) }));
    this.list = (this.cfg.fish || [{ fish: 'robalo' }]).map((f) => ({ ...f, sp: { ...(PEIXES[f.fish] || PEIXES.robalo), ...(f.sp || {}) } }));
    this.n = -1;
    this.dica = true;        // a primeira vez que se puxa, explica-se como
    this.seguinte();
  }

  fase(f) { this.ph = f; this.pt = 0; }

  seguinte() {
    this.n++;
    if (this.n >= this.list.length) { this.fase('fim'); this.hint(this.cfg.fim || 'Que bela pescaria!'); this.sfx('win'); return; }
    this.cur = this.list[this.n];
    this.who = this.crew.find((c) => c.who === this.cur.who) || this.crew[0];
    Object.assign(this, { tens: 0.25, zc: 0.5, za: Math.random() * 6, prog: 0, el: 0, strain: 0, helped: false, misses: 0, cedo: 0, shake: 0, tick: 0, inz: false });
    this.fase('pronto');
    this.hint(`${this.cur.turn || ''} Toca para lançar a linha!`.trim());
  }

  update(dt, I, v) {
    this.pt += dt;
    if (this.shake > 0) this.shake -= dt;
    const g = this.geo(v), sp = this.cur.sp;
    switch (this.ph) {
      case 'pronto':
        if ((I.actionPressed && this.pt > 0.25) || this.pt > 6) { this.fase('lancar'); this.sfx('jump'); }
        break;
      case 'lancar':
        if (this.pt > 0.55) {
          this.fase('espera'); this.sfx('pop');
          this.biteAt = 1 + Math.random() * 1.2;
          this.fx.burst(g.fx, g.wl, 6, ['#ffffff', '#cfefff'], 40);
          this.hint('Espera pela picada... Toca quando a boia afundar!');
        }
        break;
      case 'espera':
        if (I.actionPressed && this.pt > 0.25 && this.cedo < 2) {   // cedo demais: o peixe assusta-se (só das duas primeiras vezes)
          this.cedo++; this.biteAt = this.pt + 0.9 + Math.random() * 0.6; this.sfx('toc');
          this.hint('Calma... Toca só quando a boia afundar!');
        } else if (this.pt >= this.biteAt) { this.fase('picada'); this.sfx('plim'); }
        break;
      case 'picada': {
        const janela = this.misses >= 2 ? 3 : 1.25;
        if (I.actionPressed || (this.misses >= 2 && this.pt > janela)) {
          this.fase('puxar'); this.sfx('check');
          this.fx.burst(g.fx, g.wl, 8, ['#ffffff', '#cfefff'], 50);
          this.hint(this.dica ? 'Mantém premido para puxar e larga para aliviar: a tensão tem de ficar na zona verde!' : `${sp.nome} na linha! Mantém a tensão na zona verde.`);
          this.dica = false;
        } else if (this.pt > janela) {
          this.misses++; this.fase('espera'); this.biteAt = 0.8 + Math.random() * 0.8; this.sfx('toc');
          this.hint('Fugiu com o isco! Outra vez: toca quando a boia afundar.');
        }
        break;
      }
      case 'puxar': this.puxar(dt, I, g, sp); break;
      case 'apanhou':
        if (this.pt > 2.4) this.seguinte();
        break;
      default:
        if (this.pt > 2) this.done();
    }
  }

  puxar(dt, I, g, sp) {
    this.el += dt;
    this.tens = clamp(this.tens + (I.action ? SOBE : -DESCE) * dt, 0, 1);
    this.za += dt * (0.9 + 0.9 * sp.force);
    if (sp.teimoso) {
      // o polvo agarra-se às pedras: a zona salta entre o fundo e o cimo e fica lá um bocado
      const alvo = Math.floor(this.za / 2.6) % 2 ? 0.7 : 0.3;
      this.zc += clamp(alvo - this.zc, -dt * 0.55, dt * 0.55);
    } else this.zc = 0.5 + (0.07 + 0.15 * sp.force) * (0.8 * Math.sin(this.za) + 0.2 * Math.sin(this.za * 1.7 + 1));
    this.inz = this.helped || Math.abs(this.tens - this.zc) <= ZONA;
    this.prog = Math.max(0, this.prog + (this.helped ? dt / 2 : this.inz ? dt / sp.need : -dt * 0.07));
    if (this.inz) { this.tick += dt; if (this.tick > 0.32) { this.tick = 0; this.sfx('click'); } }
    if (this.tens >= 0.99 && !this.helped) {
      this.strain += dt;
      if (this.strain > 0.8) {                             // linha esticada demais: o peixe ganha terreno
        this.strain = 0; this.prog = Math.max(0, this.prog - 0.15); this.tens = 0.55; this.shake = 0.4; this.sfx('buzz');
        this.hint('A linha está esticada de mais! Larga um bocadinho.');
      }
    } else this.strain = Math.max(0, this.strain - dt);
    if (!this.helped && this.el > LIMITE) { this.helped = true; this.hint(this.sk.ajuda || 'Os amigos dão uma ajuda: já vem!'); }
    if (this.prog >= 1) {
      this.fase('apanhou');
      this.fx.burst(g.tipX + 8, g.wl, 14, ['#ffffff', '#cfefff', this.sk.sea ? this.sk.sea[0] : '#7cc8f5'], 80);
      this.sfx('catchWin');
      if (!this.helped) this.heart(1, g.px + 24, g.fy - 30);
      this.hint(this.cur.cheer || `${sp.nome}!`);
    }
  }

  // Onde fica cada coisa, conforme o ecrã.
  geo(v) {
    const top = this.top(v), sk = this.sk, len = sk.len || 150;
    const wl = Math.round(Math.max(top + 62, v.h * (v.portrait ? 0.4 : 0.5)));     // linha de água
    const bx = Math.round(Math.min(v.w * 0.04, v.w * 0.56 - len));
    const px = bx + len - 22, fy = wl - (sk.deck || 6);                            // quem pesca: x e pés
    const tipX = px + 36, tipY = fy - 46, barX = v.w - 15;
    const fx = Math.round(Math.min(barX - 28, tipX + Math.max(46, (barX - tipX) * 0.6)));   // onde cai a boia
    const deep = Math.round(Math.min(v.h - 22, wl + Math.min(110, (v.h - wl) * 0.62)));
    const by1 = Math.min(v.h - 9, wl + 150), by0 = Math.max(top + 8, by1 - 130);    // a barra da tensão, perto do peixe
    return { top, wl, len, bx, px, fy, tipX, tipY, barX, fx, deep, by0, by1 };
  }

  draw(ctx, v, R) {
    const g = this.geo(v), t = this.t, sk = this.sk, sp = this.cur.sp, ph = this.ph, wl = g.wl;
    const sea = sk.sea || ['#2f8fd0', '#123a6a', '#bfe9ff'];
    if (sk.back) sk.back(ctx, v, R, t, wl); else sky(ctx, v.w, v.h, wl, ['#3a8fe0', '#bfe6fb']);
    this.mar(ctx, v, R, g, t, sea);

    // o barco e quem vai a bordo
    const bob = Math.round(Math.sin(t * 1.7) * 1.2), festa = ph === 'apanhou' || ph === 'fim';
    if (sk.boatBack) sk.boatBack(ctx, R, g.bx, wl + bob, g.len, t);
    const outros = this.crew.filter((c) => c !== this.who), x0 = g.bx + (sk.pad || 22), x1 = g.px - 28;
    outros.forEach((c, i) => {
      const x = outros.length > 1 ? lerp(x0, x1, i / (outros.length - 1)) : (x0 + x1) / 2;
      person(ctx, c.frames, x, g.fy + bob, { scale: 2, face: 1, hop: festa ? Math.round(Math.abs(Math.sin(t * 8 + i * 1.3)) * 3) : 0 });
    });
    person(ctx, this.who.frames, g.px, g.fy + bob, { scale: 2, face: 1, hop: festa ? Math.round(Math.abs(Math.sin(t * 9)) * 3) : 0 });
    if (sk.boat) sk.boat(ctx, R, g.bx, wl + bob, g.len, t);
    for (let i = 0; i < 9; i++) R(g.bx - 6 + i * ((g.len + 26) / 9) + Math.sin(t * 2 + i) * 2, wl + (i % 2), 9, 1, i % 3 ? '#ffffff' : sea[2] || '#cfefff');

    if (ph === 'fim') return;
    // a cana
    const sh = this.shake > 0 ? Math.round(Math.sin(t * 70) * 2) : 0;
    const dobra = ph === 'puxar' ? Math.round(2 + this.tens * 10) : ph === 'picada' ? 4 : 0;
    const hx = g.px + 8, hy = g.fy + bob - 22, tx = g.tipX - Math.round(dobra * 0.4), ty = g.tipY + bob + dobra + sh;
    seg(R, hx, hy, tx, ty, INK, 2); seg(R, hx, hy, tx - 6, ty + 5, '#b8793a', 1);
    const dark = mix(sea[1], '#000000', 0.25);

    if (ph === 'pronto') { this.fio(R, tx, ty, tx, ty + 12, wl, 0); this.boia(R, tx, ty + 15); }
    else if (ph === 'lancar') {
      const k = clamp(this.pt / 0.55, 0, 1), x = lerp(tx, g.fx, k), y = lerp(ty, wl, k) - Math.sin(Math.PI * k) * 26;
      this.fio(R, tx, ty, x, y, wl, 0); this.boia(R, x, y);
    } else if (ph === 'espera') {
      const k = clamp(this.pt / Math.max(0.1, this.biteAt), 0, 1);
      peixe(R, lerp(g.fx + 46, g.fx + 14, k), lerp(g.deep, wl + 16, k), sp, -1, t * 0.6, dark);
      const y = wl + Math.round(Math.sin(t * 3) * 1);
      this.fio(R, tx, ty, g.fx, y - 3, wl, 9); this.boia(R, g.fx, y);
    } else if (ph === 'picada') {
      peixe(R, g.fx + 12, wl + 14, sp, -1, t * 1.4, dark);
      const y = wl + 4 + Math.round(Math.sin(t * 30) * 1);
      this.fio(R, tx, ty, g.fx, y - 3, wl, 2); this.boia(R, g.fx, y);
      const r = 4 + Math.floor((this.pt * 14) % 8);
      R(g.fx - r - 3, wl, 3, 1, '#ffffff'); R(g.fx + r + 1, wl, 3, 1, '#ffffff');
      if (Math.floor(t * 8) % 2) mark(ctx, g.fx, wl - 8, '!');
    } else if (ph === 'puxar') {
      const k = this.prog, fxx = lerp(g.fx + 10, g.tipX + 12, k) + Math.sin(this.za * 2.3) * 5 * (1 - k);
      const fyy = lerp(g.deep, wl + 13, k) - (this.zc - 0.5) * 12 * (1 - k);
      const nx = sp.kind === 'polvo' ? fxx : fxx - sp.len / 2 - 1, ny = sp.kind === 'polvo' ? fyy - 10 : fyy;
      this.fio(R, tx, ty, nx, ny, wl, this.tens < 0.12 ? 8 : 0);
      peixe(R, fxx, fyy, sp, -1, t * (this.inz ? 0.8 : 1.6));
      for (let i = 0; i < 3; i++) { const b = (t * 0.9 + i * 0.33) % 1; R(fxx + 6 + i * 3, fyy - 4 - b * 16, 1 + (i % 2), 1 + (i % 2), '#e8f8ff'); }
      this.medidor(R, g);
    } else if (ph === 'apanhou') {
      const k = clamp(this.pt / 0.45, 0, 1), ex = g.px + 30, ey = g.fy + bob - 26;
      const x = lerp(g.tipX + 12, ex, k), y = lerp(wl + 13, ey, k) - Math.sin(Math.PI * k) * 14;
      this.fio(R, tx, ty, x, y - (sp.kind === 'polvo' ? 10 : sp.tall), wl, 0);
      peixe(R, x, y, sp, -1, t * 0.5);
      if (k >= 1) sign(ctx, this.cur.alt && this.pt > 1.25 ? this.cur.alt : sp.nome, clamp(ex + 4, 40, v.w - 40), wl + 7, { scale: 1 });
    }
  }

  // A linha de pesca (escura fora de água, clara dentro), com alguma folga quando não está tensa.
  fio(R, x0, y0, x1, y1, wl, folga) {
    const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
    for (let i = 0; i <= n; i++) {
      const k = n ? i / n : 0, y = y0 + (y1 - y0) * k + Math.sin(Math.PI * k) * folga;
      R(x0 + (x1 - x0) * k, y, 1, 1, y > wl ? '#e8f8ff' : '#3a2f4f');
    }
  }

  boia(R, x, y) {
    R(x - 2, y - 4, 5, 7, INK); R(x - 1, y - 3, 3, 3, '#ff3b3b'); R(x - 1, y, 3, 2, '#ffffff'); R(x, y - 7, 1, 3, INK);
  }

  // O mar por baixo da linha de água.
  mar(ctx, v, R, g, t, sea) {
    const n = 8, H = v.h - g.wl;
    for (let i = 0; i < n; i++) R(0, g.wl + Math.floor((i * H) / n), v.w, Math.ceil(H / n) + 1, mix(sea[0], sea[1], i / (n - 1)));
    R(0, g.wl, v.w, 1, sea[2] || '#cfefff');
    for (let i = 0; i < 12; i++) {
      const W = v.w + 30, x = (((hash(i + 3) * W + t * 7 * (i % 2 ? 1 : -1)) % W) + W) % W - 15;
      R(x, g.wl + 2 + (i % 3) * 2, 5 + (i % 3) * 4, 1, mix(sea[0], sea[2] || '#cfefff', 0.6));
    }
    // areia e pedras no fundo
    const bed = this.sk.bed || '#c9b57a';
    R(0, v.h - 6, v.w, 6, mix(bed, sea[1], 0.35));
    for (let i = 0; i < v.w / 14; i++) { const x = i * 14 + hash(i + 9) * 8, hh = 1 + Math.floor(hash(i * 3) * 3); R(x, v.h - 6 - hh, 5 + hash(i) * 6, hh, mix(bed, sea[1], 0.5)); }
    // peixinhos ao longe
    for (let i = 0; i < 4; i++) {
      const W = v.w + 40, dir = i % 2 ? 1 : -1, x = (((hash(i * 7 + 1) * W + t * (8 + i * 3) * dir) % W) + W) % W - 20;
      const y = g.wl + 14 + hash(i * 5 + 2) * Math.max(10, H - 34), c = mix(sea[1], sea[0], 0.25);
      R(x, y, 4, 2, c); R(x - 2 * dir, y - 1, 1, 4, c);
    }
    if (this.sk.under) this.sk.under(ctx, v, R, t, g.wl);
  }

  // A barra da tensão (à direita) e, ao lado, a coluna que mostra o peixe a chegar.
  medidor(R, g) {
    const bx = g.barX, y0 = g.by0, y1 = g.by1, H = y1 - y0;
    R(bx - 2, y0 - 2, 11, H + 4, INK); R(bx - 1, y0 - 1, 9, H + 2, PAPER); R(bx, y0, 7, H, '#3a2f4f');
    R(bx, y0, 7, 4, '#ff3b3b');
    const hw = this.helped ? 1 : ZONA;
    const zy0 = y1 - clamp(this.zc + hw, 0, 1) * H, zy1 = y1 - clamp(this.zc - hw, 0, 1) * H;
    R(bx, zy0, 7, zy1 - zy0, '#5cf08a'); R(bx, (zy0 + zy1) / 2, 7, 1, '#2f9f5a');
    const my = y1 - this.tens * H;
    R(bx - 4, my - 2, 15, 5, INK); R(bx - 3, my - 1, 13, 3, this.inz ? GOLD : '#ff8a4b');
    R(bx - 10, y0 - 2, 6, H + 4, INK); R(bx - 9, y0 - 1, 4, H + 2, '#22314f');
    const ph = Math.round(clamp(this.prog, 0, 1) * (H + 2));
    R(bx - 9, y1 + 1 - ph, 4, ph, MINT);
  }

  bot(I) {
    if (this.ph === 'pronto') { if (this.pt > 0.4) I.actionPressed = true; }
    else if (this.ph === 'picada') { if (this.pt > 0.2) I.actionPressed = true; }
    else if (this.ph === 'puxar') I.action = this.tens < this.zc;
  }
}
