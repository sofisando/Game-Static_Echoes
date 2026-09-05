export interface ObjetoDinamico {
  sprite: Phaser.GameObjects.Sprite;

  dynamicId: string;
  stateFlag: string;

  falseGid?: number;
  trueGid?: number;

  falseX?: number;
  trueX?: number;

  desaparece?: boolean;
}