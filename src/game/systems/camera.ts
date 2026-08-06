export const cameraConfig = (scene: Phaser.Scene, jugador: Phaser.GameObjects.Sprite, map: Phaser.Tilemaps.Tilemap) => {
    scene.cameras.main.setZoom(3);
    scene.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    scene.cameras.main.startFollow(jugador);
}