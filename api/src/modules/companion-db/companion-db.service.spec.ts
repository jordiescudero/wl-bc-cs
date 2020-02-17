import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import DbModule from '../db-test/db-test.module';
import { CompanionDBService } from './companion-db.service';
import { EncryptDecryptService } from '../encrypt-decrypt/encrypt-decrypt.service';
import { Data } from './model/entity/data.entity';
import { DataListDto } from './model/dto/data-list.dto';
import { DataDto } from './model/dto/data.dto';
import { AuthorisedReaders } from './model/entity/authorisedReaders.entity';
import { EncryptDecryptResponseDto } from '../encrypt-decrypt/model/dto/encrypt-decrypt-response.dto';
import { KeyPair } from '../encrypt-decrypt/model/entity/keyPair.entity';

//ENCRYPT DECRYPT RESPONSE DTO
const edResponse_ErrorInvalidMnemonic = {
  error: true,
  text: "Invalid mnemonic",
  mnemonic: "",
};

const edResponse_CorrectMnemonic = {
  mnemonic: "mandate illness photo useless snake bind oval crater dream lady witness street empower hotel august range virus badge panic cart usage stick grace warfare",
};

const edResponse_ErrorAlreadyEnrolled = {
  error: true,
  text: "Already enrolled",
  mnemonic: "",
}

const edResponse_CorrectDisenroll_Single = {
  error: false,
  text: "Objects deleted: 1",
}

const edResponse_CorrectDisenrollInvented =  {
  error: false,
  text: "Objects deleted: 0",
}

// const edResponse_CorrectDecryption = {
//   text: "DECRYPTIONTXT",
// }

// const edResponse_notFoundDecryption = {
//   text: "NOT_FOUND",
// }

//AUTHORISED_READERS
const authorisedReaders_Test_One = {
  hash: "userHash_4517823rfjn1o3inj08fdh14dfhj234809fdje08dfj",
  id: expect.anything(),
  reader: "authorisedHash_123874bgf8734f78974hb89hf398h498fh34f349f8hj",
}

const authorisedReaders_Test_Two = {
  hash: "userhash_123904ujrf908c34h1fh498fhd3489fhd3f84h93e2e",
  id: expect.anything(),
  reader: "authorisedHash_123498rhnf39h898hf9834hjklskl",
}

//DATA_DTO
const dataDto_Test_One = {
  data: "Data to Be Stored for TEST ONE",
  dataHash: "dataHash_4893fh4398fbuifdakjsfh948fh34iofn34jklr4n389rf3n4fo4"
}

const dataDto_Test_Two = {
  data: "Data to Be Stored for TEST TWO",
  dataHash: "dataHash_189dbn9fdcfmsdmf89hcjd0fc8m40fc0psdcfs8f4m3f89mdfsd0"
}

const dataDto_Test_Three = {
  data: "Data to Be Stored for TEST THREE",
  dataHash: "dataHash_894hf439fb9fh98fhawf89hw4fabsnfjkdashbf89h349f8hewjk"
}

const dataDto_Test_NO_SAVED = {
  data: "Data to Be Stored for NO_SAVED",
  dataHash: "dataHash_348fnhjoiufdhfoashdfoasdjflsdakfsdfashlsfdnn_noSaved"
}

//const wait = time => new Promise(resolve => setTimeout(() => resolve(time), time));

let moduleTest: TestingModule;
let databaseName: string;

