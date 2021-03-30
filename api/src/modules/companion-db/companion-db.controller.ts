import {
  Controller,
  Get,
  Post,
  HttpStatus,
  Body,
  Delete,
  Param,
  Logger,
  Header,
} from '@nestjs/common';

import { CompanionDBService } from './companion-db.service';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
  ApiProduces,
  ApiOkResponse,
} from '@nestjs/swagger';
import { DataDto } from './model/dto/data.dto';
import { User } from '@common/decorators/user.decorator';
import { EncryptDecryptResponseDto } from '../encrypt-decrypt/model/dto/encrypt-decrypt-response.dto';
import { OnlyDataDto } from './model/dto/only-data.dto';
import * as bip39 from 'bip39';
import { KeyPair } from '@modules/encrypt-decrypt/model/entity/keyPair.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'eth-crypto';
import { MongoRepository } from 'typeorm';
import { ResponseDataArrayDto } from './model/dto/response-data-array.dto';
// import * as i18n from 'i18n';

@Controller('companionDB')
export class CompanionDBController {
  private log = new Logger('CompanionDBController', true);

  constructor(
    private readonly companionDBService: CompanionDBService,
    @InjectRepository(KeyPair)
    private readonly keyPairRepository: MongoRepository<KeyPair>,
  ) {}

  /**
   * 
   * @param userId 
   * @param mnemonic 
   */
  @Post('enroll/:hash')
  // @Roles('user')
  // @ApiBearerAuth()
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Successful Enrollement', type: EncryptDecryptResponseDto  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @Header('Content-Type', 'application/json')
  async enroll(
    @User('id') userId: string,
    @Param('hash') ownerHash: string,
    @Body() body: { mnemonic: string }
  ): Promise<EncryptDecryptResponseDto> {

    const responseDto = new EncryptDecryptResponseDto();    
          
    if(!body.mnemonic) {
        responseDto.error = true;
        responseDto.text = "Mnemonic required";
        responseDto.mnemonic = '';
        return responseDto;
        
    } else {
      const keyPair = await this.keyPairRepository.findOne({hash: ownerHash});
      if(!!keyPair) {
          responseDto.error = true;
          responseDto.text = "Already enrolled";
          responseDto.mnemonic = '';
          return responseDto;
      } else {
        if(!bip39.validateMnemonic(body.mnemonic)) {
            responseDto.error = true;
            responseDto.text = "Invalid mnemonic";
            return responseDto;
        } else {
          return this.companionDBService.enroll(ownerHash, body.mnemonic);
        }
      }
    }
  }

  /**
   * 
   * @param userId 
   */
  @Delete('disenroll/:hash')
  // @Roles('user')
  // @ApiBearerAuth()
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Disenrollement', type: EncryptDecryptResponseDto  })
  async disenroll(
    @User('id') userId: string,
    @Param('hash') hash: string,
  ): Promise<EncryptDecryptResponseDto> {
    return this.companionDBService.disenroll(hash);
  }

  /**
   * 
   * @param userId 
   * @param dataId 
   */
  @Get('read/:ownerHash/:dataHash')
  // @Roles('user')
  // @ApiBearerAuth()
  @ApiOkResponse({ type: DataDto })
  async read(
    @Param('ownerHash') ownerHash: string,
    @Param('dataHash') dataHash: string,
  ): Promise<DataDto> {
    return this.companionDBService.read(ownerHash, dataHash);
  }

    /**
   * 
   * @param userId 
   * @param dataId 
   */
  @Get('readAll/:ownerHash')
  // @Roles('user')
  // @ApiBearerAuth()
  @ApiOkResponse({ type: ResponseDataArrayDto })
  async readAll(
    @Param('ownerHash') ownerHash: string
  ): Promise<ResponseDataArrayDto> {
    return this.companionDBService.readAll(ownerHash);
  }

  /**
   * 
   * @param userId 
   * @param data 
   */
  @Post('save/:ownerHash')
  // @Roles('user')
  // @ApiBearerAuth()
  @ApiOkResponse({ type: Object })
  async save(
    @Param('ownerHash') ownerHash: string,
    @Body() data: OnlyDataDto
  ): Promise<string> {
     return this.companionDBService.save(ownerHash, data);
  }
  
  /**
   * 
   * @param userId 
   * @param dataId 
   */
  @Delete('delete/:hash/:dataId')
  // @Roles('user')
  // @ApiBearerAuth()
  async delete(
    @Param('ownerHash') ownerHash: string,
    @Param('dataHash') dataHash: string,
  ): Promise<any> {
    return this.companionDBService.delete(ownerHash, dataHash);
  }

    /**
   * 
   * @param userId 
   * @param dataId 
   */
  @Delete('deleteAll/:hash')
  // @Roles('user')
  // @ApiBearerAuth()
  async deleteAll(
    @Param('ownerHash') ownerHash: string
  ): Promise<any> {
    return this.companionDBService.deleteAll(ownerHash);
  }


  @Post('authorise/:ownerHash/:readerHash')
  // @Roles('user')
  // @ApiBearerAuth()
  async authorise(
    //@User('id') userId: string,
    @Param('ownerHash') ownerHash: string,
    @Param('readerHash') readerHash: string,
  ) {
    return this.companionDBService.authorise(ownerHash, readerHash);
  }

  @Delete('deauthorise/:ownerHash/:readerHash')
  // @Roles('user')
  // @ApiBearerAuth()
  async deauthorise(
    //@User('id') userId: string,
    @Param('ownerHash') ownerHash: string,
    @Param('readerHash') readerHash: string,
  ) {
    return this.companionDBService.deauthorise(ownerHash, readerHash);
  }

  @Post('requestAuthorisation/:dataHash/:readerHash')
  // @Roles('user')
  // @ApiBearerAuth()
  async requestAuthorisation(
    //@User('id') userId: string,
    @Param('dataHash') dataHash: string,
    @Param('readerHash') readerHash: string,
  ) {
    return await this.companionDBService.requestAuthorisation(dataHash, readerHash);
  }

  @Post('approveAuthorisation/:dataHash/:readerHash')
  // @Roles('user')
  // @ApiBearerAuth()
  async approveAuthorisation(
    //@User('id') userId: string,
    @Param('dataHash') dataHash: string,
    @Param('readerHash') readerHash: string,
  ) {
    return this.companionDBService.approveAuthorisation(dataHash, readerHash);
  }

}
