// Nível 17 «Tomás no Rugby»: o campo da Agronomia, na Tapada da Ajuda. Aqui ficam o cenário
// (campo), a pele da «estrada» para a corrida até ao ensaio (PELE_RUGBY) e o ato dos pontapés
// de conversão (Pontape): toca-se quando o marcador está entre os postes.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, PINK, clamp, lerp, hash, sky, disc, text, person, shadow } from '../draw.js';

const VERDE = '#2f8a4a', BRANCO = '#f2f2f7', RELVA = '#4f9f52', RELVA_L = '#59ad5c';
const PELES = ['#f6c9a0', '#e0a878', '#efbd94'], CABELOS = ['#4a2f1e', '#2b2b3a', '#d8b25a', '#8a8794'], ROUPAS = [VERDE, BRANCO, VERDE, '#c0392b', '#3f6fb5'];

// Um troço de bancada com a claque (x0 = esquerda, by = base, k0 = semente). Com `festa`, saltam todos.
function bancada(R, x0, bw, by, rows, t, festa, k0 = 0) {
  R(x0 - 1, by - rows * 8 - 3, bw + 2, rows * 8 + 3, INK); R(x0, by - rows * 8 - 2, bw, rows * 8 + 2, '#8a8fa0');
  for (let r = 0; r < rows; r++) {
    const y = by - 2 - r * 8;
    R(x0, y, bw, 1, '#6a6f80');
    for (let i = 0, x = x0 + 4 + (r % 2) * 4; x < x0 + bw - 7; x += 9, i++) {
      const k = k0 + i + r * 31;
      if (hash(k * 1.3 + 0.7) < 0.18) continue;          // lugares vazios
      const up = festa ? Math.round(Math.abs(Math.sin(t * 7 + k)) * 2) : 0;
      R(x - 1, y - 3 - up, 7, 3, ROUPAS[k % 5]);
      R(x, y - 7 - up, 5, 4, PELES[k % 3]); R(x, y - 8 - up, 5, 2, CABELOS[k % 4]);
    }
  }
}

// Uma placa de publicidade à beira do campo (62 x 8).
function placa(ctx, R, x, y, i) {
  R(x, y - 1, 64, 10, INK);
  R(x + 1, y, 62, 8, i % 2 ? VERDE : BRANCO);
  text(ctx, i % 2 ? 'TAPADA DA AJUDA' : 'AGRONOMIA', x + 32, y + 2, i % 2 ? BRANCO : VERDE, { align: 'center' });
}

// Os postes (em H), com as proteções verdes e brancas na base.
function postes(R, x, gy, alto) {
  const by = gy - Math.round(alto * 0.36);
  for (const dx of [-10, 9]) {
    R(x + dx - 1, gy - alto - 1, 4, alto + 1, INK); R(x + dx, gy - alto, 2, alto, BRANCO);
    R(x + dx - 2, gy - 13, 6, 13, INK); R(x + dx - 1, gy - 12, 4, 12, VERDE); R(x + dx - 1, gy - 8, 4, 3, BRANCO);
  }
  R(x - 10, by - 1, 21, 4, INK); R(x - 9, by, 19, 2, BRANCO);
  return by;
}

// A bola de rugby (oval), com o centro em (x, y); `rot` alterna a forma, para parecer que roda.
function bola(R, x, y, rot = 0) {
  x = Math.round(x); y = Math.round(y);
  if (rot % 2) { R(x - 2, y - 4, 5, 8, INK); R(x - 1, y - 3, 3, 6, '#f2ede2'); R(x, y - 1, 1, 2, '#c8452f'); }
  else { R(x - 4, y - 2, 8, 5, INK); R(x - 3, y - 1, 6, 3, '#f2ede2'); R(x - 1, y, 2, 1, '#c8452f'); }
}

