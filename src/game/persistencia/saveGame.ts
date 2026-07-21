import { gameState } from "../data/gameState";

export function saveGame(){

    localStorage.setItem(
        "detective_save",
        JSON.stringify({
            clues:[...gameState.clues],
            items:[...gameState.items],
            flags:[...gameState.flags]
        })
    );

}