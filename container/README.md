# ソースからのコンテナイメージ作成

```sh
docker build -t shh:local .
```

2段階のDockerfileで、既存の`yarn.lock`を固定したままTypeScriptサーバーと
Vueクライアントをビルドします。ビルド時の依存に必要なため、その段階だけNode 22を使い、
Vue CLI 3／Webpack 4のビルドコマンドではOpenSSLのlegacy providerを有効にします。
本番用の依存とアプリの実行環境は、固定したNode 10.16.3を維持します。

コンテナはUID 1001／GID 0で動作し、TCP 3000を使用します。
次のファイルを読み取り専用でマウントしてください。

- `/etc/shh/settings.json`：ConfigMapから渡す通常設定。
- `/run/secrets/shh/secrets.json`：Secretから渡す`voiceKey`、`remoToken`、
  `jwtSecret`、`ldapPassword`、`sessionSecret`。

起動時に両方を合成し、権限0600の`/run/shh/config.json`を生成します。
`.dockerignore`で、稼働物のアーカイブ、実行時の設定・認証情報・秘密鍵、
Gitの管理情報、ローカルの依存・ビルド成果物を除外しています。
本番の秘密情報をイメージのビルドに渡さないでください。

`master`へのpush時に、ActionsがGHCRへログインして次の2コマンドを実行します。

```sh
docker build --label "org.opencontainers.image.revision=$GITHUB_SHA" -t ghcr.io/freeesia/smarthomehub:latest .
docker push ghcr.io/freeesia/smarthomehub:latest
```

認証にはワークフローの`GITHUB_TOKEN`を使用します。
書き込み用の個人トークンの作成や、パッケージの公開属性変更は不要です。

デプロイ時は、発行済みのdigest、`imagePullPolicy: Always`、対象パッケージの
読み取り権限を持つ既存の`ghcr.io`用Secretを使用してください。
設定と認証情報は引き続き実行時にマウントします。
WOLにはホストネットワークが必要です。PS4のコントローラーは登録していません。
