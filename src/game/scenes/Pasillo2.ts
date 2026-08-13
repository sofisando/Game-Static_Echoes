import { Scene, Math as PhaserMath, Input, Cameras } from 'phaser';

interface ElementoEscenario {
    x: number;
    y: number;
    atlasKey: string;
    frameName: string;
    interactivo: boolean;
    nombre?: string;
    dialogo?: string[];
    esSuelo?: boolean;
    solido?: boolean;
    colisionW?: number;
    colisionH?: number;
    rotacion?: number;
    escala?: number;
    // Propiedades de transición espacial con F
    esTransicion?: boolean;
    promptTransicion?: string;
}

export class PasilloScene extends Scene {
    private jugador!: any;
    private cursores!: Phaser.Types.Input.Keyboard.CursorKeys;
    private teclaE!: Phaser.Input.Keyboard.Key;
    private teclaF!: Phaser.Input.Keyboard.Key;

    private todosLosMuebles: any[] = [];
    private mueblesInteractivos: any[] = [];
    private limitesFisicos: any[] = [];

    private objetoCercano: any = null;
    private indicadorE!: Phaser.GameObjects.Text;

    private estadoJuego: 'EXPLORANDO' | 'DIALOGO' | 'TRANSICIONANDO' = 'EXPLORANDO';

    private contenedorDialogo!: Phaser.GameObjects.Container;
    private textoDialogo!: Phaser.GameObjects.Text;
    private textoNombre!: Phaser.GameObjects.Text;
    private dialogoActual: string[] = [];
    private indiceDialogoActual: number = 0;

    constructor() {
        super('Pasillo2'); // ID único de la escena
    }

    preload() {
        // Cargamos los mismos assets (Phaser los reutilizará si ya están en caché, pero es buena práctica)
        this.load.image('floorLiving', 'assets/pixelInterior/floorLiving.png');
        this.load.image('wall', 'assets/pixelInterior/wall.png');
        this.load.image('muebles_sala', 'assets/pixelInterior/livingroom_LRK.png');
        this.load.json('muebles_sala_data', 'assets/pixelInterior/livingroomSprites.json');
        this.load.image('escaleras', 'assets/pixelInterior/doorswindowsstairs_LRK.png');
        this.load.json('escaleras_data', 'assets/pixelInterior/escaleras_puertasSprites.json');

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
        this.cameras.main.setBackgroundColor('#121216');

        // Configurar periféricos
        this.cursores = this.input.keyboard!.createCursorKeys();
        this.teclaE = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.E);
        this.teclaF = this.input.keyboard!.addKey(Input.Keyboard.KeyCodes.F);

        // 🧱 CONSTRUCCIÓN DEL PASILLO (Resolución adaptada a 800x600)
        // Colocamos la misma pared superior
        const pared = this.add.tileSprite(400, 105, 800, 210, 'wall');
        pared.setTileScale(0.3, 0.3);
        pared.setDepth(-10);

        // Usamos el piso del living para todo el pasillo de 800px
        const pisoPasillo = this.add.tileSprite(400, 405, 800, 390, 'floorLiving');
        pisoPasillo.setTileScale(0.2, 0.2);
        pisoPasillo.setDepth(-9);

        // Obtener texturas de Phaser
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

        // CONTROL DE ERRORES/FALLBACK: Slices seguras para puertas si faltan en el JSON
        if (texturaEscaleras) {
            // Recorte seguro para puerta abierta y cerrada del tileset modular
            if (!texturaEscaleras.has('puerta_cerrada')) {
                texturaEscaleras.add('puerta_cerrada', 0, 16, 16, 32, 48);
            }
            if (!texturaEscaleras.has('puerta_abierta')) {
                texturaEscaleras.add('puerta_abierta', 0, 80, 16, 32, 48);
            }
        }

        // Definición de elementos en el Pasillo
        const distribucionPasillo: ElementoEscenario[] = [
            {
                // Escaleras para BAJAR de regreso al Living
                x: 85, y: 170, atlasKey: 'escaleras', frameName: 'escalera_izq',
                interactivo: true, solido: true, colisionW: 120, colisionH: 80,
                escala: 3, esTransicion: true, promptTransicion: '[ F ] BAJAR AL LIVING'
            },
            {
                // Puerta de la oficina de investigación (Cerrada con llave)
                x: 350, y: 165, atlasKey: 'escaleras', frameName: 'puerta_cerrada',
                interactivo: true, nombre: "Puerta Cerrada",
                solido: true, colisionW: 60, colisionH: 30,
                dialogo: [
                    "Es la puerta de tu oficina privada de investigación.",
                    "Está cerrada bajo llave.",
                    "Se oye un zumbido eléctrico de fondo... Necesitas encontrar la llave plateada."
                ],
                escala: 3
            },
            {
                // Puerta del Baño (Abierta para explorar con F)
                x: 600, y: 165, atlasKey: 'escaleras', frameName: 'puerta_abierta',
                interactivo: true, solido: true, colisionW: 60, colisionH: 30,
                escala: 3, esTransicion: true, promptTransicion: '[ F ] ENTRAR AL BAÑO'
            }
        ];

