import { NotFoundException } from '@nestjs/common'
import { EntityRepository, Repository } from 'typeorm'
import { User } from '../entities/user.entiry'

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async findById(id: number): Promise<User> {
        const user = await this.findOne({ id })
        if (!user) {
            throw new NotFoundException('The user not found')
        }
        return user
    }
}
