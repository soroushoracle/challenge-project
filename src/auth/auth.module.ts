import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { MailModule } from 'src/mail/mail.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserRepository } from './repositories/user.repository'
import { AuthController } from './auth.controller'
import { VerificationCode } from './entities/verification-code.entity'

@Module({
    imports: [MailModule, TypeOrmModule.forFeature([UserRepository, VerificationCode])],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
