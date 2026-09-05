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

    updateDynamicObjectFrame(scene, map, config, objeto, gid!);
    console.log("DATOS POSICIÓN:", {
      dynamicId: objeto.dynamicId,
      activo,
      falseX: objeto.falseX,
      trueX: objeto.trueX,
    });
    updateDynamicObjectPosition(objeto, activo);
    console.log("despues de la posicion");
    updateDynamicObjectVisibility(objeto, activo);
  }
}

function updateDynamicObjectPosition(
  objeto: ObjetoDinamico,
  activo: boolean,
): void {
  console.log(
    "entramos en el cambio de posición, la posicion inicial es:",
    objeto.sprite.x,
  );
  const x = activo ? objeto.trueX : objeto.falseX;
  console.log("la posicion a cambiar es:", x);
  //me devuelve undefined

  if (x !== undefined) {
    console.log("entró al if, cambia posicion a:", x);
    objeto.sprite.x = x;
  }
  console.log("posicion actualizada a:", objeto.sprite.x);
  objeto.sprite.setDepth(
    objeto.sprite.y + objeto.sprite.displayHeight * (1 - objeto.sprite.originY),
  );
  console.log("profundidad actualizada a:", objeto.sprite.depth);
}

function updateDynamicObjectVisibility(
  objeto: ObjetoDinamico,
  activo: boolean,
): void {
  const visible =
    activo && objeto.desaparece //si hay flag se pone false osea que desaparece sino sige apareciendo
      ? false
      : true;

  objeto.sprite.setVisible(visible);
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
      console.log("salgo en el break");
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
  objeto.sprite.setDepth(
    objeto.sprite.y + objeto.sprite.displayHeight * (1 - objeto.sprite.originY),
  );
}
