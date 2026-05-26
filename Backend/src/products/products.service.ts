import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './products.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private uploadService: UploadService, // Inject UploadService để upload ảnh
  ) {}

  async findAllWithPagination(
    page: number,
    limit: number,
    search?: string,
    minPrice?: number,
    maxPrice?: number,
    sort?: string,
  ) {
    const query = this.productsRepository.createQueryBuilder('product');

    if (search) {
      query.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }
    if (minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (sort) {
      const [field, order] = sort.split('_');
      const validFields = ['name', 'price'];
      if (validFields.includes(field) && (order === 'asc' || order === 'desc')) {
        query.orderBy(`product.${field}`, order.toUpperCase() as 'ASC' | 'DESC');
      } else {
        query.orderBy('product.id', 'ASC');
      }
    } else {
      query.orderBy('product.id', 'ASC');
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  // Thêm method findOne
  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(newProduct);
  }

  // Sửa update nhận Partial<CreateProductDto> thay vì CreateProductDto
  async update(id: number, updateProductDto: Partial<CreateProductDto>): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return await this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const result = await this.productsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  // Sửa updateImage nhận file (Express.Multer.File) thay vì string
  async updateImage(id: number, file: Express.Multer.File): Promise<Product> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const imageUrl = await this.uploadService.uploadImage(file);
    const product = await this.findOne(id);
    product.imageUrl = imageUrl;
    return this.productsRepository.save(product);
  }
}