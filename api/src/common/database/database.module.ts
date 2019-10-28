import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { ConfigModule } from '@common/config/config.module';
import { ConfigService } from '@common/config/config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        ({
          type: config.databaseType,
          host: config.databaseHost,
          port: config.databasePort,
          database: config.databaseName,
          username: config.databaseUsername,
          password: config.databasePassword,
          entities:  config.isDebug() ? ['src/**/*.entity{.ts,.js}'] : ['dist/**/*.entity{.ts,.js}'],
          synchronize: config.isDev,
          logging: !config.isProd,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        } as TypeOrmModuleOptions),
    }),
  ],
})
export class DatabaseModule {}
