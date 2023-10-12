import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { Type } from './entities/type.entity';

import typesJson from '@db/types.json';
import Fuse from 'fuse.js';
import { GetTypesDto } from './dto/get-types.dto';
import * as mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

const types = plainToClass(Type, typesJson);
const options = {
  keys: ['name'],
  threshold: 0.3,
};
const fuse = new Fuse(types, options);

@Injectable()
export class TypesService {
  constructor(
    @InjectModel(Type.name)
    private typeModel: mongoose.Model<Type>,
  ) {}
  // private types: Type[] = types;

  async getTypes({ text, search }: GetTypesDto) {
    try {
      let data: Type[] = await this.typeModel.find();
      if (text?.replace(/%/g, '')) {
        data = fuse.search(text)?.map(({ item }) => item);
      }

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

        data = fuse
          .search({
            $and: searchText,
          })
          ?.map(({ item }) => item);
      }

      return data;
    } catch (error) {
      console.log('An error occurred while geting type: ' + error.message);

      return {};
    }
  }

  async getTypeBySlug(slug: string): Promise<Type> {
    const type: any = await this.typeModel.find({ slug });
    return type;
  }

  async create(createTypeDto: CreateTypeDto) {
    const type: Type = {
      ...types[0],
      ...createTypeDto,
      id: uuidv4(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    return await this.typeModel.create(type);
  }

  findAll() {
    return `This action returns all types`;
  }

  findOne(id: string) {
    return `This action returns a #${id} type`;
  }

  async update(
    id: string,
    updateTypeDto: UpdateTypeDto,
  ): Promise<UpdateTypeDto> {
    // return await this.TypeModel[0];
    const updatedType: any = await this.typeModel
      .findOneAndUpdate(
        { id: id },
        { ...updateTypeDto, updated_at: new Date() },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    return updatedType;
  }

  async remove(id: string): Promise<string> {
    try {
      const deletedType: Type = await this.typeModel.findOneAndDelete({
        id: id,
      });

      if (!deletedType) {
        throw new Error(`Type with ID ${id} not found.`);
      }

      return `Type with ID ${id} has been successfully removed.`;
    } catch (error) {
      throw new Error(`Failed to remove user: ${error.message}`);
    }
  }
}
