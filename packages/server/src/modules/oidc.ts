import { Router, Request, Response } from "express";
import type * as OidcClient from "openid-client";

/**
 * OpenID Connect sign-in (authorization code flow with PKCE, state and nonce).
 *
 * Settings come from environment variables so that config.json does not need to change:
 *   OIDC_ISSUER        e.g. https://id.example.com/realms/example
 *   OIDC_CLIENT_ID
 *   OIDC_CLIENT_SECRET
 *   OIDC_REDIRECT_URI  e.g. https://shh.example.com/api/user/oidc/callback
 *   OIDC_SCOPE         optional, default "openid profile email"
 */
export interface OidcSettings {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
}

export function oidcSettingsFromEnv(env: NodeJS.ProcessEnv = process.env): OidcSettings | undefined {
  const { OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_REDIRECT_URI } = env;
  if (!OIDC_ISSUER || !OIDC_CLIENT_ID || !OIDC_CLIENT_SECRET || !OIDC_REDIRECT_URI) {
    return undefined;
  }
  return {
    issuer: OIDC_ISSUER,
    clientId: OIDC_CLIENT_ID,
    clientSecret: OIDC_CLIENT_SECRET,
    redirectUri: OIDC_REDIRECT_URI,
    scope: env.OIDC_SCOPE || "openid profile email",
  };
}

interface PendingLogin {
  codeVerifier: string;
  state: string;
  nonce: string;
}

declare module "express-session" {
  interface SessionData {
    oidc?: PendingLogin;
  }
}

/** The user object stored in the session and signed into the JWT, shaped like the former LDAP user. */
export function userFromClaims(claims: Record<string, unknown>): Express.User {
  const uid = String(claims.preferred_username ?? claims.sub);
  const name = typeof claims.name === "string" ? claims.name : undefined;
  return {
    uid,
    cn: name ?? uid,
    sn: typeof claims.family_name === "string" ? claims.family_name : (name ?? uid),
    mail: typeof claims.email === "string" ? claims.email : undefined,
  } as Express.User;
}

export function createOidcRouter(settings: OidcSettings): Router {
  // openid-client is ESM-only; load it lazily from this CommonJS module.
  let configuration: Promise<OidcClient.Configuration> | undefined;
  const load = () => import("openid-client");
  const getConfiguration = () => {
    if (!configuration) {
      configuration = load()
        .then((client) => client.discovery(new URL(settings.issuer), settings.clientId, settings.clientSecret))
        .catch((error) => {
          configuration = undefined; // retry discovery on the next request
          throw error;
        });
    }
    return configuration;
  };

  const router = Router();

  router.get("/login", async (req: Request, res: Response) => {
    try {
      const client = await load();
      const config = await getConfiguration();
      const pending: PendingLogin = {
        codeVerifier: client.randomPKCECodeVerifier(),
        state: client.randomState(),
        nonce: client.randomNonce(),
      };
      req.session.oidc = pending;
      const url = client.buildAuthorizationUrl(config, {
        redirect_uri: settings.redirectUri,
        scope: settings.scope,
        code_challenge: await client.calculatePKCECodeChallenge(pending.codeVerifier),
        code_challenge_method: "S256",
        state: pending.state,
        nonce: pending.nonce,
      });
      req.session.save((err) => (err ? res.redirect("/login?error=sso") : res.redirect(url.href)));
    } catch (error) {
      console.error("OIDC login could not start", error);
      res.redirect("/login?error=sso");
    }
  });

  router.get("/callback", async (req: Request, res: Response) => {
    const pending = req.session.oidc;
    delete req.session.oidc;
    if (!pending) {
      return res.redirect("/login?error=sso");
    }
    try {
      const client = await load();
      const config = await getConfiguration();
      // Rebuild the public callback URL (the app runs behind a TLS-terminating proxy).
      const currentUrl = new URL(req.originalUrl, settings.redirectUri);
      const tokens = await client.authorizationCodeGrant(config, currentUrl, {
        pkceCodeVerifier: pending.codeVerifier,
        expectedState: pending.state,
        expectedNonce: pending.nonce,
        idTokenExpected: true,
      });
      const claims = tokens.claims();
      if (!claims) {
        throw new Error("ID token is missing");
      }
      const user = userFromClaims(claims);
      req.login(user, (err) => (err ? res.redirect("/login?error=sso") : res.redirect("/login?sso=1")));
    } catch (error) {
      console.error("OIDC callback failed", error);
      res.redirect("/login?error=sso");
    }
  });

  return router;
}
