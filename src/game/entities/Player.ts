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

  jugador.body!.setSize(26, 11);
  jugador.body!.setOffset(48, 120);

  jugador.setScale(0.7);
  jugador.setOrigin(0.5, 0.82);

  jugador.setCollideWorldBounds(true);

  jugador.play("detective_idle");

  return jugador;
}

export function updatePlayer(
  jugador: Phaser.Physics.Arcade.Sprite,
  cursores: Phaser.Types.Input.Keyboard.CursorKeys,
) {
  const velocidad = 120;

  jugador.setVelocity(0);

  if (cursores.left.isDown) {
    jugador.setVelocityX(-velocidad);
    jugador.setFlipX(true);
  } else if (cursores.right.isDown) {
    jugador.setVelocityX(velocidad);
    jugador.setFlipX(false);
  }

  if (cursores.up.isDown) {
    jugador.setVelocityY(-velocidad);
  } else if (cursores.down.isDown) {
    jugador.setVelocityY(velocidad);
  }

  if (jugador.body!.velocity.length() > 0) {
    jugador.play("detective_run", true);
  } else {
    jugador.play("detective_idle", true);
  }
}
