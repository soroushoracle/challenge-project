import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entiry'

@Entity()
export class VerificationCode {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({ nullable: true })
    code: string

    @Column({ type: 'timestamp' })
    expiredAt: Date

    @OneToOne(() => User, (user) => user.verificationCode)
    user: User
}
