// Pele da «estrada» para o nível 1: Lisboa, um sábado de 1986. O Tio ao volante de um pequeno
// utilitário quadradão, com a Tia Fátima ao lado em trabalho de parto («Ai!»), a caminho da
// maternidade: buracos, pombos, lombas e um elétrico amarelo pelo caminho.
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, sign, person } from '../draw.js';
import { cidade, road, roda, cabeca, balao } from './estrada.js';
import { TIO } from '../nomes.js';

const RED = '#d8433f', RED_D = '#a82f38', RED_L = '#f27a66';

function pombo(R, x, y, peck, wing) {
  R(x - 4, y - 6, 8, 6, INK); R(x - 3, y - 5, 6, 4, '#9aa6c8'); R(x - 3, y - 3, 4, 2, '#7a86a8');
  const hy = y - 9 + (peck ? 4 : 0);
  R(x + 2, hy, 4, 4, INK); R(x + 3, hy + 1, 2, 2, '#b8c2e0'); R(x + 5, hy + 2, 2, 1, '#ff8a4b'); R(x + 3, hy + 3, 2, 1, '#4fb888');
  if (wing < 0) { R(x - 2, y, 1, 1, '#ff8a4b'); R(x + 1, y, 1, 1, '#ff8a4b'); }
  else R(x - 3, wing ? y - 9 : y - 3, 5, 2, '#e4e8f4');
}

