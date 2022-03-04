import { Logger, NotFoundException } from '@nestjs/common'
import { EntityRepository, Repository } from 'typeorm'
import { User } from '../entities/user.entiry'

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    constructor(private readonly logger: Logger) {
        super()
    }

    async findByEmail(email: string, relations?: [string]): Promise<User> {
        const user = await this.findOne({ email }, { relations })
        if (!user) {
            this.logger.error(`The user with ${email} email address does not found!`)
            throw new NotFoundException('The user not found')
        }
        return user
    }

    async findById(id: number, relations?: [string]): Promise<User> {
        const user = await this.findOne({ id }, { relations })
        if (!user) {
            this.logger.error(`The user with ${id} ID does not found!`)
            throw new NotFoundException('The user not found')
        }
        return user
    }
}
