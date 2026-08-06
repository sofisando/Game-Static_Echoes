import { Scene } from "phaser";

export function createPlayer(
  scene: Scene,
  map: Phaser.Tilemaps.Tilemap,
  colisiones: Phaser.Physics.Arcade.StaticGroup,
  spawnName = "Spawn",
): Phaser.Physics.Arcade.Sprite {
  const spawnLayer = map.getObjectLayer("Spawn");

  if (!spawnLayer) {
    throw new Error("No existe la capa Spawn");
  }

  const spawn =
    spawnLayer.objects.find((o) => o.name === spawnName) ??
    spawnLayer.objects[0];

  if (!spawn) {
    throw new Error("No existe ningún Spawn");
  }

  const jugador = scene.physics.add.sprite(
    spawn.x!,
    spawn.y!,
    "player_idle",
    0,
  );

  scene.physics.add.collider(jugador, colisiones);

  jugador.body!.setSize(26, 10);
  jugador.body!.setOffset(50, 120);

  jugador.setScale(0.6);
  jugador.setOrigin(0.5, 0.82);

  jugador.setCollideWorldBounds(true);

  jugador.play("detective_idle");

  return jugador;
}
