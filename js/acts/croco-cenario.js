// Cenários do nível «O Crôcô»: a esplanada do café na Avenida Infante Santo, desenhada pelas
// fotografias (o prédio, a caixa do toldo com o néon, a montra, as cadeiras de alumínio, o cartaz
// dos caracóis e o logótipo dos hambúrgueres), e a malta sentada às mesas. Usado pelos três atos.
import { INK, PAPER, GOLD, hash, lerp, mix, sky, disc, text, textW, person } from '../draw.js';
import { getCharacter, makeSprite } from '../sprites.js';

// Os amigos da esplanada, pela ordem em que se sentam.
const MALTA = [['ana', 'Ana'], ['mi', 'Mi'], ['soft', 'Soft'], ['pipoca', 'Pipoca'], ['ines', 'Inês'], ['pi', 'Pi'], ['leal', 'Leal'], ['isabel', 'Isabel'], ['maisa', 'Maísa'], ['maria', 'Maria'], ['tete', 'Tété']];
export const malta = () => MALTA.map(([who, name]) => ({ who, name, frames: getCharacter(who, 'casual') }));

const DIA = ['#6ab4ec', '#9fd0f4', '#cfe8f7', '#eef5e0'], TARDE = ['#3d2f78', '#c8527a', '#f8a05a', '#ffd68a'];

// ----- o néon «Crôcô» -----
// A letra do néon, traçada com curvas e passada a píxeis uma só vez: um C grande, «rôcô» em letra
// corrida e o arco que sai do C e passa por cima da palavra, como no letreiro verdadeiro.
const NEON_W = 46, NEON_H = 16;
const NEON = (() => {
  const pts = new Map();
  const put = (x, y) => { const X = Math.round(x), Y = Math.round(y); pts.set(X + ',' + Y, [X, Y]); };
  const arco = (cx, cy, rx, ry, a0, a1) => {
    const n = Math.ceil(Math.abs(a1 - a0) / 2);
    for (let i = 0; i <= n; i++) { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; put(cx + rx * Math.cos(a), cy + ry * Math.sin(a)); }
  };
  const linha = (x0, y0, x1, y1) => { const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2); for (let i = 0; i <= n; i++) put(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n); };
  arco(23, 9.4, 22, 9, 188, 372);                                    // o arco por cima
  arco(9.5, 10, 6, 4.6, 318, 42); linha(13.9, 6.9, 14.3, 8.2);       // C
  linha(13.9, 13.1, 16.6, 13.6);
  linha(17, 14, 17, 9.4); arco(19, 10.6, 2, 1.6, 180, 345);          // r
  arco(25, 11.5, 2.4, 2.6, 0, 360); put(24, 7); put(25, 6); put(26, 7);   // ô
  arco(32, 11.5, 2.4, 2.6, 312, 48);                                 // c
  arco(39, 11.5, 2.4, 2.6, 0, 360); put(38, 7); put(39, 6); put(40, 7);   // ô
  linha(44.4, 11.3, 41.8, 11.6);                                     // o arco acaba no último ô
  return [...pts.values()];
})();
// Desenha o néon com o canto de cima em (x, y). halo = cor do brilho (quando está aceso).
export function neon(R, x, y, cor, halo) {
  if (halo) for (const [px, py] of NEON) R(x + px - 1, y + py - 1, 3, 3, halo);
  for (const [px, py] of NEON) R(x + px, y + py, 1, 1, cor);
}

