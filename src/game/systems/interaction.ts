import { hasClue, hasFlag, hasItem } from "../data/gameState";
import { ElementoEscenario } from "../types/ElementoEscenario";

export function canInteract(
    requirements?: ElementoEscenario["requirements"]
): boolean {

    if (!requirements) return true;

    if (requirements.items) {
        for (const item of requirements.items) {
            if (!hasItem(item)) return false;
        }
    }

    if (requirements.clues) {
        for (const clue of requirements.clues) {
            if (!hasClue(clue)) return false;
        }
    }

    if (requirements.flags) {
        for (const flag of requirements.flags) {
            if (!hasFlag(flag)) return false;
        }
    }

    return true;
}