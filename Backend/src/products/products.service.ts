import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './products.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Product[]; total: number; page: number; lastPage: number }> {
    const [data, total] = await this.productRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' },
    });
    const lastPage = Math.ceil(total / limit);
    return { data, total, page, lastPage };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async update(id: number, dto: Partial<CreateProductDto>): Promise<Product> {
    await this.findOne(id);
    await this.productRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
  }
}