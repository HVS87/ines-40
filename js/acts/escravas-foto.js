// «As Escravas», fecho: a fotografia de turma no recreio (um Talk com o cenário do recreio,
// o clarão do «flash» e a moldura da fotografia).
import { Talk } from './base.js';
import { PAPER, INK } from '../draw.js';
import { linhas, recreio } from './escravas-cenario.js';

export class EscravasFoto extends Talk {
  constructor(scene, cfg) {
    super(scene, {
      ...cfg,
      bg: (ctx, v, R, t, act) => recreio(ctx, v, R, t, { cam: 337 - v.w / 2, top: act.top(v), gy: linhas(v).gy, capela: 337, arvores: [337 - v.w * 0.42, 337 + v.w * 0.44] }),
      onLine: (i, act) => { if (i === (cfg.flash === undefined ? 3 : cfg.flash)) { act.flashAt = act.t; act.sfx('pop'); } },
    });
  }

  start() { this.flashAt = null; super.start(); }

  ground(v) { return linhas(v).fy; }

  draw(ctx, v, R) {
    super.draw(ctx, v, R);
    if (this.flashAt === null) return;
    const d = this.t - this.flashAt, fy = this.ground(v), top = this.top(v);
    // a moldura branca da fotografia, à volta da turma
    const x0 = 5, x1 = v.w - 5, y0 = Math.max(top + 2, fy - 86), y1 = Math.min(v.h - 4, fy + 22);
    const dark = 'rgba(43,29,46,0.45)';
    R(0, 0, v.w, y0 - 1, dark); R(0, y1 + 2, v.w, v.h - y1 - 2, dark);
    R(x0 - 1, y0 - 1, x1 - x0 + 2, 6, INK); R(x0 - 1, y1 - 9, x1 - x0 + 2, 11, INK); R(x0 - 1, y0, 6, y1 - y0, INK); R(x1 - 5, y0, 6, y1 - y0, INK);
    R(x0, y0, x1 - x0, 4, PAPER); R(x0, y1 - 8, x1 - x0, 9, PAPER); R(x0, y0, 4, y1 - y0, PAPER); R(x1 - 4, y0, 4, y1 - y0, PAPER);
    if (d < 0.6) R(0, 0, v.w, v.h, `rgba(255,255,255,${(1 - d / 0.6).toFixed(2)})`);
  }
}
