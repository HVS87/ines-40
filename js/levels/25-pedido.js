// Nível 25 — o pedido de casamento: o catamarã no Tejo, a paella enorme, o «SIM!» e o segundo
// barco, com a roda de samba.
import { Talk } from '../acts/base.js';
import { Ritmo } from '../acts/ritmo.js';
import { tejoBg } from '../acts/pedido-cenario.js';
import { Paella } from '../acts/pedido-paella.js';
import { PedidoSim } from '../acts/pedido-sim.js';
import { SAMBA } from '../acts/pedido-samba.js';

export default {
  id: 'pedido',
  title: 'O Pedido',
  music: 'party',
  story: 'O Lourenço alugou um catamarã para um passeio no Tejo com os amigos: a Ana e o Kiko, a Mi e o Leal, o Pi, o Moncada, a Marta e o Gonzaga. Serviu-se uma paella enorme e foi aí, a bordo, que ele pediu a Inês em casamento! Nesse preciso momento aproximou-se um segundo barco, com uma roda de samba, e todos dançaram.',
  help: 'Toca (ou Espaço) para servir a paella quando o prato estiver por baixo da concha. No pedido, mantém o dedo no ecrã (ou Espaço) para encher o coração. No samba, toca na coluna da nota (ou usa as setas ← ↓ →) quando ela chegar ao círculo.',
  outro: 'Ela disse que sim! E o Tejo inteiro dançou samba.',
  acts: [
    {
      act: Talk, when: 'Um fim de tarde no Tejo...',
      bg: (ctx, v, R, t, act) => tejoBg(ctx, v, R, t, { gy: act.ground(v), top: act.top(v) }),
      cast: [
        { who: 'ines', outfit: 'casual', x: 0.4, name: 'Inês' },
        { who: 'lourenco', outfit: 'casual', x: 0.58, name: 'Lourenço', face: -1 },
      ],
      lines: [
        'Inês: «Um catamarã ao pôr do sol, com os amigos todos... O que é que andas a tramar?»',
        'Lourenço: «Nada, nada... Olha, vem aí a paella! Ajudas a servir?»',
      ],
    },
    { act: Paella, hearts: 4 },
    { act: PedidoSim, hearts: 3 },
    { act: Ritmo, hearts: 5, ...SAMBA },
  ],
};
