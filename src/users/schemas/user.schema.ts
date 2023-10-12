/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Address } from 'src/addresses/entities/address.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Profile } from '../entities/profile.entity';
import { Permission } from 'src/auth/dto/create-auth.dto';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  created_at: Date;

  @Prop({ required: true })
  updated_at: Date;

  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password?: string;

  @Prop()
  otp_token?: string;

  @Prop()
  otp_token_expires?: Date;

  @Prop()
  shop_id?: string;

  @Prop()
  profile?: Profile;

  @Prop([{ type: Shop }]) // Assuming Shop is another Mongoose schema
  shops?: Shop[];

  @Prop({ type: Shop }) // Assuming Shop is another Mongoose schema
  managed_shop?: Shop;

  @Prop()
  address?: Address[];

  @Prop({ default: true }) // Set default value for is_active
  is_active?: boolean;

  @Prop({ default: ['customer'] })
  permissions?: Permission[];
}

export const UserSchema = SchemaFactory.createForClass(User);