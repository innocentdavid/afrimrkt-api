import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto, ProductPaginator } from './dto/get-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { paginate } from 'src/common/pagination/paginate';
import { GetPopularProductsDto } from './dto/get-popular-products.dto';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Product } from './schemas/product.schema';
import { v4 as uuidv4 } from 'uuid';

import Fuse from 'fuse.js';
import { plainToClass } from 'class-transformer';
import { Product as ProductEntity } from './entities/product.entity';
import productsJson from '@db/products.json';
import { slugify } from 'src/helperFunctions';
import { Shop } from 'src/shops/entities/shop.entity';
// import { Shop } from 'src/shops/schemas/shop.schema';
// import { Type } from 'src/types/schemas/type.schema';
import { Type } from 'src/types/entities/type.entity';
const products: any = plainToClass(ProductEntity, productsJson);

const options = {
  keys: [
    'name',
    'type.slug',
    'categories.slug',
    'status',
    'shop_id',
    'author.slug',
    'tags',
    'manufacturer.slug',
  ],
  threshold: 0.3,
};
const fuse = new Fuse(products, options);

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: mongoose.Model<Product>,
    @InjectModel(Shop.name) private shopModel: mongoose.Model<Shop>,
    @InjectModel(Type.name) private typeModel: mongoose.Model<Type>,
  ) {}
  // private products: any = products;

  async create(createProductDto: CreateProductDto) {
    try {
      const type: any = await this.typeModel.findOne({
        id: createProductDto.type_id,
      });
      const shop: any = await this.shopModel.findOne({
        id: createProductDto.shop_id,
      });

      // console.log(createProductDto, '\n\n\n\n\n');
      const product: any = {
        ...products[0],
        id: uuidv4(),
        slug: slugify(createProductDto.name),
        shop,
        type,
        ...createProductDto,
        created_at: new Date(),
        updated_at: new Date(),
      };
      // console.log(product, '\n\n\n\n\n');

      return await this.productModel.create(product);
    } catch (error) {
      console.log(error);

      throw new UnauthorizedException(
        'An error occurred while creating product',
      );
    }
  }

  async getProducts({
    limit,
    page,
    search,
  }: GetProductsDto): Promise<ProductPaginator> {
    try {
      if (!page) page = 1;
      if (!limit) limit = 30;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      // let data: any[] = await this.productModel.find();
      let data: any[] = [];
      console.log(search, '\n\n');
      if (search) {
        const parseSearchParams = search.split(';');
        const searchText: any = [];
        for (const searchParam of parseSearchParams) {
          const [key, value] = searchParam.split(':');
          // TODO: Temp Solution
          if (key !== 'slug') {
            searchText.push({
              [key]: value,
            });
          }
        }

        console.log(searchText, '\n\n');

        // data = fuse
        //   .search({
        //     $and: searchText,
        //   })
        //   ?.map(({ item }) => item);

        const query = {
          $and: searchText,
        };

        data = await this.productModel.find(query);
      }

      console.log(data, '\n\n');

      const results = data.slice(startIndex, endIndex);
      const url = `/products?search=${search}&limit=${limit}`;

      console.log(results.length, '\n');

      return {
        data: results,
        ...paginate(data.length, page, limit, results.length, url),
      };
    } catch (error) {
      const url = `/products?search=${search}&limit=${limit}`;
      return {
        data: [],
        ...paginate(0, page, limit, 0, url),
      };
    }
  }

  // new
  // async getProducts({
  //   limit = 30,
  //   page = 1,
  //   search,
  // }: GetProductsDto): Promise<ProductPaginator> {
  //   const startIndex = (page - 1) * limit;
  //   const endIndex = page * limit;

  //   let query: any = {};

  //   if (search) {
  //     const parseSearchParams = search.split(';');
  //     const searchText: any = [];
  //     for (const searchParam of parseSearchParams) {
  //       const [key, value] = searchParam.split(':');
  //       // TODO: Temp Solution
  //       if (key !== 'slug') {
  //         searchText.push({
  //           [key]: new RegExp(value, 'i'), // Case-insensitive search
  //         });
  //       }
  //     }

  //     query = { $and: searchText };
  //   }

  //   const data: Product[] = await this.productModel
  //     .find(query)
  //     .skip(startIndex)
  //     .limit(limit)
  //     .exec();

  //   const results = data.slice(startIndex, endIndex);
  //   const url = `/products?search=${search}&limit=${limit}`;
  //   return {
  //     data: results,
  //     ...paginate(data.length, page, limit, results.length, url),
  //   };
  // }

  async getProductBySlug(slug: string): Promise<any> {
    try {
      const product = await this.productModel.findOne({ slug }).exec();

      if (product) {
        const relatedProducts = await this.productModel
          .find({ 'type.slug': product.type.slug })
          .limit(20)
          .exec();

        return {
          ...product.toObject(), // Convert Mongoose document to plain JavaScript object
          related_products: relatedProducts,
        };
      } else {
        throw new UnauthorizedException(
          'product with the given slug is not found',
        );
      }
    } catch (error) {
      throw new UnauthorizedException(
        `product with the given slug is not found: ${error.message}`,
      );
    }
  }

  async getPopularProducts({
    limit,
    type_slug,
  }: GetPopularProductsDto): Promise<Product[]> {
    let data: any = await this.productModel.find();
    if (type_slug) {
      data = fuse.search(type_slug)?.map(({ item }) => item);
    }
    return data?.slice(0, limit);
  }

  // new
  // async getPopularProducts({
  //   limit,
  //   type_slug,
  // }: GetPopularProductsDto): Promise<Product[]> {
  //   const query: any = {};

  //   if (type_slug) {
  //     query['type.slug'] = type_slug;
  //   }

  //   const data: Product[] = await this.productModel
  //     .find(query)
  //     .limit(limit)
  //     .exec();

  //   return data;
  // }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<UpdateProductDto> {
    // return await this.productModel[0];
    const updatedProduct: any = await this.productModel
      .findOneAndUpdate(
        { id: id },
        { ...updateProductDto, updated_at: new Date() },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    return updatedProduct;
  }

  async remove(id: string): Promise<string> {
    try {
      const deletedProduct: Product = await this.productModel.findOneAndDelete({
        id: id,
      });

      if (!deletedProduct) {
        throw new Error(`Product with ID ${id} not found.`);
      }

      return `Product with ID ${id} has been successfully removed.`;
    } catch (error) {
      throw new Error(`Failed to remove user: ${error.message}`);
    }
  }
}
