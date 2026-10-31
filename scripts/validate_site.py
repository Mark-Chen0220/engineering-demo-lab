"""Validate the static portal, local links, JavaScript syntax, and source scope."""
from __future__ import annotations
import json
from pathlib import Path
import re
import subprocess
import tempfile
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
        self.scripts = []
        self.current_script = None
        self.script_module = False
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'link', 'img', 'iframe', 'a'):
            for key in ('src', 'href'):
                if key in attrs:
                    self.refs.append(attrs[key])
        if tag == 'script' and 'src' not in attrs and attrs.get('type', '') not in ('application/json', 'application/ld+json'):
            self.current_script = []
            self.script_module = attrs.get('type') == 'module'
    def handle_data(self, data):
        if self.current_script is not None:
            self.current_script.append(data)
    def handle_endtag(self, tag):
        if tag == 'script' and self.current_script is not None:
            self.scripts.append((''.join(self.current_script), self.script_module))
            self.current_script = None

def catalog():
    s = (ROOT / 'assets/catalog.js').read_text(encoding='utf-8')
    return json.loads(s.split('=', 1)[1].strip().removesuffix(';'))

def target(base, ref):
    parsed = urlsplit(ref)
    if parsed.scheme or parsed.netloc or not parsed.path:
        return None
    # Project Pages must resolve resources below the repository prefix.
    if parsed.path.startswith('/'):
        raise AssertionError(f'Root-absolute link breaks project Pages: {ref}')
    p = (base / unquote(parsed.path)).resolve()
    if p.is_dir():
        p = p / 'index.html'
    return p

def main():
    labs = catalog()
    assert len(labs) == 8
    assert len({lab['id'] for lab in labs}) == len(labs)
    assert {c: sum(lab['category'] == c for lab in labs) for c in ('vlsi', 'signals', 'control')} == {'vlsi': 2, 'signals': 3, 'control': 3}
    for lab in labs:
        assert target(ROOT, lab['path']).is_file(), lab['path']
        assert (ROOT / lab['source']).exists(), lab['source']
    count = scripts = 0
    with tempfile.TemporaryDirectory(prefix='open-lab-check-') as temp:
        for p in ROOT.rglob('*.html'):
            if any(x in ('.git', '.local') for x in p.parts):
                continue
            parsed = Page()
            parsed.feed(p.read_text(encoding='utf-8'))
            for ref in parsed.refs:
                destination = target(p.parent, ref)
                if destination is not None:
                    assert destination.is_file(), f'{p.relative_to(ROOT)} -> {ref}'
            for i, (script, module) in enumerate(parsed.scripts):
                if not script.strip():
                    continue
                checked = subprocess.run(['node', '--check', '--input-type=' + ('module' if module else 'commonjs')], input=script, capture_output=True, text=True, encoding='utf-8')
                if checked.returncode:
                    raise AssertionError(f'{p.relative_to(ROOT)} inline script {i}:\n{checked.stderr}')
                scripts += 1
            count += 1
    for p in list(ROOT.rglob('*.js')) + list(ROOT.rglob('*.mjs')) + list(ROOT.rglob('*.cjs')):
        if any(x in ('.git', '.local') for x in p.parts):
            continue
        subprocess.run(['node', '--check', '--input-type=' + ('module' if p.suffix == '.mjs' else 'commonjs')], input=p.read_text(encoding='utf-8'), text=True, encoding='utf-8', check=True, capture_output=True)
        scripts += 1
        if p.suffix == '.mjs':
            for ref in re.findall(r'from\s+[\'\"](\.[^\'\"]+)[\'\"]', p.read_text(encoding='utf-8')):
                assert target(p.parent, ref).is_file(), ref
    assert (ROOT / '.nojekyll').exists()
    assert 'ROOT / "index.html"' not in (ROOT / 'build_site.py').read_text(encoding='utf-8')
    blocked = [p for p in ROOT.rglob('*') if p.is_file() and not any(x in ('.git', '.local') for x in p.parts) and (p.suffix.lower() in ('.pdf', '.docx', '.env') or p.name in ('credentials.json', '.env.local'))]
    assert not blocked, f'Unexpected course documents or credential files: {blocked}'
    print(f'PASS: {len(labs)} labs, {count} HTML pages, {scripts} JavaScript syntax checks; all local links resolve.')
    print('PASS: project-relative URLs, catalog categories, build-script portal protection, and publish scope.')

if __name__ == '__main__':
    main()
