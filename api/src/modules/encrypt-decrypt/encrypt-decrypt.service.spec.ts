import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncryptDecryptService } from './encrypt-decrypt.service';
import { EncryptDecryptResponseDto } from './model/dto/encrypt-decrypt-response.dto';
import { ResponseCryptoDto } from './model/dto/response-crypto.dto';
import { KeyPair } from './model/entity/keyPair.entity';
import DbModule from '../db-test/db-test.module';
import { stringify } from 'querystring';
import { ConfigModule } from '@common/config/config.module';
import { Connection } from 'typeorm';
import { getConnection } from 'typeorm';

const invalidMnemonic = {
  error: true,
  text: "Invalid mnemonic",
  mnemonic: "",
};

const correctMnemonic = {
  mnemonic: "mandate illness photo useless snake bind oval crater dream lady witness street empower hotel august range virus badge panic cart usage stick grace warfare",
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

const wait = time => new Promise(resolve => setTimeout(() => resolve(time), time));

let moduleTest: TestingModule;
let databaseName: string;

describe('EncryptDecryptService', () => {
  let service: EncryptDecryptService;

  beforeAll(async (done) => {
    databaseName = "dbnameTesting";//(new Date().getTime() * Math.random()).toString(16);// <-- This is to have a "unique" name for the connection
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
    global['__MONGOD__'].drop
    global['__MONGOD__'].stop();

    done();
  });

  it('should be defined', (done) => {
    expect(service).toBeDefined();

    done();
  });

  it('should return an invalid error', async (done) => {
    const encryptDecryptResponseDto = await service.enroll(userHash, '');

    expect(encryptDecryptResponseDto).toEqual(invalidMnemonic);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);
    
    done();
  });

  it('should return a random mnemonic entity', async (done) => {
    const encryptDecryptResponseDto = await service.enroll(userHash, null);
    const regularExpression = expect.stringMatching(/^(?:\s*\S+(?:\s+\S+){0,24})?\s*$/);

    expect(encryptDecryptResponseDto.mnemonic).toEqual(
      regularExpression,
    )

    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  it('should return an already enrolled error', async (done) => {
    const encryptDecryptResponseDto = await service.enroll(userHash, correctMnemonic.mnemonic);

    expect(encryptDecryptResponseDto).toEqual(alreadyEnrolled);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  it('should return a desired mnemonic entity', async (done) => {
    const encryptDecryptResponseDto = await service.enroll(userHash+Math.random().toString(16), correctMnemonic.mnemonic);

    expect(encryptDecryptResponseDto).toEqual(correctMnemonic);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  it('should disenroll and return expected message', async (done) => {
    const encryptDecryptResponseDto = await service.disenroll(userHash);

    expect(encryptDecryptResponseDto).toEqual(correctDisenroll);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  
  it('INVENTED should disenroll and return expected message', async (done) => {
    const encryptDecryptResponseDto = await service.disenroll("INVENTED");

    expect(encryptDecryptResponseDto).toEqual(correctDisenrollInvented);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  it('encrypt/decrypt recurent encryption', async (done) => {
    const mnemonicAux = await service.enroll(userHashe2e, correctMnemonic.mnemonic);
    expect(mnemonicAux).toEqual(correctMnemonic);

    const responseCryptoDtoEncrypt = await service.encrypt(userHashe2e, correctDecryption.text);
    const responseCryptoDtoDecrypt = await service.decrypt(userHashe2e, responseCryptoDtoEncrypt.text)
    expect(responseCryptoDtoDecrypt).toEqual(correctDecryption);
    //expect(responseCryptoDtoEncrypt instanceof ResponseCryptoDto).toBe(true);

    const responseCryptoDtoEncrypt2 = await service.encrypt(userHashe2e, correctDecryption.text);
    const responseCryptoDtoDecrypt2 = await service.decrypt(userHashe2e, responseCryptoDtoEncrypt2.text)
    expect(responseCryptoDtoDecrypt2).toEqual(correctDecryption);
    //expect(responseCryptoDtoEncrypt2 instanceof ResponseCryptoDto).toBe(true);

    const responseCryptoDtoEncrypt3 = await service.encrypt(userHashe2e, correctDecryption.text);
    const responseCryptoDtoDecrypt3 = await service.decrypt(userHashe2e, responseCryptoDtoEncrypt3.text)
    expect(responseCryptoDtoDecrypt3).toEqual(correctDecryption);
    //expect(responseCryptoDtoEncrypt3 instanceof ResponseCryptoDto).toBe(true);

    done();
  });

  it('encrypt/decrypt correct', async (done) => {
    const mnemonicAux = await service.enroll(userHash, correctMnemonic.mnemonic);
    expect(mnemonicAux).toEqual(correctMnemonic);

    const responseCryptoDtoEncrypt = await service.encrypt(userHash, correctDecryption.text);
    //expect(responseCryptoDtoEncrypt instanceof ResponseCryptoDto).toBe(true);

    const responseCryptoDtoDecrypt = await service.decrypt(userHash, responseCryptoDtoEncrypt.text);
    expect(responseCryptoDtoDecrypt).toEqual(correctDecryption);
    //expect(responseCryptoDtoDecrypt instanceof ResponseCryptoDto).toBe(true);

    done();
  });

  it('encrypt not found', async (done) => {
    const responseCryptoDto = await service.encrypt(notFoundDecryption.text, notFoundDecryption.text);

    expect(responseCryptoDto).toEqual(notFoundDecryption);
    // expect(responseCryptoDto instanceof ResponseCryptoDto).toBe(true);

    done();
  });

  it('decrypt not found', async (done) => {
    const responseCryptoDto = await service.decrypt(notFoundDecryption.text, notFoundDecryption.text);

    expect(responseCryptoDto).toEqual(notFoundDecryption);
    // expect(responseCryptoDto instanceof ResponseCryptoDto).toBe(true);

    done();
  });

  // it('should save the user and add the createdAt and savedAt fields', async () => {
  //   const user = service.create(testUser);
  //   await service.save(user);

  //   expect(user.createdAt).toBeTruthy();
  //   expect(user.updatedAt).toBeTruthy();
  // });

  // it('should update the updatedAt field after an update (with the save method of the service)', async () => {
  //   const user = service.create(testUser);
  //   expect(user.updatedAt).not.toBeTruthy();

  //   await service.save(user);
  //   expect(user.updatedAt).toBeTruthy();
  //   expect(user.createdAt.getTime()).toBe(user.updatedAt.getTime());

  //   const actualUpdate = user.updatedAt;
  //   user.email = 'test2@test2.com';
  //   expect(user.updatedAt.getTime()).toBe(actualUpdate.getTime());

  //   await service.save(user);
  //   await wait(20); // <-- this is just to simulate an update after "some time"
  //   expect(user.updatedAt.getTime()).toBeGreaterThan(actualUpdate.getTime());
  // });

});