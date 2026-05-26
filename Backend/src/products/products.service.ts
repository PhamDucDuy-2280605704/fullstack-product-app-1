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
    private uploadService: UploadService,
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

    // Tìm kiếm theo tên
    if (search) {
      query.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }

    // Lọc theo giá
    if (minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Sắp xếp – đã sửa lỗi so sánh chữ hoa/thường
    if (sort) {
      const [field, order] = sort.split('_');
      const validFields = ['name', 'price'];
      // Chuyển order về chữ hoa để kiểm tra (frontend gửi 'ASC' hoặc 'DESC')
      const orderUpper = order.toUpperCase();
      if (validFields.includes(field) && (orderUpper === 'ASC' || orderUpper === 'DESC')) {
        query.orderBy(`product.${field}`, orderUpper as 'ASC' | 'DESC');
      } else {
        query.orderBy('product.id', 'ASC'); // fallback
      }
    } else {
      query.orderBy('product.id', 'ASC');
    }

    // Phân trang
    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

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