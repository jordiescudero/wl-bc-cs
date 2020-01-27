import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity({
  name: 'data',
})
export class Data {

  @ObjectIdColumn()
  @Exclude()
  id!: string;

  @Column()
  dataHash!: string;

  @Column()
  ownerHash!: string;

  @Column()
  data!: string;

}
