import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Oficina } from "./scenes/Oficina";
import { MainMenu } from "./scenes/MainMenu";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";
import { Pasillo } from "./scenes/Pasillo";

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  parent: "game-container",
  backgroundColor: "#474747ff",
  scene: [Boot, Preloader, MainMenu, Oficina, GameOver, Pasillo],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
