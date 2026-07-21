export const gameState = {
    clues: new Set<string>(),
    flags: new Set<string>(),
    items: new Set<string>(),
};

export function addClue(id: string) {
    gameState.clues.add(id);
}

export function hasClue(id: string) {
    return gameState.clues.has(id);
}

export function addItem(id: string) {
    gameState.items.add(id);
}

export function hasItem(id: string) {
    return gameState.items.has(id);
}

export function addFlag(id: string) {
    gameState.flags.add(id);
}

export function hasFlag(id: string) {
    return gameState.flags.has(id);
}