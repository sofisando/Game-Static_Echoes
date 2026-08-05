export const oficinaConfig = {
  key: "oficina",
  json: "assets/tiled/maps/oficina/Oficina.json",

  tilesets: [
    {
      tiledName: "PisosYParedes",
      key: "PisosYParedes",
      image: "assets/tiled/tiles/interior/floorswalls.png",
    },
    {
      tiledName: "Living",
      key: "Living",
      image: "assets/tiled/tiles/interior/livingroom.png",
    },
    {
      tiledName: "Decoraciones",
      key: "Decoraciones",
      image: "assets/tiled/tiles/interior/decorations.png",
    },
    {
      tiledName: "Puerta",
      key: "Puerta",
      image: "assets/tiled/tiles/interior/doorswindowsstairs.png",
    },
    {
      tiledName: "Librerias",
      key: "Librerias",
      image: "assets/tiled/tiles/interior/librerias.png",
    },
  ],
};

//Entonces el preload se transforma en algo parecido a
// loadMap(this, oficinaConfig);