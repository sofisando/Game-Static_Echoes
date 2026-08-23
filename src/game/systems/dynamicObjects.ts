import { hasFlag } from "../data/bucleState";
import { ObjetoDinamico } from "../types/dynamicObject";
import { MapConfig } from "../types/map";

export function updateDynamicObjects(
  scene: Phaser.Scene,
  map: Phaser.Tilemaps.Tilemap,
  config: MapConfig,
  dinamicos: ObjetoDinamico[],
): void {


  console.log("ACTUALIZANDO DINÁMICOS:", dinamicos);

  
  for (const objeto of dinamicos) {
    const activo = hasFlag(objeto.stateFlag);

    console.log(
      "DINÁMICO:",
      objeto.dynamicId,
      "stateFlag:",
      objeto.stateFlag,
      "activo:",
      activo,
    );

    const gid = activo ? objeto.trueGid : objeto.falseGid;

    updateDynamicObjectFrame(scene, map, config, objeto, gid);
  }
}

function updateDynamicObjectFrame(
  scene: Phaser.Scene,
  map: Phaser.Tilemaps.Tilemap,
  config: MapConfig,
  objeto: ObjetoDinamico,
  gid: number,
): void {
  let tilesetEncontrado: Phaser.Tilemaps.Tileset | undefined;

  let tilesetConfig:
    | {
        tiledName: string;
        key: string;
        image: string;
      }
    | undefined;

  for (const ts of map.tilesets) {
    if (gid >= ts.firstgid && gid < ts.firstgid + ts.total) {
      tilesetEncontrado = ts;

      tilesetConfig = config.tilesets.find((t) => t.tiledName === ts.name);

      break;
    }
  }

  if (!tilesetEncontrado || !tilesetConfig) {
    console.warn(`No se encontró tileset para GID ${gid}`);

    return;
  }

  const tileId = gid - tilesetEncontrado.firstgid;

  const tileWidth = tilesetEncontrado.tileWidth;

  const tileHeight = tilesetEncontrado.tileHeight;

  const columns = tilesetEncontrado.columns;

  if (!columns || !tileWidth || !tileHeight) {
    return;
  }

  const column = tileId % columns;

  const row = Math.floor(tileId / columns);

  const margin = tilesetEncontrado.tileMargin;

  const spacing = tilesetEncontrado.tileSpacing;

  const x = margin + column * (tileWidth + spacing);

  const y = margin + row * (tileHeight + spacing);

  const texture = scene.textures.get(tilesetConfig.key);

  if (!texture) {
    return;
  }

  const frameName = `dynamic-${objeto.dynamicId}-${gid}`;

  if (!texture.has(frameName)) {
    texture.add(frameName, 0, x, y, tileWidth, tileHeight);
  }

  objeto.sprite.setTexture(tilesetConfig.key, frameName);
}
