import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncryptDecryptService } from '../../encrypt-decrypt/encrypt-decrypt.service';
import { EncryptDecryptResponseDto } from '../../encrypt-decrypt/model/dto/encrypt-decrypt-response.dto';
import { ResponseCryptoDto } from '../../encrypt-decrypt/model/dto/response-crypto.dto';
import { KeyPair } from '../../encrypt-decrypt/model/entity/keyPair.entity';
import DbModule from './db-test.module';
import { Connection } from 'typeorm';

const addressOwner = "0x21fAE7517204a8379e4Ee9426A861d6bf22c41C7";
const addressReaderGrantedOne = "0xC0f38547Da1211AEec0A5B5dAF62c539D1D1047D";
const addressReaderGrantedTwo = "0x21fAE7517204a8379e4Ee9426A861d6bf22c41C7";
const addressReaderRandom = "0xca1b546A394582B230E98D3Cf0Db682CA3CF36C1";

const requiredMnemonicResponse = {
  error: true,
  text: "Mnemonic required",
  mnemonic: "",
};

const correctMnemonic = {
  error: false,
  mnemonic: "mandate illness photo useless snake bind oval crater dream lady witness street empower hotel august range virus badge panic cart usage stick grace warfare",
  text: "Enrolled successfully",
}

const validMnemonic = {
  error: false,
  mnemonic: "flash fault ignore image lazy bird enhance valley property mango pause fragile",
  text: "Enrolled successfully",
};

const incorrectMnemonic = {
  error: true,
  mnemonic: "lazy bird enhance valley property",
  text: "Invalid mnemonic",
};

const alreadyEnrolled = {
  error: true,
  text: "Already enrolled",
  mnemonic: "",
}

const correctDisenroll = {
  error: false,
  text: "Objects deleted: 1",
}

const correctDisenrollInvented =  {
  error: false,
  text: "Objects deleted: 0",
}

const correctDecryption = {
  text: "DECRYPTIONTXT",
}

const notFoundDecryption = {
  text: "NOT_FOUND",
}

const userHash = 'userhash_123';
const userHashe2e = 'userhash_123e2e';
const userHashe2e_test2 = 'userhash_123e2e_t2';
const userHashe2e_test3 = 'userhash_123e2e_t3';

//const wait = time => new Promise(resolve => setTimeout(() => resolve(time), time));

let moduleTest: TestingModule;
let databaseName: string;

