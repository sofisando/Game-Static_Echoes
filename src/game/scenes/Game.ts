import { Scene } from "phaser";

export class GameScene extends Scene {
  constructor() {
    super("Game");
  }

  preload() {
    this.load.tilemapTiledJSON(
      "oficina",
      "assets/tiled/maps/oficina/Oficina.json",
    );
    this.load.image(
      "PisosYParedes",
      "assets/tiled/tiles/interior/floorswalls.png",
    );
    this.load.image("Living", "assets/tiled/tiles/interior/livingroom.png");
    this.load.image(
      "Decoraciones",
      "assets/tiled/tiles/interior/decorations.png",
    );
    this.load.image(
      "Puerta",
      "assets/tiled/tiles/interior/doorswindowsstairs.png",
    );
    this.load.image("Librerias", "assets/tiled/tiles/interior/librerias.png");
  }

  create() {
    const map = this.make.tilemap({
      key: "oficina",
    });
    this.cameras.main.setZoom(3);
    this.cameras.main.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);

    console.log(map);

    const PisosYParedes = map.addTilesetImage("PisosYParedes", "PisosYParedes");
    const Puerta = map.addTilesetImage("Puerta", "Puerta");
    const Librerias = map.addTilesetImage("Librerias", "Librerias");
    const Living = map.addTilesetImage("Living", "Living");
    const Decoraciones = map.addTilesetImage("Decoraciones", "Decoraciones");

    if (!PisosYParedes || !Puerta || !Librerias || !Living || !Decoraciones) {
      console.error("No encontró el tileset");
      return;
    }

    map.createLayer("Piso", PisosYParedes);
    map.createLayer("Pared", [PisosYParedes, Living]);
    map.createLayer("Puerta", Puerta);
    map.createLayer("Muebles", [Librerias, Living]);
    map.createLayer("Decoraciones", Decoraciones);
  }
} 
