import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './model/interfaces/jwt-payload.interface';
import { ConfigService } from '@common/config/config.service';
import { Repository, SaveOptions, getConnection, MongoRepository } from 'typeorm';
import { Token } from './model/entity/token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OnetimeToken } from './model/entity/one.time.token.entity';
import { RefreshDto } from './model/dto/refresh.dto';
import * as uuidv4 from 'uuid/v4';
import { ResponseTokenDto } from './model/dto/response-token.dto';
import { TokenDto } from './model/dto/token.dto';
import { User } from './model/entity/user.entity';
import { UsersService } from './user.service';

const log = new Logger('auth.service');

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Token)
    private readonly tokenRepository: MongoRepository<Token>,
    @InjectRepository(OnetimeToken)
    private readonly oneTimeTokenRepository: MongoRepository<OnetimeToken>,
    private readonly userService: UsersService,
  ) { }

  private jtiGenerator(): string {
    return uuidv4();
  }

  public async generateTokens(user: User): Promise<ResponseTokenDto> {

    const expiresInSeconds = Number(this.configService.get('JWT_ACCESS_EXPIRATION_TIME'));
    const expiresRefreshInSeconds = Number(this.configService.get('JWT_REFRESH_EXPIRATION_TIME'));

    const refresTokenJTI = this.jtiGenerator();
    const accessTokenJTI = this.jtiGenerator();

    const refreshTokenData = { id: user.id };
    const accessTokenData = { id: user.id , role : user.role , rjti: refresTokenJTI };

    const accessTokenExpiresAt =  new Date( (new Date()).getTime() + (expiresInSeconds * 1000));
    const refreshTokenExpiresAt =  new Date( (new Date()).getTime() + (expiresRefreshInSeconds * 1000));

    const whiteAccessToken = this.tokenRepository.create( {
      jti: accessTokenJTI,
      rjti: refresTokenJTI,
      expireAt: accessTokenExpiresAt,
      userId: user.id.toString(),
     });

    const whiteRefreshToken = this.tokenRepository.create( {
      jti: refresTokenJTI,
      rjti: refresTokenJTI,
      expireAt: refreshTokenExpiresAt,
      userId: user.id.toString(),
    });

    await this.tokenRepository.save([whiteAccessToken, whiteRefreshToken]);

    const responseToken = new ResponseTokenDto();
    responseToken.accessToken = new TokenDto();
    responseToken.refreshToken = new TokenDto();
    responseToken.accessToken.expiresAt = accessTokenExpiresAt;
    responseToken.refreshToken.expiresAt = refreshTokenExpiresAt;
    responseToken.accessToken.token = this.jwtService.sign({ ...accessTokenData }, { jwtid: accessTokenJTI , expiresIn: Number(expiresInSeconds)});
    responseToken.refreshToken.token =
        this.jwtService.sign({ ...refreshTokenData }, { jwtid: refresTokenJTI, expiresIn: Number(expiresRefreshInSeconds)});

    return responseToken;
  }

  public async refreshTokens(rjti: string, refreshTokenRequest: RefreshDto): Promise<ResponseTokenDto> {

    // Test token validity
    let accessToken;
    let refreshToken;

    log.debug('start refresh');
    const now = new Date();
    const nowTime = now.getTime();

    try {
      accessToken = this.jwtService.verify(refreshTokenRequest.accessToken);
      refreshToken = this.jwtService.verify(refreshTokenRequest.refreshToken);
    } catch (exception) {
      log.debug('Tokens are not valid');
      throw new NotAcceptableException(
        'Tokens are not valid',
      );
    }

    if ((accessToken.rjti !== rjti) || (refreshToken.jti !== rjti) ) {
      log.debug('Tokens are not realted');
      throw new NotAcceptableException(
        'Tokens are not realted',
      );
    }

    let sessionTokens = await this.tokenRepository.find({
        where: {
            $and: [
                {
                  rjti,
                },
                {
                  expireAt: {
                    $gt : now,
                  },
                },
            ],
        },
      });

    log.debug(`Sessions found ${sessionTokens.length}`);

    // filter expired tokens
    sessionTokens = sessionTokens.filter( (item) => {
      return (item.expireAt.getTime() > nowTime);
    });

    log.debug(`Sessions filtered ${sessionTokens.length}`);

    const whiteListedAccesToken = sessionTokens.filter( (item) => {
        return (item.jti === accessToken.jti);
    });

    const whiteListedRefreshToken = sessionTokens.filter( (item) => {
      return (item.jti === refreshToken.jti);
    });

    if (whiteListedAccesToken.length === 0 || whiteListedRefreshToken.length === 0) {
      log.debug('Token not found');
      throw new NotAcceptableException(
        'Token not found',
      );
    }

    if (whiteListedRefreshToken[0].expireAt.getTime() === refreshToken.exp * 1000) {
      log.debug('Not last refresh token');
      throw new NotAcceptableException(
        'Not last refresh token',
      );
    }

    const tokenRefreshResponse: any = {};

    if ((this.configService.get('JWT_REFRESH_REGENERATION') === 'true') &&
        ( whiteListedRefreshToken[0].expireAt.getTime() > nowTime) &&
        ( whiteListedRefreshToken[0].expireAt.getTime() < (nowTime +  (Number(this.configService.get('JWT_REFRESH_REGENERATION_WINDOW')) * 1000)))
        ) {

      log.debug('not valid refresh token');
      // It's time to generate new refresh token.
      const expiresRefreshInSeconds = Number(this.configService.get('JWT_REFRESH_EXPIRATION_TIME'));
      const refreshTokenExpiresAt =  new Date( nowTime + (expiresRefreshInSeconds * 1000));

      const refreshTokenData = { id: refreshToken.userId };

      whiteListedRefreshToken[0].expireAt = refreshTokenExpiresAt;

      await this.tokenRepository.save(whiteListedRefreshToken[0]);

      tokenRefreshResponse.refreshToken = {
        expiresAt: refreshTokenExpiresAt,
        token: this.jwtService.sign({ ...refreshTokenData }, { jwtid: refreshToken.jti, expiresIn: Number(expiresRefreshInSeconds)}),
      };
    } else {
      log.debug('valid refresh token');
    }

    if (( whiteListedAccesToken[0].expireAt.getTime() > nowTime) &&
    ( whiteListedAccesToken[0].expireAt.getTime() < (nowTime +  (Number(this.configService.get('JWT_ACCESS_REGENERATION_WINDOW')) * 1000))) &&
    ( sessionTokens.length === 2 )
    ) {
      log.debug('not valid access token');
      // It's time to generate new access token.
      const expiresInSeconds = Number(this.configService.get('JWT_ACCESS_EXPIRATION_TIME'));
      const accessTokenExpiresAt =  new Date( nowTime + (expiresInSeconds * 1000));
      const accessTokenJTI = this.jtiGenerator();

      const newAccessToken = this.tokenRepository.create({
        jti: accessTokenJTI,
        rjti: accessToken.rjti,
        expireAt: accessTokenExpiresAt,
        userId: accessToken.userId,
      });

      const accessTokenData = { id: accessToken.id , role : accessToken.role , rjti: accessToken.rjti };

      await this.tokenRepository.save(newAccessToken);

      tokenRefreshResponse.accessToken = {
        expiresAt: accessTokenExpiresAt,
        token: this.jwtService.sign({ ...accessTokenData }, { jwtid: accessTokenJTI, expiresIn: Number(expiresInSeconds)}),
      };

    } else {
      log.debug('valid access token');
    }
    return tokenRefreshResponse;

  }

  public async createOneTimeToken(user: User, lang: string) {

    const expiresInSeconds = this.configService.get('ONE_TIME_TOKEN_EXPIRATION_TIME');

    // const oneTimeToken = this.oneTimeTokenRepository.create( {
    //   expireAt: new Date( (new Date()).getTime() + (expiresInSeconds * 1000)),
    //   email: user.email,
    //   userId: user.id.toString(),
    //   firstName: user.firstName,
    //   lastName: user.lastName,
    //   lang,
    //  });
    // await this.oneTimeTokenRepository.save(oneTimeToken);

    // return oneTimeToken;
    return null;
  }

  public async getOneTimeToken(oneTimeTokenId: string) {
    const oneTimeToken = this.oneTimeTokenRepository.findOne(oneTimeTokenId);
    return oneTimeToken;
  }

  public async deleteOneTimeToken(oneTimeTokenId: string) {
    this.oneTimeTokenRepository.delete(oneTimeTokenId);
  }

  public async deleteTokens(rjti: string) {
    await this.tokenRepository.deleteMany({rjti});
  }

  public async validateUser(jwt: JwtPayload): Promise<any> {
    const whiteToken = await this.tokenRepository.findOne({jti: jwt.jti});
    if (whiteToken) {
      return jwt;
    } else {
      return null;
    }
  }

}
