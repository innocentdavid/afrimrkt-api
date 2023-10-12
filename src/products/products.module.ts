import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductsController,
  PopularProductsController,
} from './products.controller';
// import { Product } from './entities/product.entity';
import { ProductSchema } from './schemas/product.schema';
import { ShopSchema } from 'src/shops/schemas/shop.schema';
import { TypeSchema } from 'src/types/schemas/type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Product', schema: ProductSchema },
      { name: 'Shop', schema: ShopSchema },
      { name: 'Type', schema: TypeSchema },
    ]),
  ],
  controllers: [ProductsController, PopularProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
