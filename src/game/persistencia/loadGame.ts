import { gameState } from "../data/gameState";

export function loadGame(){

    const data = localStorage.getItem("detective_save");

    if(!data) return;

    const save = JSON.parse(data);

    gameState.clues = new Set(save.clues);
    gameState.items = new Set(save.items);
    gameState.flags = new Set(save.flags);

}