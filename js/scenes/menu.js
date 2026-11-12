// Cena de fundo do menu principal: a Inês ao pôr do sol sobre o Tejo, com balões de festa.
import { getCharacter, getSprites } from '../sprites.js';
import { Particles } from '../fx.js';
import { mkR, sky, disc, stars, hash } from '../draw.js';

const BALLOONS = ['#ff5d8f', '#ffd166', '#7be0b0', '#6fb0f0', '#c79bff'];

export class MenuScene {
  constructor(game) {
    this.game = game;
    this.music = 'menu';
    this.ines = getCharacter('ines', 'festa');
    this.heart = getSprites().heart;
    this.fx = new Particles();
    this.t = 0;
    this.next = 0.5;
  }

  // A Inês fica à esquerda em paisagem (os botões ficam à direita) e ao centro em retrato.
  layout(v) {
    return { gy: Math.round(v.h * (v.portrait ? 0.86 : 0.84)), cx: Math.round(v.portrait ? v.w / 2 : v.w * 0.26) };
  }

  update(dt) {
    this.t += dt;
    this.fx.update(dt);
    this.next -= dt;
    if (this.next <= 0) {
      const { gy, cx } = this.layout(this.game.view);
      this.fx.heart(cx - 14 + Math.random() * 28, gy - 54, Math.random() < 0.3 ? '#ffd166' : '#ff5d8f');
      this.next = 0.5 + Math.random() * 0.6;
    }
  }

  draw(ctx, v) {
    const { gy, cx } = this.layout(v), t = this.t, R = mkR(ctx);
    const hz = gy - 26;                                   // linha do horizonte (o rio)
    sky(ctx, v.w, v.h, hz, ['#2a2358', '#4a2f78', '#8a3f84', '#c8527a', '#ee8a66', '#f8c27a']);
    stars(ctx, v.w, hz * 0.4, t, 3, 26);
    disc(ctx, Math.round(v.w * 0.7), hz - 6, 13, '#fff3c4');
    // a ponte ao fundo e a outra margem
    R(0, hz - 4, v.w, 4, '#4a2f78');
    for (const px of [0.18, 0.5]) { R(v.w * px, hz - 30, 3, 30, '#3a2358'); R(v.w * px - 2, hz - 31, 7, 2, '#3a2358'); }
    R(0, hz - 14, v.w, 2, '#3a2358');
    for (let x = 0; x < v.w; x += 6) R(x, hz - 12, 1, 8, '#3a2358');
    // o rio, com o reflexo do sol
    R(0, hz, v.w, gy - hz, '#3b4a8a');
    for (let i = 0; i < 9; i++) R(v.w * 0.7 - 10 + ((i * 7 + Math.floor(t * 3)) % 20), hz + 2 + i * 3, 6 + (i % 3) * 3, 1, '#f8c27a');
    for (let i = 0; i < 14; i++) R(hash(i) * v.w, hz + 3 + hash(i * 3) * (gy - hz - 5), 5, 1, '#5a6ab0');
    // o cais
    R(0, gy, v.w, v.h - gy, '#6b5a4e'); R(0, gy, v.w, 2, '#8a7868');
    for (let x = 0; x < v.w; x += 18) R(x, gy + 2, 1, v.h - gy, '#5a4a40');

    // a Inês, em tamanho duplo, aos saltinhos, com um ramo de balões
    const hop = Math.round(Math.abs(Math.sin(t * 5)) * 3);
    BALLOONS.forEach((c, i) => {
      const bx = cx + 20 + i * 9 - 18 + Math.round(Math.sin(t * 1.5 + i) * 2), by = gy - 84 - (i % 2) * 9 + Math.round(Math.sin(t * 2 + i * 1.3) * 2);
      R(bx, by + 6, 1, gy - 30 - by - 6, '#fff6e6');
      disc(ctx, bx, by, 6, '#2b1d2e'); disc(ctx, bx, by, 5, c); R(bx - 3, by - 3, 2, 2, '#ffffff');
    });
    ctx.drawImage(this.ines.stand.r, cx - 16, gy - 48 - hop, 32, 48);
    this.fx.draw(ctx);
  }
}
