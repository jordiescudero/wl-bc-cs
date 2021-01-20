import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AuthorisedReaders } from './model/entity/authorisedReaders.entity';
import { Data } from './model/entity/data.entity';
import { EncryptDecryptService } from '../encrypt-decrypt/encrypt-decrypt.service';
import { DataDto } from './model/dto/data.dto';
import { DataListDto } from './model/dto/data-list.dto';
import { EncryptDecryptResponseDto } from '../encrypt-decrypt/model/dto/encrypt-decrypt-response.dto';
import * as Hash from 'crypto';
import { BlockchainMiddlewareService } from '@modules/blockchain-middleware/blockchain-middleware.service';
import { KeyPair } from '@modules/encrypt-decrypt/model/entity/keyPair.entity';

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
  ) {}

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

    const blockchainOwnerKeys = await this.blockchainMiddlewareService.createNewAccount(ownerHash, mnemonic);
    return this.edService.enroll(ownerHash, mnemonic, blockchainOwnerKeys);

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
  async save( ownerHash: string, data: DataDto ): Promise<string> {

    console.log( "DATA: ", data);

    const keyPair = await this.keyPairRepository.findOne({hash: ownerHash});
    if (!keyPair || !this.isJsonString(JSON.stringify(data))) {
        return '';
    }        
        
    const sha256 = Hash.createHash('sha256');
    var dataToDB = new Data();
    dataToDB.ownerHash = ownerHash;
    dataToDB.dataHash = '';
      
    //Enrcypt data
    var encryptedData = await this.edService.encrypt(ownerHash, data.data);
    dataToDB.data = encryptedData.text;

    
    sha256.update(encryptedData.text);
    dataToDB.dataHash = sha256.digest('hex');
    
    this.dataRepository.save(dataToDB);
    
    
    const insertNewValueResponse = await this.blockchainMiddlewareService.insertNewValue(keyPair.blockchainOwnerKeys.publicKey, dataToDB.dataHash);
    console.log('insertNewValueResponse', insertNewValueResponse);
    // FIXME: SAVE TRANSACTION HASH

    return dataToDB.dataHash;
  }

  /**
   *
   * @param dataHash
   */
  async read(ownerHash: string, dataHash: string): Promise<DataDto> {
    
    const keyPair = await this.keyPairRepository.findOne({hash: ownerHash});
    const rawData = await this.dataRepository.findOne({ dataHash });
    if (!keyPair || !rawData) {
      return null;
    }
    
    const decrypt = await this.edService.decrypt(
      ownerHash,
      rawData.data,
    );

    const decryptedData = {
      dataHash: rawData.dataHash,
      data: decrypt.text
    };

    // FIXME: CHECK TRANSACTION HASH
    const blockchainValues = this.blockchainMiddlewareService.getAllValues();
    

    console.log("decryptedData: "+ JSON.stringify(decryptedData));

    return decryptedData;
  }
  
  /**
   *
   * @param dataHash
   */
  async delete(ownerHash: string, dataHash: string): Promise<Boolean> {
    this.dataRepository.deleteOne({ dataHash: dataHash });

    return true;
  }

  /*
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
*/
 
}
