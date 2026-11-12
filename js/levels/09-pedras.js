// Nível 9: Pedras d'El Rei. A semana de férias de todos os anos, com a família: a ponte
// flutuante, o comboiozinho antigo da Praia do Barril, as raquetes na areia e o Cemitério das
// Âncoras. (O Lourenço foi viver para a Austrália: não aparece neste nível.)
import { Talk } from '../acts/base.js';
import { hills, sign, sky } from '../draw.js';
import { TIO } from '../nomes.js';
import { DIA, tufo } from '../acts/farol-comum.js';
import { comboio } from '../acts/pedras-comum.js';
import { PedrasComboio } from '../acts/pedras-comboio.js';
import { PedrasRaquetes } from '../acts/pedras-raquetes.js';
import { PedrasAncoras } from '../acts/pedras-ancoras.js';

// A ponte flutuante sobre a ria; do outro lado, as dunas e o comboio à espera.
function ponte(ctx, v, R, t, act) {
  const gy = act.ground(v), P = v.portrait, hy = gy - (P ? 120 : 62);
  sky(ctx, v.w, v.h, hy, DIA.ceu);
  for (let i = 0; i < 3; i++) { const x = ((i * 150 + t * 3) % (v.w + 80)) - 40, y = hy - (P ? 70 : 26) - (i % 2) * 9; R(x, y, 34, 5, '#ffffff'); R(x + 6, y - 4, 20, 4, '#ffffff'); }
  // a outra margem: dunas, e o comboio da praia à espera
  hills(ctx, v.w, hy + 14, hy + 10, 0, 0, 6, 3, '#e8d8a0', 4);
  for (let k = 0; k < 6; k++) tufo(R, v.w * (0.08 + k * 0.17), hy + 6 + (k % 2) * 3, '#7a9a4a');
  comboio(ctx, R, v.w * 0.92, hy + 9, 1, t, [], { carruagens: 2 });
  // a ria
  R(0, hy + 12, v.w, v.h - hy - 12, '#58b0c4');
  for (let k = 0; k < 26; k++) { const y = hy + 16 + ((k * 37) % Math.max(10, v.h - hy - 20)), x = ((k * 53 + t * (4 + (k % 3) * 3)) % (v.w + 30)) - 15; R(x, y, 8 + (k % 3) * 4, 1, k % 2 ? '#8ad0e0' : '#3f96ac'); }
  for (let k = 0; k < 4; k++) { const x = v.w * (0.1 + k * 0.27), y = hy + 20 + (k % 2) * 8; R(x, y, 30, 3, '#6f9a4a'); R(x + 5, y - 1, 16, 1, '#8ab85a'); }
  // a ponte flutuante: tabuleiro de madeira sobre flutuadores, com corrimão
  for (let x = 6; x < v.w; x += 30) { R(x, gy + 5, 20, 8, '#2b1d2e'); R(x + 1, gy + 6, 18, 6, '#3f6fb0'); R(x + 1, gy + 6, 18, 2, '#6f9fd8'); }
  R(0, gy - 1, v.w, 8, '#2b1d2e'); R(0, gy, v.w, 5, '#b8834a'); R(0, gy, v.w, 1, '#e0b070');
  for (let x = 3; x < v.w; x += 10) R(x, gy + 1, 1, 4, '#8a5a2e');
  for (let x = 12; x < v.w; x += 40) { R(x, gy - 22, 2, 22, '#2b1d2e'); }
  R(0, gy - 22, v.w, 1, '#2b1d2e'); R(0, gy - 21, v.w, 1, '#e8dcc0');
  sign(ctx, 'PEDRAS D\'EL REI', v.w / 2, gy + 18, { bg: '#fff6e6', color: '#2f6fb5' });
}

export default {
  id: 'pedras',
  title: 'Pedras d\'El Rei',
  music: 'calm',
  story: 'Todos os anos, a Inês passa uma semana de férias no Algarve, em Pedras d\'El Rei, com a família e os amigos. Para chegar à praia, atravessa-se a ria e apanha-se um comboio antigo. E na areia nunca falta animação!',
  help: 'Toca no ecrã (ou Espaço) para apitar no comboio e para bater a bola nas raquetes. No fim da tarde, arrasta o dedo (ou usa as setas) para apanhar conchas.',
  outro: 'Mais um verão em Pedras d\'El Rei!',
  acts: [
    {
      act: Talk, when: 'Entretanto, o Lourenço vai viver para a Austrália...', bg: ponte,
      cast: [
        { who: 'irma1', x: 0.1 }, { who: 'tiafatima', x: 0.26, name: 'Tia Fátima' }, { who: 'ines', outfit: 'praia', x: 0.44, name: 'Inês' },
        { who: 'tio', x: 0.62, face: -1, name: TIO }, { who: 'irmao', x: 0.78, face: -1 }, { who: 'irma2', x: 0.92, face: -1 },
      ],
      lines: [
        'Inês: «Pedras d\'El Rei! A nossa semana de praia de todos os anos.»',
        `${TIO}: «Primeiro a ponte flutuante, depois o comboio. É a tradição!»`,
        'Inês: «O Lourenço ia gostar disto... A Austrália fica tão longe!»',
        'Tia Fátima: «Anda, filha. Um mergulho no Barril e isso passa!»',
      ],
    },
    { act: PedrasComboio, hearts: 4 },
    { act: PedrasRaquetes, hearts: 4, when: 'Na praia, com a família...' },
    { act: PedrasAncoras, hearts: 3, when: 'Ao fim da tarde, no Cemitério das Âncoras...' },
  ],
};
