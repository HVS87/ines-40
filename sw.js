// Service worker do jogo: permite instalá-lo como app e jogar sem rede.
// Estratégia "rede primeiro": com rede, recebe-se sempre a versão mais recente (e guarda-se
// uma cópia); sem rede, usa-se a cópia guardada. As fontes do Google ficam em cache.
// Ao mudar a lista de ficheiros, mudar também o nome da cache (a suite ?qa verifica que todos
// os módulos do jogo estão aqui).
const CACHE = 'ines-40-v11';
const CORE = [
  './',
  'index.html',
  'css/style.css',
  'manifest.webmanifest',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-180.png',
  'js/acts/barco-cenario.js',
  'js/acts/barco-mergulhos.js',
  'js/acts/barco-navegar.js',
  'js/acts/base.js',
  'js/acts/bimby-comum.js',
  'js/acts/bimby-programar.js',
  'js/acts/bimby-receita.js',
  'js/acts/call.js',
  'js/acts/casa-comum.js',
  'js/acts/casa-decorar.js',
  'js/acts/casa-movel.js',
  'js/acts/casa-mudancas.js',
  'js/acts/catch.js',
  'js/acts/cenarios.js',
  'js/acts/croco-caracois.js',
  'js/acts/croco-cenario.js',
  'js/acts/croco-imperiais.js',
  'js/acts/escravas-cenario.js',
  'js/acts/escravas-corda.js',
  'js/acts/escravas-foto.js',
  'js/acts/escravas-recreio.js',
  'js/acts/escravas-sala.js',
  'js/acts/estrada.js',
  'js/acts/eventos-bastidores.js',
  'js/acts/eventos-gala.js',
  'js/acts/eventos-mala.js',
  'js/acts/farol-chegada.js',
  'js/acts/farol-comum.js',
  'js/acts/farol-fogueira.js',
  'js/acts/farol-gnr.js',
  'js/acts/farol-tenda.js',
  'js/acts/festa.js',
  'js/acts/garage-amigos.js',
  'js/acts/garage-cenario.js',
  'js/acts/garage-pista.js',
  'js/acts/garage-porta.js',
  'js/acts/jantares-cuf.js',
  'js/acts/jantares-noite.js',
  'js/acts/jantares-quiche.js',
  'js/acts/lanheses-churrasco.js',
  'js/acts/lanheses-comum.js',
  'js/acts/lanheses-eira.js',
  'js/acts/madrinha-comum.js',
  'js/acts/madrinha-embalar.js',
  'js/acts/madrinha-foto.js',
  'js/acts/madrinha-vela.js',
  'js/acts/mocambique-banquete.js',
  'js/acts/mocambique-cenario.js',
  'js/acts/namoro-cenario.js',
  'js/acts/namoro-conta.js',
  'js/acts/namoro-jantar.js',
  'js/acts/namoro-passeio.js',
  'js/acts/nascimento-carro.js',
  'js/acts/naval-brinde.js',
  'js/acts/naval-fundo.js',
  'js/acts/naval-veleiros.js',
  'js/acts/noruega-mergulho.js',
  'js/acts/noruega-viagem.js',
  'js/acts/pedido-cenario.js',
  'js/acts/pedido-paella.js',
  'js/acts/pedido-samba.js',
  'js/acts/pedido-sim.js',
  'js/acts/pedras-ancoras.js',
  'js/acts/pedras-comboio.js',
  'js/acts/pedras-comum.js',
  'js/acts/pedras-raquetes.js',
  'js/acts/pesca.js',
  'js/acts/rainha-cenario.js',
  'js/acts/rainha-chegada.js',
  'js/acts/rainha-escadaria.js',
  'js/acts/recreio-cenario.js',
  'js/acts/ritmo.js',
  'js/acts/rugby.js',
  'js/acts/santos.js',
  'js/acts/sushi-cozinha.js',
  'js/acts/sushi-entrega.js',
  'js/acts/sushi-reencontro.js',
  'js/acts/verao-cenario.js',
  'js/acts/verao-comboio.js',
  'js/acts/verao-fuga.js',
  'js/acts/verao-janela.js',
  'js/acts/verao-piscina.js',
  'js/acts/xafarix-cenario.js',
  'js/acts/xafarix-cenas.js',
  'js/acts/xafarix-danca.js',
  'js/acts/xafarix-longisland.js',
  'js/audio.js',
  'js/config.js',
  'js/convidados.js',
  'js/device.js',
  'js/draw.js',
  'js/fx.js',
  'js/input.js',
  'js/layout.js',
  'js/levels/01-nascimento.js',
  'js/levels/02-escravas.js',
  'js/levels/03-rainha.js',
  'js/levels/04-namoro.js',
  'js/levels/05-garage.js',
  'js/levels/06-verao.js',
  'js/levels/07-farol.js',
  'js/levels/08-croco.js',
  'js/levels/09-tomas.js',
  'js/levels/10-bimby.js',
  'js/levels/11-pedras.js',
  'js/levels/12-xafarix.js',
  'js/levels/13-jantares.js',
  'js/levels/14-santos.js',
  'js/levels/15-sushi.js',
  'js/levels/16-casa.js',
  'js/levels/17-rugby.js',
  'js/levels/18-naval.js',
  'js/levels/19-eventos.js',
  'js/levels/20-mocambique.js',
  'js/levels/21-lanheses.js',
  'js/levels/22-noruega.js',
  'js/levels/23-madrinha.js',
  'js/levels/24-barco.js',
  'js/levels/25-pedido.js',
  'js/levels/26-jeanne.js',
  'js/levels/27-festa.js',
  'js/levels/index.js',
  'js/main.js',
  'js/musicas.js',
  'js/nomes.js',
  'js/save.js',
  'js/scenes/menu.js',
  'js/scenes/stage.js',
  'js/scenes/victory.js',
  'js/sprites.js',
  'js/ui.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Rede primeiro, com um limite de tempo; se falhar, a cópia guardada.
function networkFirst(req) {
  return caches.open(CACHE).then((cache) => new Promise((resolve) => {
    let done = false;
    const fallback = () => cache.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit && !done) { done = true; resolve(hit); }
      return hit;
    });
    const timer = setTimeout(fallback, 4000);
    fetch(req).then((res) => {
      clearTimeout(timer);
      if (res && res.ok) cache.put(req, res.clone());
      if (!done) { done = true; resolve(res); }
    }).catch(() => {
      clearTimeout(timer);
      fallback().then((hit) => {
        if (!done) { done = true; resolve(hit || Response.error()); }
      });
    });
  }));
}

// Cache primeiro (as fontes não mudam).
function cacheFirst(req) {
  return caches.open(CACHE).then((cache) => cache.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  })));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) e.respondWith(networkFirst(req));
  else if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) e.respondWith(cacheFirst(req));
});
