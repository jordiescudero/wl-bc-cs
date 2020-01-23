import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule } from '@common/config/config.module';
import { ConfigService } from '@common/config/config.service';
import { MailService } from '@common/mail/mail.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './model/entity/token.entity';
import { OnetimeToken } from './model/entity/one.time.token.entity';
import { User } from './model/entity/user.entity';
import { UsersService } from './user.service';
import { MailModule } from '@common/mail/mail.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule, TypeOrmModule.forFeature([User])],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET_KEY'),
          signOptions: {
            audience: configService.get('JWT_AUDIENCE'),
          },
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Token]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([OnetimeToken]),
    ConfigModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersService],
  exports: [PassportModule, UsersService],
})
export class AuthModule {}
