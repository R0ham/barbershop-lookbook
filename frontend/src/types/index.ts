export interface Hairstyle {
  id: string;
  name: string;
  category: string;
  length: string;
  texture: string;
  face_shapes: string[];
  style_type: string;
  pose: string;
  image_url: string;
  image_data?: Buffer;
  description: string;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Filters {
  categories: string[];
  lengths: string[];
  textures: string[];
  face_shapes: string[];
  style_types: string[];
  poses: string[];
}
