import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class CompleteUserDto {
    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    name: string

    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    family: string

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'Password too weak' })
    password: string
}
