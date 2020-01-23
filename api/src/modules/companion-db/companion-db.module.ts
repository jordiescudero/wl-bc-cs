import { Module } from '@nestjs/common';
import { CompanionDBController } from './companion-db.controller';
import { CompanionDBService } from './companion-db.service';
import { AuthorisedReaders } from './model/entity/authorisedReaders.entity';
import { Data } from './model/entity/data.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncryptDecryptModule } from '@modules/encrypt-decrypt/encrypt-decrypt.module';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthorisedReaders]),
    TypeOrmModule.forFeature([Data]),
    EncryptDecryptModule,
    AuthModule,
  ],
  controllers: [CompanionDBController],
  providers: [CompanionDBService],
})
export class CompanionDBModule { }
