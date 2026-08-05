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

//raaaaaro -------------------------------------
export function createLayers(
    map: Phaser.Tilemaps.Tilemap,
    tilesets: Phaser.Tilemaps.Tileset[]
) {

    map.createLayer("Piso", tilesets[0]);

    map.createLayer("Pared", [
        tilesets[0],
        tilesets[1]
    ]);

    map.createLayer("Puerta", tilesets[3]);

    map.createLayer("Muebles", [
        tilesets[4],
        tilesets[1]
    ]);

    map.createLayer("Decoraciones", tilesets[2]);
}
// ---------------------------------------------------

export function createCollisionGroup(
    scene: Scene,
    map: Phaser.Tilemaps.Tilemap
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
            0
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