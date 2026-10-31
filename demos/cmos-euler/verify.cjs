/* Run with: node verify.cjs. No dependencies. Tests the engine embedded in index.html. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
for (const [i, match] of scripts.entries()) new vm.Script(match[1], { filename: `inline-${i}.js` });
const core = html.match(/<script id="logic-core">([\s\S]*?)<\/script>/)[1];
const C = vm.runInNewContext(core + '\nCMOS;', { Date, Set, Map, console });
let vectors = 0, cases = 0, exactComparisons = 0;
function checkTrail(g, trail) {
  assert.ok(trail.length);
  trail.forEach((step, i) => {
    const edge = g.edges[step.edge];
    assert.ok(edge);
    assert.ok(edge.u === step.from && edge.v === step.to || edge.v === step.from && edge.u === step.to);
    if (i) assert.equal(trail[i - 1].to, step.from, 'trail is continuous');
  });
}
function checkCover(g, trails) {
  trails.forEach(t => checkTrail(g, t));
  assert.equal(trails.length, Math.max(1, g.odd.length / 2), 'minimum number of trails');
  const edgeIndices = trails.flat().map(s => s.edge);
  assert.equal(edgeIndices.length, g.edges.length);
  assert.equal(new Set(edgeIndices).size, g.edges.length, 'each edge used exactly once');
}
function allEulerSequences(g) {
  const result = new Set();
  if (g.odd.length > 2) return result;
  function dfs(node, used, labels) {
    if (labels.length === g.edges.length) { result.add(labels.join(',')); return; }
    for (const index of g.adj[node]) {
      if (used.has(index)) continue;
      const edge = g.edges[index];
      used.add(index);
      dfs(edge.u === node ? edge.v : edge.u, used, labels.concat(edge.label));
      used.delete(index);
    }
  }
  for (const start of g.odd.length ? g.odd : g.nodes) dfs(start, new Set(), []);
  return result;
}
function check(expression, compareExact = false) {
  const m = C.compile(expression); cases++;
  checkCover(m.p, m.pCover); checkCover(m.n, m.nCover);
  for (let row = 0; row < 2 ** m.inputs.length; row++) {
    const values = Object.fromEntries(m.inputs.map((name, i) => [name, !!(row & 2 ** i)]));
    const expected = C.evaluate(m.ast, values), up = C.connectivity(m.p, values), down = C.connectivity(m.n, values);
    assert.equal(up, expected, `${expression} / pull-up / ${row}`);
    assert.equal(down, !expected, `${expression} / pull-down / ${row}`);
    assert.notEqual(up, down, 'never a floating output or simultaneous rail connection');
    vectors++;
  }
  const r = C.common(m.p, m.n, 1500, 180000);
  if (r.status === 'found') {
    checkCover(m.p, [r.p]); checkCover(m.n, [r.n]);
    assert.equal(r.p.map(s => m.p.edges[s.edge].label).join(','), r.n.map(s => m.n.edges[s.edge].label).join(','));
  }
  if (compareExact) {
    const p = allEulerSequences(m.p), n = allEulerSequences(m.n);
    const exists = [...p].some(order => n.has(order));
    assert.notEqual(r.status, 'limit', 'small cases must finish');
    assert.equal(r.status === 'found', exists, `common Euler search agrees with independent exhaustive enumerator: ${expression}`);
    exactComparisons++;
  }
  return m;
}
const examples = ['AOI21', 'AOI22', 'AOI221', 'AOI222', 'AOI33', 'OAI21', 'OAI22', 'OAI221', 'OAI222', 'OAI33', 'Y = !(AB + CD)', "(AB+C)'", '!(A*B + A*C)', 'F = !((A+B*C)*(D+E))', 'F = !(!A*B + C)', 'Y = A*B+C', 'Y = !!A', 'Y = !(A + !A)', 'Y = !({enable} & (clk | reset_n))', 'A', 'A+B', 'Y = A', '!(A&&B || C)', '¬(A∧B∨C)', 'Y = !(A*B*C + D*E*F + G*H*I)'];
for (const e of examples) check(e, C.compile(e).count <= 7);
assert.equal(C.compile('AOI21').inputs.join(','), 'A,B,C');
assert.equal(C.compile('AOI221').inputs.join(','), 'A,B,C,D,E');
assert.equal(C.compile('AB+C').count, 3);
assert.equal(C.compile('{AB}+C').count, 2);
assert.equal(C.compile('Y = !(A+!A)').inverted.length, 1);
assert.equal(C.compile('Y = A*B+C').autoInverted, false);
assert.equal(C.compile('A*B+C').autoInverted, true);
for (const e of ['', 'Y =', '!(A+B', 'A++B', 'A^B', '1', '{not closed', 'Y=()']) assert.throws(() => C.compile(e), undefined, `reject ${e}`);
assert.throws(() => C.compile('!(' + Array(65).fill('A').join('+') + ')'));
assert.throws(() => C.compile('AOI999'));
let seed = 0x51a07;
function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; }
function expression(leaves) {
  if (leaves === 1) return (random() < .15 ? '!' : '') + 'ABCD'[Math.floor(random() * 4)];
  const split = 1 + Math.floor(random() * (leaves - 1));
  return '(' + expression(split) + (random() < .5 ? '*' : '+') + expression(leaves - split) + ')';
}
for (let i = 0; i < 400; i++) check('Y = !' + expression(2 + i % 7), i < 230 && i % 7 < 5);
const sixtyFour = C.compile('!(' + Array(64).fill('A').join('*') + ')');
assert.equal(sixtyFour.count, 64); checkCover(sixtyFour.p, sixtyFour.pCover); checkCover(sixtyFour.n, sixtyFour.nCover);
assert.equal(C.common(sixtyFour.p, sixtyFour.n).status, 'found');
const large = C.compile('!((A+B+C+D+E+F+G+H+I)*(J+K+L+M+N+O+P+Q+R))');
assert.ok(['found','limit','none','impossible'].includes(C.common(large.p, large.n, 10, 50).status));
assert.ok(!/<script[^>]+src\s*=/.test(html), 'all scripts embedded');
assert.ok(!/<link[^>]+(?:stylesheet|preload)/.test(html), 'no external style or font dependency');
assert.ok(!/\b(?:fetch|XMLHttpRequest)\s*\(/.test(html.match(/<script id="app-code">([\s\S]*?)<\/script>/)[1]), 'application does not fetch external assets');
console.log(JSON.stringify({ status: 'PASS', expressions: cases, truthVectors: vectors, exactCommonEulerComparisons: exactComparisons, inlineScripts: scripts.length, htmlBytes: Buffer.byteLength(html) }, null, 2));
