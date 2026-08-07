import { BaseScene } from "./BaseScene";
import { oficinaConfig } from "../data/maps/oficina";

export class Oficina extends BaseScene {
  constructor() {
    super(
      "Oficina",
      oficinaConfig,
    );
  }
}