// O logótipo do Crôcô — o hambúrguer cor de laranja com o nome em letra corrida —, tirado da imagem
// verdadeira e reduzido a píxeis em dois tamanhos. Cada carácter guarda três pontos e cada ponto
// tem 0 a 3 de tinta (0 = branco, 3 = laranja cheio), para as curvas da letra não ficarem em escada.
const LOGO_G = { w: 81, h: 79, d: 'AAAAAAAAABav____lAAAAAAAAAAAAAAAAAABv_______5AAAAAAAAAAAAAAAABv_________5AAAAAAAAAAAAAAAf___________0AAAAAAAAAAAAAH_____________QAAAAAAAAAAAAv_____________4AAAAAAAAAAAH_______________QAAAAAAAAAA________________4AAAAAAAAAH_________________QAAAAAAAAf_________________0AAAAAAAC__________________9AAAAAAAL___________________gAAAAAAf___________________0AAAAAB____________________9AAAAAD_____________________AAAAAP_____________________wAAAAv_______6VAAAWv_______4AAAB_______kAAAAAAAb______9AAAD______QAAAAAAAAAH______AAAD_____gAAABVVQAAAAL_____AAAD____0AABr____-kAAAf____AAAD___9AABv_______5QAB____AAAB___gAC__6QAAAGv_-QAL__9AAAAv_8ABv_5AAAAAAAb_-AA__4AAAAL_gAf_0AAAAAAAAAG_5AL_gAAAAAEAL_5AAAAAAAAAAAH_gAUAAAAAAAC_-AAAAAAAAAAAAAf-AAAAAAAAAf_gAAAAAAAAAAAAABv4AAAAAAAD_4AAAAAAAAAAAAAAAH_QAAAAAAf-AAAAAAAAAAAAAAAAAv4AAAAAC_0AAAH_gAAAAAAAAAAAH_AAAAAL_AAAC_78AAAAAAAAAAAAv0AAAA_4AAAv9A-AAAAAAAAAAAAH9AAAD_gAAH_QA_AAAAAAAAAAAAB_QAAL-AAAv8AA_AAAAAAAAAAAAAf0AAv4AAH_gAD_AAAAAAAAAAAAAH9AB_gAAv9AAL-AAAAAAAAAAAAAB_AD_AAC_0AAv8AAAAAAAAAAAAAAfgH8AAP_AAB_0AAAAAAAAAAAAAAL0P4AA_8AAL_QAAAAAAAAAAAAAAD8fwAD_wAAv9AAAAAAAAAAAAAAAB9vgAL_AAH_0AAAAAAAQAAAAAABQ-_QAv8AAv_AAkAAACvwAAAAAGvgv_AB_0AC_4AD-AAAD7_QAAAAH7_f_AH_QAf_QAL_AAAAAUAAAAAAAUf_QP-AC_4AAH7AAAGkAAH-AAagAf_wv9Av-AQAD_QAC_-AA__gC_9At_9_9b_m_9AC_4AP4HAL-vgf0LAAf____kvlvAHx-A_QfQvwfR_QvAAH__-kD8AvAfA-C-A_C_QAD9B_EAAv_QAPgB-A9B9H8Av_9AAL4A_4AAv-AA-AD8D0H4PwANP4AAfwAsAAA_8AB4Af0PgfwfgAsvwAA_QA0AAA_8AAQB_R-B_B_QB0_gAP_ADgAAA_8AAAL-H0H4D_AHQ_QB__ALAAAA_9AAB_0fQfQP_QeA_gLz_AtAAAAv_QAf_R9A-B-_74A__-D_70AAAAf____4b0A_v0__gAv_0B__QAAAAH____S_QAf9Ab4AAGpAAf0AAAAAB___kAoAAAAAAAAAAAAAAAAAAAAAGukAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABv____________________gAAAAL_____________________8AAAAf_____________________-AAAAf_____________________-AAAAf______________________AAAAf______________________AAAAf______________________AAAAf_____________________-AAAAf_____________________-AAAAf_____________________-AAAAf_____________________-AAAAf_____________________-AAAAf_____________________-AAAAP_____________________9AAAAH_____________________4AAAABv____________________QAA' };
const LOGO_P = { w: 33, h: 32, d: 'AAAG__-QAAAAAB____-AAAAAf_____4AAAB_______AAAL_______0AAv_______8AB___-qv___AD__kAAAb__QD_4Cv_-Qb_gB-C-QABvR_AAEuQAAABtEAALkAAAAAC0AA9AagAAAAeADwC00AAAADgLAeB0AAAAA4dC4HwAAAAAN4LQfAAAAAAG0eC4JAKgAC358fQOAZB4KD__qsPimLc1gP0oc2rH8DigPQR3bdJ0LCALgbdo9l5vYAH_50qPQpHgABpAAAAAAAAAAaqqqqqqqpAB_________QB_________gB_________gB_________gB_________QAv________A' };
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', logos = new Map();
function logoImg(L) {
  if (!logos.has(L)) {
    const rows = [];
    for (let r = 0, k = 0; r < L.h; r++) {
      let row = '';
      for (let q = 0; q < L.w; q += 3) { const n = B64.indexOf(L.d[k++]); row += '.abc'[n >> 4] + '.abc'[(n >> 2) & 3] + '.abc'[n & 3]; }
      rows.push(row);
    }
    logos.set(L, makeSprite(rows, { a: '#ffdcb8', b: '#ffab61', c: '#ff7a00' }));
  }
  return logos.get(L);
}
// Tamanho da placa do logótipo (com a margem branca): [largura, altura].
export const logoTam = (grande) => { const L = grande ? LOGO_G : LOGO_P, m = grande ? 5 : 2; return [L.w + m * 2, L.h + m * 2]; };
// Desenha o logótipo numa placa branca com o canto de cima em (x, y); grande = versão maior.
export function logo(ctx, R, x, y, grande) {
  const L = grande ? LOGO_G : LOGO_P, m = grande ? 5 : 2, [w, h] = logoTam(grande);
  x = Math.round(x); y = Math.round(y);
  R(x - 1, y - 1, w + 2, h + 2, INK); R(x, y, w, h, '#ffffff');
  ctx.drawImage(logoImg(L), x + m, y + m);
}

