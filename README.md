# Inês 40 — Quarenta Anos de Aventuras

Jogo de browser em pixel art que conta a vida da Inês em 26 níveis, do dia em que nasceu
(15 de novembro de 1986) à festa dos 40 anos (15 de novembro de 2026). Feito para lhe ser
oferecido nesse dia.

Não tem dependências nem passo de compilação: é HTML, CSS e JavaScript (módulos ES) com um
`<canvas>`. Todos os desenhos são feitos em código (não há ficheiros de imagem além dos ícones)
e o som é gerado com WebAudio.

## Jogar

```bash
node tools/serve.mjs
```

e abrir <http://localhost:8090>. (Qualquer servidor de ficheiros estáticos serve.) Joga-se com
o dedo — tocar, manter premido e arrastar — ou com o teclado (Espaço/Enter e setas; P ou Esc
para a pausa; M para a música), ao alto ou deitado. Pode instalar-se como app (botão «Instalar
app» no menu) e funciona sem rede depois da primeira visita. O progresso fica guardado no
próprio dispositivo.

## Como está organizado

```
index.html            ecrãs (menu, níveis, história, pausa, fim de nível, parabéns)
css/style.css         aspeto da interface (o jogo em si é desenhado no canvas)
js/main.js            arranque, tamanho do ecrã, ciclo principal
js/scenes/stage.js    a cena de todos os níveis: corre os «atos» do nível, um a seguir ao outro
js/scenes/menu.js     fundo do menu · js/scenes/victory.js: os parabéns finais
js/acts/              os atos (minijogos e momentos da história); base.js explica como se escrevem
js/levels/            um ficheiro por nível: textos e a lista de atos com a sua configuração
js/sprites.js         bonecos em pixel art e o ELENCO (cores de cabelo, olhos e roupa de cada pessoa)
js/draw.js            ferramentas de desenho (retângulos, céus, letras de píxeis, bonecos)
js/nomes.js           nomes usados em vários níveis (o do pai da Inês)
js/audio.js           efeitos sonoros e música · js/input.js: teclado e toque · js/save.js: progresso
tools/                servidor local, página do logótipo e lista de ficheiros do sw.js
tests/                suite automática (?qa) e ferramentas de desenvolvimento (?dev)
```

Cada nível é uma lista de **atos**. Um ato é uma classe com `start`, `update`, `draw` e
`bot` (o «robô» que o joga sozinho nos testes); a cena trata do resto: ecrã da história, pausa,
corações, caixa de instruções, legendas entre atos e fim de nível. Nunca se perde: falhar custa
corações ou tempo, e todos os atos acabam sempre.

## Os níveis

