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
    password: string

    @OneToOne(() => VerificationCode, (code) => code.user, { cascade: true })
    @JoinColumn({ name: 'verification_code' })
    verificationCode: VerificationCode

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date
}
