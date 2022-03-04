import {
    Body,
    Controller,
    HttpCode,
    Post,
    Req,
    UseGuards,
    UseInterceptors,
    ForbiddenException,
    ClassSerializerInterceptor,
} from '@nestjs/common'
import { ResponseInterceptor } from 'src/response.interceptor'
import { AuthService } from './auth.service'
import { JwtService } from '@nestjs/jwt'
import { SignInDto } from './dto/sign-in.dto'
import { VerifyEmailDto } from './dto/verify-email.dto'
import { JwtPayload } from './jwt-payload.interface'
import { AuthGuard } from '@nestjs/passport'
import { CompleteUserDto } from './dto/complete-user.dto'
import { LoginUserDto } from './dto/login-user.dto'

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
        const payload: JwtPayload = { id: user.id }
        return {
            data: { token: await this.jwtService.sign(payload) },
            message: 'Welcome to service :)',
        }
    }

    @Post('complete-register')
    @UseGuards(AuthGuard())
    @UseInterceptors(ClassSerializerInterceptor)
    async completeRegister(@Req() { user }, @Body() completeUserDto: CompleteUserDto) {
        if (!user.emailConfirmation || user.password !== null) {
            throw new ForbiddenException('You had already complete registering')
        }
        return {
            data: {
                user: await this.authService.completeUser(user.id, completeUserDto),
            },
            message: 'The User completed',
        }
    }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        const user = await this.authService.loginUser(loginUserDto)
        const payload: JwtPayload = { id: user.id }
        return {
            data: { token: await this.jwtService.sign(payload) },
            message: 'Welcome to service :)',
        }
    }
}
