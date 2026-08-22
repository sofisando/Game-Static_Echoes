export function createMapObjects(
  map: Phaser.Tilemaps.Tilemap,
) {
  const objetos = map.createFromObjects("Muebles", {});

  return objetos;
}