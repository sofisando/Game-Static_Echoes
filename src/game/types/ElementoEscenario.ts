export interface ElementoEscenario {

    x: number;
    y: number;

    atlasKey: string;
    frameName: string;

    interactivo: boolean;

    nombre?: string;
    dialogo?: string[];

    // Sistema de interacción
    clueId?: string;        // agrega una pista al inventario
    itemId?: string;        // agrega un objeto físico
    flagId?: string;        // cambia un estado global
    required?: string;      // requiere algo para interactuar

    esSuelo?: boolean;

    solido?: boolean;
    colisionW?: number;
    colisionH?: number;

    escala?: number;
    rotacion?: number;

    esTransicion?: boolean;
    promptTransicion?: string;
}