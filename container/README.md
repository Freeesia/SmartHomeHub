# Source-built container

Build on a Linux amd64 Docker engine:

```sh
docker build -t shh:local .
python3 scripts/smoke-image.py shh:local
```

The image builds both the TypeScript server and Vue client from this checkout.
Both dependency installations use the existing frozen `yarn.lock`. The build
stage uses pinned Node 22 because the locked `node-releases` build dependency
requires Node >=18; the Vue CLI 3/Webpack 4 build alone enables the OpenSSL
legacy provider. The production dependency and runtime stages retain pinned
Node 10.16.3. Updating that legacy application runtime is a separate change.

The container runs as UID 1001/GID 0 on TCP port 3000. Mount ordinary settings
at `/etc/shh/settings.json` and a separate JSON secret at
`/run/secrets/shh/secrets.json`, both read-only. The secret must contain
`voiceKey`, `remoToken`, `jwtSecret`, `ldapPassword`, and `sessionSecret`.
The entrypoint combines them into `/run/shh/config.json` with mode 0600 for the
existing application's configuration reader. A Kubernetes ConfigMap and Secret
can supply these mounts. No deployment configuration or real credentials are
part of the image build, CI check, or repository.

The Docker build context is an allowlist of build metadata and application
source. Runtime archives, `config.json`, credential files, keys, local secrets,
Git metadata, and installed dependencies are excluded. Build from a fresh
checkout and never add production credentials through build arguments or files.

PS4 controller registration is omitted to match the current deployment. Its
HTTP API returns 404 and no PS4 authentication file or UDP port is required.
WOL needs the deployment's host network access to reach the LAN broadcast
route; the image check uses read-only HTTP requests and sends no magic packet.
The check uses temporary generated credentials, verifies the actual client
assets and authenticated PC list, and does not test an LDAP server or devices.

Pull requests build and check the image with read-only repository permissions.
After a change reaches `master`, the separate publishing job checks the exact
image it pushes and uses the workflow's short-lived `GITHUB_TOKEN` with
`packages: write` to publish `ghcr.io/freeesia/smarthomehub:sha-COMMIT_SHA` and
`:latest`. Manual runs publish only when run on `master`. No personal write
token is required, and the workflow does not change package visibility.

Use the published digest from the Actions job summary for deployment:

```yaml
imagePullSecrets:
  - name: github-packages
containers:
  - name: shh
    image: ghcr.io/freeesia/smarthomehub@sha256:PUBLISHED_DIGEST
    imagePullPolicy: Always
```

The pull Secret must already contain a working `ghcr.io` login with
`read:packages` and access to this package. The workflow does not distribute
credentials or alter cluster resources. Resolve and verify the published digest
and package access before committing the GitOps change.
