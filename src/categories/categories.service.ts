import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { paginate } from 'src/common/pagination/paginate';
import * as mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schemas/category.schema';
import { v4 as uuidv4 } from 'uuid';

import { plainToClass } from 'class-transformer';
import { Category as CategoryEntity } from './entities/category.entity';
import categoriesJson from '@db/categories.json';
import { slugify } from 'src/helperFunctions';
const categories = plainToClass(CategoryEntity, categoriesJson);

import Fuse from 'fuse.js';
const options = {
  keys: ['name', 'type.slug'],
  threshold: 0.3,
};
const fuse = new Fuse(categories, options);

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: mongoose.Model<Category>,
  ) {}
  // private categories: Category[] = categories;

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category: Category = {
        ...categories[0],
        id: uuidv4(),
        ...createCategoryDto,
        slug: slugify(createCategoryDto.name),
        created_at: new Date(),
        updated_at: new Date(),
      };

      return await this.categoryModel.create(category);
    } catch (error) {
      console.log(error);

      throw new BadRequestException(`An error occurred: ${error.message}`);
    }
  }

  async getCategories({ limit, page, search, parent }: GetCategoriesDto) {
    if (!page) page = 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Category[] = await this.categoryModel.find();
    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        // const [key, value] = searchParam.split(':');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [key, value] = searchParam.split(':');
        // data = data.filter((item) => item[key] === value);
        data = fuse.search(value)?.map(({ item }) => item);
      }
    }
    if (parent === 'null') {
      data = data.filter((item) => item.parent === null);
    }
    // if (text?.replace(/%/g, '')) {
    //   data = fuse.search(text)?.map(({ item }) => item);
    // }
    // if (hasType) {
    //   data = fuse.search(hasType)?.map(({ item }) => item);
    // }

    const results = data.slice(startIndex, endIndex);
    const url = `/categories?search=${search}&limit=${limit}&parent=${parent}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  // new
  // async getCategories({ limit, page, search, parent }: GetCategoriesDto) {
  //   if (!page) page = 1;
  //   const startIndex = (page - 1) * limit;
  //   // const endIndex = page * limit;

  //   const searchConditions: any[] = [];
  //   if (search) {
  //     const searchRegex = new RegExp(search, 'i'); // Case-insensitive search regex
  //     searchConditions.push({
  //       $or: [{ key1: searchRegex }, { key2: searchRegex }],
  //     }); // Replace key1 and key2 with the appropriate fields to search
  //   }

  //   const parentConditions: any[] = [];
  //   if (parent === 'null') {
  //     parentConditions.push({ parent: null });
  //   } else if (parent === 'notnull') {
  //     parentConditions.push({ parent: { $ne: null } });
  //   }

  //   const query: any = {};
  //   if (searchConditions.length > 0) {
  //     query.$and = searchConditions;
  //   }
  //   if (parentConditions.length > 0) {
  //     query.$and = query.$and
  //       ? [...query.$and, ...parentConditions]
  //       : parentConditions;
  //   }

  //   const data: Category[] = await this.categoryModel
  //     .find(query)
  //     .skip(startIndex)
  //     .limit(limit)
  //     .exec();

  //   const url = `/categories?search=${search}&limit=${limit}&parent=${parent}`;
  //   return {
  //     data,
  //     ...paginate(data.length, page, limit, data.length, url),
  //   };
  // }

  async getCategory(param: string, language: string): Promise<Category> {
    !language && console.log(language);

    const category = await this.categoryModel
      .findOne({ $or: [{ id: param }, { slug: param }] })
      .exec();
    return category;
  }

  // async update(id: number, updateCategoryDto: UpdateCategoryDto) {
  //   return await this.categoryModel;
  // }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const updatedCategory = await this.categoryModel
      .findOneAndUpdate(
        { id: id },
        { ...updateCategoryDto, updated_at: new Date() },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    return updatedCategory;
  }

  async remove(id: string): Promise<string> {
    try {
      const deletedCategory: Category =
        await this.categoryModel.findOneAndDelete({
          id: id,
        });

      if (!deletedCategory) {
        throw new Error(`Category with ID ${id} not found.`);
      }

      return `Category with ID ${id} has been successfully removed.`;
    } catch (error) {
      throw new Error(`Failed to remove user: ${error.message}`);
    }
  }
}
