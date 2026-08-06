export const preloadPlayerAssets = (scene: Phaser.Scene) => {
  scene.load.spritesheet(
    "player_idle",
    "assets/tiled/tiles/personajes/jugador/Idle.png",
    {
      frameWidth: 128,
      frameHeight: 128,
    },
  );

  //despues puedo usar el otro que parezca que guarda algo en el bolsillo

  scene.load.spritesheet(
    "player_run",
    "assets/tiled/tiles/personajes/jugador/Run.png",
    {
      frameWidth: 128,
      frameHeight: 128,
    },
  );

  //despues se puede agregar la muerte y el ataque del personaje
};