        // Instanciar físicamente
        distribucionPasillo.forEach(obj => {
            const mueble = this.add.sprite(obj.x, obj.y, obj.atlasKey, obj.frameName);
            const escalaFinal = obj.escala !== undefined ? obj.escala : 2.5;
            mueble.setScale(escalaFinal);

            if (obj.esSuelo) {
                mueble.setDepth(-1);
            } else {
                this.todosLosMuebles.push(mueble);
            }

            if (obj.solido) {
                mueble.setData('solido', true);
                mueble.setData('colisionW', obj.colisionW);
                mueble.setData('colisionH', obj.colisionH);
            }

            if (obj.interactivo) {
                mueble.setData('nombre', obj.nombre || "Puerta");
                mueble.setData('dialogo', obj.dialogo || []);
                
                if (obj.esTransicion) {
                    mueble.setData('esTransicion', true);
                    mueble.setData('promptTransicion', obj.promptTransicion);
                }
                
                this.mueblesInteractivos.push(mueble);
            }
        });

        // Detective spawn en la zona de las escaleras listo para explorar
        this.jugador = this.add.sprite(150, 320, 'player_idle', 0);
        this.jugador.setScale(2);
        this.jugador.setOrigin(0.5, 0.82);

        // Play anim de pie
        if (this.anims.exists('detective_idle')) {
            this.jugador.play('detective_idle');
        }

        // Indicador dinámico de interacción
        this.indicadorE = this.add.text(0, 0, '[ E ] INSPECCIONAR', {
            fontFamily: 'Courier',
            fontSize: '14px',
            color: '#00ffcc',
            backgroundColor: '#000000dd',
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setVisible(false).setDepth(3000);

        this.crearCajaDialogo();

        // Registrar inputs seguros
        this.teclaE.on('down', () => this.manejarAccionE());
        this.teclaF.on('down', () => this.manejarAccionF());

        // Efecto cinemático al llegar al pasillo (Fade In)
        this.cameras.main.fadeIn(800, 0, 0, 0);
    }

    update() {
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

        if (this.anims.exists('detective_run') && this.anims.exists('detective_idle')) {
            if (estaMoviendose) {
                this.jugador.play('detective_run', true);
            } else {
                this.jugador.play('detective_idle', true);
            }
        }

        // Límites estrictos del pasillo (800 de ancho)
        const minX = 10;
        const maxX = 790;
        const minY = 210;
        const maxY = 590;

        // Eje X
        this.jugador.x += vx;
        if (this.jugador.x < minX) this.jugador.x = minX;
        if (this.jugador.x > maxX) this.jugador.x = maxX;
        if (this.chequearColisionSolida(this.jugador.x, this.jugador.y) || this.chequearColisionEstructural(this.jugador.x, this.jugador.y)) {
            this.jugador.x -= vx;
        }

        // Eje Y
        this.jugador.y += vy;
        if (this.jugador.y < minY) this.jugador.y = minY;
        if (this.jugador.y > maxY) this.jugador.y = maxY;
        if (this.chequearColisionSolida(this.jugador.x, this.jugador.y) || this.chequearColisionEstructural(this.jugador.x, this.jugador.y)) {
            this.jugador.y -= vy;
        }

        // Y-Sorting
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

            if (this.objetoCercano.getData('esTransicion')) {
                this.indicadorE.setText(this.objetoCercano.getData('promptTransicion') || '[ F ] VIAJAR');
                this.indicadorE.setStyle({ color: '#ffcc00' }); // Dorado
            } else {
                this.indicadorE.setText('[ E ] INSPECCIONAR');
                this.indicadorE.setStyle({ color: '#00ffcc' }); // Cian
            }
            this.indicadorE.setVisible(true);
        } else {
            this.objetoCercano = null;
            this.indicadorE.setVisible(false);
        }
    }

    private manejarAccionE() {
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

    private manejarAccionF() {
        if (this.estadoJuego !== 'EXPLORANDO' || !this.objetoCercano) return;

        if (this.objetoCercano.getData('esTransicion')) {
            const prompt = this.objetoCercano.getData('promptTransicion');

            if (prompt.includes('LIVING')) {
                // Volver a la planta baja
                this.estadoJuego = 'TRANSICIONANDO';
                this.indicadorE.setVisible(false);
                this.cameras.main.fadeOut(800, 0, 0, 0);

                this.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.time.delayedCall(400, () => {
                        this.scene.start('Game');
                    });
                });
            } else if (prompt.includes('BAÑO')) {
                // Simulación cinemática de entrar al baño (Apagón, diálogo rápido y volver)
                this.estadoJuego = 'TRANSICIONANDO';
                this.indicadorE.setVisible(false);
                this.cameras.main.fadeOut(800, 0, 0, 0);

                this.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.time.delayedCall(600, () => {
                        // Diálogo del baño en la pantalla negra
                        this.textoNombre.setText("SISTEMA");
                        this.textoDialogo.setText("Entras al baño del pasillo. El espejo está empañado y hay números grabados de prisa sobre el vapor: '11:45'...");
                        this.contenedorDialogo.setVisible(true);
                        
                        this.estadoJuego = 'DIALOGO';
                        
                        // Esperar que el jugador interactúe una vez para salir del baño y devolverle la luz
                        const triggerRetorno = this.input.keyboard!.once('keydown-E', () => {
                            this.contenedorDialogo.setVisible(false);
                            this.cameras.main.fadeIn(800, 0, 0, 0);
                            this.cameras.main.once(Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
                                this.estadoJuego = 'EXPLORANDO';
                            });
                        });
                    });
                });
            }
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

export default PasilloScene;