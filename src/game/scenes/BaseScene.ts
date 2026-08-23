import { Scene, Input } from "phaser";

import {
  addTilesets,
  createCollisionGroup,
  createLayers,
  createMap,
  createMapObjects,
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
  applyInteractionEffects,
  canInteract,
  createInteractionGroup,
  updateInteractions,
} from "../systems/interaction";
import { DialogueManager, createDialogueManager } from "../systems/dialogue";

import { updateDynamicObjects } from "../systems/dynamicObjects";
import { ObjetoDinamico } from "../types/dynamicObject";

export abstract class BaseScene extends Scene {
  protected jugador!: Phaser.Physics.Arcade.Sprite;
  protected cursores!: Phaser.Types.Input.Keyboard.CursorKeys;

  protected colisiones!: Phaser.Physics.Arcade.StaticGroup;
  protected transiciones!: Phaser.Physics.Arcade.StaticGroup;

  protected transicionActual: ObjetoTransicion | null = null;

  protected teclaF!: Phaser.Input.Keyboard.Key;
  protected textoF!: Phaser.GameObjects.Text;

  protected dialogo!: DialogueBox;
  protected dialogue!: DialogueManager;

  protected interactivos!: Phaser.Physics.Arcade.StaticGroup;
  protected interactivoActual: ObjetoInteractivo | null = null;

  protected objetosDinamicos: ObjetoDinamico[] = [];

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

    const objetosMapa = createMapObjects(this, map, this.mapConfig, "Muebles");
    this.objetosDinamicos = objetosMapa.dinamicos;
    console.log("DINÁMICOS AL CREAR ESCENA:", this.objetosDinamicos);
    console.log("OBJETOS DE MUEBLES:", objetosMapa.sprites);
    console.log("OBJETOS DINÁMICOS:", this.objetosDinamicos);

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

    //==========================
    // DIÁLOGO
    // =========================

    this.dialogo = createDialogueBox(this);

    this.dialogue = createDialogueManager(this.dialogo, (interactivo) => {
      applyInteractionEffects(interactivo);

      updateDynamicObjects(this, map, this.mapConfig, this.objetosDinamicos);
    });

    this.teclaE.on("down", () => {
      if (this.dialogue.isActive()) {
        this.dialogue.advance();
        return;
      }

      if (!this.interactivoActual) {
        return;
      }

      const puedeInteractuar = canInteract(
        this.interactivoActual.interactivo.requirements,
      );

      this.dialogue.start(this.interactivoActual, puedeInteractuar);
    });
  }

  update() {
    if (!this.dialogue.isActive()) {
      updatePlayer(this.jugador, this.cursores);
    }

    this.jugador.setDepth(this.jugador.y + this.jugador.displayHeight / 2);

    this.transicionActual = updateTransitions(
      this,
      this.jugador,
      this.transicionActual,
      this.textoF,
      this.teclaF,
    );

    if (this.dialogue.isActive()) {
      this.textoE.setVisible(false);
    } else {
      this.interactivoActual = updateInteractions(
        this.jugador,
        this.interactivos,
      );

      updateInteractivePrompt(this.textoE, this.interactivoActual);
    }
  }
}
