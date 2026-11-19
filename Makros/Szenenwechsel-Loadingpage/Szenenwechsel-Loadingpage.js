// --- GM MAKRO: SZENE IM CODE ÜBERSCHREIBEN & LOADINGPAGE AKTIVIEREN ---
const spielerMakroId = "OZhaGrQMeafPC15h"; // Die ID deines Spieler-Makros
const loadingPageUuid = "Scene.Yrh4yMyhaO5NrFxh"; // Die UUID deiner Loadingpage

const makro = game.macros.get(spielerMakroId);
const aktuelleSzene = canvas.scene;

if (!makro) {
    ui.notifications.error("Das Spieler-Makro wurde nicht gefunden. Bitte ID prüfen!");
} else if (!aktuelleSzene) {
    ui.notifications.error("Du hast keine Szene geöffnet!");
} else {
    // 1. Den aktuellen Code des Spieler-Makros auslesen
    let alterCode = makro.command;
    
    // 2. Die alte UUID durch die UUID der aktuellen Szene im Text überschreiben
    let neuerCode = alterCode.replace(
        /const\s+zielUuid\s*=\s*"[^"]+";/, 
        `const zielUuid = "${aktuelleSzene.uuid}";`
    );
    
    // 3. Das Spieler-Makro mit dem neuen Code in der Datenbank speichern
    await makro.update({ command: neuerCode });
    
    // 4. Loadingpage laden und für ALLE aktivieren
    const loadingScene = await fromUuid(loadingPageUuid);
    
    if (loadingScene) {
        await loadingScene.activate(); 
        ui.notifications.info(`Erfolg! '${aktuelleSzene.name}' wurde als neue Abendkarte in den Code geschrieben. Loadingpage ist aktiv.`);
    } else {
        ui.notifications.error("Die Loadingpage konnte nicht gefunden werden! Bitte UUID prüfen.");
    }
}