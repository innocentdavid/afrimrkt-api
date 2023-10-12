import { Attachment } from 'src/common/entities/attachment.entity';
// import { CoreEntity2 } from 'src/common/entities/core.entity2';
import { Product } from 'src/products/entities/product.entity';
import { Type } from 'src/types/entities/type.entity';

// export class Category extends CoreEntity2 {
export class Category {
  id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  slug: string;
  parent?: Category;
  children?: Category[];
  details?: string;
  image?: Attachment;
  icon?: string;
  type?: Type;
  products?: Product[];
  language: string;
  translated_languages: string[];
}
