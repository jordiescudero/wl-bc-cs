import { Entity, Column, ObjectIdColumn, Index } from 'typeorm';
import { Transform, Exclude } from 'class-transformer';

@Entity({
    name: 'contracts',
})
export class Contract {
    @ObjectIdColumn()
    @Transform(value => value.toString())
    id!: string;

    @Column()
    name!: string;

    @Column()
    @Index({unique: true})
    address!: string;

    @Column()
    public!: boolean;

    @Column()
    description!: string;

    @Column()
    @Exclude()
    owner!: string;

}
