import { Scene } from "phaser";

export function createPlayerAnimations(scene: Scene) {

    if (scene.anims.exists("detective_idle")) {
        return;
    }

    scene.anims.create({
        key: "detective_idle",
        frames: scene.anims.generateFrameNumbers("player_idle", {
            start: 0,
            end: 6,
        }),
        frameRate: 3,
        repeat: -1,
    });

    scene.anims.create({
        key: "detective_run",
        frames: scene.anims.generateFrameNumbers("player_run", {
            start: 0,
            end: 9,
        }),
        frameRate: 14,
        repeat: -1,
    });

    // scene.anims.create({
    //     key: "detective_death",
    //     frames: scene.anims.generateFrameNumbers("player_death", {
    //         start: 0,
    //         end: 10,
    //     }),
    //     frameRate: 10,
    //     repeat: 0,
    // });

    // scene.anims.create({
    //     key: "detective_attack",
    //     frames: scene.anims.generateFrameNumbers("player_attack", {
    //         start: 0,
    //         end: 8,
    //     }),
    //     frameRate: 12,
    //     repeat: 0,
    // });

}