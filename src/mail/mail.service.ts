import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService, private configService: ConfigService) {}

    async sendUserConfirmation(receptor: string, verificationCode: string) {
        await this.mailerService.sendMail({
            to: receptor,
            subject: this.configService.get(`MAIL_SUBJECT`),
            html: `<h2>Your verification code is: ${verificationCode}</h2>`,
            // Also can be used HTML template
        })
    }
}
