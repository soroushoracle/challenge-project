import { Logger, Module } from '@nestjs/common'
import { WinstonModule } from 'nest-winston'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MailModule } from './mail/mail.module'
import { AuthModule } from './auth/auth.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        WinstonModule.forRoot({}),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT),
            database: process.env.DATABASE_NAME,
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            autoLoadEntities: true,
            synchronize: true,
        }),
        MailModule,
        AuthModule,
    ],
    providers: [Logger],
})
export class AppModule {}
