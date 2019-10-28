import { Module } from '@nestjs/common';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { ApiKey } from './model/entity/api-key.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@common/config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey]),
    ConfigModule,
  ],
  controllers: [ApiKeysController],
  providers: [ApiKeysService],
})
export class ApiKeysModule {}
