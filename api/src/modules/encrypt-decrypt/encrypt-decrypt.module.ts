import { Module } from '@nestjs/common';
import { EncryptDecryptController } from './encrypt-decrypt.controller';
import { EncryptDecryptService } from './encrypt-decrypt.service';
import { AuthorizedCompanies } from './model/entity/authorizedCompanies.entity';
import { KeyPair } from './model/entity/keyPair.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([AuthorizedCompanies]),
        TypeOrmModule.forFeature([KeyPair]),
    ],
    controllers: [EncryptDecryptController],
    providers: [EncryptDecryptService],
})
export class EncryptDecryptModule {}
