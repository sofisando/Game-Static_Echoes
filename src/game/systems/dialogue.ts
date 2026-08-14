import { DialogueBox } from "./ui";
import { ObjetoInteractivo } from "../types/interactive";

export interface DialogueState {
  activo: boolean;
  lineas: string[];
  indice: number;
}

export interface DialogueManager {
  start: (interactivo: ObjetoInteractivo) => void;

  advance: () => void;

  close: () => void;

  isActive: () => boolean;
}

export function createDialogueManager(box: DialogueBox): DialogueManager {
  const estado: DialogueState = {
    activo: false,
    lineas: [],
    indice: 0,
  };

  function start(interactivo: ObjetoInteractivo) {
    console.log("START DIALOGO:", interactivo);
    const datos = interactivo.interactivo;

    const lineas = datos.dialogo ?? [];
    
    console.log("LINEAS:", lineas);

    if (lineas.length === 0) {
      return;
    }

    estado.activo = true;
    estado.lineas = lineas;
    estado.indice = 0;

    // Usamos directamente el nombre del objeto de Tiled.
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

    console.log("MOSTRANDO DIALOGO:", linea);
    console.log("CONTAINER VISIBLE ANTES:", box.container.visible);

    box.texto.setText(linea);

    box.container.setVisible(true);
    console.log("CONTAINER VISIBLE DESPUES:", box.container.visible);
  }

  function close() {
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
