import { ObjetoTransicion } from "../types/transition";
import { ObjetoInteractivo } from "../types/interactive";

export function createInteractionPrompt(scene: Phaser.Scene) {
  return scene.add
    .text(0, 0, "", {
      fontFamily: "Courier",
      fontSize: "5px",
      color: "#00ffcc",
      backgroundColor: "#000000dd",
      padding: {
        x: 4,
        y: 2,
      },
    })
    .setResolution(3)
    .setOrigin(0.5)
    .setVisible(false)
    .setDepth(3000);
}

export function updateTransitionPrompt(
  texto: Phaser.GameObjects.Text,
  transicion: ObjetoTransicion | null,
) {
  if (!transicion) {
    texto.setVisible(false);
    return;
  }

  texto.setColor("#ffff00");

  texto.setText(transicion.transicion.prompt ?? "[ F ] ACCION");

  texto.setPosition(transicion.x, transicion.y - transicion.height / 2 + 2);

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

  texto.setColor("#00ffcc");

  texto.setText(`[ E ] ${interactivo.interactivo.prompt ?? "ACCION"}`);

  texto.setPosition(interactivo.x, interactivo.y - interactivo.height / 2 + 2);

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
  const camera = scene.cameras.main;

  // ==========================================
  // CONFIGURACIÓN VISUAL
  // ==========================================

  const ancho = 720;
  const alto = 100;

  const margenInferior = 10;

  // ==========================================
  // CONTAINER
  // ==========================================

  const container = scene.add
    .container(0, 0)
    .setDepth(4000)
    .setVisible(false);

  // ==========================================
  // FONDO
  // ==========================================

  const fondo = scene.add.rectangle(
    0,
    0,
    ancho,
    alto,
    0x0a0a0f,
    0.98,
  );

  fondo.setStrokeStyle(
    2,
    0x00ffcc,
    1,
  );

  // ==========================================
  // NOMBRE
  // ==========================================

  const nombre = scene.add.text(
    -ancho / 2 + 20,
    -alto / 2 + 12,
    "",
    {
      fontFamily: "Courier",
      fontSize: "15px",
      fontStyle: "bold",
      color: "#00ffcc",
    },
  );

  // ==========================================
  // TEXTO
  // ==========================================

  const texto = scene.add.text(
    -ancho / 2 + 20,
    -alto / 2 + 38,
    "",
    {
      fontFamily: "Courier",
      fontSize: "16px",
      color: "#ffffff",
      wordWrap: {
        width: ancho - 40,
        useAdvancedWrap: true,
      },
    },
  );

  // ==========================================
  // HINT
  // ==========================================

  const hint = scene.add
    .text(
      ancho / 2 - 15,
      alto / 2 - 15,
      "[E] Avanzar",
      {
        fontFamily: "Courier",
        fontSize: "11px",
        color: "#666688",
      },
    )
    .setOrigin(1, 0.5);

  // ==========================================
  // AGREGAMOS LOS HIJOS
  // ==========================================

  container.add([
    fondo,
    nombre,
    texto,
    hint,
  ]);

  // ==========================================
  // MUY IMPORTANTE
  // ==========================================
  //
  // El tercer parámetro hace que los hijos
  // también tengan scrollFactor 0.
  //
  container.setScrollFactor(
    0,
    0,
    true,
  );

  // ==========================================
  // COMPENSAR EL ZOOM
  // ==========================================

  const zoom = camera.zoom || 1;

  container.setScale(1 / zoom);

  // ==========================================
  // POSICIÓN FIJA EN PANTALLA
  // ==========================================
  //
  // Queremos que el centro del box esté
  // a "margenInferior" del borde inferior.
  //
  const pantallaX = camera.width / 2;

  const pantallaY =
    camera.height -
    margenInferior -
    alto / 2;

  /*
   * Como la cámara tiene zoom, desplazamos
   * la posición respecto al centro de la cámara.
   */

  const x =
    camera.centerX +
    (pantallaX - camera.centerX) / zoom;

  const y =
    camera.centerY +
    (pantallaY - camera.centerY) / zoom;

  container.setPosition(x, y);

  return {
    container,
    nombre,
    texto,
  };
}