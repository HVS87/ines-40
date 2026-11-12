// Lista ordenada dos níveis: um ficheiro por capítulo da história, pela ordem em que se jogam.
// Cada ficheiro é carregado à parte: se um falhar, o jogo continua com um aviso nesse nível.
import { Talk } from '../acts/base.js';

const FILES = [
  '01-nascimento', '02-escravas', '03-rainha', '04-namoro', '05-garage', '06-croco', '07-verao',
  '08-farol', '09-pedras', '10-tomas', '11-bimby', '12-xafarix', '13-jantares', '14-sushi',
  '15-casa', '16-naval', '17-eventos', '18-mocambique', '19-lanheses', '20-noruega',
  '21-madrinha', '22-barco', '23-pedido', '24-jeanne', '25-festa',
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
