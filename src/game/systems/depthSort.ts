export function getSortY(
  objeto: Phaser.GameObjects.Sprite
): number {
  return objeto.y + objeto.displayHeight * (1 - objeto.originY);
}