import { NotFoundException } from '@nestjs/common'
import { EntityRepository, Repository } from 'typeorm'
import { User } from '../entities/user.entiry'

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async findByEmail(email: string, relations?: [string]): Promise<User> {
        const user = await this.findOne({ email }, { relations })
        if (!user) {
            throw new NotFoundException('The user not found')
        }
        return user
    }

    async findById(id: number, relations?: [string]): Promise<User> {
        const user = await this.findOne({ id }, { relations })
        if (!user) {
            throw new NotFoundException('The user not found')
        }
        return user
    }
}
