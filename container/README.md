# Source-built container

```sh
docker build -t shh:local .
```

The two-stage Dockerfile builds the TypeScript server and Vue client from the
existing frozen `yarn.lock`. Node 22 is needed only for build dependencies;
the Vue CLI 3/Webpack 4 command enables its OpenSSL legacy provider. Production
dependencies and the application run on pinned Node 10.16.3.

The container runs as UID 1001/GID 0 on TCP 3000. Mount these files read-only:

- `/etc/shh/settings.json`: ordinary settings from a ConfigMap.
- `/run/secrets/shh/secrets.json`: `voiceKey`, `remoToken`, `jwtSecret`,
  `ldapPassword`, and `sessionSecret` from a Secret.

The entrypoint combines them into `/run/shh/config.json` with mode 0600.
The build context allows source and build metadata only; runtime archives,
configuration, credentials, keys, Git metadata, and local dependencies are
excluded. Never pass production credentials to the image build.

PRs build only, with read-only permissions. On `master`, Actions builds once
and publishes `ghcr.io/freeesia/smarthomehub:sha-COMMIT_SHA` and `:latest` using
the workflow's `GITHUB_TOKEN`. Manual publishing also requires `master`.
No personal write token or package visibility change is needed.

For deployment, use the published digest, `imagePullPolicy: Always`, and an
existing `ghcr.io` pull Secret with package read access. Keep settings and
credentials in runtime mounts. WOL requires the deployment's host network;
the PS4 controller remains unregistered.
