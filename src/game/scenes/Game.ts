import { Scene, Math as PhaserMath, Input, Cameras } from 'phaser';

interface ElementoEscenario {
    x: number;
    y: number;
    atlasKey: string;
    frameName: string;    // Nombre exacto en el JSON
    interactivo: boolean; // Si el detective puede pulsar [E] para interactuar
    nombre?: string;      
    dialogo?: string[];   
    esSuelo?: boolean;    // Si es alfombra para forzar profundidad baja
    solido?: boolean;     // Determina si bloquea el paso del jugador
    colisionW?: number;   // Ancho de colisión personalizado (escalado)
    colisionH?: number;   // Alto de colisión personalizado (escalado)
    rotacion?: number;    // Rotación estética en grados
    escala?: number;      // Escala independiente para cada objeto
    // Propiedades exclusivas para transiciones de puertas/escaleras
    esTransicion?: boolean;
    promptTransicion?: string;
    dialogoTransicion?: string[];
}

export class GameScene extends Scene {
    // Referencias de GameObjects del personaje y teclado
    private jugador!: any; 
    private cursores!: Phaser.Types.Input.Keyboard.CursorKeys;
    private teclaE!: Phaser.Input.Keyboard.Key;
    private teclaF!: Phaser.Input.Keyboard.Key; // NUEVO: Tecla para viajes/escaleras
    
    // Arrays para renderizado, profundidad y colisiones
    private todosLosMuebles: any[] = [];
    private mueblesInteractivos: any[] = [];
    private limitesFisicos: any[] = []; // Para las columnas y paredes arquitectónicas
    
    // UI de interacción por proximidad
    private objetoCercano: any = null;
    private indicadorE!: Phaser.GameObjects.Text;

    // Control de Estado del Juego
    private estadoJuego: 'EXPLORANDO' | 'DIALOGO' | 'TRANSICIONANDO' = 'EXPLORANDO'; // NUEVO: Estado de transición

    // Interfaz de diálogos integrada
    private contenedorDialogo!: Phaser.GameObjects.Container;
    private textoDialogo!: Phaser.GameObjects.Text;
    private textoNombre!: Phaser.GameObjects.Text;
    private dialogoActual: string[] = [];
    private indiceDialogoActual: number = 0;

    constructor() {
        super('Game'); // ID de escena para enlazar desde el Main Menu
    }

    preload() {
        // Carga de los elementos modulares del escenario
        this.load.image('floorLiving', 'assets/pixelInterior/floorLiving.png');
        this.load.image('floorCocina', 'assets/pixelInterior/floorCocina.png');
        this.load.image('wall', 'assets/pixelInterior/wall.png');
        
        // Carga del Atlas de muebles con el JSON de coordenadas exacto del usuario
        this.load.image('muebles_sala', 'assets/pixelInterior/livingroom_LRK.png');
        this.load.json('muebles_sala_data', 'assets/pixelInterior/livingroomSprites.json');
        // Carga del Atlas de escalera, puertas y ventanas con el JSON de coordenadas exacto del usuario
        this.load.image('escaleras', 'assets/pixelInterior/doorswindowsstairs_LRK.png');
        this.load.json('escaleras_data', 'assets/pixelInterior/escaleras_puertasSprites.json');

        // Carga de spritesheets de animación de CraftPix de 128x128 píxeles
        this.load.spritesheet('player_idle', 'assets/personajes/gangster-pixel-character-sprite-sheets-pack/Gangsters_2/Idle_2.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        
        this.load.spritesheet('player_run', 'assets/personajes/gangster-pixel-character-sprite-sheets-pack/Gangsters_2/Run.png', {
            frameWidth: 128,
            frameHeight: 128
        });
    }

    create() {
        console.log("CREATE");
console.log("Antes:", this.estadoJuego);

this.estadoJuego = "EXPLORANDO";

console.log("Después:", this.estadoJuego);
        this.cameras.main.setBackgroundColor('#121216');

        // Configurar periféricos de entrada (Añadiendo tecla F)
        this.cursores = this.input.keyboard!.createCursorKeys();
        this.teclaE = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.E);
        this.teclaF = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.F); // NUEVO: Inicializar tecla F

