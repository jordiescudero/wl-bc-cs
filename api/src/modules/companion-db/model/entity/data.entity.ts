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
  hashOwner!: string;

  @Column()
  hashData!: string;

  @Column()
  data!: string;

}
