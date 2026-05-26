import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    if (!username) return null;
    return this.usersRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    if (!id) return null;
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(username: string, email: string, password: string): Promise<User> {
    console.log('UsersService.create received:', { username, email, password });
    
    if (!username || !email) {
      throw new ConflictException('Username and email are required');
    }
    // Bỏ kiểm tra password ở đây, để bcrypt báo lỗi rõ hơn nếu password undefined
    const existing = await this.findByUsername(username);
    if (existing) {
      throw new ConflictException('Username already exists');
    }
    // Bcrypt sẽ throw error nếu password không phải string
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }
}