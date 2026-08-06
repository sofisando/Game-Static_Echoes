export interface SceneData {
  spawn?: string;
}

export function getSceneData(scene: Phaser.Scene): SceneData {
  return (scene.scene.settings.data as SceneData) ?? {};
}

// el día de mañana probablemente no sólo pases el spawn.

// Capaz querés pasar:

// this.scene.start("Oficina", {
//   spawn: "EntradaPasillo",
//   fade: true,
//   musica: "office",
//   cinematic: false,
// });

// Entonces SceneData pasa a ser:

// export interface SceneData {
//   spawn?: string;
//   fade?: boolean;
//   musica?: string;
//   cinematic?: boolean;
// }

// Y el resto del juego ni se entera. Todo sigue leyendo los datos mediante getSceneData().