describe('CompanionDBService Testing Set', () => {
  let service: CompanionDBService;

  beforeAll(async (done) => {
    //Creating the connection to a "in-memory" database to perform all the testing.
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
    // Closing all connections and modules.
    let connection = moduleTest.get<Connection>(Connection);
    await connection.close();
    await moduleTest.close();
    global['__MONGOD__'].stop();
    
    done();
  });

  it('The service should be defined.', (done) => {
    expect(service).toBeDefined();

    done();
  });

  it('The ENROLL function should return an invalid error.', async (done) => {
    const encryptDecryptResponseDto = await service.enroll(authorisedReaders_Test_One.hash, '');

    expect(encryptDecryptResponseDto).toEqual(edResponse_ErrorInvalidMnemonic);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);
    
    done();
  });

  it('The ENROLL function should return a random mnemonic entity.', async (done) => {
    const encryptDecryptResponseDto = await service.enroll(authorisedReaders_Test_One.hash, null);
    const regularExpression = expect.stringMatching(/^(?:\s*\S+(?:\s+\S+){0,24})?\s*$/);

    expect(encryptDecryptResponseDto.mnemonic).toEqual(
      regularExpression,
    )

    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  it('The ENROLL function should return an "Already enrolled" error.', async (done) => {
    const encryptDecryptResponseDto = await service.enroll(authorisedReaders_Test_One.hash, edResponse_CorrectMnemonic.mnemonic);

    expect(encryptDecryptResponseDto).toEqual(edResponse_ErrorAlreadyEnrolled);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  it('The ENROLL function should create and return a desired mnemonic entity.', async (done) => {
    const encryptDecryptResponseDto = await service.enroll(authorisedReaders_Test_One.hash+Math.random().toString(16), edResponse_CorrectMnemonic.mnemonic);

    expect(encryptDecryptResponseDto).toEqual(edResponse_CorrectMnemonic);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  it('The DISENROLL function should disenroll/delete user key pair and return expected message.', async (done) => {
    const encryptDecryptResponseDto = await service.disenroll(authorisedReaders_Test_One.hash);

    expect(encryptDecryptResponseDto).toEqual(edResponse_CorrectDisenroll_Single);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  
  it('The DISENROLL function should disenroll and return expected message on a non existing user.', async (done) => {
    const encryptDecryptResponseDto = await service.disenroll("INVENTED");

    expect(encryptDecryptResponseDto).toEqual(edResponse_CorrectDisenrollInvented);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  it('The AUTHORISE function should authorise the provided hash.', async (done) => {
    const authorisedReaders = await service.authorise(authorisedReaders_Test_One.hash, authorisedReaders_Test_One.reader);

    expect(authorisedReaders).toEqual(authorisedReaders_Test_One);
    expect(authorisedReaders instanceof AuthorisedReaders).toBe(true);

    done();
  });

  it('The AUTHORISE function should return the user already authorised.', async (done) => {
    const authorisedReaders = await service.authorise(authorisedReaders_Test_Two.hash, authorisedReaders_Test_Two.reader);

    expect(authorisedReaders instanceof AuthorisedReaders).toBe(true);

    const authorisedReaders2 = await service.authorise(authorisedReaders_Test_Two.hash, authorisedReaders_Test_Two.reader);

    expect(authorisedReaders2).toEqual(authorisedReaders_Test_Two);
    expect(authorisedReaders2 instanceof AuthorisedReaders).toBe(true);

    done();
  });

  it('The DEAUTHORISE function should return true and delete/deauthorise the existing authorisation.', async (done) => {
    const deauthorised = await service.deauthorise(authorisedReaders_Test_One.hash, authorisedReaders_Test_One.reader);

    expect(deauthorised).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('The DEAUTHORISE function should return true for a non-existing/not found authorised hash.', async (done) => {
    //NOTE: DEAUTHORISED in the last test.
    const deauthorised = await service.deauthorise(authorisedReaders_Test_One.hash, authorisedReaders_Test_One.reader);

    expect(deauthorised).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('The DEAUTHORISEALL function should return true and delete/deauthorise all authorised hashes.', async (done) => {

    await service.authorise(authorisedReaders_Test_One.hash, authorisedReaders_Test_One.reader);
    await service.authorise(authorisedReaders_Test_One.hash, authorisedReaders_Test_One.reader+1);
    await service.authorise(authorisedReaders_Test_One.hash, authorisedReaders_Test_One.reader+2);
    await service.authorise(authorisedReaders_Test_One.hash, authorisedReaders_Test_One.reader+3);
    await service.authorise(authorisedReaders_Test_One.hash, authorisedReaders_Test_One.reader+4);
    await service.authorise(authorisedReaders_Test_One.hash, authorisedReaders_Test_One.reader+5);
    await service.authorise(authorisedReaders_Test_One.hash, authorisedReaders_Test_One.reader+6);

    const deauthorised = await service.deauthoriseAll(authorisedReaders_Test_One.hash);

    expect(deauthorised).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    //FIXME: Validate that all the authorised hashes have been deleted.

    done();
  });

  it('The REQUESTAUHTORISATION function should return true and send an email? (In progress)', async (done) => {
    //NOT IMPLEMENTED
    const deauthorised = await service.requestAuthorisation(authorisedReaders_Test_One.hash, authorisedReaders_Test_One.reader);

    //expect(deauthorised).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('The SAVE function should save the data expected and return true.', async (done) => {

    const saved = await service.save(authorisedReaders_Test_One.hash, dataDto_Test_One);

    expect(saved).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    //FIXME: Ve should validate that the data is saved correctly.

    done();
  });

  it('The SAVEBULK function returns true and saves all data provided.', async (done) => {

    const dataListDto = new DataListDto();
    dataListDto.data = [];//new Array<DataDto>();
    dataListDto.data.push(dataDto_Test_Two, dataDto_Test_Three);

    const saved = await service.saveBulk(authorisedReaders_Test_One.hash, dataListDto);
    expect(saved).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    //FIXME: We should verify that all the data has been saved.

    done();
  });

  it('The READ function returns the data requested.', async (done) => {

    //The "dataDto_Test_One" has been saved before.
    const readed = await service.read(authorisedReaders_Test_One.hash, dataDto_Test_One.dataHash);

    expect(readed).toEqual(dataDto_Test_One);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('The READ function returns NULL if data does not exists.', async (done) => {

    const readed = await service.read(authorisedReaders_Test_One.hash, dataDto_Test_NO_SAVED.dataHash);

    expect(readed).toEqual(null);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  //FIXME: Should be tested the READBULK with non existing hashes?

  it('The READBULK function returns all data requested.', async (done) => {

    //NOTE: Saved in a test before.
    const dataListDto = new DataListDto();
    dataListDto.data = [];//new Array<DataDto>();
    dataListDto.data.push(dataDto_Test_Two, dataDto_Test_Three);

    const saved = await service.readBulk(authorisedReaders_Test_One.hash, [dataDto_Test_Two.dataHash, dataDto_Test_Three.dataHash]);
    expect(saved).toEqual(dataListDto);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('The DELETE function returns true and deletes the data requested.', async (done) => {

    const deleted = await service.delete(authorisedReaders_Test_One.hash, dataDto_Test_One.dataHash);

    expect(deleted).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    //CHECK IT DOS NOT EXISTS.
    const readed = await service.read(authorisedReaders_Test_One.hash, dataDto_Test_One.dataHash);

    expect(readed).toEqual(null);

    done();
  });

  it('The DELETEBULK function returns true and deletes all data requested.', async (done) => {

    //NOTE: Saved in a test before.
    const dataListDto = new DataListDto();
    dataListDto.data = [];//new Array<DataDto>();
    dataListDto.data.push(dataDto_Test_Two, dataDto_Test_Three);

    const deleted = await service.deleteBulk(authorisedReaders_Test_One.hash, [dataDto_Test_Two.dataHash, dataDto_Test_Three.dataHash]);
    expect(deleted).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    //NOTE: Can we perform a READ BULK?
    //CHECK IT DOS NOT EXISTS.
    const readed1 = await service.read(authorisedReaders_Test_One.hash, dataDto_Test_Two.dataHash);

    expect(readed1).toEqual(null);

    //CHECK IT DOS NOT EXISTS.
    const readed2 = await service.read(authorisedReaders_Test_One.hash, dataDto_Test_Three.dataHash);

    expect(readed2).toEqual(null);

    done();
  });

});