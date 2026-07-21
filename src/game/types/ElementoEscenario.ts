export interface ElementoEscenario {
  x: number;
  y: number;

  atlasKey: string;
  frameName: string;

  interactivo: boolean;

  nombre?: string;
  dialogo?: string[];
  dialogoLocked?: string[];

  // Sistema de interacción
  clueId?: string; // agrega una pista al inventario
  itemId?: string; // agrega un objeto físico
  flagId?: string; // cambia un estado global

  // requiere algo para interactuar
  requirements?: {
    items?: string[];
    clues?: string[];
    flags?: string[];
  };

  esSuelo?: boolean;

  solido?: boolean;
  colisionW?: number;
  colisionH?: number;

  escala?: number;
  rotacion?: number;

  esTransicion?: boolean;
  promptTransicion?: string;
}
