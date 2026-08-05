import { PropiedadTiled } from "../types/tiled";

export function getProperty(
  obj: Phaser.Types.Tilemaps.TiledObject,
  nombre: string,
): unknown {
  const propiedades = (obj.properties ?? []) as PropiedadTiled[];

  return propiedades.find((p) => p.name === nombre)?.value;
}
