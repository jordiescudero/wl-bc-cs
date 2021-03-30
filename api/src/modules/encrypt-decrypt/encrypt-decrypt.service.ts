import { Injectable } from '@nestjs/common';
import { KeyPair } from './model/entity/keyPair.entity';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseCryptoDto } from './model/dto/response-crypto.dto';
import * as bip39 from 'bip39';
import EthCrypto, { Encrypted } from 'eth-crypto';
import { EncryptDecryptResponseDto } from './model/dto/encrypt-decrypt-response.dto';
var HDKey = require('hdkey')

@Injectable()
export class EncryptDecryptService {
    constructor(
        @InjectRepository(KeyPair)
        private readonly keyPairRepository: MongoRepository<KeyPair>,
    ) { }

    /**
     * This function creates a keyPair for the defined hash. 
     * It returns true if the creation was successfull and false if not.
     * 
     * @param ownerHash 
     * @param mnemonic 
     */
    async enroll(ownerHash: string, mnemonic: string, blockchainOwnerKeys: object): Promise<EncryptDecryptResponseDto> {
        const responseDto = new EncryptDecryptResponseDto();
        responseDto.error = false;
        responseDto.mnemonic = mnemonic;
        responseDto.text = "Enrolled successfully";
                
        //The mnemonic should always be sent! IT IS MANDATORY!
        if(!mnemonic) {
            responseDto.error = true;
            responseDto.text = "Mnemonic required";
            responseDto.mnemonic = '';
            return responseDto;
            
        }

        //If already enrolled, return
        const keyPair = await this.keyPairRepository.findOne({hash: ownerHash});
        if(!!keyPair) {
            responseDto.error = true;
            responseDto.text = "Already enrolled";
            responseDto.mnemonic = '';
            return responseDto;
        }
        
        //Check if the menmonic is valid, if not return.
        if(!bip39.validateMnemonic(mnemonic)) {
            responseDto.error = true;
            responseDto.text = "Invalid mnemonic";
            return responseDto;
        }
        
        const seed = bip39.mnemonicToSeed(mnemonic);
        const root = HDKey.fromMasterSeed(seed);
        const privateExtendedKey = root.privateExtendedKey;

        //Save the key pair.
        const kp = this.keyPairRepository.create({ 
            hash: ownerHash, 
            mnemonic: mnemonic,
            privateKey: privateExtendedKey,
            blockchainOwnerKeys
        });

        await this.keyPairRepository.save(kp);

        //Return the mnemonic in order to let the user save it.
        return responseDto;
    }

  /**
   * This function deletes a keyPair for the defined hash.
   * It returns true if the operation was sucessfull or false if not.
   * 
   * @param hash 
   */
    async disenroll(hash: string): Promise<EncryptDecryptResponseDto> {
        let encryptDecryptResponseDto = new EncryptDecryptResponseDto();
        
        const response = await this.keyPairRepository.deleteOne({ hash });
        encryptDecryptResponseDto.error = response.result.n != response.deletedCount;
        encryptDecryptResponseDto.text = "Objects deleted: " + response.deletedCount;

        return encryptDecryptResponseDto;
    }

    /**
     * This function encrypts the data given with the keyPair of the defined hash. 
     * Returns:
     * - Encrypted data:  if enrolled member
     * - Same data:       if NOT enrolled member
     * 
     * @param hash 
     * @param data 
     */
    async encrypt(hash: string, data: string): Promise<ResponseCryptoDto> {
        // Get the "keypair" for the given hash.
        const keyPair = await this.keyPairRepository.findOne({hash: hash});
        if (keyPair==undefined || keyPair==null || keyPair.hash!=hash) {
            return { text: data };
        }

        // Encrypt the "text" with the "public key"
        const encrypted: Encrypted = await EthCrypto.encryptWithPublicKey(
                HDKey.fromExtendedKey(keyPair.privateKey).publicKey.toString('hex'),
                data // message
            );
        
        const encryptedString = EthCrypto.cipher.stringify(encrypted);
        
        // Return the "text" encrypted
        return {text: encryptedString};
    }


    /**
     * This function decrypts the data given with the keyPair of the defined hash.
     * Returns:
     * - Decrypted data:  if enrolled member
     * - Same data:       if NOT enrolled member
     * 
     * @param hash 
     * @param data 
     */
    async decrypt(hash: string, data: string): Promise<ResponseCryptoDto> {
        // Get the "keypair" for the given hash.
        const keyPair = await this.keyPairRepository.findOne({hash: hash});
        if (keyPair==undefined || keyPair==null || keyPair.hash!=hash) {
            return { text: data };
        }        
        
        const message = await EthCrypto.decryptWithPrivateKey(
            HDKey.fromExtendedKey(keyPair.privateKey).privateKey.toString('hex'), // privateKey
            EthCrypto.cipher.parse(data) // encrypted-data
        );

        // Return the "text" decrypted.
        return {text: message};
    }

    async getMnemonic(ownerHash: string): Promise<string> {
        const keyPair = await this.keyPairRepository.findOne({hash: ownerHash});
        if (keyPair==undefined || keyPair==null || keyPair.hash!=ownerHash) {
            return null;
        }
        return keyPair.mnemonic;
    }

}
