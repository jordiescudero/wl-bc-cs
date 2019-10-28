import 'module-alias/register';
import { NestFactory, Reflector } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { setupSwagger } from './common/swagger';
import * as helmet from 'helmet';
import * as hbs from 'hbs';
import * as i18n from 'i18n';
import * as cookieParser from 'cookie-parser';
import * as mung from 'express-mung';
import * as path from 'path';

import { AccessGuard } from './common/guards/access.guard';
import { loggerMiddleware } from './common/middlewares/logger.middleware';
import { jwtCookieMiddlewareGenerator } from './common/middlewares/jwt.cookie.middleware';
import { TransformInterceptor } from './common/interceptors/TransformInterceptor';
import bodyParser = require('body-parser');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  const logger = new Logger('Main', true);

  app.setGlobalPrefix(AppModule.globalPrefix);

  app.use(helmet());
  app.use(cookieParser());
  app.use(loggerMiddleware);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(jwtCookieMiddlewareGenerator(AppModule.jwtAccessCookieName, AppModule.jwtRefreshCookieName));
  app.useGlobalGuards(new AccessGuard(new Reflector()));

  i18n.configure({
    locales: AppModule.locales,
    cookie: AppModule.localeCookieName,
    directory: AppModule.baseLocalesDir,
  });

  app.use(i18n.init);

  hbs.registerHelper('staticUrlPrefix', () => {
    return AppModule.assetsUrlPrefix;
  });

  hbs.registerHelper('__', (...args) => {
    const options = args.pop();
    return Reflect.apply(i18n.__, options.data.root, args);
  });

  hbs.registerHelper('__n', (...args) => {
    const options = args.pop();
    return Reflect.apply(i18n.__n, options.data.root, args);
  });

  hbs.registerPartials(path.join(AppModule.baseTemplatesDir, 'views', 'partials'));

  app.setBaseViewsDir(AppModule.baseTemplatesDir);
  app.setViewEngine('hbs');
  app.engine('hbs', hbs.__express);
  setupSwagger(app, AppModule.config);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  app.useGlobalInterceptors(new TransformInterceptor());

  app.use(mung.json(
    function transform(body, req, res) {

      const contype = req.headers['content-type'];

      if (  ['/api/auth/login', '/api/auth/token/refresh'].includes(req.url) && contype && contype.indexOf('application/json') === -1 ) {

        const accessCookieCfg: any = {
          maxAge: AppModule.jwtAccessTokenExpirationTime * 1000,
          path: '/api',
        };

        const refreshCookieCfg: any = {
          maxAge: AppModule.jwtRefreshTokenExpirationTime * 1000,
          path: '/api/auth/token/refresh',
        };

        if (AppModule.config.get('JWT_COOKIE_DOMAIN')) {
          accessCookieCfg.domain = AppModule.config.get('JWT_COOKIE_DOMAIN');
          refreshCookieCfg.domain = AppModule.config.get('JWT_COOKIE_DOMAIN');
        }

        if (AppModule.config.get('JWT_COOKIE_HTTP_ONLY')) {
          accessCookieCfg.httpOnly = true;
          refreshCookieCfg.httpOnly = true;
        }

        if (AppModule.config.get('JWT_COOKIE_SECURE')) {
          accessCookieCfg.secure = true;
          refreshCookieCfg.secure = true;
        }

        if (body.accessToken) {
          res.cookie(AppModule.jwtAccessCookieName, body.accessToken.token, accessCookieCfg);
          delete body.accessToken.token;
        }

        if (body.refreshToken) {
          res.cookie(AppModule.jwtRefreshCookieName, body.refreshToken.token, refreshCookieCfg);
          delete body.refreshToken.token;
        }

      }
      return body;
    },
  ));

  await app.listen(AppModule.port);

   // Log current url of app and documentation
  let baseUrl = app.getHttpServer().address().address;
  if (baseUrl === '0.0.0.0' || baseUrl === '::') {
    baseUrl = 'localhost';
  }
  const url = `http://${baseUrl}:${AppModule.port}${AppModule.globalPrefix}`;
  logger.log(`Listening to ${url}`);
  if (AppModule.isDev) {
    logger.log(`API Documentation available at ${url}/docs`);
  }
}

bootstrap();
