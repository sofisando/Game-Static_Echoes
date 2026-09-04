import { MapConfig } from "../../types/map";

export const oficinaConfig: MapConfig = {
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
    {
      tiledName: "LibreriasObj",
      key: "LibreriasObj",
      image: "assets/tiled/tiles/interior/libreriasObj.png",
    },
    {
      tiledName: "DecoracionesObjetos",
      key: "DecoracionesObjetos",
      image: "assets/tiled/tiles/interior/decoracionesPlantas.png",
    },
    {
      tiledName: "sillaVieja",
      key: "sillaVieja",
      image: "assets/tiled/tiles/interior/sillaVieja.png",
    },
  ],

  layers: [
    {
      name: "Piso",
      tilesets: ["PisosYParedes"],
    },
    {
      name: "Pared",
      tilesets: ["PisosYParedes", "Living"],
    },
    {
      name: "Puerta",
      tilesets: ["Puerta"],
    },
    {
      name: "Muebles",
      tilesets: ["Living", "Librerias"],
    },
    {
      name: "Decoraciones",
      tilesets: ["Decoraciones"],
    },
  ],
};