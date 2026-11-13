// Nível 21 — «Lanheses»: os dias de família na Casa do Tinoco, a casa de família do Lourenço,
// entre Ponte de Lima e Viana do Castelo. A eira e o espigueiro, o churrasco de carne barrosã
// e a mesa comprida ao pé da piscina. No fim, o Lourenço leva todos a ver o pôr do sol à Serra d'Arga.
import { Talk } from '../acts/base.js';
import { INK, PAPER, clamp, hash, person, sky, disc, hills } from '../draw.js';
import { getCharacter } from '../sprites.js';
import { TIO } from '../nomes.js';
import { Eira } from '../acts/lanheses-eira.js';
import { Churrasco } from '../acts/lanheses-churrasco.js';
import { ceu, sol, nuvem, casaGranito, latada, espigueiro, eira, monte, placa } from '../acts/lanheses-comum.js';

// A chegada: a casa de granito, a latada, o espigueiro e a eira com o milho a secar.
function chegada(ctx, v, R, t, act) {
  const gy = act.ground(v) - 8, top = act.top(v), w = v.w, P = v.portrait;
  ceu(ctx, v, R, gy);
  sol(ctx, Math.round(w * 0.36), top + 12);
  nuvem(ctx, R, w * 0.82 + Math.sin(t * 0.3) * 6, top + 12, '#c9ced8', '#8a8fa0');
  const cw = Math.min(96, Math.round(w * 0.3)), ch = clamp(gy - top - 30, 40, 70);
  casaGranito(ctx, R, 6, gy, cw, ch);
  placa(ctx, 6 + cw / 2, gy - ch - 16 < top + 2 ? top + 2 : gy - ch - 16);
  const ex = Math.round(w * (P ? 0.4 : 0.48)), ew = Math.round(w * 0.97) - ex;
  if (ex - cw - 22 > 20) latada(R, cw + 18, ex - 12, gy, 26);
  espigueiro(R, ex, gy, ew, clamp(gy - top - 22, 46, 96), 0.25);
  eira(R, v, gy);
  for (let k = 0; k < 6; k++) monte(R, w * (0.1 + k * 0.16), gy + 5 + (k % 2) * 3);
  // os irmãos (Sofia, Zé Inácio, Kiko e Maria), mais atrás, a tirar as malas
  const atras = [['irma1', 0.06], ['irmao', 0.14], ['irmao2', 0.86], ['irma2', 0.94]];
  for (const [who, fx] of atras) person(ctx, getCharacter(who, 'casual'), Math.round(w * fx), gy + 3, { scale: 1, face: fx < 0.5 ? 1 : -1 });
}