// O cartaz da primavera: «Há caracóis à "Crôcô"», com o caracol preto e verde de casca clara.
// (cx, y) = meio do topo; w x h = tamanho da folha.
export function cartaz(ctx, R, cx, y, w, h) {
  const x = Math.round(cx - w / 2), AZ = '#1d2233', sc = w >= 90 ? 2 : 1;
  R(x + 2, y + 2, w, h, 'rgba(40,30,50,0.35)'); R(x - 1, y - 1, w + 2, h + 2, INK); R(x, y, w, h, '#f7f5ee');
  R(x + 3, y - 2, 7, 4, '#e8dca0'); R(x + w - 10, y - 2, 7, 4, '#e8dca0');     // fita-cola
  let ty = y + 4 + 2 * sc;
  text(ctx, 'HÁ CARACÓIS', cx, ty, AZ, { scale: sc, align: 'center' }); ty += 6 * sc + 2;
  text(ctx, 'À', cx, ty + 2, AZ, { align: 'center' }); ty += 11;
  const cw = textW('CROCO', sc), tx = Math.round(cx - cw / 2), P = '#d8325a';
  text(ctx, 'CROCO', tx, ty + 2 * sc, P, { scale: sc });
  for (const k of [2, 4]) { const ox = tx + k * 4 * sc; R(ox + sc, ty - sc, sc, sc, P); R(ox, ty, sc, sc, P); R(ox + 2 * sc, ty, sc, sc, P); }     // os circunflexos
  for (const ox of [tx - 3 * sc - 1, tx + cw + 2]) { R(ox, ty + sc, sc, 2 * sc, P); R(ox + sc + 1, ty + sc, sc, 2 * sc, P); }                          // as aspas
  // o caracol
  const gy = y + h - 5, sx = Math.round(cx - w * 0.14), r = Math.max(7, Math.min(13, Math.floor((gy - ty - 9 * sc) / 2) - 1));
  R(sx - r - 3, gy - 5, r * 2 + 16, 5, AZ); R(sx + r + 8, gy - 9, 6, 7, AZ); R(sx + r + 12, gy - 12, 4, 6, AZ);        // o corpo e a cabeça
  R(sx - r, gy - 3, r * 2 + 10, 2, '#2f9a4a');                                                                         // a risca verde
  for (let i = 0; i < 9; i++) R(sx + r + 14 + i, gy - 13 - i, 2, 1, AZ);                                               // as antenas
  disc(ctx, sx + r + 24, gy - 23, 2, AZ); R(sx + r + 16, gy - 8, 7, 1, AZ); disc(ctx, sx + r + 24, gy - 8, 1, AZ);
  disc(ctx, sx, gy - r - 2, r + 1, AZ); disc(ctx, sx, gy - r - 2, r - 1, '#e6cf96');                                   // a casca, em espiral
  disc(ctx, sx - 1, gy - r - 1, Math.round(r * 0.62), AZ); disc(ctx, sx - 1, gy - r - 1, Math.round(r * 0.62) - 2, '#e6cf96');
  if (r > 8) { disc(ctx, sx - 2, gy - r, 2, AZ); R(sx - 2, gy - r, 1, 1, '#e6cf96'); }
}

