/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Banner, TypeSettings } from '../entities/type.entity';


@Schema({
  timestamps: true,
})

export class Type {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  created_at: Date;

  @Prop({ required: true })
  updated_at: Date;

  @Prop()
  name: string;

  @Prop()
  slug: string;

  @Prop()
  image: Attachment;

  @Prop()
  icon: string;

  @Prop()
  banners?: Banner[];

  @Prop()
  promotional_sliders?: Attachment[];

  @Prop()
  settings?: TypeSettings;

  @Prop()
  language: string;

  @Prop()
  translated_languages: string[];
}

export const TypeSchema = SchemaFactory.createForClass(Type);