import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AuthorisedReaders } from './model/entity/authorisedReaders.entity';
import { Data } from './model/entity/data.entity';
import { EncryptDecryptService } from '../encrypt-decrypt/encrypt-decrypt.service';
import { DataDto } from './model/dto/data.dto';
import { DataListDto } from './model/dto/data-list.dto';
import { EncryptDecryptResponseDto } from '../encrypt-decrypt/model/dto/encrypt-decrypt-response.dto';

@Injectable()
export class CompanionDBService {
  constructor(
    @InjectRepository(AuthorisedReaders)
    private readonly authReadersRepository: MongoRepository<AuthorisedReaders>,
    @InjectRepository(Data)
    private readonly dataRepository: MongoRepository<Data>,
    private readonly edService: EncryptDecryptService,
  ) {}

  /**
   * 
   * @param hash 
   * @param mnemonic 
   */
  async enroll(hash: string, mnemonic: string): Promise<EncryptDecryptResponseDto> {
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
    //NOTE: Should we check if the the USER is already AUTHORIZED?
    //At the moment we use it the DB.

    //FIXME: Has to CALL the Blockchain to delete the AUTHORIZATION
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
    ownerHash: string,
    authHash: string,
  ): Promise<Boolean> {

    //FIXME: Has to CALL the Blockchain to delete the AUTHORIZATION
    this.authReadersRepository.deleteOne({ hash: ownerHash, company: authHash });

    return true;
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
   * Encrypts and saves the data to the database
   * @param data 
   */
  async save(
    ownerHash: string, 
    //dataHash: string, 
    //data: Object,
    data: DataDto,
  ): Promise<Boolean> {
    var dataToDB = new Data();
    dataToDB.ownerHash = ownerHash;
    dataToDB.dataHash = data.dataHash;

    const jsonData = JSON.stringify(data);
    if(this.isJsonString(jsonData)){
      dataToDB.data = "The data is not a valid JSON.";
    } else {
      //Enrcypt data
      var encryptedData = this.edService.encrypt(ownerHash, jsonData);
      dataToDB.data = (await encryptedData).text;
      
      //Save data
      this.dataRepository.save(dataToDB);
    }

    return true;
  }

  /**
   * 
   * @param dataBulkList 
   */
  async saveBulk(
    ownerHash: string, 
    dataBulkList: DataListDto,
  ): Promise<Boolean> {
    
    var dataList = new DataListDto();
    dataBulkList.data.forEach(function (value){
      dataList.data.push(this.save(ownerHash, value));
    });

    return true;
  }

  /**
   * 
   * @param dataHash 
   */
  async read(
    ownerHash: string, 
    dataHash: string
  ): Promise<DataDto> {
    const decryptedData = new DataDto();
    //Search data.
    const rawData =  await this.dataRepository.findOne({ dataHash });
    decryptedData.dataHash = rawData.dataHash;
    
    //Decrypt data.
    decryptedData.data = (await this.edService.decrypt(ownerHash, rawData.data)).text;

    return decryptedData;
  }

  /**
   * 
   * @param dataHashList 
   */
  async readBulk(
    ownerHash: string, 
    dataHashList: string[],
  ): Promise<DataListDto> {
    
    var dataList = new DataListDto();
    dataHashList.forEach(function (value){
      dataList.data.push(this.read(ownerHash, value));
    });

    return dataList;
  }

  // https://formidable.com/blog/2019/fast-node-testing-mongodb/
  //   /**
  //  * Find a list of product documents by IDs
  //  * @param {ObjectID[]} ids
  //  */
  // findByIds(ids) {
  //   return this.collection.find({ _id: { $in: ids } }).toArray();
  // }

 
  /**
   * 
   * @param dataHash 
   */
  async delete(
    ownerHash: string,
    dataHash: string,
    ): Promise<Boolean> {

      this.dataRepository.deleteOne({ hash: dataHash });
      
      return true;
  }

  /**
   * 
   * @param dataIdBulk 
   */
  async deleteBulk(
    ownerHash: string,
    dataIdBulk: string[],
  ): Promise<Boolean> {
    
    dataIdBulk.forEach(function (value){
      this.read(ownerHash, value);
    });

    return true;
  }

  /**
   * PRIVATE
   * @param hash 
   */
  async deauthoriseAll(ownerHash: string): Promise<Boolean>{
    //Read all authorizations.
    const authorisations = await this.authReadersRepository.find({ hash: ownerHash });
    
    // Delete all authorisations.
    authorisations.forEach(function (value){
      this.deauthorise(ownerHash, value.reader);
    });
    
    return true;
  }  

  /**
   * PRIVATE
   * @param str 
   */
  isJsonString(str: string) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
}