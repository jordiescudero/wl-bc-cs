import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity({
  name: 'authorized_companies',
})
export class AuthorizedCompanies {

  @ObjectIdColumn()
  @Exclude()
  id!: string;

  @Column()
  hash!: string;

  @Column()
  company!: string;

}