// O campo visto da linha lateral: céu, as árvores da Tapada, a bancada, as placas e o relvado.
// o: { gy, top, fy (linha lateral do fundo), tarde, festa }.
export function campo(ctx, v, R, t, o) {
  const w = v.w, P = v.portrait, fy = o.fy || o.gy - (P ? 64 : 40);
  sky(ctx, w, v.h, fy, o.tarde ? ['#4a5aa8', '#c87a9a', '#f8b07a', '#ffe0a0'] : ['#5aa6e8', '#9fd0f4', '#d8eef8']);
  const ty = fy - (P ? 46 : 32), A = o.tarde ? '#35704a' : '#3f8a4a', B = o.tarde ? '#42805a' : '#4f9f52';
  for (let i = 0; i < w / 22 + 1; i++) { const r = 10 + Math.round(hash(i + 2) * 6); disc(ctx, i * 22 + 6, ty - r + 8, r, hash(i * 3) > 0.5 ? A : B); }
  R(0, ty, w, fy - ty, A);
  bancada(R, Math.round(w * 0.08), Math.round(w * 0.84), fy - 10, P ? 4 : 3, t, o.festa);
  for (let x = Math.round((w % 64) / 2) - 64, i = 0; x < w; x += 64, i++) placa(ctx, R, x, fy - 9, i);
  R(0, fy, w, v.h - fy, RELVA);
  for (let x = 0; x < w; x += 48) R(x, fy, 24, v.h - fy, RELVA_L);
  R(0, fy, w, 2, BRANCO);
  return fy;
}

// Fundo para o ato Talk: o campo ao fim da tarde (treino) ou de dia (jogo).
export const fundoTreino = (ctx, v, R, t, act) => { campo(ctx, v, R, t, { gy: act.ground(v), top: act.top(v), tarde: true }); };
export const fundoJogo = (ctx, v, R, t, act) => {
  const gy = act.ground(v), fy = campo(ctx, v, R, t, { gy, top: act.top(v), festa: true });
  postes(R, Math.round(v.w * 0.9), fy + 8, Math.min(v.portrait ? 90 : 62, fy - act.top(v)));
};

// ---------- A corrida para o ensaio (pele da «estrada») ----------
const PLACAGEM = ['Placagem! Levanta-te e segue, Tomás!', 'Inês: «Isso não foi nada! Força, Tomás!»', 'Mais uma placagem... O rugby é mesmo assim!'];

