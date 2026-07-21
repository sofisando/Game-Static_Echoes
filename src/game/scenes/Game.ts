import { Scene, Math as PhaserMath, Cameras } from "phaser";
import { ElementoEscenario } from "../types/ElementoEscenario";
import { livingObjects } from "../data/rooms/living";
import { habitacionObjects } from "../data/rooms/habitación";
import { createPlayerAnimations } from "../animations/playerAnimations";
import { Player } from "../entities/Player";
import { canInteract } from "../systems/interaction";

export class GameScene extends Scene {
  // Referencias de GameObjects del personaje y teclado
  private jugador!: Player;
  private cursores!: Phaser.Types.Input.Keyboard.CursorKeys;

  // Arrays para renderizado, profundidad y colisiones
  private todosLosMuebles: any[] = [];
  private mueblesInteractivos: any[] = [];
  private limitesFisicos: any[] = []; // Para las columnas y paredes arquitectónicas

  // UI de interacción por proximidad
  private objetoCercano: any = null;
  private indicadorE!: Phaser.GameObjects.Text;

  // Control de Estado del Juego
  private estadoJuego: "EXPLORANDO" | "DIALOGO" | "TRANSICIONANDO" =
    "EXPLORANDO"; // NUEVO: Estado de transición

  // Interfaz de diálogos integrada todos estos me dice que no se estan ocupando
  private contenedorDialogo!: Phaser.GameObjects.Container;
  private textoDialogo!: Phaser.GameObjects.Text;
  private textoNombre!: Phaser.GameObjects.Text;
  private dialogoActual: string[] = [];
  private indiceDialogoActual: number = 0;

  //metodo para crear objetos
  private crearObjetos(objetos: ElementoEscenario[]) {
    objetos.forEach((obj) => {
      const mueble = this.add.sprite(obj.x, obj.y, obj.atlasKey, obj.frameName);

      const escala = obj.escala ?? 2.5;

      mueble.setScale(escala);

      if (obj.rotacion) {
        mueble.setAngle(obj.rotacion);
      }

      if (obj.esSuelo) {
        mueble.setDepth(-1);
      } else {
        this.todosLosMuebles.push(mueble);
      }

      if (obj.solido) {
        mueble.setData("solido", true);
        mueble.setData("colisionW", obj.colisionW);
        mueble.setData("colisionH", obj.colisionH);
      }

      if (obj.interactivo) {
        mueble.setData("interactivo", true);
        mueble.setData("nombre", obj.nombre);
        mueble.setData("dialogo", obj.dialogo);
        mueble.setData("dialogoLocked", obj.dialogoLocked);

        // Sistema de pistas e inventario
        mueble.setData("clueId", obj.clueId);
        mueble.setData("itemId", obj.itemId);
        mueble.setData("flagId", obj.flagId);
        mueble.setData("requirements", obj.requirements);

        if (obj.esTransicion) {
          mueble.setData("esTransicion", true);
          mueble.setData("promptTransicion", obj.promptTransicion);
        }

        this.mueblesInteractivos.push(mueble);
      }
    });
  }

  constructor() {
    super("Game"); // ID de escena para enlazar desde el Main Menu
  }

  preload() {
    // Carga de los elementos modulares del escenario
    this.load.image("floorLiving", "assets/pixelInterior/floorLiving.png");
    this.load.image("floorCocina", "assets/pixelInterior/floorCocina.png");
    this.load.image("wall", "assets/pixelInterior/wall.png");

    // Carga del Atlas de muebles con el JSON de coordenadas exacto del usuario
    this.load.image("muebles_sala", "assets/pixelInterior/livingroom_LRK.png");
    this.load.json(
      "muebles_sala_data",
      "assets/pixelInterior/livingroomSprites.json",
    );
    // Carga del Atlas de escalera, puertas y ventanas con el JSON de coordenadas exacto del usuario
    this.load.image(
      "escaleras",
      "assets/pixelInterior/doorswindowsstairs_LRK.png",
    );
    this.load.json(
      "escaleras_data",
      "assets/pixelInterior/escaleras_puertasSprites.json",
    );

    // Carga de spritesheets de animación de CraftPix de 128x128 píxeles
    this.load.spritesheet(
      "player_idle",
      "assets/personajes/gangster-pixel-character-sprite-sheets-pack/Gangsters_2/Idle_2.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      },
    );

    this.load.spritesheet(
      "player_run",
      "assets/personajes/gangster-pixel-character-sprite-sheets-pack/Gangsters_2/Run.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      },
    );
  }

