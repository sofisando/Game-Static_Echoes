import { MapConfig } from "../../types/map";

export const livingCocinaConfig: MapConfig = {
  key: "living-Cocina",
  json: "assets/tiled/maps/living-cocina/living-cocina.json",

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
      tiledName: "Puerta",
      key: "Puerta",
      image: "assets/tiled/tiles/interior/doorswindowsstairs.png",
    },
    {
      tiledName: "Cocina",
      key: "Cocina",
      image: "assets/tiled/tiles/interior/kitchen.png",
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
      name: "Muebles2",
      tilesets: ["Living"],
    },
    {
      name: "MueblesLiving",
      tilesets: ["Living", "Librerias", "Cocina", "Puerta"],
    },
    {
      name: "Decoraciones",
      tilesets: ["Decoraciones", "Living"],
    },
  ],
};