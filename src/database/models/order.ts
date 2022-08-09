import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Order extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    dateTime: string;

    @Column()
    eshopId: string;
    
    @Column()
    recipientAmount: string;

    @Column()
    repayAmount: string;
    
    @Column()
    recipientCurrency: string;
    
    @Column()
    serviceName: string;
    
    @Column()
    secrcetKey: string;
    
    @Column()
    recurringType: string;
}