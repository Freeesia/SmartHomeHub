import {
  JsonController,
  Post,
  UseBefore,
  CurrentUser,
  Get,
  Authorized
} from "routing-controllers";
import passport from "passport";
import jwt, { SignOptions } from "jsonwebtoken";
import ConfigService from "../../modules/configService";
import { StrategyOptions as JwtOptions } from "passport-jwt";

@JsonController("/user")
export default class UserController {
  private readonly config: SignOptions;
  private readonly secretKey: string | Buffer;

  constructor(configService: ConfigService) {
    const op = configService.get<JwtOptions>("jwt");
    this.secretKey = op.secretOrKey;
    this.config = {
      issuer: op.issuer,
      audience: op.audience,
      expiresIn: "1y",
      notBefore: 0
    };
  }

  @Post("/login")
  @UseBefore(passport.authenticate("ldapauth"))
  login(@CurrentUser({ required: true }) user: any) {
    return jwt.sign(user, this.secretKey, this.config);
  }

  @Get("/jwt")
  @Authorized()
  getJwt(@CurrentUser({ required: true }) user: any) {
    return jwt.sign(user, this.secretKey, this.config);
  }
}
