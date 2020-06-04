import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import DbModule from './db-test.module';
import { CompanionDBService } from '../companion-db/companion-db.service';
import { ConfigService } from '../../common/config/config.service';
import { EncryptDecryptService } from '../encrypt-decrypt/encrypt-decrypt.service';
import { Data } from '../companion-db/model/entity/data.entity';
import { DataListDto } from '../companion-db/model/dto/data-list.dto';
import { AuthorisedReaders } from '../companion-db/model/entity/authorisedReaders.entity';
import { EncryptDecryptResponseDto } from '../encrypt-decrypt/model/dto/encrypt-decrypt-response.dto';
import { KeyPair } from '../encrypt-decrypt/model/entity/keyPair.entity';
import { Web3Service } from '@modules/web3/web3.service';


const addressOwner = "0x21fAE7517204a8379e4Ee9426A861d6bf22c41C7";
const addressReaderGrantedOne = "0xC0f38547Da1211AEec0A5B5dAF62c539D1D1047D";
const addressReaderGrantedTwo = "0x21fAE7517204a8379e4Ee9426A861d6bf22c41C7";
const addressReaderRandom1 = "0xca1b546A394582B230E98D3Cf0Db682CA3CF36C1";
const addressReaderRandom2 = "0xBaC35463D1e81A844c0E381979A0AEB9776275f4";
const addressReaderRandom3 = "0xBAd8C0DAF4194aA214669A9834f75AB034D4F81C";
const addressReaderRandom4 = "0xe505283358A332F2D89A799e838fba09bdf179f7";
const addressReaderRandom5 = "0xA42c0d339E1A4a60A6444c52a2194FFb0ebF326d";
const addressReaderRandom6 = "0x1033f856479a93a589fC4D79359F9Ee0955Db976";
const addressReaderRandom7 = "0xCe3620C014D655C0381ED77e217ca5c06bC101E8";

//ENCRYPT DECRYPT RESPONSE DTO
const IO_ENROLL_ErrorInvalidMnemonic = {
  error: true,
  text: "Invalid mnemonic",
  mnemonic: "mandate",
};

const O_ENROLL_ErrorRequiredMnemonic = {
  error: true,
  text: "Mnemonic required",
  mnemonic: "",
};

const O_ENROLL_ErrorAlreadyEnrolled = {
  error: true,
  text: "Already enrolled",
  mnemonic: "",
}

const I_ENROLL_CorrectMnemonic_hash = addressReaderRandom1;

const I_ENROLL_CorrectMnemonic = {
  mnemonic: "mandate illness photo useless snake bind oval crater dream lady witness street empower hotel august range virus badge panic cart usage stick grace warfare",
};

const I_ENROLL_CorrectMnemonic_hash2 = addressReaderRandom2;

const IO_ENROLL_CorrectMnemonic2 = {
  error: false,
  mnemonic: "power sun casino tongue coach into cheap boss because concert coin unlock",
  text: "Enrolled successfully",
};

const edResponse_CorrectDisenroll_Single = {
  error: false,
  text: "Objects deleted: 1",
}

const edResponse_CorrectDisenrollInvented =  {
  error: false,
  text: "Objects deleted: 0",
}


//AUTHORISED_READERS
const authorisedReaders_Test_One = {
  hash: addressOwner,
  authorised: true,
  reader: addressReaderGrantedOne,
}

const authorisedReaders_Test_Two = {
  hash: addressOwner,
  authorised: true,
  reader: addressReaderGrantedTwo,
}
const deauthrorisedReaders_test_one = {
  authorised: false, 
  hash: addressOwner, 
  reader: addressReaderGrantedOne,
}

const authDto_requested = {
  authorised: "requested", 
  hash: addressOwner, 
  reader: addressReaderGrantedOne
} 

