import { Scene, Input } from "phaser";
import { ObjetoTransicion, ZonaTransicion } from "../types/transition";
import {
  addTilesets,
  createCollisionGroup,
  createMap,
  preloadMap,
} from "../systems/tilemap";
import { createTransitionGroup } from "../systems/transitions";
import { createPlayerAnimations } from "../animations/playerAnimations";
import { preloadPlayerAssets } from "../data/personajes/player";
import { createInteractionPrompt } from "../systems/ui";
import { cameraConfig } from "../systems/camera";

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
    preloadPlayerAssets(this);
  }

  create() {
    const map = createMap(this);

    const [PisosYParedes, Living, Decoraciones, Puerta, Librerias] =
      addTilesets(map);

    this.colisiones = this.physics.add.staticGroup();
    this.transiciones = this.physics.add.staticGroup();

    if (!PisosYParedes || !Puerta || !Librerias || !Living || !Decoraciones) {
      console.error("No encontró el tileset");
      return;
    }

    this.colisiones = createCollisionGroup(this, map);

    this.transiciones = createTransitionGroup(this, map);

    this.textoF = createInteractionPrompt(this);

    this.teclaF = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.F);

    map.createLayer("Piso", PisosYParedes);
    map.createLayer("Pared", [PisosYParedes, Living]);
    map.createLayer("Puerta", Puerta);
    map.createLayer("Muebles", [Librerias, Living]);
    map.createLayer("Decoraciones", Decoraciones);

    createPlayerAnimations(this);

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

    
    cameraConfig(this, this.jugador, map);

    this.jugador.play("detective_idle");

    //cursor
    this.cursores = this.input.keyboard!.createCursorKeys();

    //Detectar cuando el jugador entra, de qué no sé
    this.physics.add.overlap(this.jugador, this.transiciones, (_, zona) => {
      this.transicionActual = zona as ObjetoTransicion;
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
