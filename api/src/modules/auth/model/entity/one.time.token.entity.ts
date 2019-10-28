import { Entity, Column, ObjectIdColumn, Index } from 'typeorm';

@Entity({
    name: 'oneTimeTokens',
})
export class OnetimeToken {
    @ObjectIdColumn()
    id!: number;

    @Column()
    @Index({ expireAfterSeconds: 1 })
    expireAt!: Date;

    @Column()
    userId!: string;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column()
    email!: string;

    @Column()
    lang!: string;
}