export const PELE_RUGBY = {
  intro: 'O Tomás tem a bola! Toca para mudar de corredor: foge às placagens e apanha os corações.',
  arrive: 'ENSAIO! O Tomás mergulha para lá da linha... e a Inês quase salta a vedação!',

  start(act) {
    act.mem.tomas = getCharacter('tomas', 'rugby');
    act.mem.ines = getCharacter('ines', 'casual');
    act.mem.adv = [getCharacter('adversario'), getCharacter('adversario', 'b')];
  },
  bump(act) { act.hint('Lama! O Tomás salta a poça... e fica salpicado até às orelhas.'); },

  back(ctx, R, a) {
    const y0 = a.roadTop, m = a.act.mem, fim = a.act.mode === 'arrive';
    sky(ctx, a.w, a.h, y0, ['#5aa6e8', '#9fd0f4', '#d8eef8']);
    // as árvores da Tapada, lá atrás (passam devagar)
    const ty = y0 - 34, off = a.cam * 0.25;
    for (let i = -1; i < a.w / 26 + 2; i++) {
      const k = Math.floor(off / 26) + i, r = 11 + Math.round(hash(k + 2) * 5);
      disc(ctx, Math.round(i * 26 - (off % 26)) + 13, ty - r + 7, r, hash(k * 3) > 0.5 ? '#3f8a4a' : '#4f9f52');
    }
    R(0, ty, a.w, y0 - ty, '#3f8a4a');
    // troços de bancada, com a claque
    const cam = Math.round(a.cam);
    for (let i = Math.floor(cam / 170) - 1; i <= Math.floor((cam + a.w) / 170) + 1; i++) bancada(R, i * 170 - cam + 20, 118, y0 - 11, 3, a.t, fim, i * 97);
    // a Inês, a correr ao longo da vedação, a puxar pelo Tomás
    const ix = a.cx + 44, hop = fim ? Math.round(Math.abs(Math.sin(a.t * 9)) * 4) : 0;
    person(ctx, m.ines, ix, y0 - 1, { scale: 2, face: fim ? -1 : 1, moving: !fim, dist: a.act.dist * 0.3, hop });
    // as placas de publicidade (tapam-lhe as pernas)
    for (let i = Math.floor(cam / 64) - 1; i <= Math.floor((cam + a.w) / 64) + 1; i++) placa(ctx, R, i * 64 - cam, y0 - 9, ((i % 2) + 2) % 2);
  },

  road(ctx, R, a) {
    const y0 = a.roadTop, off = ((Math.round(a.cam) % 48) + 48) % 48;
    R(0, y0, a.w, a.h - y0, RELVA);
    for (let x = -off; x < a.w; x += 48) R(x, y0, 24, a.h - y0, RELVA_L);
    R(0, y0, a.w, 2, BRANCO);
  },

  vehicle: {
    w: 24, h: 46, back: 18,
    draw(ctx, R, x, y, a, act) {
      const f = act.mem.tomas;
      if (act.mode === 'arrive') {
        // o mergulho para o ensaio: deitado na relva, de bola bem agarrada à frente
        ctx.save(); ctx.translate(x + 4, y - 11); ctx.rotate(Math.PI / 2); ctx.drawImage(f.a.r, -16, -24, 32, 48); ctx.restore();
        bola(R, x + 31, y - 6);
        return;
      }
      R(x - 9, y - 1, 18, 2, 'rgba(20,50,20,0.35)');
      person(ctx, f, x, y, { scale: 2, face: 1, moving: true, dist: act.dist * 0.3 });
      bola(R, x + 6, y - 20);
    },
  },

  obs: {
    // um adversário de braços abertos, pronto a placar
    placador: {
      w: 22, h: 46, msg: PLACAGEM,
      draw(ctx, R, x, y, o, a) {
        const f = a.act.mem.adv[Math.floor(o.at * 2) % 2];
        if (o.hit) {
          // ficou para trás, estendido na relva
          ctx.save(); ctx.translate(x, y - 11); ctx.rotate(-Math.PI / 2); ctx.drawImage(f.stand.l, -16, -24, 32, 48); ctx.restore();
          return;
        }
        const b = Math.round(Math.abs(Math.sin(a.t * 6 + o.at)) * 2);
        R(x - 9, y - 1, 18, 2, 'rgba(20,50,20,0.35)');
        person(ctx, f, x, y, { scale: 2, face: -1, hop: b });
        // os braços abertos
        R(x - 17, y - 25 - b, 8, 4, INK); R(x - 16, y - 24 - b, 6, 2, '#2a3358'); R(x - 18, y - 25 - b, 3, 4, INK); R(x - 17, y - 24 - b, 2, 2, '#f6c9a0');
      },
    },
    // uma poça de lama: não custa nada, mas salta-se
    poca: {
      w: 30, h: 6, soft: true,
      draw(ctx, R, x, y, o, a) {
        const cy = a.roadTop + 22;
        R(x - 16, cy - 2, 32, 14, '#6b4a2e'); R(x - 20, cy + 1, 40, 8, '#6b4a2e'); R(x - 12, cy, 20, 2, '#8a6a48'); R(x - 6, cy + 6, 14, 1, '#57391f');
        R(x + 6, cy + 3, 5, 1, '#a8c8e0');
      },
    },
  },

  props: {
    // uma linha do campo, com a bandeirinha e o número
    linha(ctx, R, x, a, p) {
      R(x, a.roadTop, 2, a.h - a.roadTop, BRANCO);
      R(x, a.roadTop - 16, 1, 16, INK); R(x + 1, a.roadTop - 16, 7, 5, GOLD);
      if (p.label) { R(x - 9, a.roadBot + 5, 20, 9, INK); text(ctx, p.label, x + 1, a.roadBot + 7, PAPER, { align: 'center' }); }
    },
    // a linha de ensaio, a área de validação e os postes
    postes(ctx, R, x, a) {
      R(x, a.roadTop, a.w, a.h - a.roadTop, '#3f8f48');
      for (let k = 0; k < 8; k++) R(x + 6 + k * 14, a.roadTop + 4 + (k % 3) * 12, 8, 1, '#59ad5c');
      R(x, a.roadTop, 3, a.h - a.roadTop, BRANCO);
      postes(R, x + 2, a.roadTop + 2, Math.min(70, a.roadTop - a.top - 2));
    },
  },
};

// O percurso do jogo: placadores, poças de lama e cinco corações até à linha de ensaio.
export const JOGO = {
  secs: 30,
  course: [
    { at: 1.4, say: 'Inês: «Vai, Tomás! Essa bola é tua!»' },
    { at: 3.6, obs: 'placador', lane: 0 }, { at: 5.2, heart: 1 },
    { at: 7, obs: 'placador', lane: 1 }, { at: 8.6, heart: 0 },
    { at: 9.4, prop: 'linha', label: 'MEIO' },
    { at: 10.4, obs: 'poca' },
    { at: 12, obs: 'placador', lane: 0 }, { at: 13.6, heart: 1 },
    { at: 15.4, obs: 'placador', lane: 1 },
    { at: 17, prop: 'linha', label: '22' }, { at: 16.6, say: 'Inês: «Linha dos 22! Já falta pouco!»' },
    { at: 18.4, obs: 'placador', lane: 0 }, { at: 20, heart: 1 },
    { at: 21.6, obs: 'placador', lane: 1 },
    { at: 23, obs: 'poca' },
    { at: 24.4, obs: 'placador', lane: 0 }, { at: 26, heart: 0 },
    { at: 27.6, obs: 'placador', lane: 1 },
    { at: 30.25, prop: 'postes' },
  ],
};

