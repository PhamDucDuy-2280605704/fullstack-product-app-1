import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Các route công khai: GET (xem danh sách & chi tiết)
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sort') sort?: string,
  ) {
    return this.productsService.findAllWithPagination(
      +page, +limit, search, minPrice, maxPrice, sort
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  // Các route yêu cầu đăng nhập:
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateData: Partial<CreateProductDto>) {
    return this.productsService.update(+id, updateData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  @Post('upload/:id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.productsService.updateImage(+id, file);
  }
}