  create() {
    console.log("CREATE");
    console.log("Antes:", this.estadoJuego);

    this.estadoJuego = "EXPLORANDO";

    console.log("Después:", this.estadoJuego);
    this.cameras.main.setBackgroundColor("#121216");

    // Configurar periféricos de entrada (Añadiendo tecla F)
    this.cursores = this.input.keyboard!.createCursorKeys();

    // 🧱 CONSTRUCCIÓN DE LA CASA EXPANDIDA (Ancho total: 1600px para albergar múltiples salas)
    const pared = this.add.tileSprite(800, 105, 1600, 210, "wall");
    pared.setTileScale(0.3, 0.3);
    pared.setDepth(-10);

    // 🚪 CONSTRUCCIÓN DE LOS PISOS INDEPENDIENTES (Pisos divididos por habitación)
    const pisoLiving = this.add.tileSprite(400, 405, 800, 390, "floorLiving");
    pisoLiving.setTileScale(0.2, 0.2);
    pisoLiving.setDepth(-9);

    const pisoCocina = this.add.tileSprite(1200, 405, 800, 390, "floorCocina");
    pisoCocina.setTileScale(0.2, 0.2);
    pisoCocina.setDepth(-9);

    // 🚪 DISEÑO DE LA PARED DIVISORIA CENTRAL (En X = 800)
    const pilarSuperior = this.add.rectangle(800, 220, 24, 180, 0x181008);
    pilarSuperior.setStrokeStyle(2, 0x3d2716);
    pilarSuperior.setDepth(220);
    this.limitesFisicos.push({ x: 800, y: 220, w: 24, h: 180 });

    const pilarInferior = this.add.rectangle(800, 530, 24, 140, 0x181008);
    pilarInferior.setStrokeStyle(2, 0x3d2716);
    pilarInferior.setDepth(530);
    this.limitesFisicos.push({ x: 800, y: 530, w: 24, h: 140 });

    // Obtener los JSON de coordenadas
    const jsonSprites = this.cache.json.get("muebles_sala_data");
    const texturaBase = this.textures.get("muebles_sala");
    const jsonEscaleras = this.cache.json.get("escaleras_data");
    const texturaEscaleras = this.textures.get("escaleras");

    // Crear dinámicamente los frames de Phaser
    if (texturaBase && Array.isArray(jsonSprites)) {
      jsonSprites.forEach((sprite: any) => {
        if (!texturaBase.has(sprite.name)) {
          texturaBase.add(
            sprite.name,
            0,
            sprite.x,
            sprite.y,
            sprite.width,
            sprite.height,
          );
        }
      });
    }
    if (texturaEscaleras && Array.isArray(jsonEscaleras)) {
      jsonEscaleras.forEach((sprite: any) => {
        if (!texturaEscaleras.has(sprite.name)) {
          texturaEscaleras.add(
            sprite.name,
            0,
            sprite.x,
            sprite.y,
            sprite.width,
            sprite.height,
          );
        }
      });
    }

    // Instanciar físicamente los objetos
    this.crearObjetos(livingObjects);
    this.crearObjetos(habitacionObjects);

    //traer animaciones del jugador
    createPlayerAnimations(this);

    this.jugador = new Player(this, 350, 450);

    // Crear indicador emergente
    this.indicadorE = this.add
      .text(0, 0, "[ E ] INSPECCIONAR", {
        fontFamily: "Courier",
        fontSize: "14px",
        color: "#00ffcc",
        backgroundColor: "#000000dd",
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(3000);

    // Crear la caja de diálogo
    this.crearCajaDialogo(); //me dice que crearCajaDialogo no existe en GameScene

    // Configuración de la cámara seguidora
    this.cameras.main.setBounds(0, 0, 1600, 600);
    this.cameras.main.startFollow(this.jugador.sprite, true, 0.1, 0.1);

    // Registrar entrada de teclado para inspección [E]

    this.input.keyboard!.on("keydown-E", this.manejarAccionE, this);

    // NUEVO: Registrar entrada de teclado para transición [F]
    this.input.keyboard!.on("keydown-F", this.manejarAccionF, this); //error: La propiedad "manejarAccionF" no existe en el tipo "GameScene". ¿Quería decir "manejarAccionE"?
    console.log("Estado:", this.estadoJuego);
  }

  update() {
    console.log(this.estadoJuego);
    // Bloquear movimiento si el juego está en diálogos o transicionando (apagón)
    if (
      this.estadoJuego === "DIALOGO" ||
      this.estadoJuego === "TRANSICIONANDO"
    ) {
      this.indicadorE.setVisible(false);
      if (
        this.anims.exists("detective_idle") &&
        this.jugador.sprite.anims.currentAnim?.key !== "detective_idle"
      ) {
        this.jugador.sprite.play("detective_idle");
      }
      return;
    }

    // Guardamos la posición anterior
    const oldX = this.jugador.x;
    const oldY = this.jugador.y;

    // El Player se mueve solo
    this.jugador.update(this.cursores);

    // Límites del mapa
    this.jugador.x = PhaserMath.Clamp(this.jugador.x, 10, 1590);
    this.jugador.y = PhaserMath.Clamp(this.jugador.y, 210, 590);

    // Si chocó, vuelve a la posición anterior
    if (
      this.chequearColisionSolida(this.jugador.x, this.jugador.y) ||
      this.chequearColisionEstructural(this.jugador.x, this.jugador.y)
    ) {
      this.jugador.x = oldX;
      this.jugador.y = oldY;
    }

    // EFECTO DE PROFUNDIDAD ISOMÉTRICA (Y-Sorting)
    this.todosLosMuebles.forEach((mueble) => {
      mueble.setDepth(mueble.y);
    });
    this.jugador.sprite.setDepth(this.jugador.y);

    this.verificarProximidadObjetos();
  }

  private chequearColisionSolida(px: number, py: number): boolean {
    const jugadorAnchoMitad = 18;
    const jugadorAltoMitad = 8;

    for (let i = 0; i < this.todosLosMuebles.length; i++) {
      const mueble = this.todosLosMuebles[i];
      if (!mueble.getData("solido")) continue;

      const mx = mueble.x;
      const my = mueble.y;
      const mw = mueble.getData("colisionW") || 0;
      const mh = mueble.getData("colisionH") || 0;

      const pLeft = px - jugadorAnchoMitad;
      const pRight = px + jugadorAnchoMitad;
      const pTop = py - jugadorAltoMitad;
      const pBottom = py + jugadorAltoMitad;

      const mLeft = mx - mw / 2;
      const mRight = mx + mw / 2;
      const mTop = my - mh / 2 + 10;
      const mBottom = my + mh / 2 + 10;

      if (
        pRight > mLeft &&
        pLeft < mRight &&
        pBottom > mTop &&
        pTop < mBottom
      ) {
        return true;
      }
    }
    return false;
  }

  private chequearColisionEstructural(px: number, py: number): boolean {
    const jugadorAnchoMitad = 18;
    const jugadorAltoMitad = 8;

    const pLeft = px - jugadorAnchoMitad;
    const pRight = px + jugadorAnchoMitad;
    const pTop = py - jugadorAltoMitad;
    const pBottom = py + jugadorAltoMitad;

    for (let i = 0; i < this.limitesFisicos.length; i++) {
      const col = this.limitesFisicos[i];
      const colLeft = col.x - col.w / 2;
      const colRight = col.x + col.w / 2;
      const colTop = col.y - col.h / 2;
      const colBottom = col.y + col.h / 2;

      if (
        pRight > colLeft &&
        pLeft < colRight &&
        pBottom > colTop &&
        pTop < colBottom
      ) {
        return true;
      }
    }
    return false;
  }

  private verificarProximidadObjetos() {
    let menorDistancia = Infinity;
    let objetoMasCercano: any = null;

    this.mueblesInteractivos.forEach((mueble: any) => {
      const distancia = PhaserMath.Distance.Between(
        this.jugador.x,
        this.jugador.y,
        mueble.x,
        mueble.y,
      );

      if (distancia < 85 && distancia < menorDistancia) {
        menorDistancia = distancia;
        objetoMasCercano = mueble;
      }
    });

    if (objetoMasCercano) {
      this.objetoCercano = objetoMasCercano;
      this.indicadorE.setPosition(
        this.objetoCercano.x,
        this.objetoCercano.y - 65,
      );

      // NUEVO: Adaptar dinámicamente el prompt e indicador si es una transición [F]
      if (this.objetoCercano.getData("esTransicion")) {
        this.indicadorE.setText(
          this.objetoCercano.getData("promptTransicion") || "[ F ] ACCION",
        );
        this.indicadorE.setStyle({ color: "#ffcc00" }); // Color dorado/amarillo para escaleras/puertas
      } else {
        this.indicadorE.setText("[ E ] INSPECCIONAR");
        this.indicadorE.setStyle({ color: "#00ffcc" }); // Color cian de inspección habitual
      }

      this.indicadorE.setVisible(true);
    } else {
      this.objetoCercano = null;
      this.indicadorE.setVisible(false);
    }
  }

  private manejarAccionE() {
    if (this.objetoCercano && this.objetoCercano.getData("esTransicion"))
      return;

    if (this.estadoJuego === "EXPLORANDO" && this.objetoCercano) {
      const requirements = this.objetoCercano.getData("requirements");

      if (!canInteract(requirements)) {
        this.dialogoActual = this.objetoCercano.getData("dialogoLocked");
      } else {
        this.dialogoActual = this.objetoCercano.getData("dialogo");
      }

      this.indiceDialogoActual = 0;
      this.estadoJuego = "DIALOGO";
      this.mostrarLineaDialogo();
    } else if (this.estadoJuego === "DIALOGO") {
      this.indiceDialogoActual++;

      if (this.indiceDialogoActual < this.dialogoActual.length) {
        this.mostrarLineaDialogo();
      } else {
        this.contenedorDialogo.setVisible(false);
        this.estadoJuego = "EXPLORANDO";
      }
    }
  }

  // NUEVO: Lógica de transición con apagón de pantalla cinemático
  private manejarAccionF() {
    console.log("F presionada");
    console.log("Estado antes:", this.estadoJuego);
    if (this.estadoJuego !== "EXPLORANDO" || !this.objetoCercano) return;

    // Solo ejecutar si el objeto cercano es catalogado como una transición espacial
    if (this.objetoCercano.getData("esTransicion")) {
      console.log("Estado cambiado:", this.estadoJuego);
      this.estadoJuego = "TRANSICIONANDO";
      this.indicadorE.setVisible(false);

      // 1. Iniciamos el efecto de apagón de pantalla (Fade Out)
      this.cameras.main.fadeOut(800, 0, 0, 0);

      // Al completarse el fundido a negro, cambiamos directamente a la escena del pasillo
      this.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.time.delayedCall(400, () => {
          // Viajar al Pasillo
          this.scene.start("Pasillo");
        });
      });
    }
  }

