// Onde fica a área de jogo no ecrã.
//
// - Telemóvel/tablet: o jogo ocupa o ecrã todo, em qualquer posição (ao alto ou deitado).
// - Computador: sempre a versão horizontal (pensada para 16:9). Entre 4:3 e 2,4:1 o jogo ocupa a
//   janela toda; numa janela mais estreita fica numa moldura 4:3 (faixas escuras por cima e por
//   baixo) e num ecrã ultralargo numa moldura 2,4:1.
//
// Tudo em píxeis CSS. Função pura, para poder ser testada com qualquer tamanho de ecrã.
const PC_MIN_ASPECT = 4 / 3, PC_MAX_ASPECT = 2.4;

// W, H: janela · mobile: telemóvel ou tablet. Devolve { x, y, w, h } (a área de jogo).
export function computeLayout({ W, H, mobile }) {
  const full = { x: 0, y: 0, w: W, h: H };
  if (!mobile) {
    const a = W / H;
    if (a < PC_MIN_ASPECT) {
      const h = Math.round(W / PC_MIN_ASPECT);
      return { ...full, y: Math.round((H - h) / 2), h };
    }
    if (a > PC_MAX_ASPECT) {
      const w = Math.round(H * PC_MAX_ASPECT);
      return { ...full, x: Math.round((W - w) / 2), w };
    }
  }
  return full;
}
