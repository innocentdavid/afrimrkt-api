import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Shop } from '../entities/shop.entity';

export class StaffsPaginator extends Paginator<Shop['staffs']> {
  data: Shop['staffs'][];
}

export class GetStaffsDto extends PaginationArgs {
  orderBy?: string;
  sortedBy?: string;
  shop_id?: string;
}
