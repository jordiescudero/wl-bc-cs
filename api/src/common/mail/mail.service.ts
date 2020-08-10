import { ConfigService } from '@common/config/config.service';
import * as nodemailer from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';
import hbs from 'nodemailer-express-handlebars';
import * as handlebars from 'express-handlebars';

import * as i18n from 'i18n';
import * as path from 'path';

@Injectable()
export class MailService {

    private mailer: nodemailer.Transporter;
    private logger = new Logger('MailService', true);

    constructor(
        private readonly configService: ConfigService,
      ) {

        this.mailer = nodemailer.createTransport({
            // host: this.configService.get('MAIL_HOST'),
            // port: this.configService.get('MAIL_PORT'),
            // secure: false,
            // auth: {
            //     user: this.configService.get('MAIL_USER'),
            //     pass: this.configService.get('MAIL_PASSWORD'),
            // },
            // tls: { rejectUnauthorized: false },
        });
        const viewEngineCfg = {
            extname: '.hbs',
            layoutsDir: configService.get('BASE_TEMPLATE_DIR') ? configService.get('BASE_TEMPLATE_DIR') :
            path.join(__dirname, '..', '..', '..', 'templates', 'emails', 'layouts'),
            defaultLayout : 'default',
            partialsDir : configService.get('BASE_TEMPLATE_DIR') ? configService.get('BASE_TEMPLATE_DIR') :
            path.join(__dirname, '..', '..', '..', 'templates', 'emails', 'partials'),
            helpers: {
                __: (...args) => {
                    const options = args.pop();
                    return Reflect.apply(i18n.__, options.data.root, args);
                  },
                __n:  (...args) => {
                    const options = args.pop();
                    return Reflect.apply(i18n.__n, options.data.root, args);
                    },
                concat: (...args) => {
                  const options = args.pop();
                  return args.join('');
                  },
            },
        };

        const viewEngine = handlebars.create(viewEngineCfg);

        const hbsCfg = {
          viewEngine,
          viewPath: configService.get('BASE_TEMPLATE_DIR') ? configService.get('BASE_TEMPLATE_DIR') :
                                                          path.join(__dirname, '..', '..', '..', 'templates', 'emails'),
          extName: '.hbs',
        };

        const hbsInstance = hbs(hbsCfg);

        this.mailer.use('compile', hbsInstance);

      }

    public sendMail(msg: any) {
        this.mailer.sendMail(msg);
    }
}
