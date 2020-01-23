import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity({
  name: 'authorised_readers',
})
export class AuthorisedReaders {

  @ObjectIdColumn()
  @Exclude()
  id!: string;

  @Column()
  hash!: string;

  @Column()
  reader!: string;

}
