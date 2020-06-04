import { Exclude } from 'class-transformer';
import { Entity, Column, ObjectIdColumn } from 'typeorm';

@Entity({
  name: 'key_pairs',
})
export class KeyPair {

  @ObjectIdColumn()
  @Exclude()
  id!: string;

  @Column()
  hash!: string;

  @Column()
  privateKey!: string;

  @Column()
  mnemonic!: string;

}
