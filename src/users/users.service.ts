import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto, UserPaginator } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { paginate } from 'src/common/pagination/paginate';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

import { User as UserEntity } from 'src/users/entities/user.entity';
import usersJson from '@db/users.json';
import { plainToClass } from 'class-transformer';
const users = plainToClass(UserEntity, usersJson);

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
  ) {}
  // private users: User[] = users;

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10); // 10 is the number of salt rounds
    const user: any = {
      ...users[0],
      id: uuidv4(),
      ...createUserDto,
      password: hashedPassword,
      // permissions: [createUserInput.permission],
      created_at: new Date(),
      updated_at: new Date(),
    };

    // console.log(createUserDto);
    return await this.userModel.create(user);
  }

  // async getUsers({
  //   text,
  //   limit,
  //   page,
  //   search,
  // }: GetUsersDto): Promise<UserPaginator> {
  //   if (!page) page = 1;
  //   if (!limit) limit = 30;
  //   const startIndex = (page - 1) * limit;
  //   const endIndex = page * limit;
  //   let data: User[] = await this.userModel.find();
  //   if (text?.replace(/%/g, '')) {
  //     data = fuse.search(text)?.map(({ item }) => item);
  //   }

  //   if (search) {
  //     const parseSearchParams = search.split(';');
  //     const searchText: any = [];
  //     for (const searchParam of parseSearchParams) {
  //       const [key, value] = searchParam.split(':');
  //       // TODO: Temp Solution
  //       if (key !== 'slug') {
  //         searchText.push({
  //           [key]: value,
  //         });
  //       }
  //     }

  //     data = fuse
  //       .search({
  //         $and: searchText,
  //       })
  //       ?.map(({ item }) => item);
  //   }

  //   const results = data.slice(startIndex, endIndex);
  //   const url = `/users?limit=${limit}`;

  //   return {
  //     data: results,
  //     ...paginate(data.length, page, limit, results.length, url),
  //   };
  // }

  async getUsers({
    text,
    limit,
    page,
    search,
  }: GetUsersDto): Promise<UserPaginator> {
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

    const data: User[] = await this.userModel
      .find(query)
      .skip(startIndex)
      .limit(limit);

    const total = await this.userModel.countDocuments(query);
    const results = data.slice(0, endIndex);
    const url = `/users?limit=${limit}`;

    return {
      data: results,
      ...paginate(total, page, limit, results.length, url),
    };
  }

  async getUsersNotify({ limit }: GetUsersDto): Promise<User[]> {
    return await this.userModel.find().limit(limit);
    // return data?.slice(0, limit);
  }

  async findOne(id: string): Promise<User> {
    const user: any = await this.userModel.findOne({ id: id });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User[]> {
    try {
      const updatedUser: any = await this.userModel
        .findOneAndUpdate(
          { id: id },
          { ...updateUserDto, updated_at: new Date() },
          {
            new: true,
          },
        )
        .exec();

      return updatedUser;
    } catch (error) {
      return error;
    }
  }

  // remove(id: string) {
  //   return `This action removes a #${id} user`;
  // }

  async remove(id: string): Promise<string> {
    try {
      const deletedUser = await this.userModel.findOneAndDelete({ id: id });

      if (!deletedUser) {
        throw new Error(`User with ID ${id} not found.`);
      }

      return `User with ID ${id} has been successfully removed.`;
    } catch (error) {
      throw new Error(`Failed to remove user: ${error.message}`);
    }
  }

  async makeAdmin(user_id: string): Promise<User> {
    const user: User = await this.userModel
      .findOneAndUpdate({ id: user_id }, { isAdmin: true }, { new: true })
      .exec();
    return user;
  }

  async banUser(id: string): Promise<User> {
    const user: User = await this.userModel
      .findOneAndUpdate({ id: id }, { is_active: false }, { new: true })
      .exec();
    return user;
  }

  async activeUser(id: string): Promise<User> {
    const user: User = await this.userModel
      .findOneAndUpdate({ id: id }, { is_active: true }, { new: true })
      .exec();
    return user;
  }
}
