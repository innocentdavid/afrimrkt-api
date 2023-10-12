import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  AuthResponse,
  ChangePasswordDto,
  ForgetPasswordDto,
  LoginDto,
  CoreResponse,
  RegisterDto,
  ResetPasswordDto,
  VerifyForgetPasswordDto,
  SocialLoginDto,
  OtpLoginDto,
  OtpResponse,
  VerifyOtpDto,
  OtpDto,
} from './dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { JWT_SECRET_KEY } from 'config';
import { User } from 'src/users/schemas/user.schema';

import { User as UserEntity } from 'src/users/entities/user.entity';
import usersJson from '@db/users.json';
import { plainToClass } from 'class-transformer';
import { MailService } from 'src/mail/mail.service';
import { generateRandomToken } from 'src/helperFunctions';
const users = plainToClass(UserEntity, usersJson);

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
    private readonly mailService: MailService,
  ) {}
  // private users: User[] = users;

  async register(createUserInput: RegisterDto): Promise<AuthResponse> {
    const hashedPassword = await bcrypt.hash(createUserInput.password, 10); // 10 is the number of salt rounds
    const user: User = {
      ...users[0],
      id: uuidv4(),
      ...createUserInput,
      password: hashedPassword,
      is_active: true,
      permissions: [createUserInput.permission],
      created_at: new Date(),
      updated_at: new Date(),
    };
    try {
      await this.userModel.create(user);
      // const token = '2394wdsd';
      // await this.mailService.sendUserConfirmation(user, token);
    } catch (error) {
      throw error;
    }

    // Generate JWT token for the user
    const token = jwt.sign({ userId: user.id }, JWT_SECRET_KEY, {
      expiresIn: '24h', // Token expiration time
    });

    return {
      token,
      permissions: user.permissions,
    };
  }

  async login(loginInput: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginInput;

    // Retrieve the user from the database by email
    const user: User = await this.userModel.findOne({ email }).exec();

    // If the user is not found, or if the password is incorrect, return an error
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // If email and password are correct, generate a JWT token and return it
    const token = jwt.sign({ userId: user.id }, JWT_SECRET_KEY, {
      expiresIn: '24h',
    });

    return {
      token,
      permissions: user.permissions,
    };
  }

  async changePassword(
    changePasswordInput: ChangePasswordDto,
  ): Promise<CoreResponse> {
    // console.log(changePasswordInput);
    try {
      const { oldPassword, newPassword, email } = changePasswordInput;
      const user = await this.userModel.findOne({ email });

      if (user) {
        if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
          // throw new UnauthorizedException('Old password is incorrect');
          return {
            success: false,
            message: 'Old password is incorrect',
          };
        }

        if (user && newPassword) {
          const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the number of salt rounds
          user.password = hashedPassword;
          await user.save();

          return {
            success: true,
            message: 'Password change successful',
          };
        } else {
          return {
            success: true,
            message: 'User not found',
          };
        }
      } else {
        return {
          success: false,
          message: 'User not found!',
        };
      }
    } catch (error: any) {
      console.log(error);

      throw new UnauthorizedException(`Something went wrong: ${error.message}`);
    }
  }

  async forgetPassword(
    forgetPasswordInput: ForgetPasswordDto,
  ): Promise<CoreResponse> {
    console.log(forgetPasswordInput);
    try {
      const { email } = forgetPasswordInput;

      if (email) {
        const token = generateRandomToken();
        const user = await this.userModel.findOne({ email });
        user.otp_token = token;
        user.otp_token_expires = new Date(Date.now() + 600000); // OTP expiry time (10 minutes)
        await user.save();

        await this.mailService.sendUserToken(user.name, user.email, token);

        return {
          success: true,
          message: 'Token sent successfully',
        };
      } else {
        throw new UnauthorizedException(`User not found`);
      }
    } catch (error: any) {
      throw new UnauthorizedException(`Something went wrong: ${error.message}`);
    }
  }

  async verifyForgetPasswordToken(
    verifyForgetPasswordTokenInput: VerifyForgetPasswordDto,
  ): Promise<CoreResponse> {
    // console.log(verifyForgetPasswordTokenInput);
    try {
      const { token, email } = verifyForgetPasswordTokenInput;
      if (token) {
        const user = await this.userModel.findOne({ email });
        if (user?.otp_token === token) {
          return {
            success: true,
            message: 'Token is valid',
          };
        } else {
          return {
            success: false,
            message: 'Token is invalid',
          };
        }
      } else {
        throw new UnauthorizedException(`access token not found`);
      }
    } catch (error: any) {
      throw new UnauthorizedException(`Something went wrong: ${error.message}`);
    }

    return {
      success: true,
      message: 'Password change successful',
    };
  }

  async resetPassword(
    resetPasswordInput: ResetPasswordDto,
  ): Promise<CoreResponse> {
    // console.log(resetPasswordInput);

    try {
      const { token, email } = resetPasswordInput;
      if (token && email) {
        const user = await this.userModel.findOne({ email });
        if (user.otp_token === token) {
          const hashedPassword = await bcrypt.hash(
            resetPasswordInput.password,
            10,
          ); // 10 is the number of salt rounds

          user.password = hashedPassword;
          await user.save();

          return {
            success: true,
            message: 'Password change successful',
          };
        } else {
          return {
            success: false,
            message: 'An error occured, please try again',
          };
        }
      } else {
        throw new UnauthorizedException(
          `jwt malformed: access token not found`,
        );
      }
    } catch (error: any) {
      throw new UnauthorizedException(`Something went wrong: ${error.message}`);
    }
  }

  async socialLogin(socialLoginDto: SocialLoginDto): Promise<AuthResponse> {
    console.log(socialLoginDto);
    return {
      token: 'jwt token',
      permissions: ['super_admin', 'customer'],
    };
  }

  async otpLogin(otpLoginDto: OtpLoginDto): Promise<AuthResponse> {
    console.log(otpLoginDto);
    return {
      token: 'jwt token',
      permissions: ['super_admin', 'customer'],
    };
  }

  async verifyOtpCode(verifyOtpInput: VerifyOtpDto): Promise<CoreResponse> {
    console.log(verifyOtpInput);
    return {
      message: 'success',
      success: true,
    };
  }

  async sendOtpCode(otpInput: OtpDto): Promise<OtpResponse> {
    console.log(otpInput);
    return {
      message: 'success',
      success: true,
      id: '1',
      provider: 'google',
      phone_number: '+919494949494',
      is_contact_exist: true,
    };
  }

  // async getUsers({ text, first, page }: GetUsersArgs): Promise<UserPaginator> {
  //   const startIndex = (page - 1) * first;
  //   const endIndex = page * first;
  //   let data: User[] = this.users;
  //   if (text?.replace(/%/g, '')) {
  //     data = fuse.search(text)?.map(({ item }) => item);
  //   }
  //   const results = data.slice(startIndex, endIndex);
  //   return {
  //     data: results,
  //     paginatorInfo: paginate(data.length, page, first, results.length),
  //   };
  // }
  // public getUser(getUserArgs: GetUserArgs): User {
  //   return this.users.find((user) => user.id === getUserArgs.id);
  // }

  async me(token: string): Promise<User> {
    try {
      if (token) {
        const decodedToken: any = jwt.verify(token, JWT_SECRET_KEY);
        const userId = decodedToken.userId;
        const user = await this.userModel.findOne({ id: userId });
        return user;
      } else {
        throw new UnauthorizedException(
          `jwt malformed: access token not found`,
        );
      }
    } catch (error: any) {
      throw new UnauthorizedException(`jwt malformed: ${error.message}`);
    }
  }

  // updateUser(id: number, updateUserInput: UpdateUserInput) {
  //   return `This action updates a #${id} user`;
  // }
}
