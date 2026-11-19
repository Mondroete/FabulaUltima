const macroId = "NOLvu92YX1OTte4k";
const meinMacro = game.macros.get(macroId);

// 1. ALTE HOOKS SÄUBERN
if (meinMacro?._hookIds) {
    for (let hook of meinMacro._hookIds) {
        if (typeof hook === "number") {
            Hooks.off("updateActor", hook);
        } else {
            Hooks.off(hook.event, hook.id);
        }
    }
}
if (meinMacro) meinMacro._hookIds = [];

// 2. HILFSFUNKTION FÜR DIE FARBE
const getColorForHp = (currentHp, maxHp) => {
    if (currentHp === undefined || !maxHp) return null;
    const hpProzent = (currentHp / maxHp) * 100;
    
    if (hpProzent <= 10) return "#8b0000"; // 0-10%: Tiefes Rot
    if (hpProzent <= 40) return "#a31c1c"; // 20-40%: Rötlich
    if (hpProzent <= 60) return "#d97706"; // 40-60%: Orange
    if (hpProzent <= 80) return "#eab308"; // 70-80%: Gelb
    return "#166a1f";                      // 80-100%: Grün
};

// 3. HOOK FÜR ÄNDERUNGEN IM SPIEL
const updateActorHook = Hooks.on("updateActor", async (actor, change, options, userId) => {
    const hasHpChange = foundry.utils.hasProperty(change, "system.resources.hp");
    if (!hasHpChange) return;

    const currentHp = actor.system?.resources?.hp?.value;
    const maxHp = actor.system?.resources?.hp?.max;
    const targetColor = getColorForHp(currentHp, maxHp);

    if (!targetColor) return;

    const tokens = actor.getActiveTokens();
    for (let token of tokens) {
        if (!token.document.ring?.enabled) continue;
        if (token.document.ring.colors.ring !== targetColor || token.document.ring.colors.background !== null) {
            await token.document.update({
                "ring.colors.ring": targetColor,
                "ring.colors.background": null
            });
        }
    }
});

// 4. NEU: SZENEN-UPDATE FÜR DEN START / SZENENWECHSEL
const updateAllTokensOnCanvas = async () => {
    if (!canvas.ready || !canvas.scene) return;
    
    const updates = [];
    for (let token of canvas.tokens.placeables) {
        const actor = token.actor;
        if (!actor || !token.document.ring?.enabled) continue;

        const currentHp = actor.system?.resources?.hp?.value;
        const maxHp = actor.system?.resources?.hp?.max;
        const targetColor = getColorForHp(currentHp, maxHp);

        if (targetColor && (token.document.ring.colors.ring !== targetColor || token.document.ring.colors.background !== null)) {
            updates.push({
                _id: token.id,
                "ring.colors.ring": targetColor,
                "ring.colors.background": null
            });
        }
    }
    
    if (updates.length > 0) {
        await canvas.scene.updateEmbeddedDocuments("Token", updates);
    }
};

// Den neuen Szenen-Update-Hook registrieren
const canvasReadyHook = Hooks.on("canvasReady", updateAllTokensOnCanvas);

// Beide Hooks im Makro speichern
if (meinMacro) {
    meinMacro._hookIds.push({ event: "updateActor", id: updateActorHook });
    meinMacro._hookIds.push({ event: "canvasReady", id: canvasReadyHook });
}

// Führt das Update direkt einmal für die aktuell bereits geladene Szene aus
updateAllTokensOnCanvas();

ui.notifications.info("Fabula Ultima: 5-Stufen-Ringe erfolgreich AKTIVIERT!");