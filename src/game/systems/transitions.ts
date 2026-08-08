import { Scene, Input } from "phaser";
import { ObjetoTransicion, ZonaTransicion } from "../types/transition";
import { getProperty } from "./tiled";
import { updateInteractionPrompt } from "./ui";

export function createTransitionGroup(
  scene: Scene,
  map: Phaser.Tilemaps.Tilemap,
) {
  const grupo = scene.physics.add.staticGroup();
  const capa = map.getObjectLayer("Transiciones");

  if (!capa) {
    return grupo;
  }

  capa.objects.forEach((obj) => {
    const zona = scene.add.rectangle(
      obj.x! + obj.width! / 2,
      obj.y! + obj.height! / 2,
      obj.width!,
      obj.height!,
      0x00ff00,
      0,
    );

    scene.physics.add.existing(zona, true);

    const datos: ZonaTransicion = {
      goTo: getProperty(obj, "goTo") as string,
      spawn: getProperty(obj, "spawn") as string,
      prompt: getProperty(obj, "prompt") as string | undefined,
    };

    (
      zona as Phaser.GameObjects.Rectangle & {
        transicion: ZonaTransicion;
      }
    ).transicion = datos;

    grupo.add(zona);
  });

  return grupo;
}

export function updateTransitions(
  scene: Scene,
  transicionActual: ObjetoTransicion | null,
  textoF: Phaser.GameObjects.Text,
  teclaF: Phaser.Input.Keyboard.Key,
) {
  updateInteractionPrompt(
    textoF,
    transicionActual,
  );

  if (
    transicionActual &&
    Input.Keyboard.JustDown(teclaF)
  ) {
    scene.scene.start(
      transicionActual.transicion.goTo,
      {
        spawn: transicionActual.transicion.spawn,
      },
    );
  }
}
