import { Scene } from "phaser";
import { ZonaTransicion } from "../types/transition";
import { getProperty } from "./tiled";

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
