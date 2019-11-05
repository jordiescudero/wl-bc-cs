import { Injectable } from '@nestjs/common';
import { KeyPair } from './model/entity/keyPair.entity';
import { AuthorizedCompanies } from './model/entity/authorizedCompanies.entity';
import * as crypto from 'crypto';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseCryptoDto } from './model/dto/response-crypto.dto';

@Injectable()
export class EncryptDecryptService {
    private readonly passphrase = 'top secret';

    constructor(
        @InjectRepository(KeyPair)
        private readonly keyPairRepository: MongoRepository<KeyPair>,
        @InjectRepository(AuthorizedCompanies)
        private readonly authCompanyRepository: MongoRepository<AuthorizedCompanies>,
    ) { }

    async enroll(hash: string) {
        // Create keyPair and push to the database.
        crypto.generateKeyPair('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                cipher: 'aes-256-cbc',
                passphrase: '', // FIXME: It works without passphrase. Should we add one?
            },
        }, (err, publicKey, privateKey) => {
            if (!err) {
                // Handle errors and use the generated key pair.
                const kp = this.keyPairRepository.create({ hash, privateKey, publicKey });
                this.keyPairRepository.save(kp);
            } else {
                throw err;
            }
        });

    }

    async disenroll(hash: string) {
        // Delete all authorisations of the database for this hash.
        this.deauthorizeAll(hash);

        // Delete the keyPair of the database.
        this.keyPairRepository.deleteOne({hash});
    }

    async authorize(hash: string, authHash: string) {
        // Check if the hash has an enrollement and check if the authorization already exists.
        // if (this.authCompanyRepository.findOne({ hash, company: authHash })) {
        //     return;
        // }

        // Create an authorization.
        // FIXME: Does not takes company into account.
        const authCompany = this.authCompanyRepository.create({ hash, company: authHash });

        // Save the authorization.
        this.authCompanyRepository.save(authCompany);

    }

    async deauthorize(hash: string, authHash: string) {
        // Delete one authorization.
        this.authCompanyRepository.deleteOne({hash, company: authHash});

    }

    async deauthorizeAll(hash: string) {
        // Delete all authorization.
        this.authCompanyRepository.deleteMany({hash});

    }

    async encrypt(hash: string, text: string): Promise<ResponseCryptoDto> {
        // Get the "keypair" for the given hash.
        const keyPair = await this.keyPairRepository.findOne({hash});
        if (!keyPair) {
            return {text};
        }

        // Encrypt the "text" with the "private key"
        // const keyObject = crypto.createPrivateKey({key: keyPair.privateKey, passphrase: this.passphrase});
        const encryptedText = crypto.privateEncrypt(keyPair.privateKey, Buffer.from(text));

        // Return the "text" encrypted
        return {text: encryptedText.toString('hex')};
    }

    async decrypt(hash: string, authHash: string, text: string): Promise<ResponseCryptoDto> {
        let authorization = false;
        // Check if the "hash" is from a "user" or an "authorized".
        // Get the "keypair" for the "user"
        const keyPair = await this.keyPairRepository.findOne({hash});
        // if (keyPair || this.authCompanyRepository.findOne({hash, company: authHash})) {
        //     authorization = true;
        // }

        // // IF NOT authoriezed, return "text" as is.
        // if (!authorization) {
        //     return {text};
        // }

        // Decrypt the "text" with the "public key"
        const decryptedText = crypto.publicDecrypt(keyPair.publicKey, Buffer.from(text, 'hex'));

        // Return the "text" decrypted.
        return {text: decryptedText.toString()};
    }

}
