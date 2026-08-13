import { ObjetoTransicion } from "../types/transition";
import { ObjetoInteractivo } from "../types/interactive";

export function createInteractionPrompt(scene: Phaser.Scene) {
  return scene.add
    .text(0, 0, "", {
      fontFamily: "Courier",
      fontSize: "6px",
      color: "#00ffcc",
      backgroundColor: "#000000dd",
      padding: {
        x: 4,
        y: 2,
      },
    })
    .setOrigin(0.5)
    .setVisible(false)
    .setDepth(3000);
}

export function updateInteractionPrompt(
  texto: Phaser.GameObjects.Text,
  transicion: ObjetoTransicion | null,
) {
  if (!transicion) {
    texto.setVisible(false);
    return;
  }

  texto.setText(
    transicion.transicion.prompt ?? "[ F ] ACCION"
  );

  texto.setPosition(
    transicion.x,
    transicion.y - transicion.height / 2 + 2,
  );

  texto.setVisible(true);
}

export function updateInteractivePrompt(
  texto: Phaser.GameObjects.Text,
  interactivo: ObjetoInteractivo | null,
) {
  if (!interactivo) {
    texto.setVisible(false);
    return;
  }

  texto.setText(
    `[ E ] ${interactivo.interactivo.prompt ?? "ACCION"}`
  );

  texto.setPosition(
    interactivo.x,
    interactivo.y - interactivo.height / 2 + 2,
  );

  texto.setVisible(true);
}

export interface DialogueBox {
  container: Phaser.GameObjects.Container;
  nombre: Phaser.GameObjects.Text;
  texto: Phaser.GameObjects.Text;
}

export function createDialogueBox(
  scene: Phaser.Scene,
): DialogueBox {
  const container = scene.add
    .container(400, 530)
    .setVisible(false)
    .setDepth(4000);

  container.setScrollFactor(0);

  const fondo = scene.add.graphics();

  fondo.fillStyle(0x0a0a0f, 0.98);
  fondo.lineStyle(2, 0x00ffcc, 1);

  fondo.fillRect(
    -380,
    -50,
    760,
    100,
  );

  fondo.strokeRect(
    -380,
    -50,
    760,
    100,
  );

  const nombre = scene.add.text(
    -360,
    -38,
    "",
    {
      fontFamily: "Courier",
      fontSize: "15px",
      fontStyle: "bold",
      color: "#00ffcc",
    },
  );

  const texto = scene.add.text(
    -360,
    -12,
    "",
    {
      fontFamily: "Courier",
      fontSize: "16px",
      color: "#ffffff",
      wordWrap: {
        width: 720,
        useAdvancedWrap: true,
      },
    },
  );

  const hint = scene.add
    .text(
      360,
      32,
      "[E] Avanzar",
      {
        fontFamily: "Courier",
        fontSize: "11px",
        color: "#666688",
      },
    )
    .setOrigin(1, 0.5);

  container.add([
    fondo,
    nombre,
    texto,
    hint,
  ]);

  return {
    container,
    nombre,
    texto,
  };
}