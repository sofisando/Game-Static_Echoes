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
import { cameraConfig } from "../systems/camera";
import { createPlayer, updatePlayer } from "../entities/Player";
import { getSceneData } from "../systems/sceneData";

import { MapConfig } from "../types/map";
import { ObjetoTransicion } from "../types/transition";

import {
  DialogueBox,
  createInteractionPrompt,
  createDialogueBox,
  updateInteractivePrompt,
} from "../systems/ui";

import { ObjetoInteractivo } from "../types/interactive";

import {
  createInteractionGroup,
  updateInteractions,
} from "../systems/interaction";

export abstract class BaseScene extends Scene {
  protected jugador!: Phaser.Physics.Arcade.Sprite;
  protected cursores!: Phaser.Types.Input.Keyboard.CursorKeys;

  protected colisiones!: Phaser.Physics.Arcade.StaticGroup;
  protected transiciones!: Phaser.Physics.Arcade.StaticGroup;

  protected transicionActual: ObjetoTransicion | null = null;

  protected teclaF!: Phaser.Input.Keyboard.Key;
  protected textoF!: Phaser.GameObjects.Text;

  protected dialogo!: DialogueBox;

  protected interactivos!: Phaser.Physics.Arcade.StaticGroup;
  protected interactivoActual: ObjetoInteractivo | null = null;

  protected teclaE!: Phaser.Input.Keyboard.Key;
  protected textoE!: Phaser.GameObjects.Text;

  private mapConfig: MapConfig;

  constructor(sceneKey: string, mapConfig: MapConfig) {
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

    const map = createMap(this, this.mapConfig);

    const tilesets = addTilesets(map, this.mapConfig);

    createLayers(map, tilesets, this.mapConfig);

    // =========================
    // COLISIONES
    // =========================

    this.colisiones = createCollisionGroup(this, map);

    // =========================
    // TRANSICIONES
    // =========================

    this.transiciones = createTransitionGroup(this, map);
    this.interactivos = createInteractionGroup(this, map);

    console.log("INTERACTIVOS CREADOS:", this.interactivos.getChildren());

    // =========================
    // UI
    // =========================

    this.textoF = createInteractionPrompt(this);
    this.textoE = createInteractionPrompt(this);

    this.dialogo = createDialogueBox(this);

    this.teclaF = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.F);
    this.teclaE = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.E);

    // =========================
    // ANIMACIONES
    // =========================

    createPlayerAnimations(this);

    // =========================
    // JUGADOR
    // =========================

    const { spawn = "Spawn" } = getSceneData(this);

    this.jugador = createPlayer(this, map, this.colisiones, spawn);

    // =========================
    // MUNDO
    // =========================

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.jugador.setCollideWorldBounds(true);

    // =========================
    // CÁMARA
    // =========================

    cameraConfig(this, this.jugador, map);

    // =========================
    // INPUT
    // =========================

    this.cursores = this.input.keyboard!.createCursorKeys();

    // =========================
    // TRANSICIONES
    // =========================

    this.physics.add.overlap(this.jugador, this.transiciones, (_, zona) => {
      this.transicionActual = zona as ObjetoTransicion;
    });
  }

  update() {
    updatePlayer(this.jugador, this.cursores);

    this.transicionActual = updateTransitions(
      this,
      this.jugador,
      this.transicionActual,
      this.textoF,
      this.teclaF,
    );

    this.interactivoActual = updateInteractions(
      this.jugador,
      this.interactivos,
    );

    updateInteractivePrompt(this.textoE, this.interactivoActual);
  }
}
