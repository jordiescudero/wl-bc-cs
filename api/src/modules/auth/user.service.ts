import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { createHmac } from 'crypto';

import { User } from './model/entity/user.entity';
import { UpdateUserDto } from './model/dto/update-user.dto';
import { RegisterUserDto } from './model/dto/register-user.dto';
import { UpdatePasswordDto } from './model/dto/update-password.dto';
import { ResponseUserDto } from './model/dto/response-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
  ) {}

  async get(id: number) {
    return await this.userRepository.findOne(id);
  }

  async getByEmail(email: string) {
    return await this.userRepository.findOne({ email });
  }

  async getByEmailAndPass(email: string, password: string) {
    const passHash = createHmac('sha256', password).digest('hex');
    return await this.userRepository.findOne({ email, password: passHash });
  }

  async create(payload: RegisterUserDto) {
    const checkUserExistence = await this.getByEmail(payload.email);

    if (checkUserExistence) {
      throw new NotAcceptableException(
        'Another user with provided email already exists.',
      );
    }
    const newUser = this.userRepository.create({...payload, role: 'user', verified: false});
    return await this.userRepository.save(newUser);
  }

  async updatePassword(userId: string, payload: UpdatePasswordDto) {
    const user = await this.userRepository.findOne(userId);
    user.password = createHmac('sha256', payload.password).digest('hex');
    user.verified = true;
    await this.userRepository.save(user);
  }

  async update(userId: string, payload: UpdateUserDto): Promise<ResponseUserDto> {
    let user = await this.userRepository.findOne(userId);
    user = Object.assign(user, payload);
    return await this.userRepository.save(user);
  }
}
