import {
  JsonController,
  Post,
  UseBefore,
  CurrentUser
} from "routing-controllers";
import passport = require("passport");

@JsonController("/user")
export default class UserController {
  @Post("/login")
  @UseBefore(passport.authenticate("ldapauth"))
  login(@CurrentUser({ required: true }) user: any) {
    return user;
  }
}