function arvore(ctx, R, x, gy, big, dusk) {
  const th = big ? 112 : 94, r = big ? 22 : 16;      // copa alta, por cima do toldo
  R(x - 2, gy - th, 4, th, '#6b4a30'); R(x - 1, gy - th, 1, th, '#8a6442');
  const a = mix('#4f9f52', '#3a6a52', dusk), b = mix('#6fbf62', '#4a8a5a', dusk);
  disc(ctx, x, gy - th - r + 8, r, a); disc(ctx, x - r + 4, gy - th + 4, r - 6, a); disc(ctx, x + r - 4, gy - th + 2, r - 7, b);
  disc(ctx, x - 4, gy - th - r + 2, r - 9, b);
  for (let i = 0; i < 6; i++) R(x - r + 6 + i * (r / 3.2), gy - th - r + 10 + (i % 3) * 7, 2, 2, '#fffbe8');   // flores da primavera
}

// O candeeiro da avenida (acende-se ao pôr do sol).
function candeeiro(ctx, R, x, gy, big, aceso) {
  const h = big ? 118 : 92;
  R(x - 4, gy - 5, 8, 5, '#8f9690'); R(x - 2, gy - h, 4, h - 4, '#4e5a56'); R(x - 1, gy - h, 1, h - 4, '#6f7c77');
  R(x - 2, gy - h - 2, 12, 3, '#4e5a56'); R(x + 5, gy - h + 1, 8, 5, INK); R(x + 6, gy - h + 2, 6, 3, aceso ? '#fff0a8' : '#c9cdd2');
  if (aceso) { disc(ctx, x + 9, gy - h + 5, 9, 'rgba(255,236,150,0.22)'); disc(ctx, x + 9, gy - h + 4, 5, 'rgba(255,240,170,0.3)'); }
}

// Uma janela do prédio, com o estore meio corrido (ou cortinas) e o parapeito.
function janela(R, x, y, w, h, tipo, luz) {
  R(x - 2, y - 3, w + 4, 3, '#d9d6c8'); R(x - 1, y - 1, w + 2, h + 2, '#6f6e68'); R(x, y, w, h, luz ? '#ffd98a' : '#4a5566');
  if (tipo === 'estore') { const e = Math.round(h * 0.68); R(x, y, w, e, '#d8cfb6'); for (let i = 2; i < e; i += 3) R(x, y + i, w, 1, '#b9ae92'); for (let i = Math.round(w / 3); i < w - 2; i += Math.round(w / 3)) R(x + i, y + e, 1, h - e, '#e8e8ee'); }
  else { for (let i = Math.round(w / 3); i < w - 1; i += Math.round(w / 3)) R(x + i, y, 1, h, '#f2f2f2'); R(x + 1, y + 1, 2, h - 2, '#c0564a'); R(x + w - 3, y + 1, 2, h - 2, '#c0564a'); R(x, y + Math.round(h * 0.4), w, 1, '#f2f2f2'); }
  R(x - 3, y + h + 1, w + 6, 2, '#d9d6c8');
}

// A chávena fumegante dos cafés (nos cantos do letreiro).
function chavena(R, x, y, c) {
  R(x + 3, y, 1, 2, c); R(x + 5, y - 1, 1, 2, c); R(x + 2, y + 3, 6, 3, c); R(x + 8, y + 4, 1, 1, c); R(x, y + 6, 10, 1, c); R(x + 2, y + 8, 6, 1, c);
}

// Cadeira de alumínio da esplanada, vista de lado (d = -1 virada para a direita, 1 para a esquerda).
function cadeira(R, x, y, d) {
  const bx = d < 0 ? x - 30 : x + 23, sx = d < 0 ? x - 30 : x + 18;
  R(bx - 1, y - 10, 9, 14, INK); R(bx, y - 9, 7, 12, '#d5dae2'); for (let i = 0; i < 4; i++) R(bx + 1, y - 8 + i * 3, 5, 1, '#9aa2b0');
  R(sx - 1, y + 2, 14, 5, INK); R(sx, y + 3, 12, 3, '#d5dae2'); R(sx, y + 3, 12, 1, '#f2f4f8');
  R(sx, y + 7, 2, 11, '#a4abb8'); R(sx + 10, y + 7, 2, 11, '#a4abb8');
}

