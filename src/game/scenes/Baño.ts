import { bañoConfig } from "../data/maps/baño";
import { BaseScene } from "./BaseScene";


export class Baño extends BaseScene {
  constructor() {
    super(
      "Baño",
      bañoConfig,
    );
  }
}