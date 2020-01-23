import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Query,
  Scope,
} from '@nestjs/common';
import { EncryptDecryptService } from './encrypt-decrypt.service';
import { RequestCryptoDto } from './model/dto/request-crypto.dto';
import { ResponseCryptoDto } from './model/dto/response-crypto.dto';

@Controller({
  path: 'crypto',
  scope: Scope.DEFAULT,
})
export class EncryptDecryptController {
  constructor(private readonly edService: EncryptDecryptService) {}

  /**
   * This function creates a keyPair for the defined hash. 
   * It returns true if the creation was successfull and false if not.
   * 
   * @param hash 
   * @param mnemonic 
   */
  @Post('enrol/:hash')
  async enrol(
    @Param('hash') hash: string,
    @Body('mnemonic') mnemonic: string,
  ) {
    return await this.edService.enroll(hash, mnemonic);
  }

  /**
   * This function deletes a keyPair for the defined hash.
   * It returns true if the operation was sucessfull or false if not.
   * 
   * @param hash 
   */
  @Delete('disenrol/:hash')
  async disenrol(@Param('hash') hash: string) {
    return await this.edService.disenroll(hash);
  }

  /**
   * This function encrypts the data given with the keyPair of the defined hash. 
   * Returns:
   * - Encrypted data:  if enrolled member
   * - Same data:       if NOT enrolled member
   * 
   * @param hash 
   * @param text 
   */
  @Get('encrypt/:hash')
  async encrypt(
    @Param('hash') hash: string,
    @Query('text') text: string,
  ): Promise<ResponseCryptoDto> {
    return await this.edService.encrypt(hash, text);
  }

  /**
   * This function decrypts the data given with the keyPair of the defined hash.
   * Returns:
   * - Decrypted data:  if enrolled member
   * - Same data:       if NOT enrolled member
   * 
   * @param hash
   * @param text 
   */
  @Get('decrypt/:hash')
  async decrypt(
    @Param('hash') hash: string,
    @Query('text') text: string,
  ): Promise<ResponseCryptoDto> {
    return await this.edService.decrypt(hash, text);
  }
}