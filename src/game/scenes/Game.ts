import { Scene, Input } from "phaser";
import { ZonaTransicion } from "../types/transition";
import { getProperty } from "../systems/tiled";
import { addTilesets, createMap, preloadMap } from "../systems/tilemap";

export class GameScene extends Scene {
  constructor() {
    super("Game");
  }
  private jugador!: Phaser.Physics.Arcade.Sprite;
  private cursores!: Phaser.Types.Input.Keyboard.CursorKeys;
  private colisiones!: Phaser.Physics.Arcade.StaticGroup;
  private transiciones!: Phaser.Physics.Arcade.StaticGroup;
  private transicionActual:
    | (Phaser.GameObjects.Rectangle & {
        transicion: ZonaTransicion;
      })
    | null = null;

  private teclaF!: Phaser.Input.Keyboard.Key;
  private textoF!: Phaser.GameObjects.Text;

  preload() {
    preloadMap(this);
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
    const map = createMap(this);

    const [PisosYParedes, Living, Decoraciones, Puerta, Librerias] =
      addTilesets(map);

    this.colisiones = this.physics.add.staticGroup();
    this.transiciones = this.physics.add.staticGroup();

    const capaColisiones = map.getObjectLayer("Colisiones");

    if (!PisosYParedes || !Puerta || !Librerias || !Living || !Decoraciones) {
      console.error("No encontró el tileset");
      return;
    }

    if (capaColisiones) {
      capaColisiones.objects.forEach((obj) => {
        const rect = this.add.rectangle(
          obj.x! + obj.width! / 2,
          obj.y! + obj.height! / 2,
          obj.width!,
          obj.height!,
          0xff0000,
          0,
        );
        this.physics.add.existing(rect, true);
        this.colisiones.add(rect);
      });
    }

    const capaTransiciones = map.getObjectLayer("Transiciones");

    if (capaTransiciones) {
      capaTransiciones.objects.forEach((obj) => {
        const zona = this.add.rectangle(
          obj.x! + obj.width! / 2,
          obj.y! + obj.height! / 2,
          obj.width!,
          obj.height!,
          0x00ff00,
          0, // invisible
        );

        this.physics.add.existing(zona, true);

        const datos: ZonaTransicion = {
          goTo: getProperty(obj, "goTo") as string,
          spawn: getProperty(obj, "spawn") as string,
        };

        (
          zona as Phaser.GameObjects.Rectangle & { transicion: ZonaTransicion }
        ).transicion = datos;

        this.transiciones.add(zona);
      });
    }

    this.textoF = this.add.text(0, 0, "[F]", {
      fontSize: "14px",
      backgroundColor: "#000",
      color: "#ffffff",
      padding: { x: 5, y: 2 },
    });

    this.textoF.setVisible(false);
    this.textoF.setDepth(9999);

    this.teclaF = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.F);

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
    const spawnLayer = map.getObjectLayer("Spawn");

    if (spawnLayer && spawnLayer.objects.length > 0) {
      const spawn = spawnLayer.objects[0];

      this.jugador = this.physics.add.sprite(
        spawn.x!,
        spawn.y!,
        "player_idle",
        0,
      );
    }
    this.physics.add.collider(this.jugador, this.colisiones);
    this.jugador.body!.setSize(26, 10);
    this.jugador.body!.setOffset(50, 120);
    this.jugador.setScale(0.6);
    this.jugador.setOrigin(0.5, 0.82);

    // Configurar límites del mundo
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.jugador.setCollideWorldBounds(true);

    // Configurar cámara
    this.cameras.main.setZoom(3);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.jugador);

    this.jugador.play("detective_idle");

    //cursor
    this.cursores = this.input.keyboard!.createCursorKeys();

    //Detectar cuando el jugador entra, de qué no sé
    this.physics.add.overlap(this.jugador, this.transiciones, (_, zona) => {
      this.transicionActual = zona as Phaser.GameObjects.Rectangle & {
        transicion: ZonaTransicion;
      };
    });
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

    if (this.transicionActual) {
      this.textoF.setVisible(true);

      this.textoF.setPosition(this.jugador.x, this.jugador.y - 40);
    } else {
      this.textoF.setVisible(false);
    }

    if (this.transicionActual && Input.Keyboard.JustDown(this.teclaF)) {
      this.scene.start(
        this.transicionActual.transicion.goTo, //me dice que la propiedad transicion no existe en el tipo never
        {
          spawn: this.transicionActual.transicion.spawn,
        },
      );
    }
  }
}
