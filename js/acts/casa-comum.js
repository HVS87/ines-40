// Nível 15 «Viver Juntos»: a sala da casa nova, partilhada pelos atos do nível (decorar,
// montar o móvel e o serão no sofá). O que o jogador escolhe (cor da parede, quadros direitos
// ou tortos) fica guardado na cena, em `scene.casa`, para aparecer igual nos atos seguintes.
import { INK, PAPER, GOLD, PINK, MINT, hash } from '../draw.js';

// As latas de tinta: qualquer uma serve (a casa é deles!).
export const CORES = [
  { nome: 'AMARELO-SOL', fala: 'Amarelo-sol', c: '#f4d98a' },
  { nome: 'VERDE-SALVA', fala: 'Verde-salva', c: '#b9d8b4' },
  { nome: 'AZUL-CÉU', fala: 'Azul-céu', c: '#b4d6ee' },
  { nome: 'ROSA-VELHO', fala: 'Rosa-velho', c: '#efc2c4' },
  { nome: 'TERRACOTA', fala: 'Terracota', c: '#e6a882' },
];
export const REBOCO = '#d9d3c7';
const MADEIRA = '#e3c48a', MADEIRA_D = '#b8935a';

// Estado da casa (um por cena). `quadros`: inclinação com que cada um ficou (null = por pendurar).
export function novaCasa(scene) {
  scene.casa = { cor: null, quadros: [null, null, null], sofa: false, planta: false, estante: 0 };
  return scene.casa;
}
export function casa(scene) { return scene.casa || novaCasa(scene); }

// Para os atos que vêm depois de decorar: garante que está tudo no sítio (útil quando, nos
// testes, se abre o nível a meio).
export function casaPronta(scene) {
  const c = casa(scene);
  if (!c.cor) c.cor = CORES[2].c;
  c.quadros = c.quadros.map((a) => (a === null ? 0 : a));
  c.sofa = c.planta = true;
  return c;
}

// Onde fica cada coisa na sala, para o tamanho de ecrã `v` e a linha do chão `gy`.
export function salaLayout(v, gy, top) {
  const P = v.portrait, w = v.w;
  return {
    gy, top,
    sofaX: Math.round(w * 0.5), sofaW: Math.round(w * 0.2) + 44,
    janela: P ? { x: 14, y: top + 14, w: 54, h: 62 } : { x: Math.round(w * 0.05), y: top + 6, w: 46, h: 40 },
    quadros: (P ? [0.3, 0.52, 0.74] : [0.36, 0.5, 0.64]).map((f) => Math.round(w * f)),
    quadroY: P ? gy - 118 : Math.min(top + 26, gy - 66),
    plantaX: Math.round(w * (P ? 0.13 : 0.11)),
    estanteX: Math.round(w * 0.88),
  };
}

// ---------- Os quadros (desenhados uma vez em telas à parte) ----------
const QW = 28, QH = 22;
let telas = null;
function quadros() {
  if (telas) return telas;
  telas = [0, 1, 2].map((i) => {
    const c = document.createElement('canvas');
    c.width = QW; c.height = QH;
    const g = c.getContext('2d');
    const r = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    r(0, 0, QW, QH, INK); r(1, 1, QW - 2, QH - 2, ['#b8793a', '#fff6e6', '#3a3f55'][i]); r(3, 3, QW - 6, QH - 6, INK);
    if (i === 0) {
      // um coração
      r(4, 4, QW - 8, QH - 8, '#fff1c4');
      r(9, 7, 4, 2, PINK); r(15, 7, 4, 2, PINK); r(8, 9, 12, 3, PINK); r(9, 12, 10, 2, PINK); r(11, 14, 6, 1, PINK); r(13, 15, 2, 1, PINK);
      r(10, 8, 1, 1, '#ffffff');
    } else if (i === 1) {
      // o mar, o sol e um barquinho à vela
      r(4, 4, QW - 8, 8, '#bfe6f8'); r(4, 12, QW - 8, 6, '#3f8fd0'); r(4, 12, QW - 8, 1, '#8fcdf0');
      r(17, 5, 4, 4, GOLD);
      r(9, 12, 7, 2, '#8a5a34'); r(12, 6, 1, 6, INK); r(9, 8, 3, 3, PAPER); r(10, 7, 2, 1, PAPER); r(13, 9, 2, 2, PAPER);
      r(6, 15, 3, 1, '#8fcdf0'); r(18, 16, 3, 1, '#8fcdf0');
    } else {
      // formas modernas
      r(4, 4, QW - 8, QH - 8, '#f2ede2');
      r(6, 6, 7, 7, MINT); r(11, 9, 8, 8, '#ff8a4b'); r(17, 5, 5, 5, GOLD); r(7, 15, 12, 1, INK);
    }
    return c;
  });
  return telas;
}

