import { Body, Controller, Post, UseInterceptors } from '@nestjs/common'
import { ResponseInterceptor } from 'src/response.interceptor'
import { AuthService } from './auth.service'
import { SignInDto } from './dto/sign-in.dto'

@Controller('auth')
@UseInterceptors(ResponseInterceptor)
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/sign-in')
    async signIn(@Body() signInDto: SignInDto) {
        const { email } = signInDto
        await this.authService.signIn(email)
        return {
            data: { email },
            message: `The verification code sent to ${email} email address.`,
        }
    }
}
