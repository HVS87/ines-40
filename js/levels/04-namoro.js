// Nível 4 — «O Namoro»: a Inês e o Lourenço apaixonam-se no liceu. O caminho de mãos dadas depois
// das aulas, o primeiro beijo e os jantares no Di Casa, o italiano baratinho dos dates.
import { Passeio } from '../acts/namoro-passeio.js';
import { Jantar } from '../acts/namoro-jantar.js';
import { Conta } from '../acts/namoro-conta.js';

export default {
  id: 'namoro',
  title: 'O Namoro',
  music: 'calm',
  story: 'No Rainha, a Inês e o Lourenço apaixonam-se e começam a namorar. Os dates eram quase sempre no Di Casa, um restaurante italiano baratinho: uma pizza para dividir, um esparguete e as moedas contadas para a conta.',
  help: 'Toca no ecrã (ou Espaço) para saltarem e apanharem corações. No jantar, mantém premido só quando o empregado não está a olhar. Na conta, toca nas moedas (ou usa as setas e Espaço).',
  outro: 'O primeiro amor, uma pizza a meias e um beijo à porta do Di Casa.',
  acts: [
    { act: Passeio, when: 'Depois das aulas...', hearts: 5 },
    { act: Jantar, when: 'Ao jantar, no Di Casa...', hearts: 5 },
    { act: Conta, when: 'E no fim... a conta!', hearts: 3 },
  ],
};