const authDto_approved = {
  authorised: true, 
  hash: addressOwner, 
  reader: addressReaderGrantedOne
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

let moduleTest: TestingModule;
let databaseName: string;

describe('CompanionDBService Testing Set', () => {
  let service: CompanionDBService;

  beforeAll(async (done) => {
    //Creating the connection to a "in-memory" database to perform all the testing.
    databaseName = "dbnameTestingCCDB";//(new Date().getTime() * Math.random()).toString(16);// <-- This is to have a "unique" name for the connection
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
        {
          provide: ConfigService,
          useValue: new ConfigService(`.env.${process.env.NODE_ENV}`),
        },
        Web3Service,
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

  it('The ENROLL function should return a "Mmnemonic required" error (empty string).', async (done) => {
    let dto = await service.enroll(authorisedReaders_Test_One.hash, '');
    expect(dto).toEqual(O_ENROLL_ErrorRequiredMnemonic);
    expect(dto instanceof EncryptDecryptResponseDto).toBe(true);
    
    done();
  });

  it('The ENROLL function should return a "Mnemonic required" error (null).', async (done) => {
    let dto = await service.enroll(authorisedReaders_Test_One.hash, null);
    expect(dto).toEqual(O_ENROLL_ErrorRequiredMnemonic);
    expect(dto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  it('The ENROLL function should return an "Invalid Mnemonic" error.', async (done) => {
    let dto = await service.enroll(authorisedReaders_Test_Two.hash, IO_ENROLL_ErrorInvalidMnemonic.mnemonic);
    expect(dto).toEqual(IO_ENROLL_ErrorInvalidMnemonic);
    expect(dto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  it('The ENROLL function should return an "Already enrolled" error.', async (done) => {
    let dto = await service.enroll(authorisedReaders_Test_One.hash, I_ENROLL_CorrectMnemonic.mnemonic);
    expect(dto instanceof EncryptDecryptResponseDto).toBe(true);

    let dto2 = await service.enroll(authorisedReaders_Test_One.hash, I_ENROLL_CorrectMnemonic.mnemonic);
    expect(dto2).toEqual(O_ENROLL_ErrorAlreadyEnrolled);

    done();
  });

  it('The ENROLL function should create and return a desired mnemonic entity.', async (done) => {
    await service.disenroll(authorisedReaders_Test_Two.hash);
    let dto = await service.enroll(authorisedReaders_Test_Two.hash, IO_ENROLL_CorrectMnemonic2.mnemonic);
    expect(dto).toEqual(IO_ENROLL_CorrectMnemonic2);
    expect(dto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  it('The DISENROLL function should disenroll/delete user key pair and return expected message.', async (done) => {
    let encryptDecryptResponseDto = await service.disenroll(authorisedReaders_Test_One.hash);
    expect(encryptDecryptResponseDto).toEqual(edResponse_CorrectDisenroll_Single);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  
  it('The DISENROLL function should disenroll and return expected message on a non existing user.', async (done) => {
    let encryptDecryptResponseDto = await service.disenroll("INVENTED");
    expect(encryptDecryptResponseDto).toEqual(edResponse_CorrectDisenrollInvented);
    expect(encryptDecryptResponseDto instanceof EncryptDecryptResponseDto).toBe(true);

    done();
  });

  it('The AUTHORISE function should authorise the provided hash.', async (done) => {
    let authorisedReaders = await service.authorise(authorisedReaders_Test_One.hash, authorisedReaders_Test_One.reader);
    expect(authorisedReaders).toEqual(authorisedReaders_Test_One);
    // expect(authorisedReaders instanceof AuthorisedReaders).toBe(true);

    done();
  });

  it('The AUTHORISE function should return the user already authorised.', async (done) => {
    let authorisedReaders = await service.authorise(authorisedReaders_Test_Two.hash, authorisedReaders_Test_Two.reader);
    let authorisedReaders2 = await service.authorise(authorisedReaders_Test_Two.hash, authorisedReaders_Test_Two.reader);
    expect(authorisedReaders2).toEqual(authorisedReaders_Test_Two);
    // expect(authorisedReaders2 instanceof AuthorisedReaders).toBe(true);

    done();
  });

  it('The DEAUTHORISE function should return true and delete/deauthorise the existing authorisation.', async (done) => {
    let deauthorised = await service.deauthorise(authorisedReaders_Test_One.hash, authorisedReaders_Test_One.reader);
    expect(deauthorised).toEqual(deauthrorisedReaders_test_one);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('The DEAUTHORISE function should return true for a non-existing/not found authorised hash.', async (done) => {
    //NOTE: DEAUTHORISED in the last test.
    let deauthorised = await service.deauthorise(authorisedReaders_Test_One.hash, authorisedReaders_Test_One.reader);
    expect(deauthorised).toEqual(deauthrorisedReaders_test_one);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('The DEAUTHORISEALL function should return true and delete/deauthorise all authorised hashes.', async (done) => {
    await service.authorise(authorisedReaders_Test_One.hash, addressReaderRandom1);
    await service.authorise(authorisedReaders_Test_One.hash, addressReaderRandom2);
    await service.authorise(authorisedReaders_Test_One.hash, addressReaderRandom3);
    await service.authorise(authorisedReaders_Test_One.hash, addressReaderRandom4);
    await service.authorise(authorisedReaders_Test_One.hash, addressReaderRandom5);
    await service.authorise(authorisedReaders_Test_One.hash, addressReaderRandom6);
    await service.authorise(authorisedReaders_Test_One.hash, addressReaderRandom7);

    let authDto = await service.deauthoriseAll(authorisedReaders_Test_One.hash);
    expect(authDto).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    //Validate that all the authorised hashes have been deleted.
    done();
  });

  it('The REQUESTAUHTORISATION function should return true ', async (done) => {
    let authDto = await service.requestAuthorisation(authorisedReaders_Test_One.hash, authorisedReaders_Test_One.reader);
    expect(authDto).toEqual(authDto_requested);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('The APPROVEAUHTORISATION function should return true', async (done) => {
    let authDto = await service.approveAuthorisation(authorisedReaders_Test_One.hash, authorisedReaders_Test_One.reader);
    expect(authDto).toEqual(authDto_approved);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('The SAVE function should save the data expected and return true.', async (done) => {
    let saved = await service.save(authorisedReaders_Test_One.hash, dataDto_Test_One);
    expect(saved).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    //Validate that the data is saved correctly.
    done();
  });

  it('The SAVEBULK function returns true and saves all data provided.', async (done) => {
    let dataListDto = new DataListDto();
    dataListDto.data = [];//new Array<DataDto>();
    dataListDto.data.push(dataDto_Test_Two, dataDto_Test_Three);

    let saved = await service.saveBulk(authorisedReaders_Test_One.hash, dataListDto);
    expect(saved).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    //Verify that all the data has been saved.
    done();
  });

  it('The READ function returns the data requested.', async (done) => {
    //The "dataDto_Test_One" has been saved before.
    let readed = await service.read(authorisedReaders_Test_One.hash, dataDto_Test_One.dataHash);
    expect(readed).toEqual(dataDto_Test_One);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('The READ function returns NULL if data does not exists.', async (done) => {
    let readed = await service.read(authorisedReaders_Test_One.hash, dataDto_Test_NO_SAVED.dataHash);
    expect(readed).toEqual(null);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  //FIXME: Should be tested the READBULK with non existing hashes?

  it('The READBULK function returns all data requested.', async (done) => {
    //NOTE: Saved in a test before.
    let dataListDto = new DataListDto();
    dataListDto.data = [];//new Array<DataDto>();
    dataListDto.data.push(dataDto_Test_Two, dataDto_Test_Three);

    let saved = await service.readBulk(authorisedReaders_Test_One.hash, [dataDto_Test_Two.dataHash, dataDto_Test_Three.dataHash]);
    expect(saved).toEqual(dataListDto);
    //expect(deauthorised instanceof Boolean).toBe(true);

    done();
  });

  it('The DELETE function returns true and deletes the data requested.', async (done) => {
    let deleted = await service.delete(authorisedReaders_Test_One.hash, dataDto_Test_One.dataHash);
    expect(deleted).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    //CHECK IT DOS NOT EXISTS.
    let readed = await service.read(authorisedReaders_Test_One.hash, dataDto_Test_One.dataHash);
    expect(readed).toEqual(null);

    done();
  });

  it('The DELETEBULK function returns true and deletes all data requested.', async (done) => {
    //NOTE: Saved in a test before.
    let dataListDto = new DataListDto();
    dataListDto.data = [];//new Array<DataDto>();
    dataListDto.data.push(dataDto_Test_Two, dataDto_Test_Three);

    let deleted = await service.deleteBulk(authorisedReaders_Test_One.hash, [dataDto_Test_Two.dataHash, dataDto_Test_Three.dataHash]);
    expect(deleted).toEqual(true);
    //expect(deauthorised instanceof Boolean).toBe(true);

    //NOTE: Can we perform a READ BULK?
    //CHECK IT DOS NOT EXISTS.
    let readed1 = await service.read(authorisedReaders_Test_One.hash, dataDto_Test_Two.dataHash);
    expect(readed1).toEqual(null);

    //CHECK IT DOS NOT EXISTS.
    let readed2 = await service.read(authorisedReaders_Test_One.hash, dataDto_Test_Three.dataHash);
    expect(readed2).toEqual(null);

    done();
  });
});