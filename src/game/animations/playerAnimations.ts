export function createPlayerAnimations(scene: Phaser.Scene) {

    if (scene.anims.exists("detective_idle")) {
        return;
    }

    scene.anims.create({
                key: 'detective_idle',
                frames: scene.anims.generateFrameNumbers('player_idle', { start: 0, end: 12 }),
                frameRate: 5,
                repeat: -1
            });

    scene.anims.create({
                key: 'detective_run',
                frames: scene.anims.generateFrameNumbers('player_run', { start: 0, end: 9 }),
                frameRate: 14,
                repeat: -1
            });

}
//antes tenia this.anims pero lo cambien a scene.anims

// export function createPlayerAnimations(scene: Phaser.Scene) {
//     if (scene.anims.exists("detective_idle")) {
//         return;
//     }

//     scene.anims.create({
//         key: "detective_idle",
//         frames: scene.anims.generateFrameNumbers("player_idle", {
//             start: 0,
//             end: 12
//         }),
//         frameRate: 5,
//         repeat: -1
//     });

//     scene.anims.create({
//         key: "detective_run",
//         frames: scene.anims.generateFrameNumbers("player_run", {
//             start: 0,
//             end: 9
//         }),
//         frameRate: 14,
//         repeat: -1
//     });
// }