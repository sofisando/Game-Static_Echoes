import { pasilloConfig } from "../data/maps/pasillo";
import { BaseScene } from "./BaseScene";


export class Pasillo extends BaseScene {
  constructor() {
    super(
      "Pasillo",
      pasilloConfig,
    );
  }
}