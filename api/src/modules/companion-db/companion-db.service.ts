import { Injectable, Inject } from '@nestjs/common';
import { MongoRepository } from 'typeorm';
import { AuthorisedReaders } from './model/entity/authorisedReaders.entity';
import { Data } from './model/entity/data.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EncryptDecryptService } from '@modules/encrypt-decrypt/encrypt-decrypt.service';
import { UsersService } from '@modules/auth/user.service';
import { DataDto } from './model/dto/data.dto';
import { DataListDto } from './model/dto/data-list.dto';

@Injectable()
export class CompanionDBService {
  constructor(
    @InjectRepository(AuthorisedReaders)
    private readonly authReadersRepository: MongoRepository<AuthorisedReaders>,
    @InjectRepository(Data)
    private readonly dataRepository: MongoRepository<Data>,
    private readonly edService: EncryptDecryptService,
    private readonly userService: UsersService,
  ) {}

  /**
   * 
   * @param hash 
   * @param mnemonic 
   */
  async enroll(hash: string, mnemonic: string): Promise<any> {
    return this.edService.enroll(hash, mnemonic);
  }

  /**
   * 
   * @param hash 
   */
  async disenroll(hash: string): Promise<any> {
    // Delete all authorisations of the database for this hash.
    this.deauthoriseAll(hash);

    // Disenrol from the Crypto Module.
    return this.edService.disenroll(hash);
  }

  /**
   * 
   * @param hash
   * @param authHash
   */
  async authorise(hash: string, authHash: string): Promise<AuthorisedReaders> {
    var authReader = await this.authReadersRepository.findOne({
      hash,
      reader: authHash,
    });

    //Check if the reader has been authorised, if not, authorise.
    if (authReader == null) {
      // Create an authorization.
      authReader = this.authReadersRepository.create({
        hash,
        reader: authHash,
      });

      // Save the authorization.
      this.authReadersRepository.save(authReader);
    }

    return authReader;
  }

  /**
   * 
   * @param hash
   * @param authHash
   */
  async deauthorise(
    hash: string,
    authHash: string,
  ): Promise<AuthorisedReaders> {
    //Get the authorisation.
    var authReader = await this.authReadersRepository.findOne({
      hash,
      reader: authHash,
    });

    // Delete one authorization.
    this.authReadersRepository.deleteOne({ hash, company: authHash });

    return authReader;
  }
  
  /**
   * 
   * @param userId 
   * @param authHash 
   */
  async requestAuthorisation(userId: string, authHash: string) {
    //TODO: Create a push to the person that owns the data.
    //FIXME: HOW TO DO A PUSH? CAN AN EMAIL BE SENT?
  }
  
  /**
   * 
   * @param dataId 
   */
  read(dataId: string): Promise<DataDto> {
    // return this.dataRepository.findOne({ dataId });
    return;
  }

  /**
   * 
   * @param dataIdList 
   */
  readBulk(
    dataIdList: string[],
  ): Promise<any> {
    // return this.dataRepository.find({ dataIdList });
    return;
  }

  /**
   * 
   * @param data 
   */
  async save(
    hash: string, 
    data: Object,
  ): Promise<Data> {
    //Enrcypt data
    var encryptedData = this.edService.encrypt(hash, JSON.stringify(data));

    var dataToDB = new Data();
    dataToDB.data = (await encryptedData).text;
    dataToDB.hashData = "123";
    dataToDB.hashOwner = hash;
    //Save data
    this.dataRepository.save(dataToDB);

    return dataToDB;
  }

  /**
   * 
   * @param dataBulkList 
   */
  saveBulk(
    dataBulkList: DataListDto,
  ): Promise<DataListDto> {
    // return this.dataRepository.save({ dataBulkList });
    return;
  }

  /**
   * 
   * @param dataId 
   */
  delete(dataId: string): Promise<any> {
    return this.dataRepository.deleteOne({ dataId });
  }

  /**
   * 
   * @param dataIdBulk 
   */
  deleteBulk(dataIdBulk: string[]): Promise<any> {
    return this.dataRepository.deleteMany({ dataIdBulk });

  }

  /**
   * PRIVATE
   * @param hash 
   */
  async deauthoriseAll(hash: string) {
    // Delete all authorisations.
    return this.authReadersRepository.deleteMany({ hash });
  }  
}