import { Math as PhaserMath, Physics, Scene, Types } from "phaser";
import {
  DatosInteractivo,
  ObjetoInteractivo,
  RequisitosInteraccion,
  EfectosInteraccion,
} from "../types/interactive";

import {
  addClue,
  addFlag,
  addItem,
  addInteraction,
  hasClue,
  hasFlag,
  hasItem,
} from "../data/bucleState";

function obtenerPropiedad(
  propiedades: Types.Tilemaps.TiledObject["properties"],
  nombre: string,
): unknown {
  if (!propiedades) return undefined;

  const propiedad = propiedades.find(
    (prop: { name: string; type: string; value: unknown }) =>
      prop.name === nombre,
  );

  return propiedad?.value;
}

function obtenerArrayPropiedad(
  propiedades: Types.Tilemaps.TiledObject["properties"],
  nombre: string,
): string[] | undefined {
  const valor = obtenerPropiedad(propiedades, nombre);

  if (typeof valor !== "string") {
    return undefined;
  }

  return valor
    .split("|")
    .map((texto) => texto.trim())
    .filter(Boolean);
}

function obtenerRequisitos(
  propiedades: Types.Tilemaps.TiledObject["properties"],
): RequisitosInteraccion | undefined {
  const items = obtenerArrayPropiedad(propiedades, "requirements_items");

  const clues = obtenerArrayPropiedad(propiedades, "requirements_clues");

  const flags = obtenerArrayPropiedad(propiedades, "requirements_flags");

  if (!items && !clues && !flags) {
    return undefined;
  }

  return {
    items,
    clues,
    flags,
  };
}
function obtenerEfectos(
  propiedades: Types.Tilemaps.TiledObject["properties"],
): EfectosInteraccion | undefined {
  const items = obtenerArrayPropiedad(propiedades, "effects_items");

  const clues = obtenerArrayPropiedad(propiedades, "effects_clues");

  const flags = obtenerArrayPropiedad(propiedades, "effects_flags");

  if (!items && !clues && !flags) {
    return undefined;
  }

  return {
    items,
    clues,
    flags,
  };
}

export function createInteractionGroup(
  scene: Scene,
  map: Phaser.Tilemaps.Tilemap,
): Phaser.Physics.Arcade.StaticGroup {
  const grupo = scene.physics.add.staticGroup();

  const capa = map.getObjectLayer("Interactivos");

  if (!capa) {
    console.warn("No se encontró la capa Interactivos");
    return grupo;
  }

  for (const objeto of capa.objects) {
    const interactionId = obtenerPropiedad(
      objeto.properties,
      "interactionId",
    ) as string | undefined;

    const tipo = obtenerPropiedad(objeto.properties, "tipo") as
      | DatosInteractivo["tipo"]
      | undefined;

    if (!interactionId || !tipo) {
      console.warn(
        `Objeto interactivo "${objeto.name}" sin interactionId o tipo`,
      );

      continue;
    }

    const datos: DatosInteractivo = {
      interactionId,
      tipo,

      prompt: obtenerPropiedad(objeto.properties, "prompt") as
        | string
        | undefined,

      dialogo: obtenerArrayPropiedad(objeto.properties, "dialogo"),

      dialogoLocked: obtenerArrayPropiedad(objeto.properties, "dialogoLocked"),

      requirements: obtenerRequisitos(objeto.properties),

      effects: obtenerEfectos(objeto.properties),

      once: obtenerPropiedad(objeto.properties, "once") as boolean | undefined,
    };

    const rect = scene.add.rectangle(
      objeto.x! + objeto.width! / 2,
      objeto.y! + objeto.height! / 2,
      objeto.width,
      objeto.height,
      0xff0000,
      0,
    ) as ObjetoInteractivo;

    rect.interactivo = datos;

    grupo.add(rect);
  }

  return grupo;
}

export function updateInteractions(
  jugador: Physics.Arcade.Sprite,
  interactivos: Physics.Arcade.StaticGroup,
): ObjetoInteractivo | null {
  let interactivoCercano: ObjetoInteractivo | null = null;

  let distanciaMinima = Infinity;

  for (const objeto of interactivos.getChildren()) {
    const interactivo = objeto as ObjetoInteractivo;

    const distancia = PhaserMath.Distance.Between(
      jugador.x,
      jugador.y,
      interactivo.x,
      interactivo.y,
    );

    if (distancia < distanciaMinima) {
      distanciaMinima = distancia;
      interactivoCercano = interactivo;
    }
  }

  const DISTANCIA_INTERACCION = 25;

  if (distanciaMinima <= DISTANCIA_INTERACCION) {
    return interactivoCercano;
  }

  return null;
}

export function canInteract(requirements?: RequisitosInteraccion): boolean {
  if (!requirements) return true;

  if (requirements.items) {
    for (const item of requirements.items) {
      if (!hasItem(item)) return false;
    }
  }

  if (requirements.clues) {
    for (const clue of requirements.clues) {
      if (!hasClue(clue)) return false;
    }
  }

  if (requirements.flags) {
    for (const flag of requirements.flags) {
      if (!hasFlag(flag)) return false;
    }
  }

  return true;
}

export function applyInteractionEffects(interaction: ObjetoInteractivo): void {
  const datos = interaction.interactivo;

  if (!datos.effects) {
    return;
  }

  const { items, clues, flags } = datos.effects;

  items?.forEach((item) => {
    addItem(item);
  });

  clues?.forEach((clue) => {
    addClue(clue);
  });

  flags?.forEach((flag) => {
    console.log("AGREGANDO FLAG:", flag);

    addFlag(flag);

    console.log("FLAG EXISTE:", hasFlag(flag));
  });

  addInteraction(datos.interactionId);
}