// A esplanada do Crôcô, na Avenida Infante Santo: o prédio de janelas com estores, a caixa do toldo
// com «RESTAURANTE», o néon e «CAFETARIA», a montra, a porta e a calçada. dusk 0 = tarde de sol,
// 1 = pôr do sol (acendem-se o néon, a montra e o candeeiro). cx = centro do café, gy = chão da
// fila da frente, top = limite de cima; rows 2 = duas filas (o café fica ao nível da de trás);
// caracois = cartaz dos caracóis na montra.
export function esplanada(ctx, v, R, o) {
  const { gy, top, cx } = o, dusk = o.dusk || 0, big = v.portrait, t = o.t || 0;
  const fy = gy - (o.rows === 2 ? 40 : 0);                       // onde o prédio assenta
  const noite = dusk > 0.45, aceso = noite && (dusk > 0.6 || Math.floor(t * 14) % 4 !== 0);   // o néon pisca ao acender
  sky(ctx, v.w, v.h, fy, DIA.map((c, i) => mix(c, TARDE[i], dusk)));
  disc(ctx, Math.round(cx + (o.half || 100) * 0.9), Math.round(lerp(top + 16, fy - 34, dusk)), big ? 14 : 11, dusk > 0.5 ? '#ffe2a0' : '#fff6c8');
  const bw = Math.min(200, (o.half || 100) * 2 - 8), wt = Math.max(top + 4, fy - (big ? 150 : 122)), x0 = Math.round(cx - bw / 2);
  const WALL = mix('#b9b6a2', '#c9a78c', dusk), FRISO = mix('#d6d3c4', '#e0c2a6', dusk);

  // ----- o prédio -----
  R(x0 - 1, wt - 1, bw + 2, fy - wt + 1, INK); R(x0, wt, bw, fy - wt, WALL);
  R(x0, wt, bw, 3, FRISO); R(x0, wt + 3, bw, 1, '#8f8c7c');
  const ay = Math.max(wt + 8, fy - 86), bh = 19, vh = 16;         // a caixa do toldo: faixa do néon + sanefa
  for (let y = ay - 12, k = 0; y - 22 > wt + 4; y -= 44, k++) {   // andares: janelas e friso
    const wy = y - 22, wa = Math.min(46, Math.round(bw * 0.26)), wb = Math.round(bw * 0.15);
    janela(R, x0 + Math.round(bw * 0.2), wy, wa, 20, 'estore', false);
    janela(R, x0 + Math.round(bw * 0.62), wy, wb, 20, k % 2 ? 'estore' : 'cortinas', noite && k === 0);
    R(x0, y + 4, bw, 3, FRISO); R(x0, y + 7, bw, 1, '#8f8c7c');
  }
  // ar condicionado e cabos, por cima do toldo
  if (ay - wt > 16) {
    R(x0 + 3, ay - 12, 14, 10, INK); R(x0 + 4, ay - 11, 12, 8, '#eceef0'); disc(ctx, x0 + 10, ay - 7, 3, '#8f96a0'); R(x0 + 10, ay - 7, 1, 1, '#eceef0');
    for (let x = x0 + 17; x < x0 + bw - 4; x += 2) R(x, ay - 4 + Math.round(Math.sin((x - x0) / 14) * 1.3), 2, 1, '#2b2a30');
  }

  // ----- por baixo do toldo: aço, montra, porta e resguardos -----
  const porta = bw >= 176, bx0 = x0 + 3, bx1 = x0 + bw - 3 - (porta ? 21 : 0), aw = bx1 - bx0, sy = ay + bh + vh, sh = fy - sy;
  if (porta) {      // a porta verde do prédio, ao lado
    R(bx1 + 2, sy - 6, 19, sh + 6, '#d9d6c8'); R(bx1 + 4, sy - 2, 15, sh + 2, INK); R(bx1 + 5, sy - 1, 13, sh + 1, '#2f4a3c');
    R(bx1 + 11, sy - 1, 1, sh + 1, '#1f3229'); R(bx1 + 7, sy + 4, 3, Math.max(4, sh - 22), '#3f6250'); R(bx1 + 13, sy + 4, 3, Math.max(4, sh - 22), '#3f6250');
  }
  if (sh > 6) {
    const vidro = noite ? '#ffd98a' : '#3f4c5e';
    R(bx0, sy, aw, sh, mix('#c3c8d0', '#c9b6a8', dusk)); R(bx0, sy, aw, 3, '#8f96a3');
    for (let x = bx0 + 18; x < bx1 - 18; x += 23) R(x, sy + 3, 1, sh - 3, '#a9afba');                       // juntas das chapas de aço
    // a montra, com as prateleiras de garrafas
    const mx = bx0 + 19, mw = Math.round(aw * 0.36), mh = Math.max(6, sh - 12);
    R(mx - 1, sy + 4, mw + 2, mh + 2, '#e8ebf0'); R(mx, sy + 5, mw, mh, vidro);
    for (let yy = sy + 14; yy < sy + 5 + mh - 3; yy += 9) {
      R(mx, yy, mw, 1, noite ? '#b98a4a' : '#27303c');
      for (let x = mx + 2; x < mx + mw - 3; x += 4) R(x, yy - 5, 2, 5, ['#c0392b', '#2f8a4a', '#e8c34a', '#f2f2f2', '#7a4a2a'][Math.floor(hash(x * 3.1 + yy) * 5)]);
    }
    // as folhas coladas no vidro (na primavera, a dos caracóis)
    R(mx + mw - 20, sy + 7, 8, 10, '#f7f5ee'); for (let i = 0; i < 3; i++) R(mx + mw - 19, sy + 9 + i * 2, 6, 1, '#b8b8c0');
    R(mx + mw - 10, sy + 7, 8, 10, '#f7f5ee');
    if (o.caracois) { R(mx + mw - 9, sy + 8, 6, 1, '#d8325a'); disc(ctx, mx + mw - 7, sy + 13, 2, '#f08a2a'); R(mx + mw - 9, sy + 15, 6, 1, '#e8c38a'); R(mx + mw - 4, sy + 13, 1, 2, '#e8c38a'); }
    else for (let i = 0; i < 3; i++) R(mx + mw - 9, sy + 9 + i * 2, 6, 1, '#b8b8c0');
    // a porta do café
    const px = bx0 + Math.round(aw * 0.66), pw = 17;
    R(px - 1, sy + 3, pw + 2, sh - 3, '#e8ebf0'); R(px, sy + 4, pw, sh - 4, noite ? '#e8b86a' : '#252a35');
    R(px + pw - 6, sy + 4, 6, sh - 4, '#dfe3ea'); R(px + pw - 5, sy + 6, 4, Math.max(3, Math.round(sh * 0.45)), noite ? '#ffe6b0' : '#5d70a0');
    // os resguardos de vidro dos lados, com os autocolantes vermelhos
    for (const rx of [bx0, bx1 - 15]) {
      R(rx, sy, 15, sh, '#f1f2f4'); R(rx + 2, sy + 3, 11, Math.max(3, sh - 22), noite ? '#f6dca0' : '#a9c2d2'); R(rx + 7, sy + 3, 1, Math.max(3, sh - 22), '#f1f2f4');
      if (sh > 30) { R(rx + 2, fy - 17, 5, 6, '#e0303a'); R(rx + 8, fy - 17, 5, 6, '#e0303a'); R(rx + 3, fy - 15, 3, 2, '#ffffff'); R(rx + 9, fy - 15, 3, 2, '#ffffff'); }
      R(rx, sy, 1, sh, '#b8bcc6'); R(rx + 14, sy, 1, sh, '#b8bcc6');
    }
  }

  // ----- a caixa do toldo -----
  const BR = mix('#f6f6f2', '#f2dcc4', dusk), AZUL = '#2b3f9e', CAST = '#7a6468', mid = Math.round((bx0 + bx1) / 2);
  R(bx0 - 3, ay - 1, aw + 6, bh + vh + 3, INK);
  R(bx0 - 2, ay, aw + 4, bh, BR); R(bx0 - 2, ay + bh, aw + 4, vh, mix('#ecebe4', '#e6ceb4', dusk)); R(bx0 - 2, ay + bh, aw + 4, 1, '#c9c8c0');
  R(bx0 - 2, ay + bh + vh, aw + 4, 1, '#bdbbb0');
  // em cima: RESTAURANTE, o néon e CAFETARIA (e as chávenas dos cafés nos cantos, se couberem)
  const nx = mid - NEON_W / 2, ny = ay + 2;
  if (aceso) { R(nx - 2, ny, NEON_W + 4, NEON_H, 'rgba(255,70,40,0.08)'); neon(R, nx, ny, '#fff0b8', 'rgba(255,60,30,0.5)'); }
  else neon(R, nx, ny, noite ? '#a8503c' : '#f07a5c');
  text(ctx, 'RESTAURANTE', nx - 4, ay + 8, AZUL, { align: 'right', shadow: '#aab2d4' });
  text(ctx, 'CAFETARIA', nx + NEON_W + 4, ay + 8, AZUL, { shadow: '#aab2d4' });
  if (aw >= 168) { chavena(R, bx0, ay + 5, '#3a3038'); chavena(R, bx1 - 10, ay + 5, '#3a3038'); }
  // em baixo: Crôcô / Restaurante * Cafetaria (e o café da casa, se couber)
  const chave = aw >= 156, tm = chave ? mid - 8 : mid + 5, y1 = ay + bh + 3;
  R(bx0, y1, 9, 11, '#7a3b34'); R(bx0 + 3, y1 + 2, 4, 1, '#ead8c8'); R(bx0 + 2, y1 + 3, 2, 2, '#ead8c8'); R(bx0 + 3, y1 + 5, 4, 1, '#ead8c8'); R(bx0 + 5, y1 + 6, 2, 2, '#ead8c8'); R(bx0 + 1, y1 + 8, 7, 1, '#ead8c8');
  const tw = textW('CROCO'), tx = Math.round(tm - tw / 2);
  text(ctx, 'CROCO', tx, y1 + 1, CAST);
  for (const k of [2, 4]) { R(tx + k * 4 + 1, y1 - 2, 1, 1, CAST); R(tx + k * 4, y1 - 1, 1, 1, CAST); R(tx + k * 4 + 2, y1 - 1, 1, 1, CAST); }
  text(ctx, 'RESTAURANTE * CAFETARIA', tm, y1 + 8, CAST, { align: 'center' });
  if (chave) { text(ctx, 'CHAVE', bx1 - 1, y1, '#6b4038', { align: 'right' }); text(ctx, "D'OURO", bx1 - 1, y1 + 7, '#9a7468', { align: 'right' }); }

  // ----- a rua: candeeiro, árvore e calçada portuguesa -----
  candeeiro(ctx, R, x0 - 9, fy, big, noite); arvore(ctx, R, cx + bw / 2 + 9, fy, big, dusk);
  R(0, fy, v.w, v.h - fy, mix('#dedbd0', '#c8a890', dusk)); R(0, fy, v.w, 1, '#b9b4a4');
  for (let i = 0; i < 140; i++) R(Math.floor(hash(i) * v.w), fy + 3 + Math.floor(hash(i * 2.3) * (v.h - fy - 4)), 2, 1, hash(i * 5) > 0.45 ? '#c6c1b2' : '#5a5566');
  // mesas vazias à frente, quando sobra chão (ecrã ao alto)
  if (o.fore && v.h - gy > 70) {
    const y = gy + Math.round((v.h - gy) * 0.55);
    for (const x of [Math.round(v.w * 0.24), Math.round(v.w * 0.74)]) {
      cadeira(R, x, y, -1); cadeira(R, x, y, 1);
      R(x - 15, y - 5, 30, 5, INK); R(x - 14, y - 4, 28, 3, '#e8e8f0'); R(x - 1, y, 2, 18, '#8a8794'); R(x - 7, y + 18, 14, 2, '#8a8794');
    }
  }
}

