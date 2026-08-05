export interface ZonaTransicion {
    goTo: string;
    spawn: string;
}

export type ObjetoTransicion =
    Phaser.GameObjects.Rectangle & {
        transicion: ZonaTransicion;
    };