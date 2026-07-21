import { ElementoEscenario } from "../../types/ElementoEscenario";

export const habitacionObjects: ElementoEscenario[] = [
  {
    x: 1200,
    y: 380,
    atlasKey: "muebles_sala",
    frameName: "mesa",
    interactivo: true,
    nombre: "Mesa de Trabajo Técnica",
    solido: true,
    colisionW: 96,
    colisionH: 45,
    dialogo: [
      "Tu mesa improvisada para la investigación del bucle.",
      "Bajo el borde hay una inscripción raspada a mano con un cuchillo:",
      "'EL PRIMER DETALLE ES IGNORAR LA REGLA DEL TIEMPO'.",
    ],
    escala: 2.5,
  },
  {
    x: 1190,
    y: 310,
    atlasKey: "muebles_sala",
    frameName: "silla",
    interactivo: false,
    solido: true,
    colisionW: 30,
    colisionH: 25,
    rotacion: -5,
    escala: 2.5,
  },
];
