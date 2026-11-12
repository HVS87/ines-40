// Atualiza a lista de ficheiros do sw.js (os que ficam guardados para jogar sem rede) a partir
// do que existe em js/. Correr depois de criar ou apagar ficheiros do jogo:
//   node tools/sw-list.mjs
// (A suite ?qa verifica que todos os módulos carregados estão nessa lista.)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const walk = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(dir + '/' + e.name) : [dir + '/' + e.name]))
  .filter((f) => f.endsWith('.js'))
  .sort();

const files = ['./', 'index.html', 'css/style.css', 'manifest.webmanifest', 'assets/icon-192.png', 'assets/icon-512.png', 'assets/icon-180.png', ...walk('js')];
const file = path.join(ROOT, 'sw.js');
const src = fs.readFileSync(file, 'utf8');
const a = src.indexOf('const CORE = ['), b = src.indexOf('];', a);
if (a < 0 || b < 0) throw new Error('não encontrei a lista CORE no sw.js');
const list = 'const CORE = [\n' + files.map((f) => `  '${f}',`).join('\n') + '\n';
fs.writeFileSync(file, src.slice(0, a) + list + src.slice(b));
console.log(`sw.js: ${files.length} ficheiros na lista.`);
