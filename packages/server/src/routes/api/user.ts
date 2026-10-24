import {
  JsonController,
  Post,
  UseBefore,
  CurrentUser,
  Get,
  Authorized,
  OnUndefined,
  Req
} from "routing-controllers";
import passport from "passport";
import jwt, { SignOptions } from "jsonwebtoken";
import { Service } from "typedi";
import ConfigService from "../../modules/configService";
import { Request } from "express";

@Service()
@JsonController("/user")
export default class UserController {
  private readonly config: SignOptions;
  private readonly secretKey: string | Buffer;

  constructor(configService: ConfigService) {
    const op = configService.get<JwtConfig>("jwt");
    this.secretKey = op.secretOrKey;
    this.config = {
      issuer: op.issuer,
      audience: op.audience,
      expiresIn: "1y",
      notBefore: 0
    };
  }

  @Post("/login")
  @UseBefore(passport.authenticate(["ldapauth", "jwt"]))
  login(@CurrentUser({ required: true }) user: any): string {
    return jwt.sign(user, this.secretKey, this.config);
  }

  @Post("/logout")
  @OnUndefined(200)
  logout(@Req() req: Request): Promise<void> {
    return new Promise<void>((resolve, reject) =>
      req.logout((err) => (err ? reject(err) : resolve())),
    );
  }

  @Get("/jwt")
  @Authorized()
  getJwt(@CurrentUser({ required: true }) user: any): string {
    return jwt.sign(user, this.secretKey, this.config);
  }

  @Get("/")
  @OnUndefined(200)
  me(@CurrentUser() user: any): any {
    return user;
  }
}

interface JwtConfig {
  secretOrKey: string;
  issuer?: string;
  audience?: string | string[];
}