export const peleNascimento = {
  intro: 'Toca para mudar de faixa: foge aos buracos e ao elétrico e apanha os corações!',
  arrive: 'Chegaram à maternidade! A Inês está quase, quase a nascer...',

  start(act) {
    const m = act.mem;
    m.tio = getCharacter('tio', 'casual');
    m.tia = getCharacter('tiafatima', 'casual');
    m.parteira = getCharacter('parteira');
    m.ai = 0;          // tempo do balão «AI!»
    m.next = 4.6;      // próxima contração
  },

  // as contrações: de vez em quando, um «AI!» e o carro abana
  update(act, dt) {
    const m = act.mem;
    if (m.ai > 0) m.ai -= dt;
    if (act.mode === 'run' && act.time >= m.next) { m.next += 6.2; m.ai = 1.3; act.sfx('chirp'); }
  },
  bump(act) { act.mem.ai = 0.9; },
  crash(act) { act.mem.ai = 0.9; },

  back(ctx, R, a) { cidade(false).back(ctx, R, a); },
  front(ctx, R, a) { cidade(false).front(ctx, R, a); },

  // a estrada, com os carris do elétrico na faixa de cima
  road(ctx, R, a) {
    road(ctx, R, a);
    for (const y of [a.roadTop + 8, a.roadTop + 14]) { R(0, y, a.w, 1, '#3f3f4a'); R(0, y + 1, a.w, 1, '#a4a4b0'); }
  },

  vehicle: {
    w: 48, h: 29,
    draw(ctx, R, x, y, a, act) {
      const m = act.mem;
      if (m.ai > 0) x += Math.round(Math.sin(a.t * 50));
      R(x - 23, y - 1, 46, 2, 'rgba(20,14,30,0.3)');
      // habitáculo quadradão, com um vidro grande
      R(x - 20, y - 29, 33, 15, INK);
      R(x - 19, y - 28, 31, 14, RED); R(x - 19, y - 28, 31, 1, RED_L);
      R(x - 16, y - 26, 26, 12, INK); R(x - 15, y - 25, 24, 11, '#c4e6f2');
      // lá dentro: a Tia Fátima e o Tio, agarrado ao volante
      cabeca(ctx, m.tia, x - 9, y - 14);
      cabeca(ctx, m.tio, x + 3, y - 14);
      R(x + 8, y - 20, 1, 6, INK); R(x + 7, y - 20, 3, 1, INK);
      R(x - 14, y - 25, 5, 1, '#ffffff'); R(x - 14, y - 24, 2, 1, '#ffffff');
      // carroçaria
      R(x - 25, y - 16, 50, 13, INK);
      R(x - 24, y - 15, 48, 11, RED); R(x - 24, y - 15, 48, 1, RED_L);
      R(x - 24, y - 10, 48, 1, '#3a2030');                               // friso lateral
      R(x - 24, y - 8, 48, 4, RED_D);
      R(x - 3, y - 14, 1, 9, RED_D); R(x - 1, y - 13, 3, 1, INK);         // porta e puxador
      R(x + 22, y - 14, 2, 3, '#ffe9a0'); R(x - 24, y - 14, 1, 3, '#ffb0a0');
      R(x - 26, y - 8, 3, 3, '#4a4458'); R(x + 23, y - 8, 3, 3, '#4a4458');   // para-choques
      R(x - 19, y - 9, 10, 6, INK); R(x + 9, y - 9, 10, 6, INK);
      roda(R, x - 14, y - 4, act.dist); roda(R, x + 14, y - 4, act.dist);
      // fumo do escape
      if (act.mode === 'run') { const k = Math.floor(a.t * 8) % 3; R(x - 29 - k * 3, y - 6 - k, 2 + k, 2, 'rgba(255,255,255,0.6)'); }
      // o Tio a suar e a Tia Fátima a queixar-se
      if (Math.floor(a.t * 2.5) % 2) { R(x + 11, y - 30, 1, 2, '#8fd0f5'); R(x + 13, y - 32, 1, 2, '#8fd0f5'); }
      if (m.ai > 0) balao(ctx, R, 'AI!', x - 10, y - 32);
    },
  },

  obs: {
    buraco: {
      w: 18, h: 8, msg: ['Tia Fátima: «Ai! Esse buraco era para desviar, querido.»', `${TIO}: «Outro buraco?! Esta rua é um queijo suíço!»`],
      draw(ctx, R, x, y) {
        R(x - 11, y - 7, 22, 7, '#efe8d8');
        R(x - 10, y - 6, 20, 6, INK); R(x - 8, y - 5, 16, 4, '#120c1a'); R(x - 6, y - 5, 5, 1, '#3a3446');
        R(x - 13, y - 3, 3, 2, '#b8b8c4'); R(x + 11, y - 5, 3, 2, '#b8b8c4'); R(x + 3, y - 9, 3, 2, '#b8b8c4');
      },
    },
    pombos: {
      w: 20, h: 10, msg: [`${TIO}: «Xô, pombos! Xô! Temos pressa!»`, 'Tia Fátima: «Os pombos estavam primeiro, querido.»'],
      draw(ctx, R, x, y, o, a) {
        const fly = o.hit ? a.t - o.hit : 0;
        for (let k = 0; k < 3; k++) {
          let px = x - 9 + k * 9, py = y - (k === 1 ? 4 : 0);
          if (fly) { px -= Math.round(fly * (26 + k * 14)); py -= Math.round(fly * (48 + k * 12)); }
          pombo(R, px, py, !fly && Math.floor(a.t * 3 + k * 1.3) % 3 === 0, fly ? Math.floor(a.t * 12 + k) % 2 : -1);
        }
      },
    },
    eletrico: {
      w: 46, h: 34, msg: 'Tia Fátima: «O elétrico não se desvia, querido. Desvia-te tu.»',
      draw(ctx, R, x, y) {
        R(x - 24, y - 32, 48, 30, INK);
        R(x - 23, y - 31, 46, 3, '#d8d4c4');
        R(x - 23, y - 28, 46, 12, '#f6f0de');
        for (let k = 0; k < 5; k++) { R(x - 21 + k * 9, y - 26, 7, 8, '#4a6a8a'); R(x - 21 + k * 9, y - 26, 3, 3, '#9cc4e0'); }
        R(x - 23, y - 16, 46, 13, '#ffd23e'); R(x - 23, y - 16, 46, 1, '#fff2a8'); R(x - 23, y - 8, 46, 1, '#c8981e'); R(x - 23, y - 5, 46, 2, '#e0b020');
        R(x + 20, y - 12, 2, 3, '#ffffff'); R(x - 22, y - 12, 2, 3, '#ff8a6a');
        R(x - 2, y - 14, 5, 9, '#c8981e'); R(x - 1, y - 13, 3, 7, '#ffd23e');
        R(x - 19, y - 3, 9, 3, INK); R(x + 10, y - 3, 9, 3, INK); R(x - 23, y, 46, 1, 'rgba(20,14,30,0.3)');
        for (let k = 0; k < 8; k++) R(x + 2 - k * 2, y - 33 - k, 2, 1, INK);     // a vara
      },
    },
    lomba: {
      w: 8, soft: true,
      draw(ctx, R, x, y, o, a) {
        for (let k = 0; k < 9; k++) R(x - 3, a.roadTop + 2 + k * 4, 6, 4, k % 2 ? INK : '#ffd23e');
        R(x + 3, a.roadTop + 2, 1, 36, 'rgba(0,0,0,0.3)');
      },
    },
  },

  props: {
    // a maternidade, com a parteira já à porta
    maternidade(ctx, R, x, a) {
      const b = a.roadTop - 8, m = a.act.mem;
      R(x - 47, b - 78, 94, 78, INK);
      R(x - 46, b - 77, 92, 77, '#f6f1e6');
      R(x - 48, b - 80, 96, 5, '#c2603a'); R(x - 48, b - 80, 96, 1, '#e28c5c');
      for (let f = 0; f < 2; f++) for (let k = 0; k < 5; k++) {
        const wx = x - 41 + k * 18, wy = b - 70 + f * 16;
        R(wx, wy, 10, 12, '#d8d0c0'); R(wx + 1, wy + 1, 8, 10, '#6a8fb0'); R(wx + 1, wy + 1, 3, 3, '#a8cde0'); R(wx + 5, wy + 1, 1, 10, '#d8d0c0');
        if ((f + k) % 2) R(wx + 1, wy + 1, 8, 4, '#ffc6de');
      }
      sign(ctx, 'MATERNIDADE', x, b - 37, { bg: '#2a3a6a', color: PAPER });
      R(x - 17, b - 25, 34, 4, '#3f6fb5'); R(x - 17, b - 22, 34, 1, '#2a4f8a');
      R(x - 12, b - 21, 24, 21, '#d8d0c0'); R(x - 11, b - 20, 10, 20, '#8fb8d0'); R(x + 1, b - 20, 10, 20, '#8fb8d0'); R(x - 3, b - 11, 1, 3, INK); R(x + 2, b - 11, 1, 3, INK);
      R(x - 46, b - 3, 92, 3, '#cfc6b4');
      for (const sx of [-28, 28]) { R(x + sx - 3, b - 6, 6, 6, '#b0603a'); R(x + sx - 4, b - 13, 8, 8, '#4f9a5a'); R(x + sx - 2, b - 15, 4, 3, '#7fc070'); }
      person(ctx, m.parteira, x + 19, b + 5, { face: -1 });
      if (a.act.mode === 'arrive') { R(x + 11, b - 26, 3, 3, GOLD); R(x + 9, b - 30, 2, 2, GOLD); }
    },
  },
};
