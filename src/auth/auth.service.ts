import { Injectable } from '@nestjs/common'
import { MailService } from 'src/mail/mail.service'

@Injectable()
export class AuthService {
    constructor(private mailService: MailService) {}

    async signIn(receptor) {
        await this.mailService.sendUserConfirmation(receptor, this.generateRandomCode())
    }

    generateRandomCode(): string {
        return Math.floor(1000 + Math.random() * 9000).toString()
    }
}
