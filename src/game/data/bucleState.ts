export const bucleState = {
    clues: new Set<string>(),
    flags: new Set<string>(),
    items: new Set<string>(),
    interactions: new Set<string>(),
};

export function addClue(id: string) {
    bucleState.clues.add(id);
}

export function hasClue(id: string) {
    return bucleState.clues.has(id);
}

export function addItem(id: string) {
    bucleState.items.add(id);
}

export function hasItem(id: string) {
    return bucleState.items.has(id);
}

export function addFlag(id: string) {
    bucleState.flags.add(id);
}

export function hasFlag(id: string) {
    return bucleState.flags.has(id);
}

export function addInteraction(id: string) {
    bucleState.interactions.add(id);
}

export function hasInteracted(id: string) {
    return bucleState.interactions.has(id);
}