import { Body, Controller, HttpCode, Post, UseInterceptors } from '@nestjs/common'
import { ResponseInterceptor } from 'src/response.interceptor'
import { AuthService } from './auth.service'
import { SignInDto } from './dto/sign-in.dto'

@Controller('auth')
@UseInterceptors(ResponseInterceptor)
export class AuthController {
    constructor(private authService: AuthService) {}

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
}
