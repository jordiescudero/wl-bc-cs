import { TypeOrmModule } from '@nestjs/typeorm';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = new MongoMemoryServer();
global['__MONGOD__'] = mongod;

export default (customOpts: any = {}) => TypeOrmModule.forRootAsync({

    
    useFactory: async () => {
        
        const port = await mongod.getPort();
        const database = await mongod.getDbName();

        return {
            type: 'mongodb',
            host: '127.0.0.1',
            port,
            database,
            //   entities: [__dirname + '/**/*.entity{.ts,.js}', './model/entity/*.entity{.ts,.js}'],
            entities:  ['src/**/*.entity{.ts,.js}'],
            ...customOpts,
        };
    },

});

