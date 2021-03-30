import { Module } from '@nestjs/common';
import { CompanionDBController } from './companion-db.controller';
import { CompanionDBService } from './companion-db.service';
import { AuthorisedReaders } from './model/entity/authorisedReaders.entity';
import { Data } from './model/entity/data.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncryptDecryptModule } from '../encrypt-decrypt/encrypt-decrypt.module';
import { AuthModule } from '@modules/auth/auth.module';
import { BlockchainMiddlewareService } from '@modules/blockchain-middleware/blockchain-middleware.service';
import { KeyPair } from '@modules/encrypt-decrypt/model/entity/keyPair.entity';
import { ConfigModule } from '@common/config/config.module';
import { Web3Module } from '@modules/web3/web3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthorisedReaders]),
    TypeOrmModule.forFeature([Data]),
    TypeOrmModule.forFeature([KeyPair]),
    EncryptDecryptModule,
    AuthModule,
    ConfigModule,
    Web3Module
  ],
  controllers: [CompanionDBController],
  providers: [CompanionDBService, BlockchainMiddlewareService],
})
export class CompanionDBModule { }
