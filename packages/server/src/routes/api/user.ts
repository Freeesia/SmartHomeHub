import { JsonController, Post, UseBefore } from "routing-controllers";
import passport = require("passport");

@JsonController("/user")
export default class UserController {
  @Post("/login")
  @UseBefore(passport.authenticate("ldapauth", { session: false }))
  login() {
    return true;
  }
}
