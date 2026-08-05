import { Scene } from "phaser";
import { oficinaConfig } from "../data/maps/oficina";

export function preloadMap(scene: Scene) {
  scene.load.tilemapTiledJSON(
    oficinaConfig.key,
    oficinaConfig.json
  );

  oficinaConfig.tilesets.forEach((tileset) => {
    scene.load.image(tileset.key, tileset.image);
  });
}

export function createMap(scene: Scene) {
  return scene.make.tilemap({
    key: oficinaConfig.key,
  });
}

export function addTilesets(map: Phaser.Tilemaps.Tilemap) {
  return oficinaConfig.tilesets.map((tileset) =>
    map.addTilesetImage(
      tileset.tiledName,
      tileset.key
    )
  );
}
// createLayers()
// createCollisionObjects()
// createTransitionObjects()
// findSpawn()
// getTilesets()