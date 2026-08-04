import { Scene } from "phaser";

export class GameScene extends Scene {
  constructor() {
    super("Game");
  }
  private jugador!: Phaser.Physics.Arcade.Sprite;
  private cursores!: Phaser.Types.Input.Keyboard.CursorKeys;

  preload() {
    this.load.tilemapTiledJSON(
      "oficina",
      "assets/tiled/maps/oficina/Oficina.json",
    );
    this.load.image(
      "PisosYParedes",
      "assets/tiled/tiles/interior/floorswalls.png",
    );
    this.load.image("Living", "assets/tiled/tiles/interior/livingroom.png");
    this.load.image(
      "Decoraciones",
      "assets/tiled/tiles/interior/decorations.png",
    );
    this.load.image(
      "Puerta",
      "assets/tiled/tiles/interior/doorswindowsstairs.png",
    );
    this.load.image("Librerias", "assets/tiled/tiles/interior/librerias.png");

    //personaje
    this.load.spritesheet(
      "player_idle",
      "assets/tiled/tiles/personajes/jugador/Idle_2.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      },
    );

    this.load.spritesheet(
      "player_run",
      "assets/tiled/tiles/personajes/jugador/Run.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      },
    );
  }

  create() {
    const map = this.make.tilemap({
      key: "oficina",
    });
    // this.cameras.main.setZoom(3);
    // this.cameras.main.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);

    console.log(map);

    const PisosYParedes = map.addTilesetImage("PisosYParedes", "PisosYParedes");
    const Puerta = map.addTilesetImage("Puerta", "Puerta");
    const Librerias = map.addTilesetImage("Librerias", "Librerias");
    const Living = map.addTilesetImage("Living", "Living");
    const Decoraciones = map.addTilesetImage("Decoraciones", "Decoraciones");

    if (!PisosYParedes || !Puerta || !Librerias || !Living || !Decoraciones) {
      console.error("No encontró el tileset");
      return;
    }

    map.createLayer("Piso", PisosYParedes);
    map.createLayer("Pared", [PisosYParedes, Living]);
    map.createLayer("Puerta", Puerta);
    map.createLayer("Muebles", [Librerias, Living]);
    map.createLayer("Decoraciones", Decoraciones);


    //animaciones personaje
    this.anims.create({
      key: "detective_idle",
      frames: this.anims.generateFrameNumbers("player_idle", {
        start: 0,
        end: 12,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: "detective_run",
      frames: this.anims.generateFrameNumbers("player_run", {
        start: 0,
        end: 9,
      }),
      frameRate: 14,
      repeat: -1,
    });

    //personaje
    this.jugador = this.physics.add.sprite(120, 120, "player_idle", 0);
    this.jugador.setScale(0.6);
    this.jugador.setOrigin(0.5, 0.82);

    // Configurar cámara
    this.cameras.main.setZoom(3);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.jugador);

    this.jugador.play("detective_idle");

    //cursor
    this.cursores = this.input.keyboard!.createCursorKeys();
  }

  update() {
    const velocidad = 120;

    this.jugador.setVelocity(0);

    if (this.cursores.left.isDown) {
      this.jugador.setVelocityX(-velocidad);
      this.jugador.setFlipX(true);
    } else if (this.cursores.right.isDown) {
      this.jugador.setVelocityX(velocidad);
      this.jugador.setFlipX(false);
    }

    if (this.cursores.up.isDown) {
      this.jugador.setVelocityY(-velocidad);
    } else if (this.cursores.down.isDown) {
      this.jugador.setVelocityY(velocidad);
    }

    if (this.jugador.body!.velocity.length() > 0) {
      this.jugador.play("detective_run", true);
    } else {
      this.jugador.play("detective_idle", true);
    }

    this.jugador.setDepth(this.jugador.y);
  }
}
