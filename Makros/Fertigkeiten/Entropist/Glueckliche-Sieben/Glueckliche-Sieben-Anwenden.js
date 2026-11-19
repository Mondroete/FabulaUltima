(async () => {
    try {
        const actor = canvas.tokens.controlled[0]?.actor || game.user.character;
        if (!actor) {
            ui.notifications.warn("🌙 Bitte wähle zuerst deinen Token aus!");
            return;
        }

        // Neues Bild für Glückliche Sieben
        const botImg = "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/systems/projectfu/styles/static/compendium/classes/entropist/entropist_lucky_seven.png"; 

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

        let targetItem = actor.items.find(i => i.name === "Glückliche Sieben" || i.system?.fuid === "gluckliche-sieben");
        let resourceKey = null, isUnderResources = false, currentLucky = 7;

        if (targetItem && targetItem.system) {
            if (targetItem.system.rp && targetItem.system.rp.name === "Lucky Number") {
                resourceKey = "rp"; currentLucky = targetItem.system.rp.current ?? 7;
            } else if (targetItem.system.resources) {
                for (let [k, v] of Object.entries(targetItem.system.resources)) {
                    if (v && v.name === "Lucky Number") { resourceKey = k; isUnderResources = true; currentLucky = v.current ?? 7; break; }
                }
            }
        }
        if (!resourceKey && targetItem?.system?.rp) { resourceKey = "rp"; currentLucky = targetItem.system.rp.current ?? 7; }

        const rollMessages = game.messages.filter(m => m.isRoll || (m.rolls && m.rolls.length > 0));
        if (rollMessages.length === 0) return ui.notifications.warn("🌙 Kein Wurf gefunden!");
        
        const lastMsg = rollMessages[rollMessages.length - 1];
        const originalRoll = lastMsg.rolls?.[0] || lastMsg.roll;
        if (!originalRoll) return ui.notifications.warn("🌙 Keine Würfel im letzten Wurf!");

        let diceResults = [];
        originalRoll.dice.forEach((die, dieIndex) => {
            if (die.results) die.results.forEach((res, resIndex) => diceResults.push({ dieIndex, resIndex, faces: die.faces, value: res.result }));
        });
        if (diceResults.length === 0) return ui.notifications.warn("🌙 Keine Würfel gefunden!");

        let optionsHtml = diceResults.map((d, i) => `<option value="${i}">W${d.faces} (Ergebnis: ${d.value})</option>`).join("");

        new Dialog({
            title: "Glückliche Sieben",
            content: `
            <div style="border: 2px solid #1c3b38; border-radius: 5px; overflow: hidden; margin-bottom: 10px; font-size: 1em; font-family: sans-serif;">
              <div style="background-color: #1c3b38; color: #b9c991 !important; padding: 4px; font-weight: bold; text-align: center;">✨ Glückliche Sieben</div>
              <div style="padding: 10px; background: rgba(28, 59, 56, 0.05); display: flex; align-items: center; gap: 15px;">
                <img src="${botImg}" style="width: 60px; height: 60px; border-radius: 5px; border: 1px solid #1c3b38; flex-shrink: 0; background: rgba(28, 59, 56, 0.1);">
                <div style="text-align: left; width: 100%;">
                  Glückszahl: <span style="color: #c92a2a; font-size: 1.2em; font-weight: bold;">${currentLucky}</span><br>
                  Letzter Wurf: <strong>${originalRoll.formula}</strong><br><br>
                  Welchen Würfel möchtest du ersetzen?<br>
                  <select id="dice-select" style="width: 100%; margin-top: 5px; border: 1px solid #1c3b38; border-radius: 4px; padding: 4px;">${optionsHtml}</select>
                </div>
              </div>
            </div>`,
            buttons: {
                swap: {
                    icon: '<i class="fas fa-dice"></i>',
                    label: "Anwenden",
                    callback: async (html) => {
                        try {
                            const chosenDie = diceResults[parseInt(html.find('#dice-select').val())];
                            const oldVal = chosenDie.value;
                            const diff = currentLucky - oldVal;
                            
                            let doc = new DOMParser().parseFromString(lastMsg.content || "", 'text/html');

                            // 1. Gesamtsumme aus HTML lesen (Stapelbar)
                            let currentDisplayedTotal = originalRoll.total;
                            let foundTotalNode = null, isCase2 = false, matchCase2 = null;

                            const totalWalker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
                            let n;
                            while ((n = totalWalker.nextNode())) {
                                const text = n.nodeValue.trim();
                                if (/^\d+$/.test(text)) {
                                    let parent = n.parentElement;
                                    let isTotalField = false;
                                    for (let level = 0; level < 4; level++) {
                                        if (parent && /vs\s*(DEF|)/i.test(parent.textContent) && !/(TREFFER|GETROFFEN|VERFEHLT|HIT|MISS)/i.test(parent.textContent)) {
                                            isTotalField = true; break;
                                        }
                                        parent = parent?.parentElement;
                                    }
                                    if (isTotalField) { currentDisplayedTotal = Number(text); foundTotalNode = n; break; }
                                } else {
                                    let match = n.nodeValue.match(/^(\s*)(\d+)(\s*vs\s*[a-zA-Z]*\s*)$/i);
                                    if (match) { currentDisplayedTotal = Number(match[2]); foundTotalNode = n; isCase2 = true; matchCase2 = match; break; }
                                }
                            }
                            const actualNewTotal = currentDisplayedTotal + diff;

                            // 2. Roll-Objekt berechnen
                            const modifiedRoll = Roll.fromData(originalRoll.toJSON());
                            let allNewValues = [];
                            modifiedRoll.dice.forEach((die, dIdx) => {
                                die.results.forEach((res, rIdx) => {
                                    if (dIdx === chosenDie.dieIndex && rIdx === chosenDie.resIndex) res.result = currentLucky;
                                    allNewValues.push(res.result);
                                });
                            });

                            const newHighestValue = Math.max(...allNewValues);
                            const oldHighest = Math.max(...diceResults.map(d => d.value));
                            const hwDiff = newHighestValue - oldHighest;
                            modifiedRoll._total = actualNewTotal;

                            if (targetItem && resourceKey) {
                                let updatePath = isUnderResources ? `system.resources.${resourceKey}.current` : `system.${resourceKey}.current`;
                                await targetItem.update({ [updatePath]: oldVal });
                            }

                            let newMessageData = lastMsg.toObject();
                            delete newMessageData._id;
                            newMessageData.rolls = [modifiedRoll];

                            // 3. Gesamtsumme im HTML überschreiben
                            if (foundTotalNode) {
                                if (isCase2) foundTotalNode.nodeValue = matchCase2[1] + actualNewTotal + matchCase2[3];
                                else foundTotalNode.nodeValue = foundTotalNode.nodeValue.replace(String(currentDisplayedTotal), String(actualNewTotal));
                            }

                            // 4. Attribute
                            function getNumberNodeFromLabelNode(labelNode) {
                                let container = labelNode.parentElement;
                                for (let level = 0; level < 3; level++) {
                                    if (!container) break;
                                    const numWalker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
                                    let numNode;
                                    while ((numNode = numWalker.nextNode())) {
                                        if (/^[-+]?\d+$/.test(numNode.nodeValue.trim()) && numNode !== labelNode) return numNode;
                                    }
                                    container = container.parentElement;
                                }
                                return null;
                            }

                            let aNodes = [], hNodes = [];
                            let tw = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
                            while(n = tw.nextNode()) {
                                let t = n.nodeValue.trim();
                                if (/^(GES|MAT|EIN|WLK|MIG|INS|DEX|WPR|GLÜ|LUC)\s*:?$/i.test(t)) aNodes.push(n);
                                if (/^(HW|HR)\s*:?$/i.test(t)) hNodes.push(n);
                            }
                            const selIdx = diceResults.indexOf(chosenDie);
                            if (aNodes[selIdx]) {
                                let nn = getNumberNodeFromLabelNode(aNodes[selIdx]);
                                if (nn && nn.nodeValue.trim() === String(oldVal)) nn.nodeValue = nn.nodeValue.replace(String(oldVal), String(currentLucky));
                            }
                            if (hwDiff !== 0) {
                                hNodes.forEach(hn => {
                                    let nn = getNumberNodeFromLabelNode(hn);
                                    if (nn && nn.nodeValue.trim() === String(oldHighest)) nn.nodeValue = nn.nodeValue.replace(String(oldHighest), String(newHighestValue));
                                });
                            }

                            // 5. Treffer/Verfehlt Box berechnen
                            const hmWalker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
                            let hmNode;
                            while((hmNode = hmWalker.nextNode())) {
                                let txt = hmNode.nodeValue;
                                let matchTarget = txt.match(/(TREFFER|GETROFFEN|VERFEHLT|HIT|MISS|CRITICAL|FUMBLE)\s*(vs|VS)\s*(\d+)/i);
                                if (matchTarget) {
                                    let currentWord = matchTarget[1], defValue = Number(matchTarget[3]), newWord = currentWord;
                                    
                                    if (actualNewTotal >= defValue) {
                                        if (/verfehlt|fumble/i.test(currentWord)) newWord = currentWord === currentWord.toUpperCase() ? "TREFFER" : "Treffer";
                                        else if (/miss/i.test(currentWord)) newWord = currentWord === currentWord.toUpperCase() ? "HIT" : "Hit";
                                    } else {
                                        if (/treffer|getroffen|critical/i.test(currentWord)) newWord = currentWord === currentWord.toUpperCase() ? "VERFEHLT" : "Verfehlt";
                                        else if (/hit/i.test(currentWord)) newWord = currentWord === currentWord.toUpperCase() ? "MISS" : "Miss";
                                    }
                                    hmNode.nodeValue = txt.replace(currentWord, newWord);
                                    let el = hmNode.parentElement;
                                    while (el && el !== doc.body) {
                                        if (typeof el.className === "string") {
                                            if (actualNewTotal >= defValue) el.className = el.className.replace(/miss/ig, "hit").replace(/failure/ig, "success").replace(/verfehlt/ig, "treffer");
                                            else el.className = el.className.replace(/hit/ig, "miss").replace(/success/ig, "failure").replace(/treffer/ig, "verfehlt");
                                        }
                                        el = el.parentElement;
                                    }
                                }
                            }

                            // 6. Schaden 100% präzise aktualisieren
                            if (hwDiff !== 0) {
                                const icons = Array.from(doc.body.querySelectorAll('i, img'));
                                for (let icon of icons) {
                                    const cls = (typeof icon.className === 'string' ? icon.className : (icon.className?.baseVal || ""));
                                    const src = icon.getAttribute('src') || "";
                                    const title = icon.getAttribute('data-tooltip') || icon.getAttribute('title') || icon.getAttribute('aria-label') || "";
                                    
                                    const isDamageIcon = 
                                        /sword|blade|bolt|lightning|fire|ice|earth|air|wind|poison|dark|light|physical/i.test(cls) || 
                                        /sword|damage|bolt|fire|ice|earth|air|poison|dark|light/i.test(src) || 
                                        /schaden|damage|bolt|blitz|feuer|eis|erde|luft|wind|gift|dunkelheit|licht|physisch/i.test(title);
                                    
                                    if (isDamageIcon) {
                                        let parent = icon.parentElement;
                                        let updated = false;
                                        for (let i = 0; i < 3; i++) {
                                            if (!parent) break;
                                            
                                            let twDamage = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null, false);
                                            let tn;
                                            while(tn = twDamage.nextNode()) {
                                                let txt = tn.nodeValue.trim();
                                                if (/^[-+]?\d+$/.test(txt)) {
                                                    // Verhindert versehentliches Editieren des Angriffs-/Attributswerts in der gleichen Row
                                                    if (!/(vs|DEF|HW|HR|GES|MAT|EIN|WLK|MIG|INS|DEX|WPR|GLÜ|LUC|MOD)/i.test(tn.parentElement.textContent)) {
                                                        tn.nodeValue = String(Number(txt) + hwDiff);
                                                        updated = true;
                                                        break;
                                                    }
                                                }
                                            }
                                            if (updated) break;
                                            parent = parent.parentElement;
                                        }
                                        if (updated) break;
                                    }
                                }
                            }

                            // 7. Atmosphäre-Banner (OHNE Besser/Schlechter)
                            let flavorText = "Du manipulierst das Schicksal und wendest deine Glückszahl an, um das Blatt zu wenden.";
                            let hwTxt = hwDiff !== 0 ? `<br>Neuer HW: <strong>${newHighestValue}</strong>` : ``;
                            let statsText = `W${chosenDie.faces}: <strong>${oldVal}</strong> ➔ <strong>${currentLucky}</strong><br>Neue Glückszahl auf Bogen: <strong>${oldVal}</strong>${hwTxt}`;
                            
                            newMessageData.content = chatBox(flavorText, statsText, "✨ Glückliche Sieben") + doc.body.innerHTML;
                            await ChatMessage.create(newMessageData);

                        } catch (err) { ui.notifications.error("Fehler: " + err.message); }
                    }
                },
                cancel: { label: "Abbrechen" }
            },
            default: "swap"
        }).render(true);
    } catch (err) { ui.notifications.error("Fehler: " + err.message); }
})();