  private mostrarLineaDialogo() {
    if (!this.objetoCercano) return;

    this.textoNombre.setText(
      this.objetoCercano.getData("nombre").toUpperCase(),
    );
    this.textoDialogo.setText(this.dialogoActual[this.indiceDialogoActual]);
    this.contenedorDialogo.setVisible(true);
  }

  private crearCajaDialogo() {
    this.contenedorDialogo = this.add
      .container(400, 530)
      .setVisible(false)
      .setDepth(4000);
    this.contenedorDialogo.setScrollFactor(0);

    const fondo = this.add.graphics();
    fondo.fillStyle(0x0a0a0f, 0.98);
    fondo.lineStyle(2, 0x00ffcc, 1);
    fondo.fillRect(-380, -50, 760, 100);
    fondo.strokeRect(-380, -50, 760, 100);

    this.textoNombre = this.add.text(-360, -38, "", {
      fontFamily: "Courier",
      fontSize: "15px",
      fontStyle: "bold",
      color: "#00ffcc",
    });

    this.textoDialogo = this.add.text(-360, -12, "", {
      fontFamily: "Courier",
      fontSize: "16px",
      color: "#ffffff",
      wordWrap: { width: 720, useAdvancedWrap: true },
    });

    const saltarHint = this.add
      .text(360, 32, "[E] Avanzar", {
        fontFamily: "Courier",
        fontSize: "11px",
        color: "#666688",
      })
      .setOrigin(1, 0.5);

    this.contenedorDialogo.add([
      fondo,
      this.textoNombre,
      this.textoDialogo,
      saltarHint,
    ]);
  }
}

export default GameScene;
