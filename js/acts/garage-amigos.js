// Nível 5, na pista cheia e escura do Paradise Garage: encontrar os amigos todos. O foco de luz
// vai passando de pessoa em pessoa; toca-se (ou Espaço) quando ilumina um amigo da Inês.
// Quem é encontrado fica iluminado, a dançar. Nunca se perde: ao fim de algum tempo, os que
// faltam vêm ter com o grupo.
import { Act } from './base.js';
import { getCharacter, LOOKS } from '../sprites.js';
import { INK, PAPER, GOLD, clamp, lerp, shadow, sign, mark } from '../draw.js';
import { pistaBg, beam, tint, extra } from './garage-cenario.js';

const FRIENDS = [
  ['ana', 'Ana', 'Ana: «Inês! Finalmente!»'],
  ['maisa', 'Maísa', 'Maísa: «Estava aqui mesmo ao lado!»'],
  ['soft', 'Soft', 'Soft: «Anda dançar connosco!»'],
  ['isabel', 'Isabel', 'Isabel: «Já me tinha perdido de vocês!»'],
  ['mi', 'Mi', 'Mi: «Esta pista é nossa!»'],
  ['maria', 'Maria', 'Maria: «Já cá estamos todas?»'],
  ['tete', 'Tété', 'Tété: «Que noite!»'],
  ['pipoca', 'Pipoca', 'Pipoca: «Guardei-vos um lugar na pista!»'],
  ['lourenco', 'Lourenço', 'Lourenço: «Andava à tua procura, Inês.»'],
];
const DARK = '#0e0820';
const LIMIT = 55;      // segundos

export class GarageAmigos extends Act {
  get max() { return this.cfg.hearts || 5; }

  start() {
    // 16 lugares na pista: a Inês (lugar fixo), os 9 amigos e 6 desconhecidos, baralhados
    const who = FRIENDS.map(([key, name, line]) => ({ kind: 'friend', name, line, frames: getCharacter(key, 'night'), fem: LOOKS[key].def === LOOKS.ines.def, found: false }));
    for (let k = 0; k < 6; k++) who.push({ kind: 'extra', frames: extra(k), found: false });
    for (let i = who.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [who[i], who[j]] = [who[j], who[i]]; }
    this.spots = who;
    this.ines = getCharacter('ines', 'night');
    this.friends = who.filter((p) => p.kind === 'friend').sort((a, b) => FRIENDS.findIndex((f) => f[1] === a.name) - FRIENDS.findIndex((f) => f[1] === b.name));
    this.cur = -1; this.from = null;
    this.phase = 'wait'; this.pt = 0.8;     // wait → move → dwell → move ...
    this.found = 0;
    this.clock = 0; this.lock = 0; this.oops = 0;
    this.over = 0;
    this.hint('Toca quando o foco de luz iluminar um amigo da Inês!');
  }