        // 🧱 CONSTRUCCIÓN DE LA CASA EXPANDIDA (Ancho total: 1600px para albergar múltiples salas)
        const pared = this.add.tileSprite(800, 105, 1600, 210, 'wall');
        pared.setTileScale(0.3, 0.3); 
        pared.setDepth(-10);      

        // 🚪 CONSTRUCCIÓN DE LOS PISOS INDEPENDIENTES (Pisos divididos por habitación)
        const pisoLiving = this.add.tileSprite(400, 405, 800, 390, 'floorLiving');
        pisoLiving.setTileScale(0.2, 0.2);
        pisoLiving.setDepth(-9);

        const pisoCocina = this.add.tileSprite(1200, 405, 800, 390, 'floorCocina');
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
        const jsonSprites = this.cache.json.get('muebles_sala_data');
        const texturaBase = this.textures.get('muebles_sala');
        const jsonEscaleras = this.cache.json.get('escaleras_data');
        const texturaEscaleras = this.textures.get('escaleras');

        // Crear dinámicamente los frames de Phaser
        if (texturaBase && Array.isArray(jsonSprites)) {
            jsonSprites.forEach((sprite: any) => {
                if (!texturaBase.has(sprite.name)) {
                    texturaBase.add(sprite.name, 0, sprite.x, sprite.y, sprite.width, sprite.height);
                }
            });
        }
        if (texturaEscaleras && Array.isArray(jsonEscaleras)) {
            jsonEscaleras.forEach((sprite: any) => {
                if (!texturaEscaleras.has(sprite.name)) {
                    texturaEscaleras.add(sprite.name, 0, sprite.x, sprite.y, sprite.width, sprite.height);
                }
            });
        }

        // Definición espacial de la casa (Living en X: 0-750, Estudio en X: 850-1600)
        const distribucionCasa: ElementoEscenario[] = [
            // ================= HABITACIÓN 1: LIVING ROOM (IZQUIERDA) =================
            {
                x: 400, y: 310, atlasKey: 'muebles_sala', frameName: 'alfombra',
                interactivo: false, esSuelo: true, escala: 2.2
            },
            { 
                x: 400, y: 170, atlasKey: 'muebles_sala', frameName: 'chimenea',
                interactivo: true, nombre: "Chimenea de Piedra",
                solido: true, colisionW: 60, colisionH: 40,
                dialogo: [
                    "Una chimenea de ladrillo desgastado integrada a la pared de madera.",
                    "El fuego emite un calor sutil pero reconfortante.",
                    "Hay ceniza fresca... Alguien estuvo aquí hace poco destruyendo pruebas."
                ],
                escala: 3.8 
            },
            { 
                x: 390, y: 310, atlasKey: 'muebles_sala', frameName: 'mesa_ratona',
                interactivo: true, nombre: "Mesita de Centro",
                solido: true, colisionW: 60, colisionH: 25,
                dialogo: [
                    "Una mesa ratona de madera pulida.",
                    "Tiene una taza con restos de café frío.",
                    "El fondo de la taza tiene grabado el número '12'."
                ],
                escala: 2.8
            },
            { 
                x: 450, y: 300, atlasKey: 'muebles_sala', frameName: 'silla_ratona',
                interactivo: false, solido: true, colisionW: 30, colisionH: 25,
                escala: 2.8
            },
            {
                x: 540, y: 330, atlasKey: 'muebles_sala', frameName: 'sillon_largo',
                interactivo: false, solido: true, colisionW: 60, colisionH: 100,
                escala: 3 
            },
            {
                x: 270, y: 310, atlasKey: 'muebles_sala', frameName: 'sillon_chico',
                interactivo: false, solido: true, colisionW: 60, colisionH: 70,
                escala: 3
            },
            {
                x: 400, y: 400, atlasKey: 'muebles_sala', frameName: 'sillon_espaldas',
                interactivo: false, solido: true, colisionW: 100, colisionH: 50,
                escala: 3
            },
            {
                // Escaleras interactivas con transición [F]
                x: 85, y: 170, atlasKey: 'escaleras', frameName: 'escalera_izq',
                interactivo: true, solido: true, colisionW: 200, colisionH: 100,
                escala: 3, 
                esTransicion: true, // Identificar como transición
                promptTransicion: '[ F ] SUBIR AL PASILLO' // Prompt personalizado
            },

            // ================= HABITACIÓN 2: ESTUDIO DE INVESTIGACIÓN (DERECHA) =================
            { 
                x: 1200, y: 380, atlasKey: 'muebles_sala', frameName: 'mesa',
                interactivo: true, nombre: "Mesa de Trabajo Técnica",
                solido: true, colisionW: 96, colisionH: 45,
                dialogo: [
                    "Tu mesa improvisada para la investigación del bucle.",
                    "Bajo el borde hay una inscripción raspada a mano con un cuchillo:",
                    "'EL PRIMER DETALLE ES IGNORAR LA REGLA DEL TIEMPO'."
                ],
                escala: 2.5
            },
            { 
                x: 1190, y: 310, atlasKey: 'muebles_sala', frameName: 'silla', 
                interactivo: false, solido: true, colisionW: 30, colisionH: 25, rotacion: -5,
                escala: 2.5
            }
        ];

