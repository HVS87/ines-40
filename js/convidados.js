// Quem vai à festa dos 40 anos, por grupos, pela ordem em que a Inês os encontra: a lista
// CONVIDADOS serve os abraços do nível 27 e a roda à volta do bolo. Os pais e os irmãos da Inês não
// vão a essa festa, mas estão no ecrã final dos parabéns, que usa a lista TODOS (família e amigos).
// Cada pessoa é [personagem, roupa] (ver LOOKS em js/sprites.js).
export const COLEGIO = [['ana', 'festa'], ['kiko', 'festa'], ['maisa', 'festa'], ['soft', 'festa'], ['isabel', 'festa']];
export const LICEU = [['mi', 'festa'], ['leal', 'festa'], ['maria', 'festa'], ['nuno', 'festa'], ['tete', 'festa']];
export const O_PIPOCA = [['pipoca', 'festa']];
export const BIMBY = [['barbara', 'festa'], ['isabelv', 'festa']];
export const MAR = [['pi', 'festa'], ['carlos', 'festa'], ['zebras', 'festa']];
export const CATAMARA = [['moncada', 'festa'], ['marta', 'festa'], ['gonzaga', 'festa']];
export const CASA = [['lourenco', 'festa'], ['tomas', 'festa']];

export const CONVIDADOS = [...COLEGIO, ...LICEU, ...O_PIPOCA, ...BIMBY, ...MAR, ...CATAMARA, ...CASA];

// Só para o ecrã final: os pais e os irmãos da Inês.
export const FAMILIA = [['tio', 'hoje'], ['tiafatima', 'hoje'], ['irma1', 'festa'], ['irma2', 'festa'], ['irmao', 'festa'], ['irmao2', 'festa']];
// (o Lourenço e o Tomás ficam à parte: no ecrã final estão ao lado da Inês, com a Jeanne e o Ginja)
export const TODOS = [...FAMILIA, ...COLEGIO, ...LICEU, ...O_PIPOCA, ...BIMBY, ...MAR, ...CATAMARA];
