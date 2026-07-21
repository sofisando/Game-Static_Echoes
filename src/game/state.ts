export interface GlobalGameMetadata {
    buclesCompletados: number;
    partidaIniciada: boolean;
}

// Este estado NO se borra cuando la escena de Phaser se reinicia.
// Ideal para guardar estadísticas de reintentos o el lore que el detective recuerda.
export const SessionState: GlobalGameMetadata = {
    buclesCompletados: 0,
    partidaIniciada: true
};

export function registrarReinicioBucle() {
    SessionState.buclesCompletados++;
}