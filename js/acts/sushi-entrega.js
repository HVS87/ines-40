// Pele da «estrada» para o nível 15: as entregas do Sushi@Home, de scooter, por Lisboa à noite.
// Carros em segunda fila (de quatro piscas), carris do elétrico e um gato guloso pelo caminho;
// três portas à espera do jantar.
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, SKIN, clamp, text } from '../draw.js';
import { cidade, road, roda, balao } from './estrada.js';

const PORTAS = { verde: '#3f9f6a', azul: '#3f6fb5', vermelha: '#c0392b' };
const OK = ['Primeira entrega: sushi inteirinho e cliente feliz!', 'Segunda entrega: nem um grão de arroz fora do sítio!', 'Terceira entrega: chegou tudo impecável!'];
const KO = 'O sushi chegou... um bocadinho abanado. Foge aos obstáculos!';

// O letreiro «SUSHI@HOME» (a arroba das letras de píxeis comuns lê-se mal: desenha-se aqui).
const AT = ['.###.', '#.#.#', '#.###', '#....', '.###.'];
function arroba(ctx, x, y, color, sc = 1) {
  ctx.fillStyle = color;
  AT.forEach((row, j) => { for (let i = 0; i < 5; i++) if (row[i] === '#') ctx.fillRect(Math.round(x) + i * sc, Math.round(y) + j * sc, sc, sc); });
}
// numa linha só, centrado em cx; devolve a largura
export function logo(ctx, cx, y, sc = 1, c1 = PAPER, c2 = '#ff8a6a') {
  const w = 47 * sc, x = Math.round(cx - w / 2);
  text(ctx, 'SUSHI', x, y, c1, { scale: sc });
  arroba(ctx, x + 21 * sc, y, c2, sc);
  text(ctx, 'HOME', x + 28 * sc, y, c1, { scale: sc });
  return w;
}

