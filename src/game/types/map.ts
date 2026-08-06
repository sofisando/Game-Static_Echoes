export interface TilesetConfig {
  tiledName: string;
  key: string;
  image: string;
}

export interface LayerConfig {
  name: string;
  tilesets: string[];
}

export interface MapConfig {
  key: string;
  json: string;

  tilesets: TilesetConfig[];
  layers: LayerConfig[];
}