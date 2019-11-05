import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CompanionDBService } from './companion-db.service';
import { JwtPayload } from './model/interfaces/jwt-payload.interface';
import { ConfigService } from '@common/config/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: CompanionDBService,
              private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET_KEY'),
    });
  }

  async validate(payload: JwtPayload) {
    // const user = await this.authService.validateUser(payload);
    // if (!user) {
    //   throw new UnauthorizedException();
    // }
    // return user;
  }
}