export const peleEntrega = {
  intro: 'Toca para mudar de faixa: foge aos carros em segunda fila e leva o sushi inteiro!',
  arrive: 'Três entregas feitas: o Sushi@Home já anda nas ruas de Lisboa!',

  start(act) {
    act.mem.lou = getCharacter('lourenco', 'sushi');
    act.mem.n = 0;
  },
  stop(act, s, ok) { const k = act.mem.n++; return ok ? OK[k % 3] : KO; },

  back(ctx, R, a) { cidade(true).back(ctx, R, a); },
  front(ctx, R, a) { cidade(true).front(ctx, R, a); },
  road(ctx, R, a) { road(ctx, R, a, { asphalt: '#3a3a52', edge: '#5a5a78', line: '#c8c4d8' }); },

  vehicle: {
    w: 40, h: 40, back: 29,
    draw(ctx, R, x, y, a, act) {
      const m = act.mem, W = '#f2f2f7', WD = '#b8bcd0';
      R(x - 18, y - 1, 36, 2, 'rgba(10,8,24,0.4)');
      // o feixe do farol
      ctx.fillStyle = 'rgba(255,240,170,0.16)'; ctx.fillRect(x + 16, y - 20, 30, 12); ctx.fillRect(x + 16, y - 17, 46, 8);
      // a caixa das entregas
      R(x - 28, y - 35, 25, 17, INK); R(x - 27, y - 34, 23, 15, '#1c1c28'); R(x - 27, y - 34, 23, 1, '#c0392b');
      text(ctx, 'SUSHI', x - 25, y - 32, PAPER); arroba(ctx, x - 26, y - 25, '#ff8a6a'); text(ctx, 'HOME', x - 20, y - 25, '#ff8a6a');
      // o condutor: tronco e cabeça do Lourenço, de capacete
      const img = m.lou.stand.r;
      ctx.drawImage(img, 2, 1, 12, 16, x - 7, y - 38, 12, 16);
      R(x - 7, y - 39, 12, 6, INK); R(x - 6, y - 38, 10, 4, '#e8e8f0'); R(x - 6, y - 38, 10, 1, '#ffffff'); R(x + 1, y - 35, 4, 1, '#c0392b');
      R(x + 1, y - 28, 7, 2, '#1c1c28'); R(x + 8, y - 28, 2, 2, SKIN);        // braço ao guiador
      R(x - 4, y - 23, 10, 4, '#1c1c28'); R(x + 4, y - 20, 3, 10, '#1c1c28'); R(x + 4, y - 11, 6, 2, '#111122');   // perna
      // a scooter
      R(x - 19, y - 19, 16, 4, INK);                                        // banco
      R(x - 20, y - 16, 18, 10, INK); R(x - 19, y - 15, 16, 8, W); R(x - 19, y - 10, 16, 3, WD);
      R(x - 6, y - 10, 18, 4, INK); R(x - 5, y - 9, 16, 2, W);                // estrado
      R(x + 9, y - 27, 5, 20, INK); R(x + 10, y - 26, 3, 18, W); R(x + 12, y - 26, 1, 18, WD);   // escudo da frente
      R(x + 7, y - 30, 7, 3, INK); R(x + 13, y - 23, 3, 4, INK); R(x + 14, y - 22, 2, 2, '#fff3b0');
      R(x - 22, y - 13, 2, 3, '#ff5d5d');
      roda(R, x - 12, y - 4, act.dist); roda(R, x + 13, y - 4, act.dist);
      R(x + 9, y - 9, 9, 2, INK);                                           // guarda-lamas
    },
  },

  obs: {
    // carro parado em segunda fila, de quatro piscas
    segunda: {
      w: 40, h: 22, msg: ['Lourenço: «Em segunda fila e de quatro piscas... um clássico.»', 'Lourenço: «É só um minutinho, dizem eles!»'],
      draw(ctx, R, x, y, o, a) {
        const c = ['#7ec8f0', '#f29ac0', '#7be0b0', '#ffb347'][Math.floor(o.at * 3) % 4], on = Math.floor(a.t * 3) % 2;
        R(x - 21, y - 13, 42, 11, INK); R(x - 20, y - 12, 40, 9, c); R(x - 20, y - 6, 40, 3, 'rgba(0,0,0,0.25)');
        R(x - 13, y - 22, 26, 10, INK); R(x - 12, y - 21, 24, 9, c); R(x - 10, y - 19, 9, 6, '#26304a'); R(x + 1, y - 19, 9, 6, '#26304a'); R(x - 10, y - 19, 3, 2, '#5a6a8a');
        roda(R, x - 12, y - 4, 0); roda(R, x + 12, y - 4, 0);
        const p = on ? '#ffb020' : '#6a4a20';
        R(x - 21, y - 11, 2, 3, p); R(x + 19, y - 11, 2, 3, p);
        if (on) { ctx.fillStyle = 'rgba(255,176,32,0.25)'; ctx.fillRect(x - 25, y - 14, 8, 9); ctx.fillRect(x + 17, y - 14, 8, 9); }
      },
    },
    // carris do elétrico a atravessar a faixa: escorregam!
    carris: {
      w: 26, h: 8, msg: 'Lourenço: «Carris do elétrico: o terror das scooters!»',
      draw(ctx, R, x, y) {
        for (let k = 0; k < 13; k++) {
          const dy = Math.round((k / 12) * 12);
          R(x - 14 + k * 2, y - 13 + dy, 3, 2, '#1a1830'); R(x - 14 + k * 2, y - 14 + dy, 3, 1, '#e4e8f8');
          R(x - 6 + k * 2, y - 13 + dy, 3, 2, '#1a1830'); R(x - 6 + k * 2, y - 14 + dy, 3, 1, '#e4e8f8');
        }
      },
    },
    // um gato a quem cheirou a salmão
    gato: {
      w: 14, h: 14, msg: 'O gato sentiu o cheiro a salmão: «Miau!»',
      draw(ctx, R, x, y, o, a) {
        let gy = y;
        if (o.hit) { const f = a.t - o.hit; x -= Math.round(f * 40); gy = y - Math.round(Math.max(0, 22 * f - 30 * f * f)) - Math.round(f * 14); }
        R(x - 5, gy - 9, 10, 9, INK); R(x - 4, gy - 8, 8, 8, '#f0a040'); R(x - 4, gy - 4, 8, 1, '#c87820');
        R(x - 1, gy - 15, 8, 7, INK); R(x, gy - 14, 6, 5, '#f0a040'); R(x - 1, gy - 17, 2, 3, INK); R(x + 5, gy - 17, 2, 3, INK);
        R(x + 1, gy - 13, 1, 2, '#b8ff6a'); R(x + 4, gy - 13, 1, 2, '#b8ff6a');
        const tail = Math.floor(a.t * 3) % 2;
        R(x - 8, gy - 6 - tail * 3, 3, 2, INK); R(x - 9, gy - 9 - tail * 3, 2, 4, INK);
        if (o.hit) balao(ctx, R, 'MIAU!', x + 2, gy - 20);
      },
    },
  },

  props: {
    // a porta de um cliente: abre-se quando a scooter para
    porta(ctx, R, x, a, p) {
      const b = a.roadTop - 8, c = PORTAS[p.cor] || PORTAS.verde;
      const f = p.t0 ? a.t - p.t0 : -1, open = f < 0 ? 0 : clamp(Math.min(f / 0.3, (2.3 - f) / 0.3), 0, 1);
      R(x - 12, b - 30, 24, 30, INK); R(x - 11, b - 29, 22, 29, '#8a84a8');
      R(x - 8, b - 25, 16, 25, '#ffd98a');                                   // a luz lá de dentro
      if (open > 0.5) {
        // o cliente, de braço estendido
        R(x - 3, b - 21, 7, 7, INK); R(x - 2, b - 20, 5, 5, SKIN); R(x - 2, b - 21, 5, 2, '#5a3a22');
        R(x - 4, b - 14, 9, 14, INK); R(x - 3, b - 13, 7, 13, '#7a8ac8'); R(x - 9, b - 11, 6, 2, SKIN);
        if (p.done) balao(ctx, R, p.ok ? 'OBRIGADO!' : 'UI...', x, b - 34, p.ok ? '#2f7f52' : '#c0392b');
      }
      const dw = Math.round(16 * (1 - open * 0.8));
      R(x - 8, b - 25, dw, 25, c); if (dw > 6) { R(x - 6, b - 23, dw - 4, 9, 'rgba(255,255,255,0.18)'); R(x - 10 + dw, b - 13, 1, 2, GOLD); }
      R(x - 4, b - 37, 8, 6, INK); R(x - 3, b - 36, 6, 4, '#ffe9a0');           // lanterna por cima da porta
      ctx.fillStyle = 'rgba(255,220,130,0.16)'; ctx.fillRect(x - 14, b - 38, 28, 42);
      // seta a marcar a entrega que falta
      if (!p.done) { const by = b - 46 + Math.round(Math.sin(a.t * 6) * 2); R(x - 4, by - 1, 9, 5, INK); R(x - 3, by, 7, 3, GOLD); R(x - 2, by + 3, 5, 2, INK); R(x - 1, by + 3, 3, 1, GOLD); R(x, by + 4, 1, 2, INK); }
    },
  },
};
