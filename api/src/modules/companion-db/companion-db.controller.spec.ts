import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanionDBService } from './companion-db.service';
import { DataListDto } from './model/dto/data-list.dto';
import { DataDto } from './model/dto/data.dto';
import { ReaderDto } from './model/dto/reader.dto';
import DbModule from '../db-test/db-test.module';
import { stringify } from 'querystring';
import { ConfigModule } from '@common/config/config.module';
import { Connection } from 'typeorm';
import { getConnection } from 'typeorm';
import { Data } from './model/entity/data.entity';
import { EncryptDecryptService } from '../encrypt-decrypt/encrypt-decrypt.service';
import { KeyPair } from '../encrypt-decrypt/model/entity/keyPair.entity';
import { AuthorisedReaders } from './model/entity/authorisedReaders.entity';

const invalidMnemonic = {
  error: true,
  errorText: "Invalid mnemonic",
  mnemonic: "",
};

const correctMnemonic = {
  mnemonic: "mandate illness photo useless snake bind oval crater dream lady witness street empower hotel august range virus badge panic cart usage stick grace warfare",
};

const alreadyEnrolled = {
  error: true,
  errorText: "Already enrolled",
  mnemonic: "",
}

const userHash = 'userhash_123';

const wait = time => new Promise(resolve => setTimeout(() => resolve(time), time));

let moduleTest: TestingModule;
let databaseName: string;

describe('CompanionDBService', () => {
  let service: CompanionDBService;

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
          Data,
          KeyPair,
          AuthorisedReaders,
        ]),
      ],
      providers: [
        CompanionDBService,
        EncryptDecryptService,
      ],
    }).compile();

    service = moduleTest.get<CompanionDBService>(CompanionDBService);

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

  // it('should return an invalid error', async (done) => {
  //   const encryptDecryptResponseDto = await service.enroll(userHash, '');

  //   expect(encryptDecryptResponseDto).toEqual(invalidMnemonic);
  //   expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);
    
  //   done();
  // });

  // it('should return a random mnemonic entity', async (done) => {
  //   const encryptDecryptResponseDto = await service.enroll(userHash, null);
  //   const regularExpression = expect.stringMatching(/^(?:\s*\S+(?:\s+\S+){0,24})?\s*$/);

  //   expect(encryptDecryptResponseDto.mnemonic).toEqual(
  //     regularExpression,
  //   )

  //   expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

  //   done();
  // });

  // it('should return an already enrolled error', async (done) => {
  //   const encryptDecryptResponseDto = await service.enroll(userHash, correctMnemonic.mnemonic);

  //   expect(encryptDecryptResponseDto).toEqual(alreadyEnrolled);
  //   expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

  //   done();
  // });

  // it('should return an desired mnemonic entity', async (done) => {
  //   const encryptDecryptResponseDto = await service.enroll(userHash+Math.random().toString(16), correctMnemonic.mnemonic);

  //   expect(encryptDecryptResponseDto).toEqual(correctMnemonic);
  //   expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

  //   done();
  // });

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