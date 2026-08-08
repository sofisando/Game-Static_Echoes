export interface ZonaTransicion {
  goTo: string;
  spawn: string;
  prompt?: string;
}

export type ObjetoTransicion = Phaser.GameObjects.Rectangle & {
  transicion: ZonaTransicion;
};