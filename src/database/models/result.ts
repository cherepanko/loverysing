import { BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user';

@Entity()
export class Result extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, user => user.result)
    user: User;

    @Column({
        default: 0
    })
    date: number;

    @Column({
        type: 'longtext'
    })
    interestedUsers: string;

    @Column({
        type: 'longtext'
    })
    secretGuests: string;

    @Column({
        type: 'longtext'
    })
    likeUsers: string;

    @Column({
        type: 'longtext'
    })
    activeUser: string;
}