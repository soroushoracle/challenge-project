import { Body, Controller, HttpCode, Post, UseInterceptors } from '@nestjs/common'
import { ResponseInterceptor } from 'src/response.interceptor'
import { AuthService } from './auth.service'
import { JwtService } from '@nestjs/jwt'
import { SignInDto } from './dto/sign-in.dto'
import { VerifyEmailDto } from './dto/verify-email.dto'

@Controller('auth')
@UseInterceptors(ResponseInterceptor)
export class AuthController {
    constructor(private authService: AuthService, private jwtService: JwtService) {}

    @Post('/sign-in')
    @HttpCode(200)
    async signIn(@Body() signInDto: SignInDto) {
        const user = await this.authService.signIn(signInDto)
        return {
            data: {
                email: user.email,
                expiredAt: user.verificationCode.expiredAt,
            },
            message: `The verification code sent to ${signInDto.email} email address.`,
        }
    }

    @Post('verify-email')
    @HttpCode(200)
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
        const user = await this.authService.verifyEmail(verifyEmailDto)
        this.authService.cleanVerificationCode(user)
        return {
            data: { token: await this.jwtService.sign({ id: user.id }) },
            message: 'Welcome to service :)',
        }
    }
}
