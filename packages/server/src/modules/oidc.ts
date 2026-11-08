import type { Strategy } from "openid-client/passport";

/**
 * Creates the OpenID Connect passport strategy from environment variables:
 * OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET and OIDC_REDIRECT_URI.
 */
export default async function createOidcStrategy(): Promise<Strategy> {
  const { OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_REDIRECT_URI } = process.env;
  if (!OIDC_ISSUER || !OIDC_CLIENT_ID || !OIDC_CLIENT_SECRET || !OIDC_REDIRECT_URI) {
    throw new Error("OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET and OIDC_REDIRECT_URI are required");
  }
  // openid-client is ESM-only, so it is imported dynamically from this CommonJS module.
  const client = await import("openid-client");
  const { Strategy } = await import("openid-client/passport");
  const config = await client.discovery(new URL(OIDC_ISSUER), OIDC_CLIENT_ID, OIDC_CLIENT_SECRET);
  return new Strategy(
    { config, callbackURL: OIDC_REDIRECT_URI, scope: "openid profile email" },
    (tokens, done) => {
      const claims = tokens.claims()!;
      done(null, { uid: claims.preferred_username, cn: claims.name, sn: claims.family_name, mail: claims.email });
    },
  );
}
