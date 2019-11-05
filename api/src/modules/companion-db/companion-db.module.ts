import { Module } from '@nestjs/common';
import { CompanionDBController } from './companion-db.controller';
import { CompanionDBService } from './companion-db.service';

@Module({
  controllers: [CompanionDBController],
  providers: [CompanionDBService],
})
export class CompanionDBModule {}
