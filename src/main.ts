import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
    const { HOST_PORT } = process.env
    const app = await NestFactory.create(AppModule)
    app.useGlobalPipes(new ValidationPipe({}))
    await app.listen(HOST_PORT)
}
bootstrap()