// Uma imperial pequenina (em cima da mesa).
function copinho(R, x, y) {
  R(x - 1, y - 9, 6, 9, INK); R(x, y - 6, 4, 5, '#f2b632'); R(x, y - 8, 4, 2, '#ffffff');
}

// Uma mesa comprida de esplanada com o tampo em y; n imperiais e chávenas de café em cima.
export function mesa(R, x0, x1, y, n, cafe) {
  R(x0 - 1, y - 1, x1 - x0 + 2, 6, INK); R(x0, y, x1 - x0, 4, '#e8e8f0'); R(x0, y + 3, x1 - x0, 1, '#b8b8c8');
  R(x0 + 6, y + 5, 2, 12, '#8a8794'); R(x1 - 8, y + 5, 2, 12, '#8a8794'); R(Math.round((x0 + x1) / 2), y + 5, 2, 12, '#8a8794');
  for (let i = 0; i < n; i++) copinho(R, Math.round(x0 + 8 + ((x1 - x0 - 20) * (i + 0.5)) / Math.max(1, n)), y);
  if (cafe) { const x = Math.round(x0 + (x1 - x0) * cafe); R(x - 1, y - 4, 7, 4, INK); R(x, y - 3, 5, 3, PAPER); R(x + 1, y - 3, 3, 1, '#5a3a2a'); R(x - 3, y - 1, 11, 1, PAPER); }
}