// ---------- Os pontapés de conversão ----------
const BOAS = ['Entre os postes! A bancada da Agronomia levanta-se.', 'Outra vez lá dentro! Inês: «É o meu filho!»', 'Três em três! Pé de ouro, o do Tomás.'];
const ZONAS = [0.34, 0.26, 0.2];

export class Pontape extends Act {
  get max() { return this.cfg.hearts || 3; }

  start() {
    this.tomas = getCharacter('tomas', 'rugby');
    this.ines = getCharacter('ines', 'casual');
    this.n = 0; this.good = 0; this.res = [];
    this.fase = 'mira'; this.ft = 0; this.idle = 0;
    this.pos = 0; this.dir = 1; this.ok = false; this.err = 0;
    this.hint('Pontapé de conversão! Toca quando o marcador estiver entre os postes (na zona verde).');
  }

  zona() { return ZONAS[Math.min(this.n, ZONAS.length - 1)]; }

  lay(v) {
    const P = v.portrait, top = this.top(v), gy = Math.round(v.h * (P ? 0.72 : 0.8)), fy = gy - (P ? 64 : 38);
    const px = Math.round(v.w * (P ? 0.8 : 0.82)), alto = Math.min(P ? 96 : 74, gy - top - 4);
    return { P, top, gy, fy, kx: Math.round(v.w * (P ? 0.2 : 0.18)), px, alto, barra: gy - Math.round(alto * 0.36), ix: Math.round(v.w * 0.5) };
  }

  update(dt, I, v) {
    const L = this.lay(v);
    this.ft += dt;
    if (this.fase === 'mira') {
      this.pos += this.dir * dt * (0.85 + this.n * 0.25);
      if (this.pos >= 1) { this.pos = 1; this.dir = -1; } else if (this.pos <= 0) { this.pos = 0; this.dir = 1; }
      this.idle += dt;
      // sem toques durante muito tempo, o Tomás chuta sozinho (ao lado)
      if ((I.actionPressed && this.ft > 0.3) || this.idle > 9) {
        this.err = this.pos - 0.5;
        this.ok = !!I.actionPressed && Math.abs(this.err) <= this.zona() / 2;
        this.fase = 'corre'; this.ft = 0; this.idle = 0;
        this.sfx('click');
      }
    } else if (this.fase === 'corre') {
      if (this.ft > 0.45) { this.fase = 'voo'; this.ft = 0; this.sfx('toc'); }
    } else if (this.fase === 'voo') {
      if (this.ft > 1.1) {
        this.fase = 'res'; this.ft = 0;
        this.res.push(this.ok);
        if (this.ok) {
          this.good++;
          this.heart(1, L.px, L.barra - 16);
          this.sfx('check');
          this.fx.burst(L.px, L.barra - 14, 14, [GOLD, PAPER, PINK], 70);
          this.hint(BOAS[Math.min(this.good - 1, BOAS.length - 1)]);
        } else {
          this.sfx('buzz');
          this.hint(this.err < 0 ? 'Saiu curto, ao lado do poste... A Inês aplaude na mesma!' : 'Com força de mais, ao lado do poste... A Inês aplaude na mesma!');
        }
      }
    } else if (this.fase === 'res') {
      if (this.ft > 1.8) {
        this.n++;
        if (this.n >= 3) {
          this.fase = 'fim'; this.ft = 0;
          this.sfx('win');
          this.hint(this.good ? 'Apito final! Vitória da Agronomia, com os pontapés do Tomás.' : 'Apito final! Os pontapés não entraram, mas o jogo foi um espetáculo.');
        } else {
          this.fase = 'mira'; this.ft = 0; this.pos = 0; this.dir = 1;
          this.hint('Mais um ensaio da Agronomia! Toca com o marcador entre os postes.');
        }
      }
    } else if (this.ft > 2.6 || (this.ft > 1.2 && I.actionPressed)) this.done();
  }