// Um quadro pendurado num prego, com o centro em (cx, cy) e inclinado `ang` graus. Para manter
// os píxeis direitos, a inclinação faz-se coluna a coluna (cada coluna sobe ou desce um pouco).
export function drawQuadro(ctx, R, i, cx, cy, ang = 0) {
  const img = quadros()[i % 3], k = Math.tan((ang * Math.PI) / 180);
  const x0 = Math.round(cx - QW / 2), y0 = Math.round(cy - QH / 2), py = y0 - 6;
  // prego e fio
  for (let d = 1; d <= 5; d++) {
    R(cx - d * 2, py + d + Math.round(-d * 2 * k), 1, 1, '#6b5a4e');
    R(cx + d * 2 - 1, py + d + Math.round(d * 2 * k), 1, 1, '#6b5a4e');
  }
  R(cx - 1, py - 1, 2, 2, INK);
  for (let sx = 0; sx < QW; sx++) ctx.drawImage(img, sx, 0, 1, QH, x0 + sx, y0 + Math.round((sx - QW / 2 + 0.5) * k), 1, QH);
}

// ---------- Os móveis ----------
const SOFA = '#2f8a96', SOFA_L = '#45a6b2', SOFA_D = '#236a74';
// O sofá em duas partes: o encosto (atrás de quem se senta) e a frente (por cima das pernas).
export function sofaBack(R, cx, gy, W) {
  const x = Math.round(cx - W / 2);
  R(x + 5, gy - 35, W - 10, 26, INK); R(x + 6, gy - 34, W - 12, 24, SOFA); R(x + 6, gy - 34, W - 12, 2, SOFA_L);
  const n = 3, cw = (W - 12) / n;
  for (let k = 1; k < n; k++) R(x + 6 + Math.round(k * cw), gy - 31, 1, 20, SOFA_D);
}
export function sofaFront(R, cx, gy, W) {
  const x = Math.round(cx - W / 2);
  R(x - 1, gy - 26, 12, 25, INK); R(x + W - 11, gy - 26, 12, 25, INK); R(x + 8, gy - 17, W - 16, 16, INK);
  R(x + 9, gy - 16, W - 18, 9, SOFA_L); R(x + 9, gy - 16, W - 18, 2, '#62bcc6');
  R(x + 9, gy - 7, W - 18, 5, SOFA_D);
  R(x, gy - 25, 10, 23, SOFA); R(x, gy - 25, 10, 3, SOFA_L); R(x + W - 10, gy - 25, 10, 23, SOFA); R(x + W - 10, gy - 25, 10, 3, SOFA_L);
  R(x + 2, gy - 2, 3, 2, INK); R(x + W - 5, gy - 2, 3, 2, INK);
}
export function sofa(R, cx, gy, W) {
  sofaBack(R, cx, gy, W);
  // almofadas
  R(cx - W / 2 + 12, gy - 26, 12, 11, INK); R(cx - W / 2 + 13, gy - 25, 10, 9, PINK);
  R(cx + W / 2 - 24, gy - 26, 12, 11, INK); R(cx + W / 2 - 23, gy - 25, 10, 9, GOLD);
  sofaFront(R, cx, gy, W);
}

