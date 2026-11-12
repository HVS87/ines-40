// Nível 21 — «Madrinha do Micas»: a Inês é madrinha de batismo do Miguel Francisco (o «Micas»),
// filho da Mi e do Leal. Embalar o bebé na pia batismal, acender a vela no círio pascal e a
// fotografia de grupo à saída da igreja.
import { Talk } from '../acts/base.js';
import { PINK, mark } from '../draw.js';
import { Embalar } from '../acts/madrinha-embalar.js';
import { Vela } from '../acts/madrinha-vela.js';
import { Foto } from '../acts/madrinha-foto.js';
import { igreja, altar, pia, cirio, fachada, petalas, bebe } from '../acts/madrinha-comum.js';

// Antes da cerimónia, dentro da igreja: a Mi passa o Micas para o colo da madrinha.
function dentro(ctx, v, R, t, act) {
  const gy = act.ground(v), top = act.top(v);
  igreja(ctx, v, R, gy, top, t);
  altar(R, v.w * (v.portrait ? 0.5 : 0.12), gy);
  pia(R, v.w * (v.portrait ? 0.12 : 0.27), gy);
  cirio(R, v.w * (v.portrait ? 0.27 : 0.35), gy, 58, t);
}
function colo(quem) {
  return (ctx, v, R, t, act) => {
    const p = act.people.find((q) => q.who === quem);
    if (!p) return;
    const naMi = quem === 'mi' && act.i < 1;
    const dono = quem === 'ines' || naMi ? p : act.people.find((q) => q.who === 'ines');
    const f = dono.face || 1, x = Math.round(dono.x * v.w) + f * 10, y = act.ground(v) - 19;
    bebe(R, x, y, 1, act.i >= 2 ? 'riso' : 'calmo', -f, t);
    if (act.i >= 2) mark(ctx, x + f * 9, y - 6, '♥', PINK);
  };
}

// À saída: a igreja por fora, com pétalas no ar.
function adro(ctx, v, R, t, act) {
  fachada(ctx, v, R, act.ground(v), act.top(v), v.w * 0.5);
  petalas(R, v, t, 18);
}

export default {
  id: 'madrinha',
  title: 'Madrinha do Micas',
  music: 'calm',
  story: 'A Mi e o Leal tiveram um menino, o Miguel Francisco — o «Micas» —, e a madrinha de batismo é a Inês! No grande dia há um bebé para embalar junto à pia batismal, uma vela para acender no círio pascal e uma fotografia de grupo para a posteridade.',
  help: 'Toca no ecrã (ou carrega em Espaço) devagar e a compasso para embalar o Micas. Depois, toca no momento certo: quando a chama chega ao pavio e quando todos olham para a câmara.',
  outro: 'Madrinha babada!',
  ending: 'O Micas ganhou uma madrinha para a vida toda.',
  acts: [
    {
      act: Talk, when: 'O dia do batizado do Micas...', bg: dentro, fg: colo('mi'),
      cast: [
        { who: 'padre', x: 0.44, face: 1, name: 'Padre' },
        { who: 'ines', outfit: 'festa', x: 0.6, face: 1, name: 'Inês' },
        { who: 'mi', outfit: 'festa', x: 0.76, face: -1, name: 'Mi' },
        { who: 'leal', outfit: 'festa', x: 0.9, face: -1, name: 'Leal' },
      ],
      lines: [
        'Mi: «Pronta, madrinha? O Micas hoje acordou cheio de energia...»',
        'Inês: «Prontíssima! Anda cá ao colo da madrinha, Micas.»',
        'Padre: «Vamos então começar. Aproximem-se da pia batismal.»',
      ],
    },
    { act: Embalar, hearts: 5 },
    { act: Vela, when: 'Depois da água, a vela do batismo...', hearts: 3 },
    { act: Foto, when: 'À saída da igreja, chovem pétalas e arroz!', hearts: 4 },
    {
      act: Talk, bg: adro, fg: colo('ines'),
      cast: [
        { who: 'leal', outfit: 'festa', x: 0.24, face: 1, name: 'Leal' },
        { who: 'ines', outfit: 'festa', x: 0.5, face: -1, name: 'Inês' },
        { who: 'mi', outfit: 'festa', x: 0.74, face: -1, name: 'Mi' },
      ],
      lines: [
        'Mi: «Ficou tão sossegado ao teu colo! Já se vê quem é a preferida.»',
        'Leal: «Madrinha é para a vida toda, Inês. Agora não te livras dele!»',
        'Inês: «Nem quero! Micas, a madrinha vai estragar-te com mimos.»',
      ],
    },
  ],
};