  draw(ctx, v, R) {
    const L = this.lay(v), t = this.t, gy = L.gy, festa = (this.fase === 'res' && this.ok) || (this.fase === 'fim' && this.good > 0);
    campo(ctx, v, R, t, { gy, top: L.top, fy: L.fy, festa });
    // a Inês, junto à linha lateral, a torcer
    const iy = L.fy + 8;
    shadow(ctx, L.ix, iy, 14);
    person(ctx, this.ines, L.ix, iy, { scale: 2, face: this.fase === 'mira' || this.fase === 'corre' ? -1 : 1, hop: festa ? Math.round(Math.abs(Math.sin(t * 9)) * 5) : 0 });
    postes(R, L.px, gy, L.alto);
    // o Tomás: dois passos de balanço e o pontapé
    const recuo = 14, chuta = this.fase === 'corre';
    const tx = this.fase === 'mira' ? L.kx - recuo : chuta ? L.kx - recuo + Math.round(clamp(this.ft / 0.45, 0, 1) * recuo) : L.kx;
    shadow(ctx, tx, gy, 14);
    person(ctx, this.tomas, tx, gy, { scale: 2, face: 1, moving: chuta, dist: this.ft * 70, hop: festa ? Math.round(Math.abs(Math.sin(t * 8)) * 3) : 0 });
    // a bola: no suporte, no ar e depois a cair
    const x0 = L.kx + 15, y0 = gy - 5;
    const x1 = this.ok ? L.px + Math.round(this.err * 24) : L.px + (this.err < 0 ? -25 : 27), y1 = this.ok ? L.barra - 15 : L.barra - 4;
    if (this.fase === 'mira' || this.fase === 'corre') { R(x0 - 2, gy - 2, 5, 2, '#e0572f'); bola(R, x0, y0, 1); }
    else if (this.fase === 'voo') {
      const p = clamp(this.ft / 1.1, 0, 1);
      bola(R, lerp(x0, x1, p), lerp(y0, y1, p) - Math.sin(p * Math.PI) * (L.P ? 54 : 30), Math.floor(this.ft * 12));
    } else if (this.fase === 'res' && this.ft < 0.9) {
      const p = this.ft / 0.9, y = y1 + p * p * (gy - 6 - y1);
      if (!this.ok || p < 0.5) bola(R, x1 + p * 14, y, Math.floor(this.ft * 10));
    }
    // os três pontapés: uma bola por cada, verde se entrou
    for (let k = 0; k < 3; k++) {
      const bx = 10 + k * 13, by = L.top + 9;
      R(bx - 5, by - 4, 11, 9, INK);
      R(bx - 4, by - 3, 9, 7, k < this.res.length ? (this.res[k] ? '#5cf08a' : '#9a93ad') : k === this.n && Math.floor(t * 3) % 2 ? GOLD : PAPER);
    }
    // o marcador: a zona verde é o espaço entre os postes
    if (this.fase === 'mira' || this.fase === 'corre') {
      const mw = Math.min(150, v.w - 44), mx = Math.round((v.w - mw) / 2), my = L.P ? gy + 30 : Math.min(v.h - 13, gy + 14), z = this.zona();
      R(mx - 2, my - 2, mw + 4, 10, INK); R(mx, my, mw, 6, '#3a3f55');
      R(mx + Math.round(mw * (0.5 - z / 2)), my, Math.round(mw * z), 6, '#5cf08a');
      for (const e of [0.5 - z / 2, 0.5 + z / 2]) { const ex = mx + Math.round(mw * e); R(ex - 2, my - 8, 4, 15, INK); R(ex - 1, my - 7, 2, 13, BRANCO); }
      const px = mx + Math.round(mw * this.pos);
      R(px - 3, my - 7, 7, 5, INK); R(px - 2, my - 6, 5, 3, GOLD); R(px - 1, my - 3, 3, 10, INK); R(px, my - 3, 1, 9, GOLD);
    }
  }

  // O robô: chuta com o marcador bem dentro da zona verde.
  bot(I) {
    if (this.fase === 'mira' && this.ft > 0.35 && Math.abs(this.pos - 0.5) < this.zona() / 2 - 0.04) I.actionPressed = true;
    else if (this.fase === 'fim' && this.ft > 1.3) I.actionPressed = true;
  }
}
