import * as fs from 'fs'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as winston from 'winston'
import { WinstonModule } from 'nest-winston'

const loggerFileFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
        let msg = `${timestamp} [${level}] : ${message} `
        if (metadata) {
            msg += JSON.stringify(metadata)
        }
        return msg
    }),
)
const loggerFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
)

async function bootstrap() {
    fs.appendFile('fullLogs.log', '', function (err) {
        if (err) throw err
    })
    const { HOST_PORT } = process.env
    const app = await NestFactory.create(AppModule, {
        logger: WinstonModule.createLogger({
            transports: [
                new winston.transports.Console({
                    format: loggerFormat,
                }),
                new winston.transports.File({
                    filename: 'fullLogs.log',
                    format: loggerFileFormat,
                }),
            ],
        }),
    })
    app.useGlobalPipes(new ValidationPipe({}))
    await app.listen(HOST_PORT)
}
bootstrap()