| N.º | Ficheiro | Título | Atos |
|---|---|---|---|
| 1 | `01-nascimento.js` | O Nascimento | Estrada → Catch |
| 2 | `02-escravas.js` | As Escravas | Talk → EscravasRecreio → EscravasCorda → EscravasSala → EscravasFoto |
| 3 | `03-rainha.js` | O Rainha | Chegada → Escadaria → Talk |
| 4 | `04-namoro.js` | O Namoro | Passeio → Jantar → Conta |
| 5 | `05-garage.js` | Paradise Garage | Talk → GaragePorta → Ritmo → GarageAmigos |
| 6 | `06-croco.js` | O Crô-Crô | Imperiais → Caracois → Talk |
| 7 | `07-verao.js` | Verões em Santo Amaro | VeraoPiscina → VeraoFuga → VeraoJanela → VeraoComboio → Talk → VeraoJanela |
| 8 | `08-farol.js` | Acampar na Ilha do Farol | Talk → FarolChegada → FarolTenda → FarolFogueira → FarolGNR |
| 9 | `09-pedras.js` | Pedras d'El Rei | Talk → PedrasComboio → PedrasRaquetes → PedrasAncoras |
| 10 | `10-tomas.js` | Nasce o Tomás | Talk → Catch |
| 11 | `11-bimby.js` | A Bimby | BimbyReceita → BimbyProgramar → Talk → Call |
| 12 | `12-xafarix.js` | O Xafarix | Talk → Ritmo → LongIsland → Talk → Call |
| 13 | `13-jantares.js` | Jantares com Amigos | JantaresQuiche → JantaresCuf → JantaresNoite |
| 14 | `14-santos.js` | Santos | Sardinhas → Ritmo → Talk → Call |
| 15 | `15-sushi.js` | O Regresso do Lourenço | Reencontro → Cozinha → Estrada |
| 16 | `16-casa.js` | Viver Juntos | Mudancas → Decorar → Movel → Talk |
| 17 | `17-naval.js` | Fins de Tarde no Clube Naval | Brinde → Veleiros → Talk |
| 18 | `18-eventos.js` | Eventos e Viagens | EventosMala → EventosGala → Talk |
| 19 | `19-mocambique.js` | Moçambique | Talk → Pesca → Banquete |
| 20 | `20-lanheses.js` | Lanheses | Talk → Eira → Churrasco → Talk |
| 21 | `21-noruega.js` | Roadtrip na Noruega | Estrada → Mergulho |
| 22 | `22-madrinha.js` | Madrinha do Micas | Talk → Embalar → Vela → Foto → Talk |
| 23 | `23-barco.js` | Passeios de Barco | Navegar → Pesca → Mergulhos |
| 24 | `24-pedido.js` | O Pedido | Talk → Paella → PedidoSim → Ritmo |
| 25 | `25-jeanne.js` | Nasce a Jeanne | Talk → Catch |
| 26 | `26-festa.js` | Os 40 Anos | Abracos → Bolo |

`Talk` é um momento de história (cenário, personagens e falas); `Catch` é o nascimento (o
bebé salta e é preciso apanhá-lo); `Call` é um telefonema da Austrália, interrompido por um
canguru, uma aranha gigante ou um bando de emus; `Estrada`, `Ritmo` e `Pesca` são mecânicas
partilhadas por vários níveis, cada um com a sua «pele».

## Mudar coisas

- **Aspeto de uma pessoa** (cabelo, olhos, roupa): `LOOKS` em `js/sprites.js`. A farda do
  colégio é a constante `FARDA`, no mesmo ficheiro.
- **Nome do pai da Inês**: `TIO` em `js/nomes.js`.
- **Textos e falas de um nível**: no ficheiro do nível (`js/levels/`) ou nos atos desse nível
  (`js/acts/<nível>-*.js`).
- **Novo ficheiro de jogo**: correr `node tools/sw-list.mjs` (atualiza a lista do `sw.js`, para
  o jogo continuar a funcionar sem rede) e mudar o nome da cache no `sw.js`.
- **Logótipo e ícones**: `tools/logo.html` (com o servidor a correr,
  <http://localhost:8090/tools/logo.html>) desenha a imagem de partilha e os ícones com os bonecos
  do jogo; o botão «Guardar todas em assets/» grava-os.

## Testar

- <http://localhost:8090/?qa> corre a suite automática: os robôs jogam os 26 níveis do princípio
  ao fim (com pausa a meio), e verificam-se os textos, os menus, a gravação do progresso, a lista
  de ficheiros para jogar sem rede e toques ao acaso. Resultado no painel e em `window.__qa`.
  Acrescentar `&touch&device=mobile` para testar como num telemóvel.
- <http://localhost:8090/?dev> dá `window.__dev` na consola: `await __dev.play('garage')`,
  `__dev.goto('garage', 1)`, `__dev.step(3)`, e `await __dev.shot('nome')` /
  `await __dev.sheet('nome', ['garage'])`, que guardam capturas em `tests/shots/` (com
  `node tests/shots.mjs` a correr).
- `?debug` abre todos os níveis sem ser preciso jogá-los por ordem.
