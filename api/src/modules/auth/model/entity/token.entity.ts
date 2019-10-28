import { Entity, Column, ObjectIdColumn, Index } from 'typeorm';

@Entity({
    name: 'tokenWhitelist',
})
export class Token {
    @ObjectIdColumn()
    id!: number;

    @Column()
    @Index({unique: true})
    jti!: string;

    @Column()
    @Index()
    rjti!: string;

    @Column()
    @Index({ expireAfterSeconds: 1 })
    expireAt!: Date;

    @Column()
    @Index()
    userId!: string;
}
