import { Controller, Get, Post, Body, Delete, Param, Query } from '@nestjs/common';
import { KeyPair } from './model/entity/keyPair.entity';
import { EncryptDecryptService } from './encrypt-decrypt.service';
import { CompanyDto } from './model/dto/company.dto';
import { RequestCryptoDto } from './model/dto/request-crypto.dto';
import { ResponseCryptoDto } from './model/dto/response-crypto.dto';

@Controller('crypto')
export class EncryptDecryptController {
    constructor(private readonly edService: EncryptDecryptService) {}

    @Post('enroll/:hash')
    async enroll(@Param('hash') hash: string) {
        // This function will create a keyPair for the defined hash.
        // It will return true or false according if the creation was successfull or not.
        return await this.edService.enroll(hash);
    }

    @Delete('disenroll/:hash')
    async disenroll(@Param('hash') hash: string) {
        // This function will delete a keyPair for the defined hash.
        // This function will delete all the authorizations attached to the given hash.
        // It will return true or false according if the operation was sucessfull or not.
        return await this.edService.disenroll(hash);
    }

    @Post('authorize/:hash')
    async authorize(@Param('hash') hash: string, @Body() companyDto: CompanyDto) {
        // This funciton will create an authorization for this hash.
        // It will return true or false according if the operation was sucessfull or not.
        return await this.edService.authorize(hash, companyDto.authHash);
    }

    @Delete('deauthorize/:hash')
    async deauthorize(@Param('hash') hash: string, @Body() companyDto: CompanyDto) {
        // This funciton will delete an authorization for this hash.
        // It will return true or false according if the operation was sucessfull or not.
        return await this.edService.deauthorize(hash, companyDto.authHash);
    }

    @Get('encrypt/:hash')
    async encrypt(@Param('hash') hash: string, @Query('text') text: string): Promise<ResponseCryptoDto> {
        // FIXME: Only the user can encrypt data.

        // IF enrolled member -> return encrypted data.
        // If NOT enrolled member -> return same data.
        return await this.edService.encrypt(hash, text);
    }

    @Get('decrypt/:hash')
    async decrypt(@Param('hash') hash: string, @Query('authHash') authHash: string, @Query('text') text: string): Promise<ResponseCryptoDto> {
        // IF enrolled member -> return decrypted data.
        // If NOT enrolled member -> return same data.
        return await this.edService.decrypt(hash, authHash, text);
    }

}
