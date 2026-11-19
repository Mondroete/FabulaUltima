(async () => {
    try {
        const actor = canvas.tokens.controlled[0]?.actor || game.user.character;
        if (!actor) {
            ui.notifications.warn("🌙 Bitte wähle zuerst deinen Symbolisten-Token aus!");
            return;
        }

        const botImg = "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/modules/fabula_ultima/Klasse/Symbolist/Symbole/symbol-der-elemente.webp"; 
        const baseUrl = "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/systems/projectfu/styles/static/affinities/icons/";
        
        // MP-Icon komplett rahmenlos gemacht
        const mpIconUrl = "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/systems/projectfu/styles/static/icons/resources/mp_borderless.png";
        const mpIconHtml = `<img src="${mpIconUrl}" style="width: 14px; height: 14px; vertical-align: middle; display: inline-block; background: transparent; border: none; box-shadow: none;" alt="GP">`;

        // MP-Pfad ermitteln
        let mpPath = "system.resources.mp.value";
        let currentMP = foundry.utils.getProperty(actor, mpPath);

        if (currentMP === undefined && actor.system?.mp?.value !== undefined) {
            mpPath = "system.mp.value";
            currentMP = actor.system.mp.value;
        } else if (currentMP === undefined && actor.system?.gp?.value !== undefined) {
            mpPath = "system.gp.value";
            currentMP = actor.system.gp.value;
        }

        if (currentMP === undefined) {
            return ui.notifications.warn("🌙 Konnte die MP-Ressource auf dem Charakterbogen nicht finden!");
        }

        // Zuordnung für deutsche Bezeichnungen
        const elementData = {
            air: { name: "Luft", german: "Luftschaden" },
            bolt: { name: "Blitz", german: "Blitzschaden" },
            dark: { name: "Finster", german: "Finsterschaden" },
            earth: { name: "Erde", german: "Erdschaden" },
            fire: { name: "Feuer", german: "Feuerschaden" },
            ice: { name: "Eis", german: "Eisschaden" },
            light: { name: "Licht", german: "Lichtschaden" },
            poison: { name: "Gift", german: "Giftschaden" },
            physical: { name: "Physisch", german: "physischen Schaden" }
        };

        const elements = [
            { id: "air", name: "Luft", icon: `${baseUrl}air.png` },
            { id: "bolt", name: "Blitz", icon: `${baseUrl}bolt.png` },
            { id: "dark", name: "Finster", icon: `${baseUrl}dark.png` },
            { id: "earth", name: "Erde", icon: `${baseUrl}earth.png` },
            { id: "fire", name: "Feuer", icon: `${baseUrl}fire.png` },
            { id: "ice", name: "Eis", icon: `${baseUrl}ice.png` },
            { id: "light", name: "Licht", icon: `${baseUrl}light.png` },
            { id: "poison", name: "Gift", icon: `${baseUrl}poison.png` },
            { id: "physical", name: "Physisch", icon: `${baseUrl}physical.png` }
        ];

        let elementsHtml = elements.map((el, index) => `
            <label style="display: flex; align-items: center; gap: 8px; padding: 4px 6px; cursor: pointer; font-size: 0.95em; border: none; background: transparent;">
                <input type="radio" name="element-choice" value="${el.id}" ${index === 0 ? "checked" : ""}>
                <img src="${el.icon}" style="width: 20px; height: 20px; object-fit: contain; flex-shrink: 0; background: transparent; border: none; box-shadow: none;" alt="${el.name}">
                <strong style="color: #143a36;">${el.name}</strong>
            </label>
        `).join("");

        let d = new Dialog({
            title: "Symbol der Elemente – Schadensumwandlung",
            content: `
            <div style="font-size: 1em; font-family: 'Signika', sans-serif; color: #1a1a1a; padding: 5px;">
              <div style="background-color: #143a36; color: #e6e1c5; padding: 8px; font-weight: bold; text-align: center; border: 2px solid #3d968b; border-radius: 6px; margin-bottom: 12px; font-size: 1.1em;">
                ⚡ Symbol der Elemente
              </div>
              
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding: 8px; border-radius: 6px; border: 1px solid #3d968b;">
                <img src="${botImg}" style="width: 50px; height: 50px; border-radius: 4px; border: 1px solid #3d968b; flex-shrink: 0;">
                <div>
                  Symbolist: <strong style="color: #143a36;">${actor.name}</strong><br>
                  Verfügbare ${mpIconHtml}GP: <strong style="color: #8f3333; font-size: 1.1em;" id="dialog-current-mp">${currentMP}</strong>
                </div>
              </div>

              <hr style="border: 0; border-top: 1px solid #3d968b; margin: 10px 0;">

              <div style="margin-bottom: 10px;">
                <label style="font-weight: bold; color: #143a36;">1. Gesamtschaden des Angriffs eingeben:</label>
                <input id="total-damage" type="number" value="30" style="width: 100%; margin-top: 4px; border: 2px solid #3d968b; border-radius: 4px; padding: 6px; background: #fff; color: #1a1a1a; font-weight: bold; text-align: center; font-size: 1.2em;" min="1">
              </div>

              <div style="padding: 8px; border-radius: 6px; border: 1px solid #3d968b; margin-bottom: 10px; text-align: center;">
                Erforderliche ${mpIconHtml}GP (1/3): <strong id="calc-cost" style="color: #8f3333; font-size: 1.2em;">10 ${mpIconHtml}GP</strong>
                <div id="cost-warning" style="font-size: 0.85em; color: #8f3333; font-weight: bold; margin-top: 2px;"></div>
              </div>

              <hr style="border: 0; border-top: 1px solid #3d968b; margin: 10px 0;">

              <label style="font-weight: bold; color: #143a36; display: block; margin-bottom: 6px;">2. Gewünschtes Element auswählen:</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; max-height: 180px; overflow-y: auto; padding: 2px; border: none; background: transparent;">
                ${elementsHtml}
              </div>
            </div>`,
            buttons: {
                convert: {
                    icon: '<i class="fas fa-bolt"></i>',
                    label: "Umwandeln & GP zahlen",
                    callback: async (html) => {
                        const totalDamage = parseInt(html.find('#total-damage').val());
                        const selectedElement = html.find('input[name="element-choice"]:checked').val();

                        if (isNaN(totalDamage) || totalDamage <= 0) {
                            return ui.notifications.warn("🌙 Bitte gib einen gültigen Schaden ein!");
                        }

                        const gpCost = Math.floor(totalDamage / 3);
                        const latestMP = foundry.utils.getProperty(actor, mpPath) ?? 0;

                        if (latestMP < gpCost) {
                            return ui.notifications.warn(`🌙 Nicht genug GP! Du (${actor.name}) benötigst ${gpCost} GP, hast aber nur ${latestMP} GP.`);
                        }

                        const newMP = latestMP - gpCost;
                        await actor.update({ [mpPath]: newMP });

                        const dmgCommand = `@DMG[${totalDamage} ${selectedElement}]`;
                        const germanDamageName = elementData[selectedElement]?.german || selectedElement;

                        const flavorText = `${actor.name} greift ein und lenkt die Seelenenergie um!`;
                        const statsText = `Umgewandelter Schaden: <strong>${dmgCommand}</strong><br>Erforderliche @ICON[mp]GP (1/3): <strong>@LOSS[${gpCost} mp]{${gpCost} GP}</strong><br>@ICON[mp]GP wurde automatisch bezahlt @ICON[mp]GP ${latestMP} -> ${newMP}`;

                        const chatContent = `
                        <div style="border: 2px solid #3d968b; border-radius: 9px; overflow: hidden; color: #1a1a1a; font-family: 'Signika', sans-serif;">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 12px; background: #1c564f; color: #e6e1c5; font-size: 18px; font-weight: bold; text-align: center; border-bottom: 2px solid #3d968b;">
                                <img src="${botImg}" style="width: 24px; height: 24px; border: none; flex-shrink: 0;" alt="Icon">
                                <span>Symbol der Elemente</span>
                            </div>
                            <div style="padding: 10px 12px; font-size: 14px; line-height: 1.4; border-bottom: 1px solid #3d968b;">
                                <em>${flavorText}</em>
                            </div>
                            <div style="padding: 10px 12px; font-size: 14px; line-height: 1.5;">
                                ${statsText}
                            </div>
                            <hr style="border: 0; border-top: 1px solid #3d968b; margin: 0;">
                            <div style="padding: 10px 12px; font-size: 14px; font-weight: bold; color: #143a36;">
                                ✨ Der gesamte Schaden wurde erfolgreich in @ICON[${selectedElement}] ${germanDamageName} umgewandelt!
                            </div>
                        </div>`;

                        await ChatMessage.create({
                            speaker: ChatMessage.getSpeaker({ actor }),
                            content: chatContent
                        });
                    }
                },
                cancel: { label: "Abbrechen" }
            },
            default: "convert",
            render: (html) => {
                const inputField = html.find("#total-damage");
                const costDisplay = html.find("#calc-cost");
                const warningDisplay = html.find("#cost-warning");

                inputField.on("input", (e) => {
                    const dmg = parseInt(e.target.value) || 0;
                    const cost = Math.floor(dmg / 3);
                    if (costDisplay.length) costDisplay.html(`${cost} ${mpIconHtml}GP`);
                    if (warningDisplay.length) {
                        if (cost > currentMP) {
                            warningDisplay.text("⚠️ Warnung: Nicht genug GP vorhanden!");
                        } else {
                            warningDisplay.text("");
                        }
                    }
                });
                // Initialer Aufruf zur Berechnung
                inputField.trigger("input");
            }
        });

        d.render(true);

    } catch (err) { 
        ui.notifications.error("Fehler: " + err.message); 
    }
})();