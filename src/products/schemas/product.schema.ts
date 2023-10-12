/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';
import { Type } from 'src/types/entities/type.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Attachment } from 'src/common/entities/attachment.entity';

enum ProductStatus {
  PUBLISH = 'publish',
  DRAFT = 'draft',
}

enum ProductType {
  SIMPLE = 'simple',
  VARIABLE = 'variable',
}

class VariationOption {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  value: string;
}

class Variation {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  is_disable: boolean;

  @Prop()
  sale_price?: number;

  @Prop({ required: true })
  quantity: number;

  @Prop([VariationOption])
  options: VariationOption[];
}

class OrderProductPivot {
  @Prop()
  variation_option_id?: number;

  @Prop({ required: true })
  order_quantity: number;

  @Prop({ required: true })
  unit_price: number;

  @Prop({ required: true })
  subtotal: number;
}

@Schema({
  timestamps: true,
})
export class Product {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  created_at: Date;

  @Prop({ required: true })
  updated_at: Date;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ type: Type, required: true })
  type: Type;

  @Prop({ required: true })
  type_id: string;

  @Prop()
  product_type: ProductType;

  // @Prop([{ type: Category, ref: 'Category' }])
  @Prop()
  categories: Category[];

  // @Prop([{ type: Tag, ref: 'Tag' }])
  @Prop()
  tags?: Tag[];

  @Prop()
  variations?: AttributeValue[];

  // @Prop([Variation])
  @Prop()
  variation_options?: Variation[];

  // @Prop({ type: OrderProductPivot })
  @Prop()
  pivot?: OrderProductPivot;

  // @Prop([{ type: Order, ref: 'Order' }])
  @Prop()
  orders?: Order[];

  @Prop({ type: Shop, ref: 'Shop', required: true })
  shop: Shop;

  @Prop({ required: true })
  shop_id: string;

  // @Prop([{ type: Product, ref: 'Product' }])
  @Prop()
  related_products?: Product[];

  @Prop()
  description: string;

  @Prop()
  in_stock: boolean;

  @Prop()
  is_taxable: boolean;

  @Prop()
  sale_price?: number;

  @Prop()
  max_price?: number;

  @Prop()
  min_price?: number;

  @Prop()
  sku?: string;

  @Prop()
  gallery?: Attachment[];

  @Prop()
  image?: Attachment;

  @Prop()
  status: ProductStatus;

  @Prop()
  height?: string;

  @Prop()
  length?: string;

  @Prop()
  width?: string;

  @Prop()
  price?: number;

  @Prop()
  quantity: number;

  @Prop()
  weight?: number;

  @Prop()
  unit: string;

  @Prop()
  ratings: number;

  @Prop()
  in_wishlist: boolean;

  // @Prop({ type: [Review], ref: 'Review' })
  @Prop()
  my_review?: Review[];

  @Prop()
  language?: string;

  @Prop([String])
  translated_languages?: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
