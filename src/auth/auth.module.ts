import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { MailModule } from 'src/mail/mail.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserRepository } from './repositories/user.repository'
import { AuthController } from './auth.controller'
import { VerificationCode } from './entities/verification-code.entity'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { JWTStrategy } from './jwt.strategy'

@Module({
    imports: [
        MailModule,
        TypeOrmModule.forFeature([UserRepository, VerificationCode]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            useFactory: async (configs: ConfigService) => ({
                secret: configs.get('JWT_SECRET_KEY'),
                signOptions: {
                    expiresIn: '1d',
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, JWTStrategy],
    controllers: [AuthController],
    exports: [JWTStrategy, PassportModule],
})
export class AuthModule {}
