import { Logger, Module } from '@nestjs/common'
import { MailService } from './mail.service'
import { MailerModule } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'

@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: async (configs: ConfigService) => ({
                transport: {
                    host: configs.get('MAIL_HOST'),
                    port: Number(configs.get('MAIL_PORT')),
                    secure: false,
                    requireTLS: true,
                    auth: {
                        user: configs.get('MAIL_AUTH_USER'),
                        pass: configs.get('MAIL_AUTH_PASSWORD'),
                    },
                },
                defaults: {
                    from: configs.get('MAIL_FROM'),
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [MailService, Logger],
    exports: [MailService],
})
export class MailModule {}
