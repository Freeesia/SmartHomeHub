# ソースからのコンテナイメージ作成

```sh
docker build -t shh:local .
```

2段階のDockerfileで、既存の`yarn.lock`を固定したままTypeScriptサーバーと
Vueクライアントをビルドします。ビルド時の依存に必要なため、その段階だけNode 22を使い、
Vue CLI 3／Webpack 4のビルドコマンドではOpenSSLのlegacy providerを有効にします。
本番用の依存とアプリの実行環境は、固定したNode 10.16.3を維持します。

実行用イメージにはserverの本番用依存とコンパイル済みのアプリだけを用意します。
UID 1001／GID 0で`node app/bin/www.js`を直接実行し、TCP 3000を使用します。

完成済みの`config.json`を`/opt/shh/config.json`へ読み取り専用でマウントしてください。
アプリはこのファイルをそのまま読みます。設定の合成や書き出しは行いません。
秘密値を含むため、K3sではSealedSecretから生成したSecretをマウントします。
設定ファイルの形式は`packages/server/config.sample.json`を参照してください。
`.dockerignore`は、Git管理情報、`node_modules`、ルートの`dist`、`config.json`、
PS4の認証ファイル、Vue CLIの環境ファイルだけを除外します。
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
