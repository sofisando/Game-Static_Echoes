export interface ElementoEscenario {
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

    escala?: number;
    rotacion?: number;

    esTransicion?: boolean;
    promptTransicion?: string;
}