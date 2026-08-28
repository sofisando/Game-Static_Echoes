import { livingCocinaConfig } from "../data/maps/living-cocina";
import { BaseScene } from "./BaseScene";


export class LivingCocina extends BaseScene {
  constructor() {
    super(
      "Living-Cocina",
      livingCocinaConfig,
    );
  }
}