import { Body, Controller, Post, UseInterceptors } from '@nestjs/common'
import { ResponseInterceptor } from 'src/response.interceptor'
import { AuthService } from './auth.service'

@Controller('auth')
@UseInterceptors(ResponseInterceptor)
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/sign-in')
    async signIn(@Body('email') email: string) {
        await this.authService.signIn(email)
        return {
            data: { email },
            message: `The verification code sent to ${email} email address.`,
        }
    }
}
