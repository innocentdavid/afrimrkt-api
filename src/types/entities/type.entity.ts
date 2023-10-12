import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity2 } from 'src/common/entities/core.entity2';

export class Type extends CoreEntity2 {
  name: string;
  slug: string;
  image: Attachment;
  icon: string;
  banners?: Banner[];
  promotional_sliders?: Attachment[];
  settings?: TypeSettings;
  language: string;
  translated_languages: string[];
}

export class Banner {
  id: string;
  title?: string;
  description?: string;
  image: Attachment;
}

export class TypeSettings {
  isHome: boolean;
  layoutType: string;
  productCard: string;
}