        // Instanciar físicamente los muebles y configurar sus datos
        distribucionCasa.forEach(obj => {
            const mueble = this.add.sprite(obj.x, obj.y, obj.atlasKey, obj.frameName);
            
            const escalaFinal = obj.escala !== undefined ? obj.escala : 2.5;
            mueble.setScale(escalaFinal);
            
            // Aplicar rotación personalizada si la tiene declarada
            if (obj.rotacion) {
                mueble.setAngle(obj.rotacion);
            }

            if (obj.esSuelo) {
                mueble.setDepth(-1); // Las alfombras siempre por debajo del personaje
            } else {
                this.todosLosMuebles.push(mueble); // Se añade a la lista de cálculo de Y-Sorting
            }

            // Inyección de metadata física y diálogos en el sprite
            if (obj.solido) {
                mueble.setData('solido', true);
                mueble.setData('colisionW', obj.colisionW);
                mueble.setData('colisionH', obj.colisionH);
            }

            if (obj.interactivo) {
                mueble.setData('interactivo', true); // Declarar que es interactivo
                mueble.setData('nombre', obj.nombre);
                mueble.setData('dialogo', obj.dialogo);
                
                // NUEVO: Guardar metadatos de transición si existen
                if (obj.esTransicion) {
                    mueble.setData('esTransicion', true);
                    mueble.setData('promptTransicion', obj.promptTransicion);
                }
                
                this.mueblesInteractivos.push(mueble); // Sensor de proximidad activo
            }
        });

