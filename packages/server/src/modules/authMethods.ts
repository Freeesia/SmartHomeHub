/** Which sign-in methods this server offers. */
export default class AuthMethods {
  constructor(
    readonly password: boolean,
    readonly oidc: boolean,
  ) {}

  /** passport strategies accepted by POST /api/user/login (JWT refresh is always allowed). */
  get loginStrategies(): string[] {
    return this.password ? ["ldapauth", "jwt"] : ["jwt"];
  }
}