// A planta no vaso; `vico` de 0 (murcha) a 1 (viçosa).
export function planta(R, x, gy, vico = 1) {
  const d = Math.round((1 - vico) * 4), G = vico > 0.5 ? '#4fae5a' : '#7fa85a', GD = '#2f7a3f';
  x = Math.round(x);
  R(x - 1, gy - 28 + d, 2, 18 - d, GD);
  const folha = (lx, ly, w, h) => { R(lx - 1, ly - 1 + d, w + 2, h + 2, GD); R(lx, ly + d, w, h, G); R(lx + 1, ly + d, w - 2, 1, '#7fd08a'); };
  folha(x - 10, gy - 27 + d, 8, 4); folha(x + 2, gy - 31, 8, 4); folha(x - 7, gy - 36 + d, 6, 4); folha(x + 2, gy - 21 + d, 7, 3); folha(x - 2, gy - 41 + d * 2, 5, 4);
  R(x - 8, gy - 12, 16, 12, INK); R(x - 7, gy - 11, 14, 3, '#e58a5c'); R(x - 6, gy - 8, 12, 7, '#c7683a'); R(x - 6, gy - 3, 12, 2, '#a8502a');
}

// A estante por montar: fase 0 (nada) a 4 (pronta, com livros).
export const ESTANTE_W = 40, ESTANTE_H = 60;
export function estante(R, x, gy, fase) {
  if (fase <= 0) return;
  x = Math.round(x);
  const B = (bx, by, w, h, c) => { R(bx - 1, by - 1, w + 2, h + 2, INK); R(bx, by, w, h, c); };
  const alto = fase >= 2 ? 56 : 28;
  if (fase >= 3) B(x - 17, gy - 57, 34, 53, '#c9a86a');
  B(x - 20, gy - 4, 40, 4, MADEIRA_D);
  B(x - 20, gy - alto, 3, alto - 4, MADEIRA); B(x + 17, gy - alto, 3, alto - 4, MADEIRA);
  if (fase >= 2) { B(x - 17, gy - 23, 34, 2, MADEIRA); B(x - 17, gy - 41, 34, 2, MADEIRA); }
  if (fase >= 3) B(x - 21, gy - 60, 42, 3, MADEIRA);
  if (fase >= 4) {
    // livros e bugigangas
    const livros = ['#c0392b', '#3f6fb5', GOLD, '#3fa672', PINK, '#7a3fa0', '#ff8a4b'];
    for (let k = 0; k < 7; k++) { const hgt = 10 + Math.round(hash(k + 3) * 4); R(x - 15 + k * 4, gy - 23 - hgt, 3, hgt, livros[k]); }
    for (let k = 0; k < 4; k++) { const hgt = 9 + Math.round(hash(k + 9) * 4); R(x - 15 + k * 4, gy - 41 - hgt, 3, hgt, livros[(k + 3) % 7]); }
    R(x + 5, gy - 50, 9, 9, INK); R(x + 6, gy - 49, 7, 7, PAPER); R(x + 8, gy - 47, 3, 3, PINK);
    R(x - 13, gy - 12, 10, 8, INK); R(x - 12, gy - 11, 8, 6, MINT);
    R(x + 2, gy - 9, 12, 5, INK); R(x + 3, gy - 8, 10, 3, '#f2e6c8');
  }
}