// A mesa comprida ao pé da piscina (fundo) ...
function piscina(ctx, v, R, t, act) {
  const gy = act.ground(v), top = act.top(v), w = v.w, P = v.portrait;
  const hy = gy - (P ? 78 : 56);
  ceu(ctx, v, R, hy);
  sol(ctx, Math.round(w * 0.86), top + 12);
  espigueiro(R, Math.round(w * 0.04), hy, Math.round(w * 0.4), clamp(hy - top - 14, 34, 70), 0.9);
  casaGranito(ctx, R, Math.round(w * 0.56), hy, Math.round(w * 0.3), clamp(hy - top - 20, 34, 60));
  R(0, hy, w, v.h - hy, '#7fae5a'); R(0, hy, w, 2, '#9fce72');
  // relva com flores (ao alto sobra muito relvado à frente da mesa)
  for (let k = 0; k < 40; k++) {
    const fx = Math.round(hash(k + 11) * (w - 6)) + 2, fy = gy + 14 + Math.round(hash(k * 2.7 + 3) * Math.max(0, v.h - gy - 20));
    if (fy > v.h - 4) continue;
    R(fx, fy, 3, 1, '#6a9a4a'); if (k % 3 === 0) { R(fx, fy - 2, 2, 2, k % 2 ? '#ffffff' : '#ffd166'); }
  }
  // a piscina, com os irmãos da Inês lá dentro
  const px = Math.round(w * 0.08), pw = Math.round(w * 0.84), py = hy + 6, ph = P ? 34 : 20;
  R(px - 3, py - 3, pw + 6, ph + 6, INK); R(px - 2, py - 2, pw + 4, ph + 4, '#e6e0d4'); R(px, py, pw, ph, '#3fb0e0'); R(px, py, pw, 2, '#8fdcf5');
  for (let k = 0; k < 8; k++) R(px + 6 + ((k * 41 + Math.floor(t * 8)) % (pw - 16)), py + 4 + ((k * 7) % Math.max(1, ph - 6)), 6, 1, '#bfeaf8');
  [['irma1', 0.2], ['irmao', 0.4], ['irmao2', 0.6], ['irma2', 0.8]].forEach(([who, fx], k) => {
    const img = getCharacter(who, 'casual').stand[k % 2 ? 'l' : 'r'], bx = Math.round(px + pw * fx), b = Math.round(Math.sin(t * 2 + k) * 1);
    // só a cabeça e os ombros de fora de água
    ctx.drawImage(img, 0, 0, 16, 15, bx - 8, py + ph - 19 + b, 16, 15);
    R(bx - 9, py + ph - 5 + b, 18, 1, '#bfeaf8');
  });
  // boia
  const bx = Math.round(px + pw * 0.88);
  R(bx - 7, py + ph - 8, 14, 6, INK); R(bx - 6, py + ph - 7, 12, 4, '#ff5d8f'); R(bx - 2, py + ph - 7, 4, 4, PAPER); R(bx - 3, py + ph - 6, 6, 2, '#3fb0e0');
}

// ... e a mesa, por cima das pernas de quem está sentado.
function mesa(ctx, v, R, t, act) {
  const gy = act.ground(v), w = v.w, y = gy - 17;
  R(4, y - 1, w - 8, 26, INK); R(5, y, w - 10, 24, PAPER);
  for (let x = 5; x < w - 12; x += 8) { R(x, y + 20, 4, 4, '#e86a6a'); R(x + 4, y + 16, 4, 4, '#f6b0b0'); }
  R(5, y, w - 10, 2, '#ffffff'); R(5, y + 5, w - 10, 1, '#e6dcc8');
  for (const fx of [0.08, 0.92]) R(Math.round(w * fx) - 2, y + 25, 4, Math.min(22, v.h - y - 25), INK);
  // travessa da carne, broa, pratos e garrafas de vinho verde
  const item = (fx, fn) => fn(Math.round(w * fx));
  item(0.5, (x) => { R(x - 13, y - 5, 26, 5, INK); R(x - 12, y - 4, 24, 3, '#d8d8e6'); R(x - 9, y - 7, 7, 4, '#8a4a26'); R(x - 1, y - 7, 7, 4, '#8a4a26'); R(x + 5, y - 6, 5, 3, '#a85a34'); });
  for (const fx of [0.17, 0.4, 0.61, 0.83]) item(fx, (x) => { R(x - 3, y - 13, 5, 13, INK); R(x - 2, y - 8, 3, 8, '#4f9a5a'); R(x - 1, y - 12, 1, 4, '#4f9a5a'); R(x - 2, y - 5, 3, 3, PAPER); });
  for (const fx of [0.1, 0.25, 0.33, 0.68, 0.75, 0.9]) item(fx, (x) => { R(x - 6, y - 2, 12, 3, INK); R(x - 5, y - 1, 10, 1, '#f2f2f7'); });
  item(0.28, (x) => { R(x - 6, y - 7, 12, 6, INK); R(x - 5, y - 6, 10, 4, '#c98a3a'); R(x - 4, y - 6, 8, 1, '#e8b060'); });
  // copos no ar, no brinde
  if (act.i >= 2) for (const p of act.people) { const x = Math.round(p.x * w) + (p.face || 1) * 11, cy = gy - 36 - Math.round(Math.abs(Math.sin(t * 5 + p.x * 9)) * 3); R(x - 2, cy - 1, 5, 7, INK); R(x - 1, cy, 3, 4, '#e8f0a8'); R(x, cy + 4, 1, 2, PAPER); }
}

