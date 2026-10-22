"""Exercise a built image through the application's real HTTP interfaces."""
import base64
import hashlib
import hmac
from html.parser import HTMLParser
import json
from pathlib import Path
import secrets
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request


def docker(*args):
    return subprocess.check_output(['docker', *args], stderr=subprocess.PIPE).decode().strip()


def jwt_segment(value):
    return base64.urlsafe_b64encode(json.dumps(value).encode()).rstrip(b'=')


class Assets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        path = values.get('src' if tag == 'script' else 'href', '')
        if tag in ('script', 'link') and path.startswith('/') and path.endswith(('.js', '.css')):
            self.paths.append(path)


def main(image):
    with tempfile.TemporaryDirectory(prefix='shh-image-') as temporary:
        root = Path(temporary)
        settings_dir = root / 'settings'
        secrets_dir = root / 'secrets'
        settings_dir.mkdir()
        secrets_dir.mkdir()
        settings = {
            'pc': {'example': '02:00:00:00:00:01'},
            'jwt': {'issuer': 'urn:shh:smoke', 'audience': 'urn:shh:smoke'},
            'googlehome': {'googleHomeUrl': '127.0.0.1', 'baseUrl': '127.0.0.1:3000'},
            'ldap': {'url': 'ldap://127.0.0.1:389', 'bindDN': 'cn=smoke',
                     'searchBase': 'dc=example,dc=invalid', 'searchFilter': '(uid={{username}})'}
        }
        credentials = {key: secrets.token_urlsafe(32) for key in
                       ('voiceKey', 'remoToken', 'jwtSecret', 'ldapPassword', 'sessionSecret')}
        (settings_dir / 'settings.json').write_text(json.dumps(settings), encoding='utf-8')
        (secrets_dir / 'secrets.json').write_text(json.dumps(credentials), encoding='utf-8')
        container = docker('run', '--detach', '--rm', '--cap-drop=ALL',
                           '--security-opt=no-new-privileges', '--user=1001:0',
                           '--publish=127.0.0.1::3000',
                           '--mount', 'type=bind,src=' + str(settings_dir) + ',dst=/etc/shh,readonly',
                           '--mount', 'type=bind,src=' + str(secrets_dir) + ',dst=/run/secrets/shh,readonly',
                           image)
        try:
            state = json.loads(docker('inspect', container))[0]
            port = state['NetworkSettings']['Ports']['3000/tcp'][0]['HostPort']
            base = 'http://127.0.0.1:' + port

            def request(path, token=None):
                headers = {'Authorization': 'Bearer ' + token} if token else {}
                try:
                    with urllib.request.urlopen(urllib.request.Request(base + path, headers=headers), timeout=5) as response:
                        return response.status, response.read()
                except urllib.error.HTTPError as error:
                    return error.code, error.read()

            for attempt in range(30):
                try:
                    status, body = request('/')
                    if status == 200:
                        break
                except (urllib.error.URLError, ConnectionError, TimeoutError):
                    pass
                time.sleep(1)
            else:
                raise RuntimeError('The application did not become ready')

            assets = Assets()
            assets.feed(body.decode())
            assert assets.paths, 'The client bundle is missing'
            for path in assets.paths:
                code, content = request(path)
                assert code == 200 and content, 'A client asset is unavailable'
            assert request('/api/pc/')[0] == 401, 'PC API must require authentication'
            assert request('/api/ps4/')[0] == 404, 'PS4 API must remain unregistered'
            header = jwt_segment({'alg': 'HS256', 'typ': 'JWT'})
            payload = jwt_segment({'uid': 'smoke', 'iss': settings['jwt']['issuer'],
                                   'aud': settings['jwt']['audience'], 'exp': int(time.time()) + 60})
            signing_input = header + b'.' + payload
            signature = base64.urlsafe_b64encode(hmac.new(credentials['jwtSecret'].encode(),
                                                         signing_input, hashlib.sha256).digest()).rstrip(b'=')
            token = (signing_input + b'.' + signature).decode()
            code, content = request('/api/pc/', token)
            assert code == 200 and json.loads(content) == ['example'], 'Authenticated PC list failed'
            runtime = json.loads(docker('exec', container, 'node', '-e',
                'const fs=require("fs"); console.log(JSON.stringify({node:process.version,uid:process.getuid(),gid:process.getgid(),configMode:fs.statSync("config.json").mode & 511}));'))
            assert runtime == {'node': 'v10.16.3', 'uid': 1001, 'gid': 0, 'configMode': 384}, runtime
            print(json.dumps({'image': image, 'root_status': status, 'client_assets': len(assets.paths),
                              'unauthenticated_pc': 401, 'authenticated_pc': 200, 'ps4': 404,
                              'runtime': runtime, 'physical_device_requests': 0}))
        finally:
            subprocess.run(['docker', 'stop', '--time=5', container], capture_output=True, check=False)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('Usage: python3 scripts/smoke-image.py IMAGE')
    main(sys.argv[1])