  // Onde fica cada lugar (k de 0 a 15; o 16.º lugar, o da Inês, é o do meio da fila da frente).
  layout(v) {
    const top = this.top(v), P = v.portrait, cols = P ? 4 : 8, rows = P ? 4 : 2;
    const y0 = P ? top + 78 : Math.round(v.h * 0.66), y1 = v.h - (P ? 40 : 24);
    const pos = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = Math.round(((c + 0.5 + (r % 2 ? 0.2 : -0.2)) * v.w) / cols);
        pos.push({ x, y: Math.round(lerp(y0, y1, rows > 1 ? r / (rows - 1) : 1)) });
      }
    }
    // a Inês fica no lugar do meio da última fila; os outros 15 ocupam os restantes
    const mine = (rows - 1) * cols + Math.floor(cols / 2);
    const me = pos.splice(mine, 1)[0];
    return { pos, me, floor: y0 - (P ? 58 : 34) };
  }

  dwell() { return clamp(1.5 - this.found * 0.05, 1.05, 1.5); }

  pick() {
    const left = this.spots.map((p, i) => i).filter((i) => !this.spots[i].found && i !== this.cur);
    const fr = left.filter((i) => this.spots[i].kind === 'friend'), ex = left.filter((i) => this.spots[i].kind === 'extra');
    const pool = fr.length && (Math.random() < 0.62 || !ex.length) ? fr : ex.length ? ex : fr;
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : this.cur;
  }

  update(dt, I, v) {
    if (this.over) {
      this.over += dt;
      if (this.over > 4.2 || (this.over > 1.6 && I.actionPressed)) this.done();
      return;
    }
    this.clock += dt;
    this.lock = Math.max(0, this.lock - dt);
    this.oops = Math.max(0, this.oops - dt);
    this.pt -= dt;
    if (this.pt <= 0) {
      if (this.phase === 'dwell' || this.phase === 'wait') {
        this.from = this.cur; this.cur = this.pick(); this.phase = 'move'; this.pt = 0.38;
      } else { this.phase = 'dwell'; this.pt = this.dwell(); }
    }
    if (I.actionPressed && this.lock <= 0 && this.cur >= 0) {
      const p = this.spots[this.cur], lit = this.phase === 'dwell' || (this.phase === 'move' && this.pt < 0.12);
      if (lit && p.kind === 'friend' && !p.found) this.find(p, v);
      else if (lit && p.kind === 'extra') {
        this.sfx('toc'); this.lock = 0.5; this.oops = 0.7;
        this.hint('Esse não é do grupo! Espera que a luz ilumine um amigo.');
      }
    }
    if (this.found >= FRIENDS.length || this.clock > LIMIT) this.finish();
  }

  find(p, v) {
    const { pos } = this.layout(v), at = pos[this.cur];
    p.found = true;
    this.found++;
    this.sfx('pop');
    this.fx.burst(at.x, at.y - 30, 10, [GOLD, PAPER, '#ff5d8f'], 60);
    // um coração a cada dois amigos (e outro com o último)
    if (this.found % 2 === 0 || this.found === FRIENDS.length) this.heart(1, at.x, at.y - 50);
    this.hint(p.line);
    this.phase = 'dwell'; this.pt = 0.7;
  }

  finish() {
    const all = this.found >= FRIENDS.length;
    for (const p of this.spots) if (p.kind === 'friend') p.found = true;
    this.over = 0.01;
    this.sfx('win');
    this.hint(all ? 'O grupo todo junto na pista do Garage!' : 'Os que faltavam vieram ter contigo: o grupo todo junto na pista!');
  }

  draw(ctx, v, R) {
    const t = this.t, top = this.top(v), { pos, me, floor } = this.layout(v);
    const beat = t * 2.07, b = Math.floor(beat), pulse = Math.max(0, 1 - (beat - b) * 3), party = this.over > 0;
    pistaBg(ctx, v, R, t, { gy: floor, top, beat, pulse, dim: party ? 0.15 : 0.5 });
    // foco de luz: de onde está para onde vai
    let sx = -99, sy = 0, lit = -1;
    if (this.cur >= 0 && !party) {
      const a = pos[this.cur], f = this.from !== null && this.from >= 0 ? pos[this.from] : { x: v.w / 2, y: top };
      const k = this.phase === 'move' ? 1 - clamp(this.pt / 0.38, 0, 1) : 1, e = k * k * (3 - 2 * k);
      sx = lerp(f.x, a.x, e); sy = lerp(f.y, a.y, e);
      if (this.phase === 'dwell' || k > 0.7) lit = this.cur;
      beam(R, v.w / 2, top - 6, sx, sy - 22, 5, 40, 'rgba(255,244,190,0.16)');
      for (let j = -5; j <= 5; j++) { const hw = Math.round(Math.sqrt(1 - (j * j) / 30) * 22); R(sx - hw, sy - 2 + j, hw * 2, 1, 'rgba(255,244,190,0.3)'); }
    }
    // pessoas, de trás para a frente (a Inês incluída)
    const all = this.spots.map((p, i) => ({ p, at: pos[i], i }));
    all.push({ p: null, at: me, i: -1 });
    all.sort((a, c) => a.at.y - c.at.y);
    for (const { p, at, i } of all) {
      const on = !p || p.found || i === lit;
      const dance = !p || p.found || party;
      const leg = dance ? ((b + i) % 2 ? 'a' : 'b') : 'stand', dir = Math.floor((b + i * 3) / 2) % 2 ? 'l' : 'r';
      const frames = p ? p.frames : this.ines, img = frames[leg][dir];
      const hop = dance ? Math.round(pulse * 3) : Math.round(Math.abs(Math.sin(t * 2 + i * 1.3)) * 1.4);
      shadow(ctx, at.x, at.y, 14);
      ctx.drawImage(on ? img : tint(img, DARK), at.x - 16, at.y - 48 - hop, 32, 48);
      if (!p) continue;
      if (i === lit && !p.found && p.kind === 'friend') sign(ctx, p.name, at.x, at.y - 62, { color: GOLD, bg: '#3a1a4f' });
      if (i === lit && p.kind === 'extra' && this.oops > 0) mark(ctx, at.x, at.y - 50, '?', '#3f6fb5');
    }
    // quem falta encontrar: as caras dos 9 amigos, em baixo
    const n = this.friends.length, gap = Math.min(14, Math.floor((v.w - 8) / n)), x0 = Math.round((v.w - n * gap) / 2), y = v.h - 14;
    R(x0 - 3, y - 2, n * gap + 5, 15, 'rgba(14,8,32,0.8)');
    this.friends.forEach((p, k) => {
      const img = p.frames.stand.r, sy0 = p.fem ? 3 : 1;
      ctx.drawImage(p.found ? img : tint(img, '#4a4468'), 2, sy0, 12, 11, x0 + k * gap, y, 12, 11);
      if (p.found) { R(x0 + k * gap + 8, y + 8, 4, 4, INK); R(x0 + k * gap + 9, y + 9, 2, 2, '#5cf08a'); }
    });
  }

  bot(I) {
    if (this.over) { if (this.over > 1.8) I.actionPressed = true; return; }
    const p = this.cur >= 0 ? this.spots[this.cur] : null;
    if (p && this.phase === 'dwell' && p.kind === 'friend' && !p.found && this.pt < this.dwell() - 0.3 && this.lock <= 0) I.actionPressed = true;
  }
}
