export class Player {

    public sprite: Phaser.GameObjects.Sprite;

    private velocidad = 6;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number
    ) {

        this.sprite = scene.add.sprite(x, y, "player_idle", 0);

        this.sprite.setScale(2);
        this.sprite.setOrigin(0.5, 0.82);

        this.sprite.play("detective_idle");
    }

    update(cursores: Phaser.Types.Input.Keyboard.CursorKeys) {

        let vx = 0;
        let vy = 0;

        if (cursores.left.isDown) {
            vx = -this.velocidad;
            this.sprite.setFlipX(true);
        }
        else if (cursores.right.isDown) {
            vx = this.velocidad;
            this.sprite.setFlipX(false);
        }

        if (cursores.up.isDown) {
            vy = -this.velocidad;
        }
        else if (cursores.down.isDown) {
            vy = this.velocidad;
        }

        this.moveX(vx);
        this.moveY(vy);

        if (vx !== 0 || vy !== 0) {
            this.playRun();
        } else {
            this.playIdle();
        }
    }

    moveX(dx: number) {
        this.sprite.x += dx;
    }

    moveY(dy: number) {
        this.sprite.y += dy;
    }

    playIdle() {

        if (this.sprite.anims.currentAnim?.key !== "detective_idle") {
            this.sprite.play("detective_idle");
        }

    }

    playRun() {

        if (this.sprite.anims.currentAnim?.key !== "detective_run") {
            this.sprite.play("detective_run");
        }

    }

    get x() {
        return this.sprite.x;
    }

    set x(value: number) {
        this.sprite.x = value;
    }

    get y() {
        return this.sprite.y;
    }

    set y(value: number) {
        this.sprite.y = value;
    }

}