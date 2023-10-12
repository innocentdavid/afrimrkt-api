import { Type } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';

export class CoreEntity2 {
  id?: string = uuidv4();
  @Type(() => Date)
  created_at?: Date = new Date();
  @Type(() => Date)
  updated_at?: Date = new Date();
}
