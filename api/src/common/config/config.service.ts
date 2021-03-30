import { parse, DotenvParseOutput } from 'dotenv';
import { readFileSync } from 'fs';
import * as Joi from 'joi';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly envConfig: DotenvParseOutput;

  constructor(filePath: string) {
    const parsedConfig = parse(readFileSync(filePath));
    this.envConfig = this.validateInput(parsedConfig);
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(parsedConfig: DotenvParseOutput) {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid(['development', 'production', 'test', 'provision'])
        .default('development'),
      DATABASE_TYPE: Joi.string()
        .valid([
          'cockroachdb',
          'cordova',
          'mariadb',
          'mongodb',
          'mssql',
          'mysql',
          'nativescript',
          'oracle',
          'postgres',
          'react-native',
          'sqlite',
          'sqljs',
        ])
        .required(),
      PORT: Joi.number(),
      // API_AUTH_ENABLED: Joi.boolean()
      //   .required()
      //   .default(true),
      // add more validation rules ...
    });

    const validationOptions: Joi.ValidationOptions = { allowUnknown: true };

    const { error, value: validatedEnvConfig } = Joi.validate(
      parsedConfig,
      envVarsSchema,
      validationOptions,
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  /**
   * Generic getter
   */
  get(key: string) {
    return this.envConfig[key];
  }

  /**
   * Getters for each environment variable
   */
  public get isDev() {
    return this.envConfig.NODE_ENV === 'development';
  }

  public isDebug(): boolean {
    return process.env.DEBUG === 'true';
  }

  public get isProd() {
    return this.envConfig.NODE_ENV === 'production';
  }

  public get isTest() {
    return this.envConfig.NODE_ENV === 'test';
  }

  public get databaseType() {
    return this.envConfig.DATABASE_TYPE;
  }

  public get databaseHost() {
    return this.envConfig.DATABASE_HOST;
  }

  public get databasePort() {
    return Number(this.envConfig.DATABASE_PORT);
  }

  public get databaseUsername() {
    return this.envConfig.DATABASE_USERNAME;
  }

  public get databasePassword() {
    return this.envConfig.DATABASE_PASSWORD;
  }

  public get databaseName() {
    return this.envConfig.DATABASE_NAME;
  }

  public get databaseEntitiesPath() {
    return this.envConfig.DATABASE_ENTITIES_PATH;
  }

  public get databaseEntitiesPathDebug() {
    return this.envConfig.DATABASE_ENTITIES_PATH_DEBUG;
  }

  public get jwtSecret() {
    return this.envConfig.JWT_SECRET;
  }

  public get blockchainMiddlewareAPIUrl() {
    return this.envConfig.BLOCKCHAIN_MIDDLEWARE_API_URL;
  }

}
