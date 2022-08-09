/* eslint-disable no-unused-vars */
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Result } from './result';

export enum UserType {
    USER = 1,
    ADMIN = 2
}

export enum UserSex {
    WOMAN = 1,
    MAN = 2,
    NULL = 3
}

@Entity()
export class User extends BaseEntity {
    @PrimaryColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    @Column({
        type: 'enum',
        enum: UserType,
        default: UserType.USER
    })
    type: UserType;

    @Column()
    createdAt: number;

    @Column({
        type: 'enum',
        enum: UserSex
    })
    sex: UserSex;

    @Column({
        default: 0
    })
    balance: number;

    @Column({
        default: 0
    })
    endSubscribeTime: number;

    get hasSubscribe(): boolean {
        return this.endSubscribeTime > Math.round(Date.now() / 1000);
    }

    @Column({
        default: false
    })
    isBanned: boolean;

    @OneToOne(() => Result, result => result.user)
    @JoinColumn()
    result: Result;

    @Column({
        default: false
    })
    usedPromo: boolean;
}
