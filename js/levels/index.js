// Lista ordenada dos níveis: um ficheiro por capítulo da história, pela ordem em que se jogam.
// Cada ficheiro é carregado à parte: se um falhar, o jogo continua com um aviso nesse nível.
// A lista LEVELS começa vazia e fica cheia quando a promessa `ready` se cumpre; o js/main.js
// espera por ela antes de arrancar. (Não se usa «await» de topo: em versões antigas do Safari, um
// módulo assim, importado por vários outros, pode nunca chegar a arrancar.)
import { Talk } from '../acts/base.js';

const FILES = [
  '01-nascimento', '02-escravas', '03-rainha', '04-namoro', '05-garage', '06-verao', '07-farol',
  '08-croco', '09-tomas', '10-bimby', '11-pedras', '12-xafarix', '13-jantares', '14-santos',
  '15-sushi', '16-casa', '17-rugby', '18-naval', '19-eventos', '20-mocambique', '21-lanheses',
  '22-noruega', '23-madrinha', '24-barco', '25-pedido', '26-jeanne', '27-festa',
];

const missing = (file, err) => ({
  id: file.slice(3),
  title: 'Em construção',
  story: 'Este capítulo ainda não está pronto.',
  broken: String((err && err.message) || err),
  acts: [{ act: Talk, lines: ['Este capítulo ainda está em construção.'] }],
});

export const LEVELS = [];
export const ready = Promise.all(FILES.map((file) => import(`./${file}.js`).then(
  (m) => m.default,
  (err) => { console.error('nível ' + file, err); return missing(file, err); },
))).then((list) => { LEVELS.push(...list); return LEVELS; });

// Etiqueta de cada nível: "Nível 3", ...
export const levelLabel = (index) => 'Nível ' + (index + 1);
