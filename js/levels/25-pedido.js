// Nível 25 — o pedido de casamento: o catamarã no Tejo, a paella enorme, o «SIM!», o segundo
// barco, com a roda de samba, e a fotografia de grupo do fim do dia (a Inês de branco, ao
// centro, e o Lourenço de camisa cor-de-rosa ao lado, todos de óculos de sol).
import { Talk } from '../acts/base.js';
import { Ritmo } from '../acts/ritmo.js';
import { tejoBg } from '../acts/pedido-cenario.js';
import { Paella } from '../acts/pedido-paella.js';
import { PedidoSim } from '../acts/pedido-sim.js';
import { SAMBA } from '../acts/pedido-samba.js';

export default {
  id: 'pedido',
  title: 'O Pedido',
  music: 'flamenco',
  story: 'O Lourenço alugou um catamarã para um passeio no Tejo com os amigos: a Ana e o Kiko, a Mi e o Leal, o Pi, o Moncada, a Marta e o Gonzaga. Serviu-se uma paella enorme e foi aí, a bordo, que ele pediu a Inês em casamento! Nesse preciso momento aproximou-se um segundo barco, com uma roda de samba, e todos dançaram.',
  help: 'Toca (ou Espaço) para servir a paella quando o prato estiver por baixo da concha. No pedido, mantém o dedo no ecrã (ou Espaço) para encher o coração. No samba, toca na coluna da nota (ou usa as setas ← ↓ →) quando ela chegar ao círculo.',
  outro: 'Ela disse que sim! E o Tejo inteiro dançou samba.',
  acts: [
    {
      act: Talk, when: 'Um fim de tarde no Tejo...',
      bg: (ctx, v, R, t, act) => tejoBg(ctx, v, R, t, { gy: act.ground(v), top: act.top(v) }),
      cast: [
        { who: 'ines', outfit: 'barco*', x: 0.4, name: 'Inês' },
        { who: 'lourenco', outfit: 'barco*', x: 0.58, name: 'Lourenço', face: -1 },
      ],
      lines: [
        'Inês: «Um catamarã ao pôr do sol, com os amigos todos... O que é que andas a tramar?»',
        'Lourenço: «Nada, nada... Olha, vem aí a paella! Ajudas a servir?»',
      ],
    },
    { act: Paella, hearts: 4 },
    { act: PedidoSim, hearts: 3, music: 'romance' },
    { act: Ritmo, hearts: 5, music: 'samba', ...SAMBA },
    // a fotografia de grupo, na proa do catamarã
    {
      act: Talk, hearts: 1, music: 'romance', when: 'E, ao fim do dia, todos para a proa...',
      bg: (ctx, v, R, t, act) => tejoBg(ctx, v, R, t, { gy: act.ground(v), top: act.top(v) }),
      fg: (ctx, v, R, t, act) => { if (act.i === 1 && act.timer < 0.3) R(0, 0, v.w, v.h, `rgba(255,255,255,${(0.9 - act.timer * 3).toFixed(2)})`); },
      onLine: (i, act) => { if (i === 1) act.sfx('plim'); },
      cast: [
        // atrás
        { who: 'leal', outfit: 'casual*', x: 0.2, dy: 13 }, { who: 'pi', outfit: 'casual', x: 0.38, dy: 13 }, { who: 'moncada', outfit: 'casual*', x: 0.56, dy: 13, face: -1 },
        { who: 'ana', outfit: 'casual*', x: 0.74, dy: 13, face: -1 }, { who: 'kiko', outfit: 'casual*', x: 0.9, dy: 13, face: -1 },
        // à frente: a Inês ao centro, de branco, e o Lourenço ao lado
        { who: 'mi', outfit: 'casual*', x: 0.12 }, { who: 'lourenco', outfit: 'barco*', x: 0.33, name: 'Lourenço' }, { who: 'ines', outfit: 'barco*', x: 0.5, face: -1, name: 'Inês' },
        { who: 'marta', outfit: 'casual*', x: 0.67, face: -1 }, { who: 'gonzaga', outfit: 'casual*', x: 0.85, face: -1 },
      ],
      lines: [
        'Fim de tarde no Tejo, toda a gente de óculos de sol... Juntem-se, que é hora da fotografia!',
        'Clique! A fotografia do dia em que a Inês disse que sim.',
      ],
    },
  ],
};
