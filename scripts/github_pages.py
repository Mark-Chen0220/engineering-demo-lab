"""Manage this portal's GitHub repository and Pages with existing Git sign-in.

Credentials stay in process memory and are never written to this repository.
Run only on a machine already signed in through Git Credential Manager.
"""
from __future__ import annotations
import argparse
import json
import os
import subprocess
import urllib.error
import urllib.request

OWNER = 'Mark-Chen0220'
REPO = 'engineering-demo-lab'
SITE = f'https://{OWNER.lower()}.github.io/{REPO}/'

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=('verify', 'create', 'enable', 'status'))
    action = parser.parse_args().action
    env = dict(os.environ, GIT_TERMINAL_PROMPT='0', GCM_INTERACTIVE='never')
    result = subprocess.run(['git', 'credential', 'fill'], input=f'protocol=https\nhost=github.com\nusername={OWNER}\n\n', text=True, capture_output=True, env=env, check=True)
    credential = dict(line.split('=', 1) for line in result.stdout.splitlines() if '=' in line)
    token = credential['password']

    def request(path, method='GET', data=None, missing=False):
        req = urllib.request.Request('https://api.github.com' + path, method=method,
            data=json.dumps(data).encode() if data is not None else None,
            headers={'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json',
                     'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'Open-Lab-Publisher'})
        try:
            with urllib.request.urlopen(req, timeout=45) as response:
                raw = response.read()
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as error:
            if missing and error.code == 404:
                return None
            try:
                message = json.loads(error.read()).get('message', 'GitHub request failed')
            except (ValueError, AttributeError):
                message = 'GitHub request failed'
            raise RuntimeError(f'GitHub HTTP {error.code}: {message}') from None

    user = request('/user')
    if user['login'].lower() != OWNER.lower():
        raise RuntimeError('The authenticated account does not own this portal.')
    base = f'/repos/{OWNER}/{REPO}'
    if action == 'verify':
        repository = request(base, missing=True)
        print(json.dumps({'login': user['login'], 'repository_exists': repository is not None}))
    elif action == 'create':
        repository = request(base, missing=True)
        created = repository is None
        if created:
            repository = request('/user/repos', 'POST', {'name': REPO,
                'description': 'Eight interactive engineering labs: CMOS, sampling, oversampling ADCs, and control systems.',
                'private': False, 'has_wiki': False, 'has_projects': False, 'homepage': SITE})
        print(json.dumps({'created': created, 'repository': repository['html_url'], 'clone_url': repository['clone_url'], 'private': repository['private']}))
    elif action == 'enable':
        pages = request(base + '/pages', missing=True)
        if pages is None:
            pages = request(base + '/pages', 'POST', {'build_type': 'legacy', 'source': {'branch': 'main', 'path': '/'}})
        elif pages.get('source') != {'branch': 'main', 'path': '/'}:
            pages = request(base + '/pages', 'PUT', {'build_type': 'legacy', 'source': {'branch': 'main', 'path': '/'}})
        print(json.dumps({'url': pages.get('html_url', SITE), 'status': pages.get('status'), 'source': pages.get('source')}))
    else:
        pages = request(base + '/pages')
        build = request(base + '/pages/builds/latest', missing=True)
        print(json.dumps({'url': pages['html_url'], 'status': pages.get('status'), 'https_enforced': pages.get('https_enforced'),
            'source': pages.get('source'), 'build': {k: build.get(k) for k in ('status', 'commit', 'error', 'updated_at')} if build else None}))

if __name__ == '__main__':
    main()
