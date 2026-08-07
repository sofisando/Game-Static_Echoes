import { MapConfig } from "../../types/map";

export const pasilloConfig: MapConfig = {
  key: "pasillo",
  json: "assets/tiled/maps/pasillo/Pasillo.json",

  tilesets: [
    {
      tiledName: "PisosYParedes",
      key: "PisosYParedes",
      image: "assets/tiled/tiles/interior/floorswalls.png",
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
  ],

  layers: [
    {
      name: "Piso",
      tilesets: ["PisosYParedes"],
    },
    {
      name: "Pared",
      tilesets: ["PisosYParedes"],
    },
    {
      name: "Puerta",
      tilesets: ["Puerta"],
    },
    {
      name: "Decoraciones",
      tilesets: ["Decoraciones"],
    },
  ],
};
