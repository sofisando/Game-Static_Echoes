//interactionPrompt.ts

//quedó pero creo que este es el feo, no el que tengo lindo del pasillo
export function createInteractionPrompt(scene: Phaser.Scene) {
    const textF = scene.add.text(0, 0, "[F]", {
        fontSize: "14px",
        backgroundColor: "#000",
        color: "#ffffff",
        padding: { x: 5, y: 2 },
    });

    textF.setVisible(false);
    textF.setDepth(9999);

    return textF;
}