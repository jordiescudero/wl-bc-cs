import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AuthorisedReaders } from './model/entity/authorisedReaders.entity';
import { Data } from './model/entity/data.entity';
import { EncryptDecryptService } from '../encrypt-decrypt/encrypt-decrypt.service';
import { DataDto } from './model/dto/data.dto';
import { ResponseDataArrayDto } from './model/dto/response-data-array.dto';
import { EncryptDecryptResponseDto } from '../encrypt-decrypt/model/dto/encrypt-decrypt-response.dto';
import * as Hash from 'crypto';
import { BlockchainMiddlewareService } from '@modules/blockchain-middleware/blockchain-middleware.service';
import { KeyPair } from '@modules/encrypt-decrypt/model/entity/keyPair.entity';
import { OnlyDataDto } from './model/dto/only-data.dto';
import { Web3Service } from '@modules/web3/web3.service';

@Injectable()
export class CompanionDBService {
  constructor(
    @InjectRepository(AuthorisedReaders)
    private readonly authReadersRepository: MongoRepository<AuthorisedReaders>,
    @InjectRepository(Data)
    private readonly dataRepository: MongoRepository<Data>,
    @InjectRepository(KeyPair)
    private readonly keyPairRepository: MongoRepository<KeyPair>,
    private readonly edService: EncryptDecryptService,
    private readonly blockchainMiddlewareService: BlockchainMiddlewareService,
    private readonly web3Service: Web3Service,
  ) { }

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

  /**
   *
   * @param ownerHash
   * @param mnemonic
   */
  async enroll(
    ownerHash: string,
    mnemonic: string,
  ): Promise<EncryptDecryptResponseDto> {


    const sha256 = Hash.createHash('sha256');
    sha256.update(mnemonic);
    const blockchainPassword = sha256.digest('hex');

    const blockchainOwnerKeys = await this.blockchainMiddlewareService.createNewAccount(ownerHash, blockchainPassword);

    if (blockchainOwnerKeys.data && blockchainOwnerKeys.data.severity === 'ERROR') {
      return {
        error: true,
        text: blockchainOwnerKeys.data.detail,
        mnemonic: ''
      }
    } else {
      //FIXME:
      //NOTE: SHould the EncryptDecrypt Service SAVE the blockchain owner keys? 
      //It seems that it does not make any sense.
      return this.edService.enroll(ownerHash, mnemonic, blockchainOwnerKeys.data);
    }

  }

  /**
   *
   * @param ownerHash
   */
  async disenroll(ownerHash: string): Promise<EncryptDecryptResponseDto> {
    // Disenrol from the Crypto Module.
    return await this.edService.disenroll(ownerHash);
  }


  /**
   * Encrypts and saves the data to the database
   * @param data
   */
  async save(ownerHash: string, data: OnlyDataDto): Promise<string> {

    console.log("DATA: ", data);

    const keyPair = await this.keyPairRepository.findOne({ hash: ownerHash });
    if (!keyPair || !this.isJsonString(JSON.stringify(data))) {
      return 'Error - Kepair or data not present';
    }

    
    var dataToDB = new Data();
    dataToDB.ownerHash = ownerHash;
    dataToDB.dataHash = '';

    //Enrcypt data
    var encryptedData = await this.edService.encrypt(ownerHash, data.data);
    dataToDB.data = encryptedData.text;

    const sha256 = Hash.createHash('sha256');
    sha256.update(encryptedData.text);
    dataToDB.dataHash = sha256.digest('hex');

    this.dataRepository.save(dataToDB);


    // FIXME: SAVE TRANSACTION HASH
    const insertNewValueResponse = await this.blockchainMiddlewareService.insertNewValue(keyPair.blockchainOwnerKeys.publicKey, dataToDB.dataHash);
    console.log('insertNewValueResponse', insertNewValueResponse.data);

    return dataToDB.dataHash;
  }

  /**
   *
   * @param dataHash
   */
  async read(ownerHash: string, dataHash: string): Promise<DataDto> {
    let decryptedData: DataDto;

    const keyPair = await this.keyPairRepository.findOne({ hash: ownerHash });
    const rawData = await this.dataRepository.findOne({ ownerHash, dataHash });
    if (!keyPair || !rawData) {
      return null;
    }

    // FIXME: CHECK TRANSACTION HASH
    const blockchainValues = await this.blockchainMiddlewareService.getAllValues();

    if (blockchainValues.data) {
      const blockchainData = blockchainValues.data.filter((data) => {
        return data.value === dataHash;
      });

      console.log('blockchainData', blockchainData);

      if (blockchainData) {
        decryptedData.dataHash = rawData.dataHash
        //FIXME: Has authorisation

        const decrypt = await this.edService.decrypt(ownerHash, rawData.data);
        decryptedData.data = decrypt.text;

        return decryptedData;
      } else {
        return null;
      }

    } else {
      return null;
    }

  }

  /**
 *
 * @param dataHash
 */
  async readAll(ownerHash: string): Promise<ResponseDataArrayDto> {

    const keyPair = await this.keyPairRepository.findOne({ hash: ownerHash });
    const rawDataList = await this.dataRepository.find({ ownerHash });
    if (!keyPair || !rawDataList) {
      return null;
    }

    const responseDataArrayDto = new ResponseDataArrayDto();
    responseDataArrayDto.items = new Array();

    responseDataArrayDto.items = await Promise.all(rawDataList.map(async (rawData) => {
      // FIXME: CHECK TRANSACTION HASH
      const blockchainValues = await this.blockchainMiddlewareService.getAllValues();

      if (blockchainValues.data) {
        const blockchainData = blockchainValues.data.filter((data) => {
          return data.value === rawData.dataHash;
        });

        console.log('blockchainData', blockchainData);

        if (blockchainData) {
          let decryptedData: DataDto;
          const decrypt = await this.edService.decrypt(
            ownerHash,
            rawData.data,
          );

          decryptedData.dataHash = rawData.dataHash
          decryptedData.data = decrypt.text;

          return decryptedData;
        } else {
          return null;
        }
      } else {
        return null;
      }
    }));

    responseDataArrayDto.count = responseDataArrayDto.items.length;
    return responseDataArrayDto;


  }

  /**
   *
   * @param ownerHash
   * @param dataHash
   */
  async delete(ownerHash: string, dataHash: string): Promise<Boolean> {
    this.dataRepository.deleteOne({ ownerHash: ownerHash, dataHash: dataHash });

    return true;
  }

  /**
 *
 * @param ownerHash
 */
  async deleteAll(ownerHash: string): Promise<Boolean> {
    this.dataRepository.delete({ ownerHash: ownerHash });

    return true;
  }

  
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


}
