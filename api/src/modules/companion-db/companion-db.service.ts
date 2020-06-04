import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AuthorisedReaders } from './model/entity/authorisedReaders.entity';
import { Data } from './model/entity/data.entity';
import { EncryptDecryptService } from '../encrypt-decrypt/encrypt-decrypt.service';
import { DataDto } from './model/dto/data.dto';
import { DataListDto } from './model/dto/data-list.dto';
import { EncryptDecryptResponseDto } from '../encrypt-decrypt/model/dto/encrypt-decrypt-response.dto';
import { Web3Service } from '../web3/web3.service';

@Injectable()
export class CompanionDBService {
  constructor(
    @InjectRepository(AuthorisedReaders)
    private readonly authReadersRepository: MongoRepository<AuthorisedReaders>,
    @InjectRepository(Data)
    private readonly dataRepository: MongoRepository<Data>,
    private readonly edService: EncryptDecryptService,
    private readonly web3Service: Web3Service,
  ) {}

  /**
   *
   * @param ownerHash
   * @param mnemonic
   */
  async enroll(
    ownerHash: string,
    mnemonic: string,
  ): Promise<EncryptDecryptResponseDto> {
    return this.edService.enroll(ownerHash, mnemonic);
  }

  /**
   *
   * @param ownerHash
   */
  async disenroll(ownerHash: string): Promise<EncryptDecryptResponseDto> {
    // Delete all authorisations of the database for this hash.
    this.deauthoriseAll(ownerHash);

    // Disenrol from the Crypto Module.
    return this.edService.disenroll(ownerHash);
  }

  /**
   *
   * @param ownerHash
   * @param readerHash
   */
  async authorise(ownerHash: string, readerHash: string): Promise<any> {
    this.web3Service._initContext(await this.edService.getMnemonic(ownerHash));

    return await new Promise((resolve, reject) => {
      this.web3Service.authorisationContract.methods
        //.giveAuthorisation(ownerHash, readerHash)
        .giveAuthorisation(readerHash)
        .send(this.web3Service.transactionObject)
        .on('transactionHash', hash => {
          this.web3Service._checkTransaction(hash).then(
            () => {
              //AUTHORISATION GRANTED.
              //console.log("AUTHORISATION GRANTED.");
              resolve({
                hash: ownerHash,
                reader: readerHash,
                authorised: true,
              });
            },
            err => reject(err),
          );
        });
    }).catch(error => {
      console.log('AUTHORISE ERROR', error);
    });
  }

  /**
   *
   * @param ownerHash
   * @param readerHash
   */
  async deauthorise(ownerHash: string, readerHash: string): Promise<any> {
    this.web3Service._initContext(await this.edService.getMnemonic(ownerHash));

    return new Promise((resolve, reject) => {
      this.web3Service.authorisationContract.methods
        //.removeAuthorisation(ownerHash, readerHash)
        .removeAuthorisation(readerHash)
        .send(this.web3Service.transactionObject)
        .on('transactionHash', hash => {
          this.web3Service._checkTransaction(hash).then(
            () => {
              //AUTHORISATION REMOVED.
              //console.log("AUTHORISATION REMOVED.");

              resolve({
                hash: ownerHash,
                reader: readerHash,
                authorised: false,
              });
            },
            err => reject(err),
          );
        });
    }).catch(error => {
      console.log('DEAUTHORISE ERROR', error);
    });
  }

  /**
   *
   * @param ownerHash
   * @param readerHash
   */
  async requestAuthorisation(
    ownerHash: string,
    readerHash: string,
  ): Promise<any> {
    this.web3Service._initContext(await this.edService.getMnemonic(ownerHash));

    return new Promise((resolve, reject) => {
      this.web3Service.authorisationContract.methods
        //.requestAuthorisation(ownerHash, readerHash)
        .requestAuthorisation(ownerHash)
        .send(this.web3Service.transactionObject)
        .on('transactionHash', hash => {
          this.web3Service._checkTransaction(hash).then(
            () => {
              //AUTHORISATION REQUESTED.
              //console.log("AUTHORISATION REQUESTED.");

              resolve({
                hash: ownerHash,
                reader: readerHash,
                authorised: 'requested',
              });
            },
            err => reject(err),
          );
        });
    }).catch(error => {
      console.log('REQUEST AUTHORISATION ERROR', error);
    });
  }

  /**
   *
   * @param ownerHash
   * @param readerHash
   */
  async approveAuthorisation(
    ownerHash: string,
    readerHash: string,
  ): Promise<any> {
    this.web3Service._initContext(await this.edService.getMnemonic(ownerHash));

    return new Promise((resolve, reject) => {
      this.web3Service.authorisationContract.methods
        //.approveAuthorisation(ownerHash, readerHash)
        .approveAuthorisation(readerHash)
        .send(this.web3Service.transactionObject)
        .on('transactionHash', hash => {
          this.web3Service._checkTransaction(hash).then(
            () => {
              //AUTHORISATION REQUESTED => APPROVED.
              //console.log("AUTHORISATION REQUESTED IS APPROVED");

              resolve({
                hash: ownerHash,
                reader: readerHash,
                authorised: true,
              });
            },
            err => reject(err),
          );
        });
    }).catch(error => {
      console.log('APPROVE AUTHORISATION ERROR', error);
    });
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

    if (!this.isJsonString(JSON.stringify(data))) {
      dataToDB.data = 'The data is not a valid JSON.';
    } else {
      //Enrcypt data
      var encryptedData = this.edService.encrypt(ownerHash, data.data);
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
    for (var i = 0, len = dataBulkList.data.length; i < len; i++) {
      await this.save(ownerHash, dataBulkList.data[i]);
    }

    return true;
  }

  /**
   *
   * @param dataHash
   */
  async read(ownerHash: string, dataHash: string): Promise<DataDto> {
    const decryptedData = new DataDto();
    //Search data.
    const rawData = await this.dataRepository.findOne({ dataHash });
    if (rawData == undefined || rawData == null) {
      return null;
    }
    decryptedData.dataHash = rawData.dataHash;

    //Decrypt data.
    decryptedData.data = (await this.edService.decrypt(
      ownerHash,
      rawData.data,
    )).text;

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
    dataList.data = [];
    for (var i = 0, len = dataHashList.length; i < len; i++) {
      dataList.data.push(await this.read(ownerHash, dataHashList[i]));
    }

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
  async delete(ownerHash: string, dataHash: string): Promise<Boolean> {
    this.dataRepository.deleteOne({ dataHash: dataHash });

    return true;
  }

  /**
   *
   * @param dataIdBulk
   */
  async deleteBulk(ownerHash: string, dataIdBulk: string[]): Promise<Boolean> {
    for (var i = 0, len = dataIdBulk.length; i < len; i++) {
      await this.delete(ownerHash, dataIdBulk[i]);
    }

    return true;
  }

  /**
   * PRIVATE
   * @param hash
   */
  async deauthoriseAll(ownerHash: string): Promise<Boolean> {
    //Read all authorizations.
    const authorisations = await this.authReadersRepository.find({
      hash: ownerHash,
    });

    // Delete all authorisations.
    for (var i = 0, len = authorisations.length; i < len; i++) {
      await this.deauthorise(ownerHash, authorisations[i].reader);
    }

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
