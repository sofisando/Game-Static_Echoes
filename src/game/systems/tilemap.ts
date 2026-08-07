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
    map.createLayer(
      layer.name,
      layer.tilesets.map((nombre) => tilesets.get(nombre)!),
    );
  });
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
// createLayers()
// createCollisionObjects()
// createTransitionObjects()
// findSpawn()
// getTilesets()
