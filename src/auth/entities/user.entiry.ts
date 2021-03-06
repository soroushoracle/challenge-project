import { Exclude } from 'class-transformer'
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { VerificationCode } from './verification-code.entity'

@Entity()
export class User {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({ nullable: true })
    name: string

    @Column({ nullable: true })
    family: string

    @Column({ unique: true })
    email: string

    @Column({ default: false })
    emailConfirmation: boolean

    @Column({ nullable: true })
    @Exclude({ toPlainOnly: true })
    password: string

    @Exclude({ toPlainOnly: true })
    @Column({ nullable: true })
    salt: string

    @OneToOne(() => VerificationCode, (code) => code.user, { cascade: true })
    @JoinColumn({ name: 'verification_code' })
    verificationCode: VerificationCode

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date

    constructor(partial: Partial<User>) {
        Object.assign(this, partial)
    }
}
