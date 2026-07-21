import { ElementoEscenario } from "../../types/ElementoEscenario";

export const livingObjects: ElementoEscenario[] = [
  // ================= HABITACIÓN 1: LIVING ROOM (IZQUIERDA) =================
  {
    x: 400,
    y: 310,
    atlasKey: "muebles_sala",
    frameName: "alfombra",
    interactivo: false,
    esSuelo: true,
    escala: 2.2,
  },
  {
    x: 400,
    y: 170,
    atlasKey: "muebles_sala",
    frameName: "chimenea",
    interactivo: true,
    nombre: "Chimenea de Piedra",
    solido: true,
    colisionW: 60,
    colisionH: 40,
    dialogo: [
      "Una chimenea de ladrillo desgastado integrada a la pared de madera.",
      "El fuego emite un calor sutil pero reconfortante.",
      "Hay ceniza fresca... Alguien estuvo aquí hace poco destruyendo pruebas.",
    ],
    escala: 3.8,
    clueId:"ceniza_fresca"
  },
  {
    x: 390,
    y: 310,
    atlasKey: "muebles_sala",
    frameName: "mesa_ratona",
    interactivo: true,
    nombre: "Mesita de Centro",
    solido: true,
    colisionW: 60,
    colisionH: 25,
    dialogo: [
      "Una mesa ratona de madera pulida.",
      "Tiene una taza con restos de café frío.",
      "El fondo de la taza tiene grabado el número '12'.",
    ],
    clueId: "numero_12",
    escala: 2.8,
  },
  {
    x: 450,
    y: 300,
    atlasKey: "muebles_sala",
    frameName: "silla_ratona",
    interactivo: false,
    solido: true,
    colisionW: 30,
    colisionH: 25,
    escala: 2.8,
  },
  {
    x: 540,
    y: 330,
    atlasKey: "muebles_sala",
    frameName: "sillon_largo",
    interactivo: false,
    solido: true,
    colisionW: 60,
    colisionH: 100,
    escala: 3,
  },
  {
    x: 270,
    y: 310,
    atlasKey: "muebles_sala",
    frameName: "sillon_chico",
    interactivo: false,
    solido: true,
    colisionW: 60,
    colisionH: 70,
    escala: 3,
  },
  {
    x: 400,
    y: 400,
    atlasKey: "muebles_sala",
    frameName: "sillon_espaldas",
    interactivo: false,
    solido: true,
    colisionW: 100,
    colisionH: 50,
    escala: 3,
  },
  {
    // Escaleras interactivas con transición [F]
    x: 85,
    y: 170,
    atlasKey: "escaleras",
    frameName: "escalera_izq",
    interactivo: true,
    solido: true,
    colisionW: 200,
    colisionH: 100,
    escala: 3,
    esTransicion: true, // Identificar como transición
    promptTransicion: "[ F ] SUBIR AL PASILLO", // Prompt personalizado
  },
    // supongamos despues encontramos una llave, la agregamos al inventario
//   {
//     nombre:"Llave",

//     dialogo:[
//         "Encontraste una llave oxidada."
//     ],

//     itemId:"llave_sotano"
// }

  //o algo que funcione como un interruptor que activa la electricidad, y al activarlo se habilita una bandera que permite interactuar con otros objetos
// {
//     nombre:"Interruptor",

//     dialogo:[
//         "Escuchas un ruido..."
//     ],

//     flagId:"electricidad"
// }
];