// O pôr do sol na Serra d'Arga: o sol a descer sobre o mar, os montes em camadas, os penedos de
// granito e os garranos a pastar. Os irmãos da Inês ficam mais atrás, a ver.
function arga(ctx, v, R, t, act) {
  const gy = act.ground(v), top = act.top(v), w = v.w, hy = gy - 64;
  sky(ctx, w, v.h, hy + 6, ['#3a3a78', '#8a4a8a', '#e0607a', '#f8a05a', '#ffd98a']);
  for (let i = 0; i < 3; i++) { const cx = ((i * 131 + t * 3) % (w + 70)) - 35, cy = top + 14 + i * 13; R(cx, cy, 30, 3, 'rgba(255,214,170,0.55)'); R(cx + 6, cy - 2, 16, 2, 'rgba(255,214,170,0.55)'); }
  const sx = Math.round(w * 0.5);
  disc(ctx, sx, hy - 3, 13, '#fff3c4');
  // o mar, lá ao fundo, com o reflexo do sol
  R(0, hy, w, 8, '#c8607a'); R(0, hy, w, 1, '#ffd98a');
  for (let k = 0; k < 4; k++) R(sx - 10 + k * 2 + Math.round(Math.sin(t * 2 + k) * 2), hy + 1 + k * 2, 20 - k * 4, 1, '#fff3c4');
  // os montes, do mais longe para o mais perto
  hills(ctx, w, v.h, gy, 0, 0, 47, 7, '#7a4a7a', 2);
  hills(ctx, w, v.h, gy, 60, 1, 22, 7, '#57386a', 5);
  // garranos a pastar na encosta, em silhueta
  for (const [fx, dy, f] of [[0.26, 27, 1], [0.76, 25, -1]]) {
    const x = Math.round(w * fx), y = gy - dy, c = '#2a2040';
    R(x - 6, y - 6, 12, 5, c); R(x - 6, y - 1, 2, 5, c); R(x + 4, y - 1, 2, 5, c); R(x - 3, y - 1, 1, 4, c); R(x + 2, y - 1, 1, 4, c);
    R(x + f * 6 - (f < 0 ? 3 : 0), y - 4, 3, 6, c); R(x + f * 8 - (f < 0 ? 3 : 0), y, 3, 3, c); R(x - f * 7 - (f < 0 ? 0 : 1), y - 5, 1, 5, c);
  }
  // o cimo da serra: chão, tojo e penedos de granito
  R(0, gy, w, v.h - gy, '#3a2c52'); R(0, gy, w, 2, '#5a4470');
  for (let k = 0; k < 26; k++) { const x = Math.round(hash(k + 3) * (w - 4)), y = gy + 5 + Math.round(hash(k * 1.7 + 2) * Math.max(0, v.h - gy - 10)); R(x, y, 3, 1, '#57406e'); if (k % 4 === 0) R(x + 1, y - 2, 1, 2, '#e8c05a'); }
  for (const [fx, bw, bh] of [[0.05, 22, 13], [0.93, 26, 16], [0.6, 12, 6]]) {
    const x = Math.round(w * fx);
    R(x - bw / 2, gy - bh + 3, bw, bh - 3, '#2a2040'); R(x - bw / 2 + 3, gy - bh, bw - 6, 3, '#2a2040');
    R(x - bw / 2 + 3, gy - bh, bw - 8, 1, '#f8a05a'); R(x - bw / 2 + 1, gy - bh + 3, 2, 1, '#f8a05a');
  }
  // a Sofia e o Zé Inácio de um lado, o Kiko e a Maria do outro
  const lados = [['irma1', 0.07], ['irmao', 0.19], ['irmao2', 0.83], ['irma2', 0.94]];
  for (const [who, fx] of lados) person(ctx, getCharacter(who, 'casual'), Math.round(w * fx), gy, { scale: 2, face: fx < 0.5 ? 1 : -1 });
}

