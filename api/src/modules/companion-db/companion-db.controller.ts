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
import { MnemonicDto } from './model/dto/mnemonic.dto';
import { DataListDto } from './model/dto/data-list.dto';
import { User } from '@common/decorators/user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { Data } from './model/entity/data.entity';
// import * as i18n from 'i18n';

@Controller('companionDB')
export class CompanionDBController {
  private log = new Logger('CompanionDBController', true);

  constructor(private readonly companionDBService: CompanionDBService) {}

  //FIXME: When registered, we also have to enroll them automatically to the CryptoModule
  // @Post('enroll')
  // @Roles('user')
  // @ApiBearerAuth()
  // async enroll(
  //   @User('id') userId: string,
  //   @Body() mnemonic: MnemonicDto,
  // ): Promise<any> {
  //   await this.companionDBService.enroll(userId, mnemonic.mnemonic);
  //   //FIXME: Think about what to return.
  //   return;
  // }

  /**
   * 
   * @param userId 
   * @param mnemonic 
   */
  @Post('enrol')
  @Roles('user')
  @ApiBearerAuth()
  async enrol(
    @User('id') userId: string,
    @Body('mnemonic') mnemonic: string
  ): Promise<any> {
    return await this.companionDBService.enroll(userId, mnemonic);
  }

  /**
   * 
   * @param userId 
   */
  @Delete('disenrol')
  @Roles('user')
  @ApiBearerAuth()
  async disenroll(
    @User('id') userId: string,
  ): Promise<any> {
    return await this.companionDBService.disenroll(userId);
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
  @Post('requestAuthorisation/:hash')
  @Roles('user')
  @ApiBearerAuth()
  async requestAuthorisation(
    @User('id') userId: string,
    @Param('hash') hash: string,
    @Body() readerDto: ReaderDto,
  ) {
    return await this.companionDBService.requestAuthorisation(hash, readerDto.authHash,
    );
  }

  /**
   * 
   * @param userId 
   * @param dataId 
   */
  @Get('read/:dataId')
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: DataDto })
  async read(
    @User('id') userId: string,
    @Param('dataId') dataId: string,
  ): Promise<DataDto> {
    return await this.companionDBService.read(dataId);
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
    return await this.companionDBService.readBulk(dataIdList);
  }

  /**
   * 
   * @param userId 
   * @param data 
   */
  @Post('save')
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: Object })
  async save(@User('id') userId: string, @Body() data: Object): Promise<Data> {
    return await this.companionDBService.save(userId, data);
  }

  /**
   * 
   * @param userId 
   * @param dataBulkList 
   */
  @Post('save/bulk')
  @Roles('user')
  @ApiBearerAuth()
  @ApiOkResponse({ type: DataListDto })
  async saveBulk(
    @User('id') userId: string,
    @Body() dataBulkList: DataListDto,
  ): Promise<DataListDto> {
    return await this.companionDBService.saveBulk(dataBulkList);
  }

  /**
   * 
   * @param userId 
   * @param dataId 
   */
  @Delete('delete/:dataId')
  @Roles('user')
  @ApiBearerAuth()
  async delete(
    @User('id') userId: string,
    @Param('dataId') dataId: string,
  ): Promise<any> {
    return await this.companionDBService.delete(dataId);
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
    return await this.companionDBService.deleteBulk(dataIdBulk);
  }
}
