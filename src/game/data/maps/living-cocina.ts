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
    {
      tiledName: "LibreriasObj",
      key: "LibreriasObj",
      image: "assets/tiled/tiles/interior/libreriasObj.png",
    },
    {
      tiledName: "FloresObj",
      key: "FloresObj",
      image: "assets/tiled/tiles/interior/floresObj.png",
    },
    {
      tiledName: "Escalera",
      key: "Escalera",
      image: "assets/tiled/tiles/interior/escalera.png",
    },
    {
      tiledName: "DecoracionesObjetos",
      key: "DecoracionesObjetos",
      image: "assets/tiled/tiles/interior/decoracionesPlantas.png",
    },
    {
      tiledName: "chimenea",
      key: "chimenea",
      image: "assets/tiled/tiles/interior/chimenea.png",
    },

    {
      tiledName: "sillas",
      key: "sillas",
      image: "assets/tiled/tiles/interior/sillas.png",
    },
    {
      tiledName: "sillon",
      key: "sillon",
      image: "assets/tiled/tiles/interior/sillon.png",
    },
    {
      tiledName: "mesa",
      key: "mesa",
      image: "assets/tiled/tiles/interior/mesa.png",
    },
    {
      tiledName: "alfombra",
      key: "alfombra",
      image: "assets/tiled/tiles/interior/alfombra.png",
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
      name: "MueblesLiving",
      tilesets: ["Living", "Librerias", "Cocina", "Puerta"],
    },
    {
      name: "Decoraciones",
      tilesets: ["Decoraciones", "Living"],
    },
  ],
};
