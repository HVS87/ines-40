// O final do jogo: fogo de artifício e os convidados da festa a festejar os 40 anos da Inês.
// Cada toque no ecrã lança mais foguetes.
import { getCharacter } from '../sprites.js';
import { Fireworks, Particles } from '../fx.js';
import { mkR, sky, stars, person, text, PINK, GOLD } from '../draw.js';
import { CONVIDADOS } from '../convidados.js';


export class VictoryScene {
  constructor(game) {
    this.game = game;
    this.music = 'party';
    this.fire = new Fireworks();
    this.fx = new Particles();
    this.ines = getCharacter('ines', 'festa');
    this.crowd = CONVIDADOS.map(([who, outfit]) => getCharacter(who, outfit));   // todos os da festa (a Inês fica ao centro, maior)
    this.t = 0;
  }

  enter() {
    this.game.ui.showVictory();
    this.onTap = (e) => {
      if (e.type === 'keydown' && (e.repeat || (e.code !== 'Space' && e.code !== 'Enter'))) return;
      if (e.target && e.target.closest && e.target.closest('.btn')) return;
      const v = this.game.view;
      for (let k = 0; k < 2; k++) this.fire.launch(v.w, v.h, v.h * 0.1, v.h * 0.45);
    };
    document.addEventListener('pointerdown', this.onTap);
    document.addEventListener('keydown', this.onTap);
  }

  exit() {
    document.removeEventListener('pointerdown', this.onTap);
    document.removeEventListener('keydown', this.onTap);
  }

  update(dt) {
    this.t += dt;
    const v = this.game.view;
    this.fire.update(dt, v.w, v.h, v.h * 0.1, v.h * 0.45, () => this.game.audio.play('boom'));
    this.fx.update(dt);
    if (Math.floor(this.t * 3) !== Math.floor((this.t - dt) * 3)) this.fx.heart(v.w * 0.5 - 20 + Math.random() * 40, v.h * 0.8 - 50, Math.random() < 0.4 ? GOLD : PINK);
  }

  draw(ctx, v) {
    const R = mkR(ctx), t = this.t, gy = Math.round(v.h * (v.portrait ? 0.88 : 0.86));
    sky(ctx, v.w, v.h, gy, ['#0b0a24', '#161440', '#2a2358', '#4a2f78']);
    stars(ctx, v.w, gy * 0.6, t, 5, 50);
    this.fire.draw(ctx);
    R(0, gy, v.w, v.h - gy, '#2a2540'); R(0, gy, v.w, 2, '#4a4468');
    // grinalda de bandeirinhas
    for (let x = 0, i = 0; x < v.w; x += 9, i++) {
      const y = gy - 62 + Math.round(Math.sin((x / v.w) * Math.PI) * 6);
      R(x, y, 9, 1, '#fff6e6'); R(x + 2, y + 1, 5, 3, ['#ff5d8f', '#ffd166', '#7be0b0', '#6fb0f0'][i % 4]); R(x + 3, y + 4, 3, 2, ['#ff5d8f', '#ffd166', '#7be0b0', '#6fb0f0'][i % 4]);
    }
    // os convidados, em filas (tantas quantas forem precisas para caberem), aos saltos
    const n = this.crowd.length, rows = Math.max(1, Math.min(3, Math.ceil((n * 15) / (v.w - 16)))), per = Math.ceil(n / rows);
    this.crowd.forEach((f, i) => {
      const row = Math.floor(i / per), k = i % per, cols = Math.min(per, n - row * per);
      const x = Math.round(((k + 0.5) / cols) * (v.w - 16)) + 8 + (row ? 6 : 0);
      const hop = Math.round(Math.abs(Math.sin(t * 6 + i * 0.9)) * 3);
      person(ctx, f, x, gy + 1 - row * 16, { face: x < v.w / 2 ? 1 : -1, hop });
    });
    // a Inês ao centro, em grande
    const hop = Math.round(Math.abs(Math.sin(t * 5)) * 4);
    person(ctx, this.ines, v.w / 2, gy + 6, { scale: 2, hop });
    text(ctx, '40', v.w / 2, gy - 58 - hop, GOLD, { scale: 2, align: 'center', shadow: '#2b1d2e' });
    this.fx.draw(ctx);
  }
}
