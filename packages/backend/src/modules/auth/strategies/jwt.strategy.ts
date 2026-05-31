import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          const authHeader = req.headers?.authorization;
          if (authHeader?.startsWith("Bearer ")) {
            return authHeader.split(" ")[1];
          }
          return req.query?.token ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "dev-secret-change-in-production",
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.authService.validateUser(payload);
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, name: user.name };
  }
}
