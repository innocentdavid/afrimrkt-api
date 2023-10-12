import { Address } from 'src/addresses/entities/address.entity';
// import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Profile } from './profile.entity';
import { CoreEntity2 } from 'src/common/entities/core.entity2';
import { Permission } from 'src/auth/dto/create-auth.dto';

export class User extends CoreEntity2 {
  name: string;
  email: string;
  password?: string;
  otp_token?: string;
  otp_token_expires?: Date;
  shop_id?: string;
  profile?: Profile;
  shops?: Shop[];
  managed_shop?: Shop;
  is_active?: boolean = true;
  address?: Address[];
  permissions?: Permission[];
  // orders?: Order[];
}
