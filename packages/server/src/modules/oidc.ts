import { Router, Request, Response, NextFunction } from "express";
import passport from "passport";

/**
 * OpenID Connect sign-in with openid-client's passport strategy
 * (authorization code flow; PKCE and the request state are handled by the strategy).
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

const STRATEGY = "oidc";

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

/**
 * Registers the "oidc" passport strategy once the issuer's discovery document is loaded.
 * openid-client is ESM-only, so it is imported lazily from this CommonJS module.
 * A failed discovery is retried on the next sign-in attempt.
 */
function strategyLoader(settings: OidcSettings): () => Promise<void> {
  let ready: Promise<void> | undefined;
  return () => {
    ready ??= (async () => {
      const client = await import("openid-client");
      const { Strategy } = await import("openid-client/passport");
      const config = await client.discovery(new URL(settings.issuer), settings.clientId, settings.clientSecret);
      passport.use(
        STRATEGY,
        new Strategy({ config, callbackURL: settings.redirectUri, scope: settings.scope }, (tokens, verified) => {
          const claims = tokens.claims();
          if (!claims) {
            return verified(new Error("ID token is missing"));
          }
          verified(null, userFromClaims(claims));
        }),
      );
    })().catch((error) => {
      ready = undefined;
      throw error;
    });
    return ready;
  };
}

export function createOidcRouter(settings: OidcSettings): Router {
  const ensureStrategy = strategyLoader(settings);
  // Start loading in the background so the first sign-in is quick; errors surface on use.
  ensureStrategy().catch((error) => console.error("OIDC discovery failed", error));

  const authenticate = (options: passport.AuthenticateOptions) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureStrategy();
    } catch (error) {
      console.error("OIDC is unavailable", error);
      return res.redirect("/login?error=sso");
    }
    passport.authenticate(STRATEGY, options)(req, res, next);
  };

  const router = Router();
  // Redirects to the identity provider.
  router.get("/login", authenticate({}));
  // Handles the authorization response, then signs the user in to the session.
  router.get(
    "/callback",
    authenticate({ successRedirect: "/login?sso=1", failureRedirect: "/login?error=sso" }),
  );
  // Unexpected errors from the strategy (for example a token endpoint failure).
  router.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("OIDC callback failed", error);
    res.redirect("/login?error=sso");
  });
  return router;
}
