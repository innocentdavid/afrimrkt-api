import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Shop as ShopEntity } from './entities/shop.entity';
// import nearShopJson from '@db/near-shop.json';
// import Fuse from 'fuse.js';
import { GetShopsDto, ShopPaginator } from './dto/get-shops.dto';
import { paginate } from 'src/common/pagination/paginate';
import { GetStaffsDto, StaffsPaginator } from './dto/get-staffs.dto';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Shop } from './schemas/shop.schema';
import { v4 as uuidv4 } from 'uuid';

import shopsJson from '@db/shops.json';
import { plainToClass } from 'class-transformer';
import { slugify } from 'src/helperFunctions';
import { JWT_SECRET_KEY } from 'config';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/users/schemas/user.schema';
const shops = plainToClass(ShopEntity, shopsJson);

// const nearShops = plainToClass(Shop, nearShopJson);
// const options = {
//   keys: ['name', 'type.slug', 'is_active'],
//   threshold: 0.3,
// };
// const fuse = new Fuse(shops, options);

@Injectable()
export class ShopsService {
  constructor(
    @InjectModel(Shop.name)
    private shopsModel: mongoose.Model<Shop>, // private nearShops: mongoose.Model<Shop>,
    @InjectModel(User.name)
    private readonly userModel: mongoose.Model<User>,
  ) {}

  async create(createShopDto: CreateShopDto) {
    try {
      const { token, ...shopData } = createShopDto;
      if (token) {
        const decodedToken: any = jwt.verify(token, JWT_SECRET_KEY);
        const userId = decodedToken.userId;
        const user = await this.userModel.findOne({ id: userId });

        const shop: any = {
          ...shops[0],
          id: uuidv4(),
          ...shopData,
          owner_id: user.id,
          owner: user,
          slug: slugify(createShopDto.name),
          created_at: new Date(),
          updated_at: new Date(),
        };

        const createShop = await this.shopsModel.create(shop);
        const userShops = [...user.shops, createShop];
        await this.userModel
          .findOneAndUpdate(
            { id: userId },
            { shops: userShops, shop_id: createShop.id },
          )
          .catch((err) => {
            throw new UnauthorizedException(
              `Error updating user: ${err.message}`,
            );
          });
        return createShop;
      } else {
        throw new UnauthorizedException(
          `jwt malformed: access token not found`,
        );
      }
    } catch (error: any) {
      throw new UnauthorizedException(`Something went wrong: ${error.message}`);
    }
  }

  async getShops({
    text,
    limit,
    page,
    search,
  }: GetShopsDto): Promise<ShopPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const query: any = {};

    if (text && text.replace(/%/g, '')) {
      query.$text = { $search: text };
    }

    if (search) {
      const parseSearchParams = search.split(';');
      const searchText: any = {};
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        // TODO: Temp Solution
        if (key !== 'slug') {
          searchText[key] = value;
        }
      }

      Object.assign(query, searchText);
    }

    const data: any[] = await this.shopsModel
      .find(query)
      .skip(startIndex)
      .limit(limit);

    const total = await this.shopsModel.countDocuments(query);
    const results = data.slice(0, endIndex);
    const url = `/shops?search=${search}&limit=${limit}`;

    return {
      data: results,
      ...paginate(total, page, limit, results.length, url),
    };
  }

  // async getStaffs({ shop_id, limit, page }: GetStaffsDto) {
  //   const startIndex = (page - 1) * limit;
  //   const endIndex = page * limit;
  //   let staffs: Shop['staffs'] = [];
  //   if (shop_id) {
  //     staffs =
  //       (await this.shopsModel.find((p) => p.id === Number(shop_id))
  //         ?.staffs) ?? [];
  //   }
  //   const results = staffs?.slice(startIndex, endIndex);
  //   const url = `/staffs?limit=${limit}`;

  //   return {
  //     data: results,
  //     ...paginate(staffs?.length, page, limit, results?.length, url),
  //   };
  // }

  async getStaffs({
    shop_id,
    limit,
    page,
  }: GetStaffsDto): Promise<StaffsPaginator> {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // let staffs: Shop['staffs'] = [];
    let staffs: any = [];

    if (shop_id) {
      // Find the shop based on the provided shop_id
      const shop = await this.shopsModel.findOne({ id: shop_id }).exec();

      // If the shop is found, retrieve its staffs
      if (shop) {
        staffs = shop.staffs || [];
      }
    } else {
      // If no shop_id is provided, retrieve all staffs
      staffs = (await this.shopsModel.find().select('staffs').exec()) || [];
    }

    const results = staffs?.slice(startIndex, endIndex);
    const url = `/staffs?limit=${limit}`;

    return {
      data: results,
      ...paginate(staffs?.length, page, limit, results?.length, url),
    };
  }

  async getShop(slug: string): Promise<Shop> {
    const shop: any = await this.shopsModel.findOne({ slug });
    return shop;
  }

  async getNearByShop(lat: string, lng: string) {
    const shops: any[] = await this.shopsModel.find({ lat, lng });
    return shops;
  }

  async update(id: string, updateShopDto: UpdateShopDto) {
    try {
      // Save the updated user object back to the database
      const updateShop: Shop = await this.shopsModel
        .findOneAndUpdate(
          { id: id },
          { ...updateShopDto, updated_at: new Date() },
          {
            new: true,
          },
        )
        .exec();
      return updateShop;
    } catch (error) {
      return error;
    }
  }

  // async approve(id: string) {
  //   return `This action removes a #${id} shop`;
  // }

  async approve(id: string): Promise<string> {
    try {
      const approvedShop: Shop = await this.shopsModel.findOneAndUpdate({
        is_active: true,
      });

      if (!approvedShop) {
        throw new Error(`Shop with ID ${id} not found.`);
      }

      return `Shop with ID ${id} has been successfully approved.`;
    } catch (error) {
      throw new Error(`Failed to remove user: ${error.message}`);
    }
  }

  async approveShop(id: string): Promise<Shop> {
    try {
      const approvedShop: Shop = await this.shopsModel.findOneAndUpdate({
        is_active: true,
      });

      if (!approvedShop) {
        throw new Error(`Shop with ID ${id} not found.`);
      }

      // return `Shop with ID ${id} has been successfully approved.`;
      return approvedShop;
    } catch (error) {
      throw new Error(`Failed to remove user: ${error.message}`);
    }
  }

  // async remove(id: string) {
  //   return `This action removes a #${id} shop`;
  // }

  async remove(id: string): Promise<string> {
    try {
      const deletedShop: Shop = await this.shopsModel.findOneAndDelete({
        id: id,
      });

      if (!deletedShop) {
        throw new Error(`Shop with ID ${id} not found.`);
      }

      return `Shop with ID ${id} has been successfully removed.`;
    } catch (error) {
      throw new Error(`Failed to remove user: ${error.message}`);
    }
  }

  async disapproveShop(id: string): Promise<Shop> {
    try {
      const disapproveShop: Shop = await this.shopsModel.findOneAndUpdate({
        is_active: false,
      });

      if (!disapproveShop) {
        throw new Error(`Shop with ID ${id} not found.`);
      }

      // return `Shop with ID ${id} has been successfully disapprove.`;
      return disapproveShop;
    } catch (error) {
      throw new Error(`Failed to remove user: ${error.message}`);
    }
  }

  // async approveShop(id: string) {
  //   const shop = await this.shopsModel.find((s) => s.id === Number(id));
  //   shop.is_active = true;

  //   return shop;
  // }
}