export default {
  id: 'lanheses',
  title: 'Lanheses',
  music: 'minho',
  story: 'O Lourenço tem uma casa de família em Lanheses, entre Ponte de Lima e Viana do Castelo: a Casa do Tinoco, do nome de um famoso antepassado dele. Todos os anos a Inês convida para lá a família — os pais, a Sofia, a Maria, o Zé Inácio e o Kiko — para uns dias de piscina, boa comida e boa bebida. E o Lourenço adora grelhar carne barrosã!',
  help: 'Na eira, arrasta o dedo (ou usa as setas) para a Inês levar o milho ao espigueiro antes da chuva. No churrasco, toca na posta que está no ponto (ou escolhe com as setas e serve com Espaço).',
  outro: 'Dizem que é a maior eira da Península Ibérica!',
  ending: 'Uns bons dias de descanso, em família, na Casa do Tinoco.',
  acts: [
    {
      act: Talk, when: 'Lanheses, entre Ponte de Lima e Viana do Castelo...', bg: chegada,
      cast: [
        { who: 'lourenco', outfit: 'casual', x: 0.3, face: 1, name: 'Lourenço' },
        { who: 'ines', outfit: 'casual', x: 0.45, face: 1, name: 'Inês' },
        { who: 'tiafatima', outfit: 'hoje', x: 0.64, face: -1, name: 'Tia Fátima' },
        { who: 'tio', outfit: 'hoje', x: 0.79, face: -1, name: TIO },
      ],
      lines: [
        'Inês: «Chegámos! Bem-vindos à Casa do Tinoco.»',
        `${TIO}: «Que espigueiro enorme! E esta eira não acaba...»`,
        'Lourenço: «É para secar o milho que a quinta dá. Dizem que é a maior eira da Península Ibérica!»',
        'Tia Fátima: «Pois olhem que vem ali uma nuvem... e o milho está todo cá fora!»',
      ],
    },
    { act: Eira, hearts: 5 },
    { act: Churrasco, when: 'À hora do almoço, o Lourenço acende a grelha...', hearts: 5 },
    {
      act: Talk, when: 'E depois, a mesa comprida ao pé da piscina.', bg: piscina, fg: mesa,
      cast: [
        { who: 'tiafatima', outfit: 'hoje', x: 0.2, face: 1, name: 'Tia Fátima', dy: 6 },
        { who: 'tio', outfit: 'hoje', x: 0.38, face: 1, name: TIO, dy: 6 },
        { who: 'ines', outfit: 'praia', x: 0.62, face: -1, name: 'Inês', dy: 6 },
        { who: 'lourenco', outfit: 'grelha', x: 0.8, face: -1, name: 'Lourenço', dy: 6 },
      ],
      lines: [
        'Tia Fátima: «Que almoço! Não me cabe nem mais uma garfada.»',
        'Lourenço: «Então e a sobremesa? Ainda agora começámos!»',
        `${TIO}: «Um brinde à Casa do Tinoco... e ao cozinheiro!»`,
        'Inês: «À família! Para o ano há mais: já estão todos convidados.»',
        "Lourenço: «E logo, ao fim da tarde, vamos todos ver o pôr do sol à Serra d'Arga!»",
      ],
    },
    {
      act: Talk, music: 'calm', when: "Ao fim da tarde, no alto da Serra d'Arga...", bg: arga,
      cast: [
        { who: 'lourenco', outfit: 'casual', x: 0.31, face: 1, name: 'Lourenço' },
        { who: 'ines', outfit: 'casual', x: 0.43, face: 1, name: 'Inês' },
        { who: 'tiafatima', outfit: 'hoje', x: 0.59, face: -1, name: 'Tia Fátima' },
        { who: 'tio', outfit: 'hoje', x: 0.71, face: -1, name: TIO },
      ],
      lines: [
        'Lourenço: «Chegámos lá acima. Agora é só esperar pelo espetáculo.»',
        'Tia Fátima: «Que vista! Daqui vê-se tudo, até ao mar.»',
        "Inês: «O pôr do sol na Serra d'Arga, com a família toda. Não podia acabar melhor!»",
      ],
    },
  ],
};
