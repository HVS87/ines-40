// Lista ordenada dos níveis: um ficheiro por capítulo da história, pela ordem em que se jogam.
// Cada ficheiro é carregado à parte: se um falhar, o jogo continua com um aviso nesse nível.
import { Talk } from '../acts/base.js';

const FILES = [
  '01-nascimento', '02-escravas', '03-rainha', '04-namoro', '05-garage', '06-croco', '07-verao',
  '08-farol', '09-tomas', '10-bimby', '11-pedras', '12-xafarix', '13-jantares', '14-santos',
  '15-sushi', '16-casa', '17-naval', '18-eventos', '19-mocambique', '20-lanheses', '21-noruega',
  '22-madrinha', '23-barco', '24-pedido', '25-jeanne', '26-festa',
];

const missing = (file, err) => ({
  id: file.slice(3),
  title: 'Em construção',
  story: 'Este capítulo ainda não está pronto.',
  broken: String((err && err.message) || err),
  acts: [{ act: Talk, lines: ['Este capítulo ainda está em construção.'] }],
});

export const LEVELS = await Promise.all(FILES.map((file) => import(`./${file}.js`).then(
  (m) => m.default,
  (err) => { console.error('nível ' + file, err); return missing(file, err); },
)));

// Etiqueta de cada nível: "Nível 3", ...
export const levelLabel = (index) => 'Nível ' + (index + 1);
