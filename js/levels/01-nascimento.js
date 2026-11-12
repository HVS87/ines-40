// Nível 1 — O Nascimento. Lisboa, 15 de novembro de 1986: os pais da Inês correm para a
// maternidade (corrida de carro pelas ruas) e, lá chegados, é preciso apanhar a bebé.
import { Estrada } from '../acts/estrada.js';
import { peleNascimento } from '../acts/nascimento-carro.js';
import { Catch } from '../acts/catch.js';
import { TIO } from '../nomes.js';

export default {
  id: 'nascimento',
  title: 'O Nascimento',
  music: 'play',
  story: `Lisboa, um sábado de novembro. A Tia Fátima está em trabalho de parto e o ${TIO} acelera pela cidade fora, a caminho da maternidade. Vem aí a Inês — e vem com pressa!`,
  help: 'Toca no ecrã (ou Espaço) para mudar de faixa: foge aos buracos, aos pombos e ao elétrico e apanha os corações. Na maternidade, arrasta o dedo (ou usa as setas) para apanhar a bebé!',
  outro: 'Nasceu a Inês!',
  ending: 'Sábado, 15 de novembro de 1986: bem-vinda, Inês!',
  acts: [
    {
      act: Estrada, when: 'Lisboa, 15 de novembro de 1986', skin: peleNascimento, secs: 34,
      course: [
        { at: 3.6, obs: 'buraco', lane: 0 }, { at: 3.7, heart: 1 },
        { at: 5.2, say: `${TIO}: «Aguenta, Fátima! Não tenhas o bebé no carro!»` },
        { at: 6.2, obs: 'pombos', lane: 1 }, { at: 6.3, heart: 0 },
        { at: 8.0, obs: 'lomba' },
        { at: 8.6, say: 'Tia Fátima: «Tem calma, querido. E mais devagar nas lombas... Ai!»' },
        { at: 9.8, obs: 'buraco', lane: 0 },
        { at: 12.2, obs: 'eletrico', lane: 1 }, { at: 12.3, heart: 0 },
        { at: 13.4, say: `${TIO}: «Eu estou calmíssimo! Onde é que é o travão?!»` },
        { at: 14.6, obs: 'pombos', lane: 0 },
        { at: 16.4, obs: 'lomba' },
        { at: 17.8, obs: 'buraco', lane: 1 },
        { at: 18.6, say: 'Tia Fátima: «Agora é à direita. A outra direita, querido.»' },
        { at: 20.2, obs: 'buraco', lane: 0 }, { at: 20.3, heart: 1 },
        { at: 22.6, obs: 'eletrico', lane: 1 }, { at: 22.7, heart: 0 },
        { at: 23.8, say: `${TIO}: «É sábado e Lisboa inteira veio para a rua!»` },
        { at: 24.9, obs: 'pombos', lane: 0 },
        { at: 26.6, obs: 'lomba' },
        { at: 27.9, obs: 'buraco', lane: 1 }, { at: 28.0, heart: 0 },
        { at: 28.9, say: 'Tia Fátima: «É já ali à frente. Respira fundo... tu, não sou eu.»' },
        { at: 30.4, obs: 'buraco', lane: 0 },
        { at: 34, prop: 'maternidade', dx: 34 },
      ],
    },
    {
      act: Catch, when: 'Na maternidade...', hearts: 3,
      mother: ['tiafatima', 'casual'], catcher: ['tio', 'casual'],
      baby: { name: 'Inês', article: 'a', blanket: '#ffc6de', born: 'Bem-vinda ao mundo, Inês!' },
    },
  ],
};
