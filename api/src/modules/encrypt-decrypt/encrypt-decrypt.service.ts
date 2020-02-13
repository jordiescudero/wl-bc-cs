import { Injectable } from '@nestjs/common';
import { KeyPair } from './model/entity/keyPair.entity';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseCryptoDto } from './model/dto/response-crypto.dto';
import * as bip39 from 'bip39';
import EthCrypto from 'eth-crypto';
import { EncryptDecryptResponseDto } from './model/dto/encrypt-decrypt-response.dto';

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
     * @param hash 
     * @param mnemonic 
     */
    async enroll(hash: string, mnemonic: string): Promise<EncryptDecryptResponseDto> {
        //If already enrolled, return
        const keyPair = await this.keyPairRepository.findOne({hash});
        const responseDto = new EncryptDecryptResponseDto();
        if(keyPair!=null) {
            responseDto.error = true;
            responseDto.text = "Already enrolled";
            responseDto.mnemonic = '';
            return responseDto;
        }

        //Check if a mnemonic is sent, if not, create one.
        if(mnemonic == null) {
            mnemonic = bip39.generateMnemonic(256);
        }
        responseDto.mnemonic = mnemonic;
        
        //Check if the menmonic is valid, if not return.
        if(!bip39.validateMnemonic(mnemonic)) {
            responseDto.error = true;
            responseDto.text = "Invalid mnemonic";
            responseDto.mnemonic = '';
            return responseDto;
        }
        
        //Create the key pair. NOTE: The entropy is dobled to fullfill the needs from the EthCrypto specifications.
        const entropy = Buffer.from(bip39.mnemonicToEntropy(mnemonic)+bip39.mnemonicToEntropy(mnemonic)); // must contain at least 128 chars
        const identity = EthCrypto.createIdentity(entropy);
        const privateKey = identity.privateKey;

        //Save the key pair.
        const kp = this.keyPairRepository.create({ hash: hash, privateKey: privateKey });
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
        
        const returnedDto = await this.keyPairRepository.deleteOne({ hash });
        encryptDecryptResponseDto.error = returnedDto.result.ok != 1;
        encryptDecryptResponseDto.text = "Objects deleted: " + returnedDto.result.n;

        return encryptDecryptResponseDto;
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
    async encrypt(hash: string, text: string): Promise<ResponseCryptoDto> {
        // Get the "keypair" for the given hash.
        const keyPair = await this.keyPairRepository.findOne({hash: hash});
        if (keyPair==undefined || keyPair==null || keyPair.hash!=hash) {
            return {text: text};
        }

        // Encrypt the "text" with the "private key"
        const encrypted = await EthCrypto.encryptWithPublicKey(
            EthCrypto.publicKeyByPrivateKey(keyPair.privateKey), // publicKey
            text // message
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
     * @param text 
     */
    async decrypt(hash: string, text: string): Promise<ResponseCryptoDto> {
        // Get the "keypair" for the given hash.
        const keyPair = await this.keyPairRepository.findOne({hash: hash});
        if (keyPair==undefined || keyPair==null || keyPair.hash!=hash) {
            return {text: text};
        }

        //Decrypt the "text" with the "private key"
        const message = await EthCrypto.decryptWithPrivateKey(
            keyPair.privateKey, // privateKey
            EthCrypto.cipher.parse(text) // encrypted-data
        );

        // Return the "text" decrypted.
        return {text: message};
    }

}
