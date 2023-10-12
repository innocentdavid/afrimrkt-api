/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Type } from 'src/types/entities/type.entity';
import { Product } from 'src/products/entities/product.entity';
// import { CoreEntity2 } from 'src/common/entities/core.entity2';

@Schema({
  timestamps: true,
})
// export class Category extends CoreEntity2 {
export class Category {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  created_at: Date;

  @Prop({ required: true })
  updated_at: Date;

  @Prop({ required: true })
  name: string;

  // @Prop({ required: true, unique: true })
  @Prop()
  slug: string;

  // @Prop({ type: 'ObjectId', ref: 'Category' })
  @Prop({ type: 'ObjectId', ref: 'Category' })
  parent?: Category;

  // @Prop([{ type: 'ObjectId', ref: 'Category' }])
  @Prop()
  children?: Category[];

  @Prop()
  details?: string;

  // @Prop({ type: 'ObjectId', ref: 'Attachment' })
  @Prop()
  image?: Attachment;

  @Prop()
  icon?: string;

  // @Prop({ type: Type, ref: 'Type' })
  @Prop()
  type?: Type;

  // @Prop([{ type: 'ObjectId', ref: 'Product' }])
  @Prop()
  products?: Product[];

  // @Prop({ required: true })
  @Prop()
  language: string;

  // @Prop([String])
  @Prop()
  translated_languages: string[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);