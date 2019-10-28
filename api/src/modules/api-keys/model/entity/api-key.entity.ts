import { Entity, Column, ObjectIdColumn, Index } from 'typeorm';
import { Exclude, Transform } from 'class-transformer';
import { ResponseContractDto } from '@modules/contracts/model/dto/response-contract.dto';

@Entity({
    name: 'api-keys',
})
export class ApiKey   {

    @ObjectIdColumn()
    @Transform(value => value.toString())
    id!: string;

    @Column()
    @Index({unique: true})
    name!: string;

    @Column()
    description!: string;

    @Column()
    @Exclude()
    @Index()
    owner!: string;

    @Column()
    role!: string;

    @Column()
    contracts!: ResponseContractDto[];

    @Column()
    active!: boolean;

}
