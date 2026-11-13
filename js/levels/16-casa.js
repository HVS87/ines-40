// Nível 16 — «Viver Juntos»: a Inês, o Lourenço e o Tomás (já adolescente) mudam-se para a
// mesma casa. As mudanças pelas escadas acima, a sala para decorar e a estante das instruções
// impossíveis; no fim, os três no sofá, com pizza.
import { Talk } from '../acts/base.js';
import { INK, PAPER, GOLD } from '../draw.js';
import { Mudancas } from '../acts/casa-mudancas.js';
import { Decorar } from '../acts/casa-decorar.js';
import { Movel } from '../acts/casa-movel.js';
import { casaPronta, salaLayout, drawSala, sofaBack, sofaFront } from '../acts/casa-comum.js';

// O serão: a sala pronta, de noite (atrás das pessoas só o encosto do sofá).
function serao(ctx, v, R, t, act) {
  const st = casaPronta(act.s), L = salaLayout(v, act.ground(v), act.top(v));
  drawSala(ctx, v, R, L, st, { noite: true, estante: 4, semSofa: true });
  // candeeiro de pé, aceso
  const cx = Math.round(L.sofaX + L.sofaW / 2 + (v.portrait ? 14 : 22)), gy = L.gy;
  R(cx - 1, gy - 50, 2, 50, INK); R(cx - 5, gy - 2, 10, 2, INK);
  R(cx - 8, gy - 62, 16, 13, INK); R(cx - 7, gy - 61, 14, 11, GOLD); R(cx - 7, gy - 61, 14, 2, '#fff1a8');
  R(cx - 22, gy - 48, 44, 44, 'rgba(255,209,102,0.10)');
  sofaBack(R, L.sofaX, gy, L.sofaW);
}

// Por cima das pessoas: a frente do sofá (ficam sentados) e a pizza em cima de uma caixa das mudanças.
function pizza(ctx, v, R, t, act) {
  const L = salaLayout(v, act.ground(v), act.top(v)), gy = L.gy, x = L.sofaX;
  sofaFront(R, x, gy, L.sofaW);
  const by = gy + 6;
  R(x - 17, by, 34, Math.min(20, v.h - by - 2), INK); R(x - 16, by + 1, 32, Math.min(18, v.h - by - 4), '#c9985a'); R(x - 16, by + 1, 32, 2, '#e0b878'); R(x - 2, by + 1, 4, Math.min(18, v.h - by - 4), '#f0dca8');
  // a caixa da pizza, aberta
  R(x - 15, by - 15, 30, 12, INK); R(x - 14, by - 14, 28, 10, PAPER); R(x - 6, by - 11, 12, 4, '#c0392b');
  R(x - 15, by - 4, 30, 5, INK); R(x - 14, by - 3, 28, 3, PAPER);
  R(x - 12, by - 6, 24, 3, '#e8a83a'); R(x - 11, by - 7, 22, 2, '#f6d27a');
  for (let k = 0; k < 5; k++) R(x - 9 + k * 4 + (k % 2), by - 7 + (k % 2), 2, 1, '#c0392b');
  // fumozinho
  for (let k = 0; k < 3; k++) { const p = (t * 0.6 + k / 3) % 1; R(x - 6 + k * 6 + Math.round(Math.sin(t * 2 + k) * 2), by - 9 - Math.round(p * 10), 1, 2, `rgba(255,246,230,${(0.6 * (1 - p)).toFixed(2)})`); }
}

export default {
  id: 'casa',
  title: 'Viver Juntos',
  music: 'play',
  story: 'A Inês e o Lourenço decidem viver juntos, com o Tomás, que já é um adolescente. Há caixas para carregar pelas escadas acima, paredes para pintar e uma casa inteira para decorar a três.',
  help: 'Toca no ecrã (ou carrega em Espaço) no momento certo: quando a caixa chega às mãos da Inês, quando o quadro está direito... Para regar, mantém premido. No móvel, toca nas peças pela ordem das instruções (ou usa as setas e Espaço).',
  outro: 'Casa nova, vida a três!',
  ending: 'Uma casa, três pessoas e uma pizza: está tudo no sítio.',
  acts: [
    { act: Mudancas, when: 'Dia de mudanças...', hearts: 5 },
    { act: Decorar, when: 'Com as caixas todas lá em cima...', hearts: 5 },
    { act: Movel, when: 'Só falta montar a estante.', hearts: 4 },
    {
      act: Talk, when: 'Nessa noite...', bg: serao, fg: pizza,
      cast: [
        { who: 'lourenco', outfit: 'casual', x: 0.4, face: 1, name: 'Lourenço', dy: 10 },
        { who: 'ines', outfit: 'casual', x: 0.5, face: 1, name: 'Inês', dy: 10 },
        { who: 'tomas', outfit: 'teen', x: 0.6, face: -1, name: 'Tomás', dy: 10 },
      ],
      lines: [
        'Lourenço: «Casa pronta! Quem é que encomendou a pizza?»',
        'Tomás: «Eu! Pelo telemóvel. Afinal sempre serve para alguma coisa...»',
        'Inês: «A nossa casa. Os três. Não mudava nada!»',
        'Lourenço: «Nem a peça que sobrou?»',
      ],
    },
  ],
};
