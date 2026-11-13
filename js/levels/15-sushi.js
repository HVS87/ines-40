// Nível 15 — O Regresso do Lourenço. Ele volta da Austrália, reatam o namoro, e ele abre o
// Sushi@Home: o reencontro no aeroporto, a cozinha (montar pedidos) e as entregas de scooter.
import { Estrada } from '../acts/estrada.js';
import { Reencontro } from '../acts/sushi-reencontro.js';
import { Cozinha } from '../acts/sushi-cozinha.js';
import { peleEntrega } from '../acts/sushi-entrega.js';

export default {
  id: 'sushi',
  title: 'O Regresso do Lourenço',
  music: 'play',
  story: 'O Lourenço volta da Austrália e os dois reatam o namoro. Na bagagem, ele traz uma ideia: o Sushi@Home, sushi entregue em casa. A Inês arregaça as mangas e ajuda!',
  help: 'Na cozinha, toca no ecrã (ou Espaço) quando uma peça do pedido passar debaixo dos hashi. Nas entregas, toca (ou Espaço) para mudar de faixa e fugir aos obstáculos.',
  outro: 'Sushi@Home: entregue com amor!',
  ending: 'Juntos outra vez — e com o jantar tratado.',
  acts: [
    { act: Reencontro, when: 'O Lourenço está de volta!' },
    { act: Cozinha, when: 'Na cozinha do Sushi@Home...' },
    {
      act: Estrada, when: 'E agora, as entregas!', skin: peleEntrega, secs: 34.2, tolerance: 1,
      course: [
        { at: 3.8, obs: 'segunda', lane: 0 },
        { at: 6.2, obs: 'gato', lane: 1 }, { at: 6.3, heart: 0 },
        { at: 8.4, obs: 'carris', lane: 0 },
        { at: 11, stop: 'porta', cor: 'verde', dx: 34 },
        { at: 11.6, say: 'Inês: «Próxima entrega: a porta azul. Cuidado com os carris!»' },
        { at: 13.8, obs: 'segunda', lane: 1 },
        { at: 16, obs: 'carris', lane: 0 },
        { at: 18.2, obs: 'gato', lane: 1 },
        { at: 20.2, obs: 'segunda', lane: 0 },
        { at: 22.5, stop: 'porta', cor: 'azul', dx: 34 },
        { at: 23.1, say: 'Inês: «Última: a porta vermelha. E não comas os makis pelo caminho!»' },
        { at: 25.2, obs: 'carris', lane: 1 },
        { at: 27.4, obs: 'segunda', lane: 0 }, { at: 27.5, heart: 1 },
        { at: 29.6, obs: 'gato', lane: 1 },
        { at: 31.6, obs: 'segunda', lane: 0 },
        { at: 34, stop: 'porta', cor: 'vermelha', dx: 34 },
      ],
    },
  ],
};
