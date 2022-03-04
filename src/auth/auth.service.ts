import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MailService } from 'src/mail/mail.service'
import { CompleteUserDto } from './dto/complete-user.dto'
import { SignInDto } from './dto/sign-in.dto'
import { VerifyEmailDto } from './dto/verify-email.dto'
import { User } from './entities/user.entiry'
import { VerificationCode } from './entities/verification-code.entity'
import { UserRepository } from './repositories/user.repository'

@Injectable()
export class AuthService {
    constructor(
        private mailService: MailService,
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
    ) {}

    async signIn(signInDto: SignInDto): Promise<User> {
        const { email } = signInDto
        let user = await this.findUserByEmail(email, ['verificationCode'])
        if (user) {
            if (this.isCodeValid(user.verificationCode.expiredAt))
                throw new BadRequestException('You already received a code.')
        } else {
            user = await this.userRepository.create({ email })
        }
        this.setVerificationCode(user)
        await this.userRepository.save(user)
        this.mailService.sendUserConfirmation(signInDto.email, user.verificationCode.code)
        return user
    }

    async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<User> {
        const { email, code } = verifyEmailDto
        const user = await this.findUserByEmail(email, ['verificationCode'])
        const { verificationCode } = user
        if (!this.isCodeValid(verificationCode.expiredAt)) {
            throw new BadRequestException('Your code is expired!')
        }
        if (code !== verificationCode.code) {
            throw new BadRequestException('Invalid credentials!')
        }
        user.emailConfirmation = true
        return this.userRepository.save(user)
    }

    async completeUser(id: number, completeUserDto: CompleteUserDto): Promise<User> {
        const { name, family, password } = completeUserDto
        const user = await this.userRepository.findById(id)
        user.name = name
        user.family = family
        user.password = password
        return await this.userRepository.save(user)
    }

    async cleanVerificationCode(user: User): Promise<User> {
        user.verificationCode.code = null
        return await this.userRepository.save(user)
    }

    private async findUserByEmail(email: string, relations?: [string]): Promise<User> {
        const user = await this.userRepository.findOne({ email }, { relations })
        if (!user) {
            throw new NotFoundException('The user not found')
        }
        return user
    }

    private isCodeValid(expiredAt: Date): boolean {
        return new Date(Date.now()).getTime() < new Date(expiredAt).getTime() ? true : false
    }

    private setVerificationCode(user: User): void {
        if (!user.verificationCode) {
            user.verificationCode = new VerificationCode()
        }
        user.verificationCode.code = this.generateRandomCode()
        user.verificationCode.expiredAt = this.computingExpiredAt()
    }

    private generateRandomCode(): string {
        return Math.floor(1000 + Math.random() * 9000).toString()
    }

    private computingExpiredAt() {
        const date = new Date()
        return new Date(date.setMinutes(date.getMinutes() + 2))
    }
}
