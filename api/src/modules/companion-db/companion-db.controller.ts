import {
  Controller,
  Get,
  Render,
  Post,
  HttpStatus,
  Body,
  Req,
  HttpException,
  Res,
  Query,
  Delete,
  Put,
  Param,
  Logger,
  Header,
} from '@nestjs/common';
// import { Request, Response } from 'express';
import { CompanionDBService } from './companion-db.service';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
  ApiProduces,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ReaderDto } from './model/dto/reader.dto';
import { DataDto } from './model/dto/data.dto';
import { DataListDto } from './model/dto/data-list.dto';
import { User } from '@common/decorators/user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { Data } from './model/entity/data.entity';
import { EncryptDecryptResponseDto } from '../encrypt-decrypt/model/dto/encrypt-decrypt-response.dto';
// import * as i18n from 'i18n';

@Controller('companionDB')
export class CompanionDBController {
  private log = new Logger('CompanionDBController', true);

  constructor(private readonly companionDBService: CompanionDBService) {}

  /**
   * 
   * @param userId 
   * @param mnemonic 
   */
  @Post('enrol/:hash')
  @Roles('user')
  @ApiBearerAuth()
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Successful Enrollement', type: EncryptDecryptResponseDto  })
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  @ApiProduces('application/json')
  @Header('Content-Type', 'application/json')
  async enrol(
    @User('id') userId: string,
    @Param('hash') hash: string,
    @Body('mnemonic') mnemonic: string
  ): Promise<EncryptDecryptResponseDto> {
    return await this.companionDBService.enroll(hash, mnemonic);
  }

  /**
   * 
   * @param userId 
   */
  @Delete('disenrol/:hash')
  @Roles('user')
  @ApiBearerAuth()
  @ApiResponse({ status: HttpStatus.OK, description: 'Successful Disenrollement', type: EncryptDecryptResponseDto  })
  async disenroll(
    @User('id') userId: string,
    @Param('hash') hash: string,
  ): Promise<EncryptDecryptResponseDto> {
    return await this.companionDBService.disenroll(hash);
  }

    /**
   * 
   * @param userId 
   * @param hash 
   * @param readerDto 
   */
  @Post('authorise/:hash')
  @Roles('user')
  @ApiBearerAuth()
  async authorise(
    @User('id') userId: string,
    @Param('hash') hash: string,
    @Body() readerDto: ReaderDto,
  ) {
    return await this.companionDBService.authorise(hash, readerDto.authHash);
  }

  /**
   * 
   * @param userId 
   * @param hash 
   * @param readerDto 
   */
  @Delete('deauthorise/:hash')
  @Roles('user')
  @ApiBearerAuth()
  async deauthorise(
    @User('id') userId: string,
    @Param('hash') hash: string,
    @Body() readerDto: ReaderDto,
  ) {
    return await this.companionDBService.deauthorise(hash, readerDto.authHash);
  }

  /**
   * 
   * @param userId 
   * @param hash 
   * @param readerDto 
   */
  @Post('requestAuthorisation/:dataHash')
  @Roles('user')
  @ApiBearerAuth()
  async requestAuthorisation(
    @User('id') userId: string,
    @Param('dataHash') dataHash: string,
    @Body() readerDto: ReaderDto,
  ) {
    return await this.companionDBService.requestAuthorisation(dataHash, readerDto.authHash);
  }

    /**
   * 
   * @param userId 
   * @param hash 
   * @param readerDto 
   */
  @Post('approveAuthorisation/:dataHash')
  @Roles('user')
  @ApiBearerAuth()
  async approveAuthorisation(
    @User('id') userId: string,
    @Param('dataHash') dataHash: string,
    @Body() readerDto: ReaderDto,
  ) {
    return await this.companionDBService.approveAuthorisation(dataHash, readerDto.authHash);
  }

  /**
   * 
   * @param userId 
   * @param dataId 
   */
  @Get('read/:hash/:dataId')
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: DataDto })
  async read(
    @User('id') userId: string,
    @Param('hash') hash: string,
    @Param('dataId') dataId: string,
  ): Promise<DataDto> {
    return await this.companionDBService.read(hash, dataId);
  }

  /**
   * 
   * @param userId 
   * @param dataIdList 
   */
  @Get('read/bulk')
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: DataListDto })
  async readBulk(
    @User('id') userId: string,
    @Query() dataIdList: string[],
  ): Promise<DataListDto> {
    return await this.companionDBService.readBulk(userId, dataIdList);
  }

  /**
   * 
   * @param userId 
   * @param data 
   */
  @Post('save/:hash')
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: Object })
  async save(
    @User('id') userId: string, 
    @Param('hash') hash: string,
    @Body() data: DataDto
  ): Promise<Boolean> {
    return await this.companionDBService.save(hash, data);
  }

  /**
   * 
   * @param userId 
   * @param dataBulk
   */
  @Post('save/bulk')
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: DataListDto })
  async saveBulk(
    @User('id') userId: string,
    @Body() dataBulk: DataListDto,
  ): Promise<Boolean> {
    return await this.companionDBService.saveBulk(userId, dataBulk);
  }

  /**
   * 
   * @param userId 
   * @param dataId 
   */
  @Delete('delete/:hash/:dataId')
  @Roles('user')
  @ApiBearerAuth()
  async delete(
    @User('id') userId: string,
    @Param('hash') hash: string,
    @Param('dataId') dataId: string,
  ): Promise<any> {
    return await this.companionDBService.delete(hash, dataId);
  }

  /**
   * 
   * @param userId 
   * @param dataIdBulk 
   */
  @Delete('delete/bulk')
  @Roles('user')
  @ApiBearerAuth()
  async deleteBulk(
    @User('id') userId: string,
    @Body() dataIdBulk: string[],
  ): Promise<any> {
    return await this.companionDBService.deleteBulk(userId, dataIdBulk);
  }
}
