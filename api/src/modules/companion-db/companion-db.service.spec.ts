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
import { EncryptDecryptResponseDto } from '../encrypt-decrypt/model/dto/encrypt-decrypt-response.dto';
import { hash } from 'eth-crypto';

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
const authorisedHash = 'authorisedHash_123';
const authorisedHashNoExisting = 'authorisedHash_123_noExisiting';

const authorisedReadersExpected = {
  hash: "userhash_123",
  reader: "authorisedHash_123",
}

const authorisedReadersExpectedAlreadyAuthorised = {
  hash: "userhash_123",
  id: expect.anything(),
  reader: "authorisedHash_123",
}

//const wait = time => new Promise(resolve => setTimeout(() => resolve(time), time));

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

  it('Authorise', async (done) => {
    const authorisedReaders = await service.authorise(userHash, authorisedHash);

    expect(authorisedReaders).toEqual(authorisedReadersExpected);
    expect(authorisedReaders instanceof AuthorisedReaders).toBe(true);

    done();
  });

  it('Authorise already authorised', async (done) => {
    const authorisedReaders = await service.authorise(userHash, authorisedHash);

    expect(authorisedReaders).toEqual(authorisedReadersExpectedAlreadyAuthorised);
    expect(authorisedReaders instanceof AuthorisedReaders).toBe(true);

    done();
  });

  it('Deauthorise existing', async (done) => {
    const deauthorised = await service.deauthorise(userHash, authorisedHash);

    expect(deauthorised).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('Deauthorise non-existing', async (done) => {
    const deauthorised = await service.deauthorise(userHash, authorisedHashNoExisting);

    expect(deauthorised).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('Deauthorise ALL', async (done) => {

    await service.authorise(userHash, authorisedHash);
    await service.authorise(userHash, authorisedHash+1);
    await service.authorise(userHash, authorisedHash+2);
    await service.authorise(userHash, authorisedHash+3);
    await service.authorise(userHash, authorisedHash+4);
    await service.authorise(userHash, authorisedHash+5);
    await service.authorise(userHash, authorisedHash+6);

    const deauthorised = await service.deauthoriseAll(userHash);

    expect(deauthorised).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('request authorisation', async (done) => {
    //NOT IMPLEMENTED
    const deauthorised = await service.requestAuthorisation(userHash, authorisedHashNoExisting);

    //expect(deauthorised).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('Save Data JSON', async (done) => {

    const dataDto = new DataDto();
    dataDto.data = "Data to Be Stored";
    dataDto.dataHash = "dataHash_SaveDataJSON";
    const saved = await service.save(userHash, dataDto);

    expect(saved).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('Save bulk Data', async (done) => {

    const dataListDto = new DataListDto();

    const dataDto = new DataDto();
    dataDto.data = "DATA 1 of the BULK";
    dataDto.dataHash = "dataHash_SaveDataBULK_JSON_1";
    
    const dataDto2 = new DataDto();
    dataDto2.data = "DATA 2 of the BULK";
    dataDto2.dataHash = "dataHash_SaveDataBULK_JSON_2";

    dataListDto.data = [];//new Array<DataDto>();
    dataListDto.data.push(dataDto,dataDto2);

    const saved = await service.saveBulk(userHash, dataListDto);
    expect(saved).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('Read data', async (done) => {

    const dataDto = new DataDto();
    dataDto.data = "Data to Be Stored";
    dataDto.dataHash = "dataHash_SaveDataJSON";
    const readed = await service.read(userHash, dataDto.dataHash);

    expect(readed).toEqual(dataDto);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('Read data NOT EXISTING', async (done) => {

    const dataDto = new DataDto();
    dataDto.data = "Data to Be Stored";
    dataDto.dataHash = "dataHash_SaveDataJSON_NOEXISITING";
    const readed = await service.read(userHash, dataDto.dataHash);

    expect(readed).toEqual(null);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('Read bulk data', async (done) => {

    const dataListDto = new DataListDto();

    const dataDto = new DataDto();
    dataDto.data = "DATA 1 of the BULK";
    dataDto.dataHash = "dataHash_SaveDataBULK_JSON_1";
    
    const dataDto2 = new DataDto();
    dataDto2.data = "DATA 2 of the BULK";
    dataDto2.dataHash = "dataHash_SaveDataBULK_JSON_2";

    dataListDto.data = [];//new Array<DataDto>();
    dataListDto.data.push(dataDto,dataDto2);

    const saved = await service.readBulk(userHash, [dataDto.dataHash, dataDto2.dataHash]);
    expect(saved).toEqual(dataListDto);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('Delete data', async (done) => {

    const dataDto = new DataDto();
    dataDto.data = "Data to Be Stored";
    dataDto.dataHash = "dataHash_SaveDataJSON";
    const deleted = await service.delete(userHash, dataDto.dataHash);

    expect(deleted).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    //CHECK IT DOS NOT EXISTS.
    const readed = await service.read(userHash, dataDto.dataHash);

    expect(readed).toEqual(null);

    done();
  });

  it('DELETE bulk data', async (done) => {

    const dataListDto = new DataListDto();

    const dataDto = new DataDto();
    dataDto.data = "DATA 1 of the BULK";
    dataDto.dataHash = "dataHash_SaveDataBULK_JSON_1";
    
    const dataDto2 = new DataDto();
    dataDto2.data = "DATA 2 of the BULK";
    dataDto2.dataHash = "dataHash_SaveDataBULK_JSON_2";

    dataListDto.data = [];//new Array<DataDto>();
    dataListDto.data.push(dataDto,dataDto2);

    const deleted = await service.deleteBulk(userHash, [dataDto.dataHash, dataDto2.dataHash]);
    expect(deleted).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    //CHECK IT DOS NOT EXISTS.
    const readed1 = await service.read(userHash, dataDto.dataHash);

    expect(readed1).toEqual(null);

    //CHECK IT DOS NOT EXISTS.
    const readed2 = await service.read(userHash, dataDto2.dataHash);

    expect(readed2).toEqual(null);

    done();
  });

});