// A janela, com os telhados lá fora (de dia ou de noite).
function janela(R, J, noite) {
  const { x, y, w, h } = J;
  R(x - 2, y - 2, w + 4, h + 4, INK); R(x - 1, y - 1, w + 2, h + 2, PAPER);
  R(x + 1, y + 1, w - 2, h - 2, noite ? '#232a5a' : '#8fcdf0'); R(x + 1, y + Math.round(h * 0.45), w - 2, Math.round(h * 0.3), noite ? '#2f3a72' : '#bfe6f8');
  if (noite) { for (let k = 0; k < 6; k++) R(x + 3 + Math.round(hash(k + 1) * (w - 7)), y + 3 + Math.round(hash(k * 3 + 2) * h * 0.35), 1, 1, '#ffffff'); R(x + w - 10, y + 5, 4, 4, '#fff6c4'); }
  else { R(x + w - 12, y + 5, 5, 5, '#fff1a8'); R(x + 5, y + 8, 9, 2, '#ffffff'); R(x + 7, y + 6, 5, 2, '#ffffff'); }
  // casario
  const by = y + h - 1, casas = [[2, 12, 14], [14, 18, 10], [24, 10, 12], [36, 15, 14]];
  for (const [dx, ch, cw] of casas) {
    if (dx + 2 >= w) continue;
    const ww = Math.min(cw, w - 1 - dx);
    R(x + dx, by - ch, ww, ch, noite ? '#3a3f6a' : '#f2e6d0'); R(x + dx, by - ch - 3, ww, 3, noite ? '#5a3a4a' : '#d8785a');
    R(x + dx + 2, by - ch + 4, 2, 3, noite ? GOLD : '#6fa8d4'); if (ww > 8) R(x + dx + 6, by - ch + 4, 2, 3, noite && hash(dx) > 0.5 ? '#3a3f6a' : noite ? GOLD : '#6fa8d4');
  }
  R(x + Math.round(w / 2) - 1, y, 2, h, PAPER); R(x, y + Math.round(h / 2) - 1, w, 2, PAPER);
  R(x - 3, y + h + 2, w + 6, 3, INK); R(x - 2, y + h + 2, w + 4, 2, PAPER);
}

// A sala inteira: parede (na cor escolhida ou ainda em reboco), janela, chão de madeira e o
// que já lá estiver. opts: { noite, pintura: 0–1 (a tinta a avançar da esquerda), corNova,
// semQuadros, semSofa, semPlanta, semJanela, vico, estante }.
export function drawSala(ctx, v, R, L, st, opts = {}) {
  const w = v.w, gy = L.gy, base = opts.pintura !== undefined ? REBOCO : st.cor || REBOCO;
  R(0, 0, w, gy, base);
  if (opts.pintura !== undefined) {
    const px = Math.round(w * opts.pintura);
    R(0, 0, px, gy, opts.corNova); R(px, 0, 2, gy, PAPER);
  }
  if (base === REBOCO) for (let k = 0; k < 40; k++) { const sx = Math.round(hash(k + 5) * w), sy = Math.round(hash(k * 2.3 + 1) * gy); if (opts.pintura === undefined || sx > w * opts.pintura + 2) R(sx, sy, 2, 1, '#c8c1b4'); }
  R(0, gy - 30, w, 26, 'rgba(43,29,46,0.05)');
  // rodapé e chão de tacos
  R(0, gy - 5, w, 1, 'rgba(43,29,46,0.25)'); R(0, gy - 4, w, 4, PAPER);
  R(0, gy, w, v.h - gy, '#c49a6a'); R(0, gy, w, 1, '#8a6238');
  for (let y = gy + 7, r = 0; y < v.h; y += 8, r++) {
    R(0, y, w, 1, '#a87f52');
    for (let x = (r % 2) * 14 + 6; x < w; x += 28) R(x, y - 6, 1, 6, '#a87f52');
  }
  if (!opts.semJanela) janela(R, L.janela, opts.noite);
  if (!opts.semQuadros) st.quadros.forEach((a, i) => { if (a !== null) drawQuadro(ctx, R, i, L.quadros[i], L.quadroY, a); });
  if (st.planta && !opts.semPlanta) planta(R, L.plantaX, gy, opts.vico === undefined ? 1 : opts.vico);
  estante(R, L.estanteX, gy, opts.estante === undefined ? st.estante : opts.estante);
  if (st.sofa && !opts.semSofa) sofa(R, L.sofaX, gy, L.sofaW);
}
