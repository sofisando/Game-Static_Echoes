import { Scene, Input } from "phaser";

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

import { MapConfig } from "../types/map";
import { ObjetoTransicion } from "../types/transition";

export abstract class BaseScene extends Scene {
  protected jugador!: Phaser.Physics.Arcade.Sprite;
  protected cursores!: Phaser.Types.Input.Keyboard.CursorKeys;

  protected colisiones!: Phaser.Physics.Arcade.StaticGroup;
  protected transiciones!: Phaser.Physics.Arcade.StaticGroup;

  protected transicionActual: ObjetoTransicion | null = null;

  protected teclaF!: Phaser.Input.Keyboard.Key;
  protected textoF!: Phaser.GameObjects.Text;

  private mapConfig: MapConfig;

  constructor(
    sceneKey: string,
    mapConfig: MapConfig,
  ) {
    super(sceneKey);

    this.mapConfig = mapConfig;
  }

  preload() {
    preloadMap(this, this.mapConfig);
    preloadPlayerAssets(this);
  }

  create() {
    // =========================
    // MAPA
    // =========================

    const map = createMap(
      this,
      this.mapConfig,
    );

    const tilesets = addTilesets(
      map,
      this.mapConfig,
    );

    createLayers(
      map,
      tilesets,
      this.mapConfig,
    );

    // =========================
    // COLISIONES
    // =========================

    this.colisiones = createCollisionGroup(
      this,
      map,
    );

    // =========================
    // TRANSICIONES
    // =========================

    this.transiciones = createTransitionGroup(
      this,
      map,
    );

    // =========================
    // UI
    // =========================

    this.textoF = createInteractionPrompt(this);

    this.teclaF = this.input.keyboard!.addKey(
      Input.Keyboard.KeyCodes.F,
    );

    // =========================
    // ANIMACIONES
    // =========================

    createPlayerAnimations(this);

    // =========================
    // JUGADOR
    // =========================

    const { spawn = "Spawn" } = getSceneData(this);

    this.jugador = createPlayer(
      this,
      map,
      this.colisiones,
      spawn,
    );

    // =========================
    // MUNDO
    // =========================

    this.physics.world.setBounds(
      0,
      0,
      map.widthInPixels,
      map.heightInPixels,
    );

    this.jugador.setCollideWorldBounds(true);

    // =========================
    // CÁMARA
    // =========================

    cameraConfig(
      this,
      this.jugador,
      map,
    );

    // =========================
    // INPUT
    // =========================

    this.cursores =
      this.input.keyboard!.createCursorKeys();

    // =========================
    // TRANSICIONES
    // =========================

    this.physics.add.overlap(
      this.jugador,
      this.transiciones,
      (_, zona) => {
        this.transicionActual =
          zona as ObjetoTransicion;
      },
    );
  }

  update() {
    updatePlayer(
      this.jugador,
      this.cursores,
    );

    updateTransitions(
      this,
      this.jugador,
      this.transicionActual,
      this.textoF,
      this.teclaF,
    );
  }
}