        // Generar animaciones
        if (this.textures.exists('player_idle') && this.textures.exists('player_run')) {
            this.anims.create({
                key: 'detective_idle',
                frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 12 }),
                frameRate: 5,
                repeat: -1
            });

            this.anims.create({
                key: 'detective_run',
                frames: this.anims.generateFrameNumbers('player_run', { start: 0, end: 9 }),
                frameRate: 14,
                repeat: -1
            });
        }

        // Instanciar detective
        this.jugador = this.add.sprite(350, 450, 'player_idle', 0);
        this.jugador.setScale(2);
        this.jugador.setOrigin(0.5, 0.82);

        // Play anim inicial
        if (this.anims.exists('detective_idle')) {
            this.jugador.play('detective_idle');
        }

        // Crear indicador emergente
        this.indicadorE = this.add.text(0, 0, '[ E ] INSPECCIONAR', {
            fontFamily: 'Courier',
            fontSize: '14px',
            color: '#00ffcc',
            backgroundColor: '#000000dd',
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setVisible(false).setDepth(3000);

        // Crear la caja de diálogo
        this.crearCajaDialogo();

        // Configuración de la cámara seguidora
        this.cameras.main.setBounds(0, 0, 1600, 600);
        this.cameras.main.startFollow(this.jugador, true, 0.1, 0.1);

        // Registrar entrada de teclado para inspección [E]
    
        this.input.keyboard!.on('keydown-E', this.manejarAccionE, this);

        // NUEVO: Registrar entrada de teclado para transición [F]
        this.input.keyboard!.on('keydown-F', this.manejarAccionF, this);
        console.log("Estado:", this.estadoJuego);
    }

    update() {
         console.log(this.estadoJuego);
        // Bloquear movimiento si el juego está en diálogos o transicionando (apagón)
        if (this.estadoJuego === 'DIALOGO' || this.estadoJuego === 'TRANSICIONANDO') {
            this.indicadorE.setVisible(false);
            if (this.anims.exists('detective_idle') && this.jugador.anims.currentAnim?.key !== 'detective_idle') {
                this.jugador.play('detective_idle');
            }
            return; 
        }

        const velocidad = 6;
        let estaMoviendose = false;
        let vx = 0;
        let vy = 0;

        // Lectura de inputs direccionales
        if (this.cursores.left.isDown) {
            vx = -velocidad;
            this.jugador.setFlipX(true); 
            estaMoviendose = true;
        } else if (this.cursores.right.isDown) {
            vx = velocidad;
            this.jugador.setFlipX(false); 
            estaMoviendose = true;
        }

        if (this.cursores.up.isDown) {
            vy = -velocidad;
            estaMoviendose = true;
        } else if (this.cursores.down.isDown) {
            vy = velocidad;
            estaMoviendose = true;
        }

        // Cambiar animaciones dinámicamente
        if (this.anims.exists('detective_run') && this.anims.exists('detective_idle')) {
            if (estaMoviendose) {
                this.jugador.play('detective_run', true);
            } else {
                this.jugador.play('detective_idle', true);
            }
        }

        // Límites de la habitación
        const minX = 10;
        const maxX = 1590; 
        const minY = 210;  
        const maxY = 590;  

        // 1. Probar movimiento en el eje X
        this.jugador.x += vx;
        if (this.jugador.x < minX) this.jugador.x = minX;
        if (this.jugador.x > maxX) this.jugador.x = maxX;
        
        if (this.chequearColisionSolida(this.jugador.x, this.jugador.y) || this.chequearColisionEstructural(this.jugador.x, this.jugador.y)) {
            this.jugador.x -= vx;
        }

        // 2. Probar movimiento en el eje Y
        this.jugador.y += vy;
        if (this.jugador.y < minY) this.jugador.y = minY;
        if (this.jugador.y > maxY) this.jugador.y = maxY;
        
        if (this.chequearColisionSolida(this.jugador.x, this.jugador.y) || this.chequearColisionEstructural(this.jugador.x, this.jugador.y)) {
            this.jugador.y -= vy;
        }

        // EFECTO DE PROFUNDIDAD ISOMÉTRICA (Y-Sorting)
        this.todosLosMuebles.forEach(mueble => {
            mueble.setDepth(mueble.y);
        });
        this.jugador.setDepth(this.jugador.y);

        this.verificarProximidadObjetos();
    }

    private chequearColisionSolida(px: number, py: number): boolean {
        const jugadorAnchoMitad = 18;
        const jugadorAltoMitad = 8;

        for (let i = 0; i < this.todosLosMuebles.length; i++) {
            const mueble = this.todosLosMuebles[i];
            if (!mueble.getData('solido')) continue;

            const mx = mueble.x;
            const my = mueble.y;
            const mw = mueble.getData('colisionW') || 0;
            const mh = mueble.getData('colisionH') || 0;

            const pLeft = px - jugadorAnchoMitad;
            const pRight = px + jugadorAnchoMitad;
            const pTop = py - jugadorAltoMitad;
            const pBottom = py + jugadorAltoMitad;

            const mLeft = mx - mw / 2;
            const mRight = mx + mw / 2;
            const mTop = my - mh / 2 + 10; 
            const mBottom = my + mh / 2 + 10;

            if (pRight > mLeft && pLeft < mRight && pBottom > mTop && pTop < mBottom) {
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

            if (pRight > colLeft && pLeft < colRight && pBottom > colTop && pTop < colBottom) {
                return true; 
            }
        }
        return false;
    }

    private verificarProximidadObjetos() {
        let menorDistancia = Infinity;
        let objetoMasCercano: any = null;

        this.mueblesInteractivos.forEach((mueble: any) => {
            const distancia = PhaserMath.Distance.Between(this.jugador.x, this.jugador.y, mueble.x, mueble.y);

            if (distancia < 85 && distancia < menorDistancia) {
                menorDistancia = distancia;
                objetoMasCercano = mueble;
            }
        });

        if (objetoMasCercano) {
            this.objetoCercano = objetoMasCercano;
            this.indicadorE.setPosition(this.objetoCercano.x, this.objetoCercano.y - 65);
            
            // NUEVO: Adaptar dinámicamente el prompt e indicador si es una transición [F]
            if (this.objetoCercano.getData('esTransicion')) {
                this.indicadorE.setText(this.objetoCercano.getData('promptTransicion') || '[ F ] ACCION');
                this.indicadorE.setStyle({ color: '#ffcc00' }); // Color dorado/amarillo para escaleras/puertas
            } else {
                this.indicadorE.setText('[ E ] INSPECCIONAR');
                this.indicadorE.setStyle({ color: '#00ffcc' }); // Color cian de inspección habitual
            }
            
            this.indicadorE.setVisible(true);
        } else {
            this.objetoCercano = null;
            this.indicadorE.setVisible(false);
        }
    }

    private manejarAccionE() {
        // Ignorar la tecla E si el objeto es un portal de transición
        if (this.objetoCercano && this.objetoCercano.getData('esTransicion')) return;

        if (this.estadoJuego === 'EXPLORANDO' && this.objetoCercano) {
            this.dialogoActual = this.objetoCercano.getData('dialogo');
            this.indiceDialogoActual = 0;
            this.estadoJuego = 'DIALOGO';
            this.mostrarLineaDialogo();
        } else if (this.estadoJuego === 'DIALOGO') {
            this.indiceDialogoActual++;
            if (this.indiceDialogoActual < this.dialogoActual.length) {
                this.mostrarLineaDialogo();
            } else {
                this.contenedorDialogo.setVisible(false);
                this.estadoJuego = 'EXPLORANDO';
            }
        }
    }

    // NUEVO: Lógica de transición con apagón de pantalla cinemático
    private manejarAccionF() {
        console.log("F presionada");
    console.log("Estado antes:", this.estadoJuego);
        if (this.estadoJuego !== 'EXPLORANDO' || !this.objetoCercano) return;

        // Solo ejecutar si el objeto cercano es catalogado como una transición espacial
        if (this.objetoCercano.getData('esTransicion')) {
console.log("Estado cambiado:", this.estadoJuego);
            this.estadoJuego = 'TRANSICIONANDO';
            this.indicadorE.setVisible(false);

            // 1. Iniciamos el efecto de apagón de pantalla (Fade Out)
            this.cameras.main.fadeOut(800, 0, 0, 0);

            // Al completarse el fundido a negro, cambiamos directamente a la escena del pasillo
            this.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.time.delayedCall(400, () => {
                    // Viajar al Pasillo
                    this.scene.start('Pasillo');
                });
            });
        }
    }

    private mostrarLineaDialogo() {
        if (!this.objetoCercano) return;

        this.textoNombre.setText(this.objetoCercano.getData('nombre').toUpperCase());
        this.textoDialogo.setText(this.dialogoActual[this.indiceDialogoActual]);
        this.contenedorDialogo.setVisible(true);
    }

    private crearCajaDialogo() {
        this.contenedorDialogo = this.add.container(400, 530).setVisible(false).setDepth(4000);
        this.contenedorDialogo.setScrollFactor(0);

        const fondo = this.add.graphics();
        fondo.fillStyle(0x0a0a0f, 0.98);
        fondo.lineStyle(2, 0x00ffcc, 1);
        fondo.fillRect(-380, -50, 760, 100);
        fondo.strokeRect(-380, -50, 760, 100);

        this.textoNombre = this.add.text(-360, -38, '', {
            fontFamily: 'Courier',
            fontSize: '15px',
            fontStyle: 'bold', 
            color: '#00ffcc'
        });

        this.textoDialogo = this.add.text(-360, -12, '', {
            fontFamily: 'Courier',
            fontSize: '16px',
            color: '#ffffff',
            wordWrap: { width: 720, useAdvancedWrap: true }
        });

        const saltarHint = this.add.text(360, 32, '[E] Avanzar', {
            fontFamily: 'Courier',
            fontSize: '11px',
            color: '#666688'
        }).setOrigin(1, 0.5);

        this.contenedorDialogo.add([fondo, this.textoNombre, this.textoDialogo, saltarHint]);
    }
}

export default GameScene;