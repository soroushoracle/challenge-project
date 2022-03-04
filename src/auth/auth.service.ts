import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MailService } from 'src/mail/mail.service'
import { CompleteUserDto } from './dto/complete-user.dto'
import { SignInDto } from './dto/sign-in.dto'
import { VerifyEmailDto } from './dto/verify-email.dto'
import { User } from './entities/user.entiry'
import { VerificationCode } from './entities/verification-code.entity'
import { UserRepository } from './repositories/user.repository'
import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto'

@Injectable()
export class AuthService {
    constructor(
        private mailService: MailService,
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private readonly logger: Logger,
    ) {}

    async signIn(signInDto: SignInDto): Promise<User> {
        const { email } = signInDto
        let user = await this.userRepository.findOne({ email }, { relations: ['verificationCode'] })
        if (user) {
            if (this.isCodeValid(user.verificationCode.expiredAt)) {
                this.logger.error(`The ${email} email address already received a verification code.`)
                throw new BadRequestException('You already received a code.')
            }
        } else {
            user = await this.userRepository.create({ email })
            this.logger.log(`An user with ${email} email address created.`)
        }
        this.setVerificationCode(user)
        await this.userRepository.save(user)
        this.mailService.sendUserConfirmation(signInDto.email, user.verificationCode.code)
        return user
    }

    async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<User> {
        const { email, code } = verifyEmailDto
        const user = await this.userRepository.findOne({ email }, { relations: ['verificationCode'] })
        const { verificationCode } = user
        if (!this.isCodeValid(verificationCode.expiredAt)) {
            this.logger.error(`The verification code of ${email} email address is expired!`)
            throw new BadRequestException('Your code is expired!')
        }
        if (code !== verificationCode.code) {
            this.logger.error(`An invalid request was submitted from the ${email} email`)
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
        user.salt = await bcrypt.genSalt()
        user.password = await this.hashedPassword(password, user.salt)
        this.logger.log(`The user with ${user.email} email address completed registering.`)
        return await this.userRepository.save(user)
    }

    async cleanVerificationCode(user: User): Promise<User> {
        user.verificationCode.code = null
        return await this.userRepository.save(user)
    }

    async loginUser(loginUserDto: LoginUserDto): Promise<User> {
        const { email, password } = loginUserDto
        const user = await this.userRepository.findByEmail(email)
        if (!user.emailConfirmation) {
            this.logger.error(`The user with ${email} does not completed registering yet.`)
            throw new ForbiddenException('You must first confirm your email')
        }
        if (!(await bcrypt.compare(password, user.password))) {
            this.logger.error(`An invalid request was submitted from the ${email} email`)
            throw new BadRequestException('Invalid credentials!')
        }
        return user
    }

    private async hashedPassword(password: string, salt: string): Promise<string> {
        return await bcrypt.hash(password, salt)
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