// A malta às mesas, entre x0 e x1: uma fila (ecrã deitado) ou duas (ao alto). Quem fala (ou toda a
// gente, com all) dá saltinhos. drinks = imperiais em cima das mesas.
export function sentados(ctx, R, list, o) {
  const { x0, x1, gy, t } = o, rows = o.rows || 1, drinks = o.drinks || 0;
  const draw = (m, x, y) => {
    const hop = (o.all || (m.name && m.name === o.speaker)) ? Math.round(Math.abs(Math.sin(t * 7 + x)) * 2) : 0;
    person(ctx, m.frames, x, y, { face: x < (x0 + x1) / 2 ? 1 : -1, scale: 2, hop });
  };
  if (rows === 2) {
    const half = Math.ceil(list.length / 2), back = list.slice(0, half), front = list.slice(half), by = gy - 40;
    back.forEach((m, i) => draw(m, Math.round(x0 + 14 + ((x1 - x0 - 28) * i) / Math.max(1, back.length - 1)), by));
    mesa(R, x0 + 2, x1 - 2, by - 17, Math.min(drinks, half), 0);
    front.forEach((m, i) => draw(m, Math.round(x0 + 22 + ((x1 - x0 - 44) * i) / Math.max(1, front.length - 1)), gy));
    mesa(R, x0 + 14, x1 - 14, gy - 17, Math.max(0, drinks - half), o.cafe ? 0.5 : 0);
  } else {
    list.forEach((m, i) => draw(m, Math.round(x0 + 14 + ((x1 - x0 - 28) * i) / Math.max(1, list.length - 1)), gy));
    mesa(R, x0, x1, gy - 17, drinks, o.cafe ? 0.4 : 0);
  }
}

