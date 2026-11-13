// Nível 22 — Roadtrip na Noruega: a Inês, o Lourenço e o Tomás vão de carro de Oslo a Bergen
// (montanhas, Borgund, o túnel de Lærdal, Flåm) e mergulham no fiorde, junto ao chalé.
import { Estrada } from '../acts/estrada.js';
import { peleNoruega } from '../acts/noruega-viagem.js';
import { Mergulho } from '../acts/noruega-mergulho.js';

export default {
  id: 'noruega',
  title: 'Roadtrip na Noruega',
  music: 'norte',
  story: 'A Inês, o Lourenço e o Tomás fazem-se à estrada na Noruega: de Oslo a Bergen, por montanhas, cascatas e fiordes. À espera deles, um chalé à beira da água... e um mergulho gelado!',
  help: 'Na estrada, toca no ecrã (ou Espaço) para mudar de faixa. No pontão, mantém o dedo no ecrã (ou o Espaço) para ganhar coragem e larga na zona verde!',
  outro: 'Fiordes, renas e um mergulho de coragem!',
  ending: 'Três corajosos, um fiorde e muito chocolate quente.',
  acts: [
    {
      act: Estrada, when: 'De Oslo a Bergen, pela montanha...', skin: peleNoruega, secs: 40, tunnel: [18.5, 26],
      course: [
        { at: 1.2, prop: 'placa', label: 'OSLO' },
        { at: 4.0, obs: 'ovelhas', lane: 0 }, { at: 4.1, heart: 1 },
        { at: 6.4, obs: 'pedra', lane: 1 },
        { at: 7.6, prop: 'cascata' },
        { at: 8.8, obs: 'rena', lane: 0 }, { at: 8.9, heart: 1 },
        { at: 10.2, say: 'A igreja de madeira de Borgund, com cabeças de dragão nos telhados!' },
        { at: 11.2, obs: 'ovelhas', lane: 1 },
        { at: 12.6, prop: 'borgund' },
        { at: 13.8, obs: 'rena', lane: 0 },
        { at: 16.2, obs: 'pedra', lane: 1 },
        { at: 17.2, say: 'O túnel de Lærdal: 24,5 km, o maior túnel rodoviário do mundo!' },
        { at: 20, heart: 1 },
        { at: 21.4, say: 'Tomás: «Ainda falta muito? Este túnel nunca mais acaba!»' },
        { at: 22.6, heart: 0 },
        { at: 24.4, obs: 'pedra', lane: 1 },
        { at: 26.8, say: 'Flåm! Daqui para a frente, fiordes e cascatas por todo o lado.' },
        { at: 27.6, prop: 'placa', label: 'FLAM' },
        { at: 29.6, obs: 'ovelhas', lane: 0 }, { at: 29.7, heart: 1 },
        { at: 30.8, prop: 'cascata' },
        { at: 31.9, obs: 'rena', lane: 1 },
        { at: 33.4, prop: 'chale' },
        { at: 34.2, obs: 'ovelhas', lane: 0 },
        { at: 36.4, obs: 'rena', lane: 1 }, { at: 36.5, heart: 0 },
        { at: 40, prop: 'bryggen', dx: 70 },
      ],
    },
    { act: Mergulho, when: 'No chalé, à beira do fiorde...' },
  ],
};
