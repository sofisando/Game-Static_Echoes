import { MapConfig } from "../../types/map";

export const bañoConfig: MapConfig = {
  key: "baño",

  json: "assets/tiled/maps/baño/Baño.json",

  tilesets: [
    {
      tiledName: "PisosYParedes",
      key: "PisosYParedes",
      image: "assets/tiled/tiles/interior/floorswalls.png",
    },
    {
      tiledName: "BañoTextiles",
      key: "BañoTextiles",
      image: "assets/tiled/tiles/interior/textiles_BA.png",
    },
    {
      tiledName: "BañoPorcelana",
      key: "BañoPorcelana",
      image: "assets/tiled/tiles/interior/fixtures_BA.png",
    },
    {
      tiledName: "Muebles",
      key: "Muebles",
      image: "assets/tiled/tiles/interior/cabinets_BA.png",
    },
    {
      tiledName: "PorcelanaObject",
      key: "PorcelanaObject",
      image: "assets/tiled/tiles/interior/fixtures_BA.png",
    },
    {
      tiledName: "espejo",
      key: "espejo",
      image: "assets/tiled/tiles/interior/espejo.png",
    },
    {
      tiledName: "floresObj",
      key: "floresObj",
      image: "assets/tiled/tiles/interior/floresObj.png",
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
      name: "Decoraciones",
      tilesets: ["BañoTextiles"],
    },
    {
      name: "Mueble",
      tilesets: ["Muebles"],
    },
    {
      name: "Porcelana",
      tilesets: ["BañoPorcelana"],
    },
  ],
};