// Onde ficam a cena e o painel do minijogo, conforme o ecrã (para os atos das imperiais e dos caracóis).
export function partes(v, top) {
  if (v.portrait) {
    const py = Math.round(v.h * 0.57);
    return { top, gy: Math.round(v.h * 0.5), cx: Math.round(v.w / 2), half: v.w / 2, x0: 6, x1: v.w - 6, rows: 2, px: 10, py, pw: v.w - 20, ph: v.h - py - 14, s: 2 };
  }
  const pw = Math.round(v.w * 0.4), sx = pw + 16;
  return { top, gy: Math.round(v.h * 0.9), cx: Math.round((sx + v.w) / 2), half: (v.w - sx) / 2, x0: sx + 4, x1: v.w - 6, rows: 1, px: 8, py: top + 4, pw, ph: v.h - top - 12, s: 1 };
}

// Moldura de um painel de «grande plano». Devolve o tamanho por dentro, em unidades do painel:
// ao alto o painel desenha-se ao dobro (p.s = 2), com ctx.translate(p.px, p.py) e ctx.scale(p.s, p.s).
export function painel(R, p, cor) {
  R(p.px - 2, p.py - 2, p.pw + 4, p.ph + 4, INK); R(p.px - 1, p.py - 1, p.pw + 2, p.ph + 2, GOLD); R(p.px, p.py, p.pw, p.ph, cor);
  return { pw: Math.floor(p.pw / p.s), ph: Math.floor(p.ph / p.s) };
}
