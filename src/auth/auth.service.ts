import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MailService } from 'src/mail/mail.service'
import { SignInDto } from './dto/sign-in.dto'
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
        let user = await this.userRepository.findOne({ email }, { relations: ['verificationCode'] })
        if (user) {
            if (this.isCodeValid(user.verificationCode.expiredAt)) {
                throw new BadRequestException('You already received a code.')
            }
            this.setVerificationCode(user)
            await this.userRepository.save(user)
        } else {
            user = await this.userRepository.create({ email })
            this.setVerificationCode(user)
            await this.userRepository.save(user)
        }
        this.mailService.sendUserConfirmation(signInDto.email, user.verificationCode.code)
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
