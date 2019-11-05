import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';

import { DatabaseModule } from './common/database/database.module';
import { ConfigModule } from './common/config/config.module';
import { ConfigService } from './common/config/config.service';
import { MailModule } from './common/mail/mail.module';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
// import { ContractsModule } from './modules/contracts/contracts.module';
import { CompanionDBModule } from './modules/companion-db/companion-db.module';
import { EncryptDecryptModule } from './modules/encrypt-decrypt/encrypt-decrypt.module';

// TODO: try to make configurable the rootPath for ServeStaticModule github Issue: https://github.com/nestjs/serve-static/issues/10
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'static'),
    }),
    ConfigModule,
    DatabaseModule,
    MailModule,
    AuthModule,
    ApiKeysModule,
    // ContractsModule,
    CompanionDBModule,
    EncryptDecryptModule],
  controllers: [AppController],
})
export class AppModule {
  static port: string | number;
  static isDev: boolean;
  static globalPrefix: string;
  static baseTemplatesDir: string;
  static baseLocalesDir: string;
  static staticAssetsDir: string;
  static config: ConfigService;
  static locales: string[];
  static defaultLocale: string;
  static localeCookieName: string;
  static jwtAccessCookieName: string;
  static jwtRefreshCookieName: string;
  static assetsUrlPrefix: string;
  static jwtAccessTokenExpirationTime: number;
  static jwtRefreshTokenExpirationTime: number;

  constructor(private readonly config: ConfigService) {
    AppModule.baseTemplatesDir = config.get('BASE_TEMPLATE_DIR') ? config.get('BASE_TEMPLATE_DIR') : path.join(__dirname, '..' , 'templates');
    AppModule.baseLocalesDir = config.get('BASE_LOCALE_DIR') ? config.get('BASE_LOCALE_DIR') : path.join(__dirname, '..' , 'locales');
    AppModule.staticAssetsDir = config.get('BASE_LOCALE_DIR') ? config.get('BASE_LOCALE_DIR') : path.join(__dirname, '..' , 'static');
    AppModule.defaultLocale = config.get('LOCALE_DEFAULT') ? config.get('LOCALE_DEFAULT') : 'en';
    AppModule.localeCookieName = config.get('LOCALE_COOKIE_NAME') ? config.get('LOCALE_COOKIE_NAME') : 'locale';
    AppModule.jwtAccessCookieName = config.get('JWT_ACCESS_COOKIE_NAME') ? config.get('JWT_ACCESS_COOKIE_NAME') : 'JWT_ACCESS_COOKIE_NAME';
    AppModule.jwtRefreshCookieName = config.get('JWT_REFRESH_COOKIE_NAME') ? config.get('JWT_REFRESH_COOKIE_NAME') : 'JWT_REFRESH_COOKIE_NAME';
    AppModule.jwtAccessTokenExpirationTime = Number(config.get('JWT_ACCESS_EXPIRATION_TIME'));
    AppModule.jwtRefreshTokenExpirationTime = Number(config.get('JWT_REFRESH_EXPIRATION_TIME'));
    AppModule.assetsUrlPrefix = config.get('STATIC_URL_PREFIX') ? config.get('STATIC_URL_PREFIX') : '/assets';

    AppModule.locales = config.get('LOCALES') ? config.get('LOCALES').split(',') : ['en'];
    AppModule.port = config.get('API_PORT');
    AppModule.globalPrefix = config.get('API_GLOBAL_PREFIX');
    AppModule.isDev = config.isDev;
    AppModule.config = config;
  }

}
