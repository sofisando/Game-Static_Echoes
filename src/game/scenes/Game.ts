export class GameScene extends Scene {

    constructor(){
        super("Game");
    }

    preload(){

        this.load.tilemapTiledJSON(
            "pasillo",
            "assets/maps/pasilloMap.json"
        );

        this.load.image(
            "Pisos",
            "assets/tiles/Pisos.png"
        );

        this.load.image(
            "Decoraciones",
            "assets/tiles/Decoraciones.png"
        );

        this.load.image(
            "PuertasVentanasEscaleras",
            "assets/tiles/PuertasVentanasEscaleras.png"
        );

    }

    create(){

        const map = this.make.tilemap({
            key:"pasillo"
        });

        const pisos =
            map.addTilesetImage(
                "Pisos",
                "Pisos"
            );

        const decoraciones =
            map.addTilesetImage(
                "Decoraciones",
                "Decoraciones"
            );

        const puertas =
            map.addTilesetImage(
                "PuertasVentanasEscaleras",
                "PuertasVentanasEscaleras"
            );

        map.createLayer("piso", pisos);

        map.createLayer("pared", decoraciones);

        map.createLayer(
            "puertas",
            [decoraciones, puertas]
        );

    }

}