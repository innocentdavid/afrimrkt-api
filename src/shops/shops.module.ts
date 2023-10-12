import { Module } from '@nestjs/common';
import { ShopsService } from './shops.service';
import {
  ApproveShopController,
  DisapproveShopController,
  ShopsController,
  StaffsController,
  NearByShopController,
} from './shops.controller';
import { ShopSchema } from './schemas/shop.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [
    // MongooseModule.forFeature([{ name: 'Shop', schema: ShopSchema }]),
    // MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: 'Shop', schema: ShopSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [
    ShopsController,
    StaffsController,
    DisapproveShopController,
    ApproveShopController,
    NearByShopController,
  ],
  providers: [ShopsService],
})
export class ShopsModule {}
