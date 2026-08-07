import { BaseScene } from "./BaseScene";
import { oficinaConfig } from "../data/maps/oficina";

export class GameScene extends BaseScene {
  constructor() {
    super(
      "Game",
      oficinaConfig,
    );
  }
}