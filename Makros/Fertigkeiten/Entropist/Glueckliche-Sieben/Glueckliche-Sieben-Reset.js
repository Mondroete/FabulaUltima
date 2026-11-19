(async () => {
    try {
        const actor = canvas.tokens.controlled[0]?.actor || game.user.character;
        if (!actor) {
            ui.notifications.warn("🌙 Bitte wähle zuerst deinen Token aus!");
            return;
        }

        // Dein Bild für Glückliche Sieben
        const botImg = "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/systems/projectfu/styles/static/compendium/classes/entropist/entropist_lucky_seven.png"; 

        // Deine bewährte Chat-Box (Design bleibt unverändert)
        const chatBox = (flavorText, statsText, title = "Systemnachricht") => `
            <div style="border: 2px solid #1c3b38; border-radius: 5px; overflow: hidden; margin-bottom: 5px; background: transparent;">
                <div style="background-color: #1c3b38; color: #b9c991 !important; padding: 4px 8px; font-weight: bold; font-family: sans-serif;">
                    ${title}
                </div>
                <div style="padding: 8px; font-family: sans-serif; font-size: 0.95em; line-height: 1.4;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                        <img src="${botImg}" style="width: 45px; height: 45px; border-radius: 5px; border: 1px solid #1c3b38; flex-shrink: 0; background: rgba(28, 59, 56, 0.1);">
                        <div style="font-style: italic; color: #222;">
                            ${flavorText}
                        </div>
                    </div>
                    <div style="border-top: 1px solid rgba(28, 59, 56, 0.2); padding-top: 6px; margin-top: 2px;">
                        ${statsText}
                    </div>
                </div>
            </div>`;

        // Item auf dem Akteur suchen
        let targetItem = actor.items.find(i => i.name === "Glückliche Sieben" || i.system?.fuid === "gluckliche-sieben");
        
        if (!targetItem) {
            ui.notifications.warn(`🌙 ${actor.name} besitzt die Fähigkeit "Glückliche Sieben" nicht!`);
            return;
        }

        let resourceKey = null, isUnderResources = false;

        // Pfad zur Ressource finden (wie in deinem Original-Code)
        if (targetItem.system) {
            if (targetItem.system.rp && targetItem.system.rp.name === "Lucky Number") {
                resourceKey = "rp"; 
            } else if (targetItem.system.resources) {
                for (let [k, v] of Object.entries(targetItem.system.resources)) {
                    if (v && v.name === "Lucky Number") { resourceKey = k; isUnderResources = true; break; }
                }
            }
        }
        if (!resourceKey && targetItem?.system?.rp) { resourceKey = "rp"; }

        if (resourceKey) {
            // 1. Glückszahl fix auf 7 setzen
            let updatePath = isUnderResources ? `system.resources.${resourceKey}.current` : `system.${resourceKey}.current`;
            await targetItem.update({ [updatePath]: 7 });

            // 2. Empfänger für das Flüstern (Whisper) ermitteln
            const gmIds = game.users.filter(u => u.isGM).map(u => u.id); // Alle GMs
            const playerId = game.user.id; // Der Spieler, der das Makro ausführt
            
            // Set bündelt die IDs und verhindert, dass der GM die Nachricht doppelt bekommt, falls er es selbst auslöst
            const whisperTargets = [...new Set([...gmIds, playerId])]; 

            // 3. Chat-Nachricht vorbereiten und senden
            let flavorText = "Das Schicksal ordnet sich neu...";
            let statsText = `Die Glückszahl von <strong>${actor.name}</strong> wurde wieder auf <strong>7</strong> gesetzt.`;

            await ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ actor: actor }),
                content: chatBox(flavorText, statsText, "✨ Glückliche Sieben - Reset"),
                whisper: whisperTargets // Hier wird das Flüstern aktiviert!
            });

        } else {
            ui.notifications.warn("🌙 Konnte die 'Lucky Number'-Ressource im Item nicht finden.");
        }

    } catch (err) { 
        ui.notifications.error("Fehler: " + err.message); 
    }
})();