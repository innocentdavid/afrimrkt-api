import { CoreEntity } from 'src/common/entities/core.entity';

export class PaymentGateWay extends CoreEntity {
  user_id: string;
  customer_id: string;
  gateway_name: string;
}
