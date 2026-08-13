export type TipoInteractivo =
  | "inspeccionar"
  | "recoger"
  | "usar"
  | "activar";

export interface RequisitosInteraccion {
  items?: string[];
  clues?: string[];
  flags?: string[];
}

export interface EfectosInteraccion {
  items?: string[];
  clues?: string[];
  flags?: string[];
}

export interface DatosInteractivo {
  interactionId: string;

  tipo: TipoInteractivo;

  prompt?: string;
  nombre?: string;

  dialogo?: string[];
  dialogoLocked?: string[];

  requirements?: RequisitosInteraccion;

  effects?: EfectosInteraccion;

  once?: boolean;
}

export type ObjetoInteractivo =
  Phaser.GameObjects.Rectangle & {
    interactivo: DatosInteractivo;
  };