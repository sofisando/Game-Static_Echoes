import { DialogueBox } from "./ui";
import { ObjetoInteractivo } from "../types/interactive";

export interface DialogueState {
  activo: boolean;
  lineas: string[];
  indice: number;
}

export interface DialogueManager {
  start: (interactivo: ObjetoInteractivo, puedeInteractuar: boolean) => void;

  advance: () => void;
  close: () => void;
  isActive: () => boolean;
}

export function createDialogueManager(
  box: DialogueBox,
  onComplete: (interactivo: ObjetoInteractivo) => void,
): DialogueManager {
  let interactivoActual: ObjetoInteractivo | null = null;
  let interaccionPermitida = false;
  const estado: DialogueState = {
    activo: false,
    lineas: [],
    indice: 0,
  };

  function start(interactivo: ObjetoInteractivo, puedeInteractuar: boolean) {
    const datos = interactivo.interactivo;

    const lineas = puedeInteractuar
      ? (datos.dialogo ?? [])
      : (datos.dialogoLocked ?? []);

    if (lineas.length === 0) {
      return;
    }

    interactivoActual = interactivo;
    interaccionPermitida = puedeInteractuar;

    estado.activo = true;
    estado.lineas = lineas;
    estado.indice = 0;

    box.nombre.setText(interactivo.name || "");

    mostrarLinea();
  }

  function advance() {
    if (!estado.activo) {
      return;
    }

    estado.indice++;

    if (estado.indice >= estado.lineas.length) {
      close();
      return;
    }

    mostrarLinea();
  }

  function mostrarLinea() {
    const linea = estado.lineas[estado.indice];
    box.texto.setText(linea);
    box.container.setVisible(true);
  }

  function close() {
    if (interactivoActual && interaccionPermitida) {
      onComplete(interactivoActual);
    }

    interactivoActual = null;
    interaccionPermitida = false;

    estado.activo = false;
    estado.lineas = [];
    estado.indice = 0;

    box.container.setVisible(false);
  }

  function isActive() {
    return estado.activo;
  }

  return {
    start,
    advance,
    close,
    isActive,
  };
}
