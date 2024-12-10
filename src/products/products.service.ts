import { PrismaClient } from '@prisma/client';
import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductService');

  onModuleInit() {
    this.$connect();
    this.logger.log(`Database connected!`);
  }

  async create(createProductDto: CreateProductDto) {
    const product = await this.product.create({
      data: createProductDto,
    });
    return product;
  }

  async findAll( paginationDto: PaginationDto ) {

    const { page, limit, } = paginationDto;
    const totalPages = await this.product.count({
      where: {
        available: true,
      },
    });
    const lastPage = Math.ceil( totalPages / limit );

    const meta = { page, lastPage, totalPages, };

    const data = await this.product.findMany({
      where: {
        available: true,
      },
      take: limit,
      skip: ( page - 1 ) * limit,
    });

    return {
      meta,
      data,
    };

  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: {
        id,
        available: true,
      },
    });

    if ( !product ) {
      throw new NotFoundException(
        `Product with id ${ id } not found.`,
      );
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
    await this.findOne( id );
    const product = await this.product.update({
      where: {
        id,
        available: true,
      },
      data,
    });
    return product;
  }

  async remove(id: number) {
    await this.findOne( id );
    // const product = await this.product.delete({
    //   where: { id, },
    // });
    const product = await this.product.update({
      where: { id, },
      data: {
        available: false,
      }
    });
    return product;
  }
}
