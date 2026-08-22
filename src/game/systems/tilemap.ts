import { Scene } from "phaser";
import { MapConfig } from "../types/map";

export function preloadMap(scene: Phaser.Scene, config: MapConfig) {
  scene.load.tilemapTiledJSON(config.key, config.json);

  config.tilesets.forEach((tile) => {
    scene.load.image(tile.key, tile.image);
  });
}

export function createMap(scene: Phaser.Scene, config: MapConfig) {
  return scene.make.tilemap({
    key: config.key,
  });
}

export function addTilesets(map: Phaser.Tilemaps.Tilemap, config: MapConfig) {
  const resultado = new Map<string, Phaser.Tilemaps.Tileset>();

  config.tilesets.forEach((tile) => {
    const ts = map.addTilesetImage(tile.tiledName, tile.key);

    if (ts) {
      resultado.set(tile.key, ts);
    }
  });

  return resultado;
}

export function createLayers(
  map: Phaser.Tilemaps.Tilemap,
  tilesets: Map<string, Phaser.Tilemaps.Tileset>,
  config: MapConfig,
) {
  config.layers.forEach((layer) => {
    const tileLayer = map.createLayer(
      layer.name,
      layer.tilesets.map((nombre) => tilesets.get(nombre)!),
    );

    tileLayer?.setDepth(0);
  });
}

// ======================================================
// OBJETOS GRÁFICOS DE TILED
// ======================================================

export function createMapObjects(
  scene: Phaser.Scene,
  map: Phaser.Tilemaps.Tilemap,
  config: MapConfig,
  objectLayerName: string,
) {
  const layer = map.getObjectLayer(objectLayerName);

  if (!layer) {
    console.warn(`No existe la capa de objetos: ${objectLayerName}`);
    return [];
  }

  const sprites: Phaser.GameObjects.Sprite[] = [];

  layer.objects.forEach((obj) => {
    if (!obj.gid) {
      return;
    }

    const gid = obj.gid;

    // Buscar qué tileset contiene este GID
    let tilesetEncontrado: Phaser.Tilemaps.Tileset | undefined;
    let tilesetConfig:
      | {
          tiledName: string;
          key: string;
          image: string;
        }
      | undefined;

    for (let i = 0; i < map.tilesets.length; i++) {
      const ts = map.tilesets[i];

      if (gid >= ts.firstgid && gid < ts.firstgid + ts.total) {
        tilesetEncontrado = ts;

        tilesetConfig = config.tilesets.find((t) => t.tiledName === ts.name);

        break;
      }
    }

    if (!tilesetEncontrado || !tilesetConfig) {
      console.warn(
        `No se encontró tileset para GID ${gid} en objeto "${obj.name}"`,
      );
      return;
    }

    const tileId = gid - tilesetEncontrado.firstgid;

    const tileWidth = tilesetEncontrado.tileWidth;
    const tileHeight = tilesetEncontrado.tileHeight;

    const columns = tilesetEncontrado.columns;

    if (!columns || !tileWidth || !tileHeight) {
      console.warn(
        `El tileset "${tilesetEncontrado.name}" no tiene información suficiente.`,
      );
      return;
    }

    const column = tileId % columns;
    const row = Math.floor(tileId / columns);

    const margin = tilesetEncontrado.tileMargin;
    const spacing = tilesetEncontrado.tileSpacing;

    const x = margin + column * (tileWidth + spacing);

    const y = margin + row * (tileHeight + spacing);

    const textureKey = tilesetConfig.key;

    const texture = scene.textures.get(textureKey);

    if (!texture) {
      console.warn(
        `No se encontró la textura "${textureKey}" para "${obj.name}"`,
      );
      return;
    }

    // Crear un frame temporal con el recorte del tile
    const frameName = `obj-${objectLayerName}-${obj.id}`;

    if (!texture.has(frameName)) {
      texture.add(frameName, 0, x, y, tileWidth, tileHeight);
    }

    const sprite = scene.add.sprite(
      obj.x! + tileWidth / 2,
      obj.y! - tileHeight / 2,
      textureKey,
      frameName,
    );

    sprite.setName(obj.name || "");

    // Y-sort
    sprite.setDepth(obj.y!);

    if (obj.rotation) {
      sprite.setRotation(Phaser.Math.DegToRad(obj.rotation));
    }

    sprites.push(sprite);
  });

  return sprites;
}

//-----------------------------------------------

export function createCollisionGroup(
  scene: Scene,
  map: Phaser.Tilemaps.Tilemap,
) {
  const grupo = scene.physics.add.staticGroup();

  const layer = map.getObjectLayer("Colisiones");

  if (!layer) return grupo;

  layer.objects.forEach((obj) => {
    const rect = scene.add.rectangle(
      obj.x! + obj.width! / 2,
      obj.y! + obj.height! / 2,
      obj.width!,
      obj.height!,
      0xff0000,
      0,
    );

    scene.physics.add.existing(rect, true);

    grupo.add(rect);
  });

  return grupo;
}
