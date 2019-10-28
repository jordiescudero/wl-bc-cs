import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@common/config/config.module';
import { ConfigService } from '@common/config/config.service';

@Module({
  imports: [ConfigModule],
  exports: [MailService],
  providers: [MailService],
})
export class MailModule {}
