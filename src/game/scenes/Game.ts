import { Scene, Input } from "phaser";
import { ObjetoTransicion, ZonaTransicion } from "../types/transition";
import {
  addTilesets,
  createCollisionGroup,
  createLayers,
  createMap,
  preloadMap,
} from "../systems/tilemap";
import {
  createTransitionGroup,
  updateTransitions,
} from "../systems/transitions";
import { createPlayerAnimations } from "../animations/playerAnimations";
import { preloadPlayerAssets } from "../data/personajes/player";
import { createInteractionPrompt } from "../systems/ui";
import { cameraConfig } from "../systems/camera";
import { createPlayer, updatePlayer } from "../entities/Player";
import { getSceneData } from "../systems/sceneData";
import { oficinaConfig } from "../data/maps/oficina";

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
    preloadMap(this, oficinaConfig);
    preloadPlayerAssets(this);
  }

  create() {
    const map = createMap(this, oficinaConfig);

    const tilesets = addTilesets(map, oficinaConfig);

    createLayers(map, tilesets, oficinaConfig);
    this.colisiones = this.physics.add.staticGroup();
    this.transiciones = this.physics.add.staticGroup();

    this.colisiones = createCollisionGroup(this, map);

    this.transiciones = createTransitionGroup(this, map);

    this.textoF = createInteractionPrompt(this);

    this.teclaF = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.F);

    createPlayerAnimations(this);
    //definimos el punto de aparición del jugador y lo creamos
    const { spawn = "Spawn" } = getSceneData(this);
    this.jugador = createPlayer(this, map, this.colisiones, spawn);

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
    updatePlayer(this.jugador, this.cursores);

    updateTransitions(
      this,
      this.jugador,
      this.transicionActual,
      this.textoF,
      this.teclaF,
    );
  }
}
