/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserAddress } from 'src/addresses/entities/address.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Location, ShopSocials } from 'src/settings/entities/setting.entity';
import { User } from 'src/users/entities/user.entity';


class PaymentInfo {
  @Prop({ required: true })
  account: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  bank: string;
}

class Balance {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  admin_commission_rate: number;

  @Prop({ type: Number, required: true })
  total_earnings: number;

  @Prop({ type: Number, required: true })
  withdrawn_amount: number;

  @Prop({ type: Number, required: true })
  current_balance: number;

  @Prop({ required: true })
  payment_info: PaymentInfo;
}


class ShopSettings {
  @Prop([{ type: ShopSocials }])
  socials: ShopSocials[];

  @Prop({ required: true })
  contact: string;

  @Prop({ type: Location, required: true })
  location: Location;

  @Prop()
  website: string;
}

@Schema({ timestamps: true })
export class Shop {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  created_at: Date;

  @Prop({ required: true })
  updated_at: Date;
  
  @Prop({ required: true, unique: true })
  owner_id: string;

  @Prop({ type: User })
  owner: User;

  @Prop([{ type: User }])
  staffs: User[];

  @Prop({ required: true, default: true })
  is_active: boolean;

  @Prop({ type: Number, default: 0 })
  orders_count: number;

  @Prop({ type: Number, default: 0 })
  products_count: number;

  @Prop({ type: Balance })
  balance: Balance;

  @Prop({ required: true })
  name: string;

  // @Prop({ required: true, unique: true })
  @Prop()
  slug?: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  cover_image: Attachment;

  @Prop({ type: Attachment })
  logo: Attachment;

  @Prop({ required: true })
  address: UserAddress;

  @Prop({ type: ShopSettings })
  settings: ShopSettings;

  @Prop()
  distance: string;

  @Prop()
  lat: string;

  @Prop()
  lng: string;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
