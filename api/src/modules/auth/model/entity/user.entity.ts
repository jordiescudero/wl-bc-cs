import { Exclude } from 'class-transformer';
import { Entity, Column, ObjectIdColumn } from 'typeorm';

@Entity({
  name: 'users',
})
export class User {
  @ObjectIdColumn()
  @Exclude()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;

  @Column()
  role!: string;

  @Column()
  @Exclude()
  verified!: boolean;

  @Column()
  @Exclude()
  password!: string;
}