describe('EncryptDecryptService', () => {
  let service: EncryptDecryptService;

  beforeAll(async (done) => {
    databaseName = "dbnameTestingED";//(new Date().getTime() * Math.random()).toString(16);// <-- This is to have a "unique" name for the connection
    moduleTest = await Test.createTestingModule({
      imports: [
        DbModule({
          name: databaseName, 
          useUnifiedTopology: true,
          keepConnectionAlive: true,
          synchronize: true,
        }),
        TypeOrmModule.forFeature([
          KeyPair,
        ]),
      ],
      providers: [
        EncryptDecryptService,
      ],
    }).compile();

    service = moduleTest.get<EncryptDecryptService>(EncryptDecryptService);

    done();
  });

  afterAll( async (done) => {

    let connection = moduleTest.get<Connection>(Connection);
    await connection.close();
    await moduleTest.close();
    global['__MONGOD__'].stop();

    done();
  });

  it('should be defined', (done) => {
    expect(service).toBeDefined();

    done();
  });

  /*

  it('should return a  mnemonic required error', async (done) => {
    let encryptDecryptResponseDto = await service.enroll(userHash, null);
    expect(encryptDecryptResponseDto).toEqual(requiredMnemonicResponse);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  it('should return an invalid error', async (done) => {
    let encryptDecryptResponseDto = await service.enroll(userHash, incorrectMnemonic.mnemonic);
    expect(encryptDecryptResponseDto).toEqual(incorrectMnemonic);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);
    
    done();
  });

  it('should return an already enrolled error', async (done) => {
    let encryptDecryptResponseDto = await service.enroll(userHash, correctMnemonic.mnemonic);
    let encryptDecryptResponseDto2 = await service.enroll(userHash, correctMnemonic.mnemonic);
    expect(encryptDecryptResponseDto2).toEqual(alreadyEnrolled);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  it('should return a desired mnemonic entity', async (done) => {
    let encryptDecryptResponseDto = await service.enroll(userHash+Math.random().toString(16), correctMnemonic.mnemonic);
    expect(encryptDecryptResponseDto).toEqual(correctMnemonic);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  */
  it('should disenroll and return expected message', async (done) => {
    let encryptDecryptResponseDto = await service.disenroll(userHash);
    expect(encryptDecryptResponseDto).toEqual(correctDisenroll);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  
  it('INVENTED should disenroll and return expected message', async (done) => {
    let encryptDecryptResponseDto = await service.disenroll("INVENTED");
    expect(encryptDecryptResponseDto).toEqual(correctDisenrollInvented);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  it('encrypt/decrypt recurent encryption', async (done) => {
    /*
    let mnemonicAux = await service.enroll(userHashe2e, correctMnemonic.mnemonic);
    expect(mnemonicAux).toEqual(correctMnemonic);
    */

    let responseCryptoDtoEncrypt = await service.encrypt(userHashe2e, correctDecryption.text);
    let responseCryptoDtoDecrypt = await service.decrypt(userHashe2e, responseCryptoDtoEncrypt.text)
    expect(responseCryptoDtoDecrypt).toEqual(correctDecryption);
    //expect(responseCryptoDtoEncrypt instanceof ResponseCryptoDto).toBe(true);

    let responseCryptoDtoEncrypt2 = await service.encrypt(userHashe2e, correctDecryption.text);
    let responseCryptoDtoDecrypt2 = await service.decrypt(userHashe2e, responseCryptoDtoEncrypt2.text)
    expect(responseCryptoDtoDecrypt2).toEqual(correctDecryption);
    //expect(responseCryptoDtoEncrypt2 instanceof ResponseCryptoDto).toBe(true);

    let responseCryptoDtoEncrypt3 = await service.encrypt(userHashe2e, correctDecryption.text);
    let responseCryptoDtoDecrypt3 = await service.decrypt(userHashe2e, responseCryptoDtoEncrypt3.text)
    expect(responseCryptoDtoDecrypt3).toEqual(correctDecryption);
    //expect(responseCryptoDtoEncrypt3 instanceof ResponseCryptoDto).toBe(true);

    await service.disenroll(userHashe2e);

    done();
  });

  it('encrypt/decrypt recurent encryption test 2', async (done) => {
    /*
    let mnemonicAux = await service.enroll(userHashe2e_test2, validMnemonic.mnemonic);
    expect(mnemonicAux).toEqual(validMnemonic);
    */

    let responseCryptoDtoEncrypt = await service.encrypt(userHashe2e_test2, correctDecryption.text);
    let responseCryptoDtoDecrypt = await service.decrypt(userHashe2e_test2, responseCryptoDtoEncrypt.text)
    expect(responseCryptoDtoDecrypt).toEqual(correctDecryption);
    //expect(responseCryptoDtoEncrypt instanceof ResponseCryptoDto).toBe(true);

    let responseCryptoDtoEncrypt2 = await service.encrypt(userHashe2e_test2, correctDecryption.text);
    let responseCryptoDtoDecrypt2 = await service.decrypt(userHashe2e_test2, responseCryptoDtoEncrypt2.text)
    expect(responseCryptoDtoDecrypt2).toEqual(correctDecryption);
    //expect(responseCryptoDtoEncrypt2 instanceof ResponseCryptoDto).toBe(true);

    let responseCryptoDtoEncrypt3 = await service.encrypt(userHashe2e_test2, correctDecryption.text);
    let responseCryptoDtoDecrypt3 = await service.decrypt(userHashe2e_test2, responseCryptoDtoEncrypt3.text)
    expect(responseCryptoDtoDecrypt3).toEqual(correctDecryption);
    //expect(responseCryptoDtoEncrypt3 instanceof ResponseCryptoDto).toBe(true);

    await service.disenroll(userHashe2e_test2);

    done();
  });

  // it('encrypt/decrypt recurent encryption test 3', async (done) => {
  //   const mnemonicAux = await service.enroll(userHashe2e_test3, incorrectMnemonic.mnemonic);
  //   expect(mnemonicAux).toEqual(incorrectMnemonic);

  //   const responseCryptoDtoEncrypt = await service.encrypt(userHashe2e_test3, correctDecryption.text);
  //   const responseCryptoDtoDecrypt = await service.decrypt(userHashe2e_test3, responseCryptoDtoEncrypt.text)
  //   expect(responseCryptoDtoDecrypt).toEqual(correctDecryption);
  //   //expect(responseCryptoDtoEncrypt instanceof ResponseCryptoDto).toBe(true);

  //   const responseCryptoDtoEncrypt2 = await service.encrypt(userHashe2e_test3, correctDecryption.text);
  //   const responseCryptoDtoDecrypt2 = await service.decrypt(userHashe2e_test3, responseCryptoDtoEncrypt2.text)
  //   expect(responseCryptoDtoDecrypt2).toEqual(correctDecryption);
  //   //expect(responseCryptoDtoEncrypt2 instanceof ResponseCryptoDto).toBe(true);

  //   const responseCryptoDtoEncrypt3 = await service.encrypt(userHashe2e_test3, correctDecryption.text);
  //   const responseCryptoDtoDecrypt3 = await service.decrypt(userHashe2e_test3, responseCryptoDtoEncrypt3.text)
  //   expect(responseCryptoDtoDecrypt3).toEqual(correctDecryption);
  //   //expect(responseCryptoDtoEncrypt3 instanceof ResponseCryptoDto).toBe(true);

  //   done();
  // });


  it('encrypt/decrypt correct', async (done) => {
    /*
    let mnemonicAux = await service.enroll(userHash, correctMnemonic.mnemonic);
    expect(mnemonicAux).toEqual(correctMnemonic);
    */

    let responseCryptoDtoEncrypt = await service.encrypt(userHash, correctDecryption.text);
    let responseCryptoDtoDecrypt = await service.decrypt(userHash, responseCryptoDtoEncrypt.text);
    expect(responseCryptoDtoDecrypt).toEqual(correctDecryption);
    //expect(responseCryptoDtoDecrypt instanceof ResponseCryptoDto).toBe(true);

    done();
  });

  it('encrypt not found', async (done) => {
    let responseCryptoDto = await service.encrypt(notFoundDecryption.text, notFoundDecryption.text);
    expect(responseCryptoDto).toEqual(notFoundDecryption);
    // expect(responseCryptoDto instanceof ResponseCryptoDto).toBe(true);

    done();
  });

  it('decrypt not found', async (done) => {
    let responseCryptoDto = await service.decrypt(notFoundDecryption.text, notFoundDecryption.text);
    expect(responseCryptoDto).toEqual(notFoundDecryption);
    // expect(responseCryptoDto instanceof ResponseCryptoDto).toBe(true);

    done();
  });  
});