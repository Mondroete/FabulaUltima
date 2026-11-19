// ============================================================================
// MAGISCHE SYMBOLE – ABENDÜBERWACHUNG
// Project FU 5.x / Foundry VTT V14
// ============================================================================
(async () => {
    // ========================================================================
    // 1. KONFIGURATION
    // ========================================================================
    const CONFIG = {
        symbolPrefix: "Effekt: Symbol",
        skillName: "Magische Symbole",
        stateKey: "magischeSymboleAbendueberwachung",
        scanExistingEffects: true,
        onlyActiveGMs: true,
        whisperOwners: true,
        showSpellDescription: true,
        descriptionMaximum: 900,
        showStartupNotification: true,
        spellCompendiumFallback: "Compendium.fabula-ultima-ger.item-1-artikel.Item.",
        colors: {
            dark: "rgba(20, 58, 54, 0.8)",    
            middle: "rgba(28, 86, 79, 0.7)",  
            light: "rgba(38, 115, 106, 0.6)", 
            gold: "#e6e1c5",                  
            border: "#3d968b",                
            text: "#e6e1c5",                  
            pale: "rgba(230, 225, 197, 0.9)",
            paleSpell: "rgba(230, 225, 197, 0.75)", 
            paleText: "#1a1a1a",              
            warning: "#8f3333"
        }
    };
    // ========================================================================
    // 2. GM-PRÜFUNG
    // ========================================================================
    if (!game.user.isGM) {
        ui.notifications.warn(
            "Die Überwachung für Magische Symbole muss von der Spielleitung gestartet werden."
        );
        return;
    }
    // ========================================================================
    // 3. VORHANDENEN HOOK ENTFERNEN
    // ========================================================================
    const previousState = globalThis[CONFIG.stateKey];
    if (previousState?.hookId) {
        Hooks.off("createActiveEffect", previousState.hookId);
    }
    if (previousState?.hookIdCreate) {
        Hooks.off("createActiveEffect", previousState.hookIdCreate);
    }
    if (previousState?.hookIdDelete) {
        Hooks.off("deleteActiveEffect", previousState.hookIdDelete);
    }
    
    const notifiedEffects = previousState?.notifiedEffects instanceof Set
        ? previousState.notifiedEffects
        : new Set();
    const notifiedDeletions = previousState?.notifiedDeletions instanceof Set
        ? previousState.notifiedDeletions
        : new Set();
        
    const processingEffects = new Set();
    // ========================================================================
    // 4. HILFSFUNKTIONEN
    // ========================================================================
    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
    function normalize(value) {
        return String(value ?? "")
            .trim()
            .toLocaleLowerCase("de-DE");
    }
    function isSymbolEffect(effect) {
        const name = String(effect?.name ?? effect?.label ?? "").trim();
        return normalize(name).startsWith(
            normalize(CONFIG.symbolPrefix)
        );
    }
    function getTargetActor(effect) {
        if (!effect) return null;
        if (effect.parent?.documentName === "Actor") {
            return effect.parent;
        }
        if (effect.parent?.actor) {
            return effect.parent.actor;
        }
        if (effect.target?.documentName === "Actor") {
            return effect.target;
        }
        if (effect.target?.actor) {
            return effect.target.actor;
        }
        return null;
    }
    function getEffectUuid(effect) {
        return effect?.uuid
            ?? `${effect?.parent?.uuid ?? "Actor.Unbekannt"}.ActiveEffect.${effect?.id ?? foundry.utils.randomID()}`;
    }
    function getProjectFUSource(effect) {
        return foundry.utils.getProperty(
            effect,
            "flags.projectfu.Source"
        ) ?? {};
    }
    async function resolveSourceActor(effect) {
        const source = getProjectFUSource(effect);
        if (source.actorUuid) {
            try {
                const document = await fromUuid(source.actorUuid);
                if (document?.documentName === "Actor") return document;
                if (document?.actor) return document.actor;
                if (document?.parent?.documentName === "Actor") return document.parent;
            } catch (error) {
                console.warn("Magische Symbole | Quellen-UUID Fehler:", source.actorUuid, error);
            }
        }
        if (source.itemUuid) {
            try {
                const sourceItem = await fromUuid(source.itemUuid);
                if (sourceItem?.parent?.documentName === "Actor") return sourceItem.parent;
            } catch (error) {
                console.warn("Magische Symbole | Quellen-Item Fehler:", source.itemUuid, error);
            }
        }
        const sourceName = String(source.name ?? "").trim();
        if (!sourceName) return null;
        const normalizedSourceName = normalize(sourceName);
        const sceneToken = canvas?.tokens?.placeables?.find(token => {
            return normalize(token.actor?.name) === normalizedSourceName;
        });
        if (sceneToken?.actor) return sceneToken.actor;
        
        return game.actors.find(actor => {
            return normalize(actor.name) === normalizedSourceName;
        }) ?? null;
    }
    function getMagicalSymbolsSkill(sourceActor) {
        if (!sourceActor) return null;
        const byFuid = sourceActor.items.find(item => {
            return normalize(
                foundry.utils.getProperty(item, "system.fuid")
            ) === "magische-symbole";
        });
        if (byFuid) return byFuid;
        
        return sourceActor.items.find(item => {
            return (
                item.type === "skill" &&
                normalize(item.name) === normalize(CONFIG.skillName)
            );
        }) ?? null;
    }
    function getSkillLevel(skill) {
        const rawLevel = foundry.utils.getProperty(skill, "system.level.value");
        const level = Number(rawLevel);
        if (!Number.isFinite(level)) return 0;
        return Math.max(0, Math.floor(level));
    }
    function getKnownSpells(sourceActor) {
        if (!sourceActor) return [];
        return sourceActor.items.filter(item => item.type === "spell");
    }
    function parseNumericCost(value) {
        if (typeof value === "number") {
            return Number.isFinite(value) ? value : null;
        }
        const text = String(value ?? "").trim().replace(",", ".");
        if (!text) return null;
        const directNumber = Number(text);
        if (Number.isFinite(directNumber)) return directNumber;
        const match = text.match(/-?\d+(?:\.\d+)?/);
        if (!match) return null;
        const extractedNumber = Number(match[0]);
        return Number.isFinite(extractedNumber) ? extractedNumber : null;
    }
    function getSpellCostData(spell) {
        const baseCost = parseNumericCost(foundry.utils.getProperty(spell, "system.cost.amount"));
        const resource = String(foundry.utils.getProperty(spell, "system.cost.resource") ?? "mp").trim().toLowerCase();
        const perTarget = Boolean(foundry.utils.getProperty(spell, "system.cost.perTarget"));
        const targetingMaxRaw = Number(foundry.utils.getProperty(spell, "system.targeting.max"));
        const targetingMax = Number.isFinite(targetingMaxRaw) ? Math.max(0, Math.floor(targetingMaxRaw)) : 0;
        const targetingRule = String(foundry.utils.getProperty(spell, "system.targeting.rule") ?? "").trim();
        return { baseCost, resource, perTarget, targetingMax, targetingRule };
    }
    function getAllowedTargetOptions(spell, maximumCost) {
        const costData = getSpellCostData(spell);
        if (costData.baseCost === null || costData.baseCost < 0) {
            return { allowed: false, reason: "Kostenfehler", costData, options: [] };
        }
        if (costData.baseCost === 0) {
            return { allowed: true, costData, options: [{ targets: costData.perTarget ? 1 : null, totalCost: 0 }] };
        }
        if (!costData.perTarget) {
            const allowed = costData.baseCost <= maximumCost;
            return {
                allowed,
                reason: allowed ? null : `Zu teuer (${costData.baseCost} GP).`,
                costData,
                options: allowed ? [{ targets: null, totalCost: costData.baseCost }] : []
            };
        }
        const affordableTargets = Math.floor(maximumCost / costData.baseCost);
        let spellTargetMaximum = costData.targetingMax;
        if (spellTargetMaximum <= 0) spellTargetMaximum = affordableTargets;
        const maximumTargets = Math.min(affordableTargets, spellTargetMaximum);
        
        if (maximumTargets < 1) {
            return { allowed: false, reason: `Zu teuer.`, costData, options: [] };
        }
        const options = [];
        for (let targets = 1; targets <= maximumTargets; targets++) {
            options.push({ targets, totalCost: costData.baseCost * targets });
        }
        return { allowed: true, costData, options };
    }
    function getDurationLabel(spell) {
        const duration = String(foundry.utils.getProperty(spell, "system.duration.value") ?? "").trim().toLowerCase();
        const labels = { scene: "Szene", instantaneous: "Unmittelbar", instant: "Unmittelbar", rest: "Rast", turn: "Zug", round: "Runde" };
        return labels[duration] ?? duration ?? "";
    }
    function getTargetLabel(spell) {
        const maximum = Number(foundry.utils.getProperty(spell, "system.targeting.max"));
        const rule = String(foundry.utils.getProperty(spell, "system.targeting.rule") ?? "").trim().toLowerCase();
        if (rule === "self") return "Selbst";
        if (rule === "single" || maximum === 1) return "ein Ziel";
        if (rule === "multiple" && Number.isFinite(maximum) && maximum > 1) return `bis zu ${maximum} Ziele`;
        if (rule === "special") return "besonders";
        if (Number.isFinite(maximum) && maximum > 0) return maximum === 1 ? "ein Ziel" : `bis zu ${maximum} Ziele`;
        return "laut Zauber";
    }
    function getCleanDescription(spell) {
        const description = String(foundry.utils.getProperty(spell, "system.description") ?? "").trim();
        if (!description) return "";
        if (description.length <= CONFIG.descriptionMaximum) return description;
        return `${description.slice(0, CONFIG.descriptionMaximum)}…`;
    }
    function getSpellLink(spell) {
        const sourceId = foundry.utils.getProperty(spell, "flags.core.sourceId");
        if (sourceId && sourceId.startsWith("Compendium.")) {
            return `@UUID[${sourceId}]{${spell.name}}`;
        }
        if (spell.id) {
            return `@UUID[${CONFIG.spellCompendiumFallback}${spell.id}]{${spell.name}}`;
        }
        return `@UUID[${spell.uuid}]{${spell.name}}`;
    }
    function getWhisperRecipients(targetActor) {
        const recipients = new Set();
        for (const user of game.users) {
            if (!user.isGM) continue;
            if (CONFIG.onlyActiveGMs && !user.active) continue;
            recipients.add(user.id);
        }
        if (CONFIG.whisperOwners && targetActor) {
            for (const user of game.users) {
                if (user.isGM) continue;
                if (!user.active) continue;
                if (targetActor.testUserPermission(user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)) {
                    recipients.add(user.id);
                }
            }
        }
        return Array.from(recipients);
    }
    function getSymbolDisplayName(effect) {
        const name = String(effect?.name ?? "Effekt: Symbol").trim();
        return name.replace(/^Effekt:\s*/i, "");
    }
    
    function buildSpellCard({
        effect,
        targetActor,
        sourceActor,
        skillLevel,
        maximumCost,
        eligibleSpells,
        mode = "create"
    }) {
        const C = CONFIG.colors;
        
        // 1. KARTEN-LAYOUT FÜR DIE ERINNERUNG (NEUES SYMBOL)
        if (mode === "create") {
            const introText = `<strong>Symbolträger Übersicht:</strong><br>- <strong>${escapeHtml(targetActor.name)}</strong> hat das Symbol <strong>${escapeHtml(getSymbolDisplayName(effect))}</strong> von <strong>${escapeHtml(sourceActor.name)}</strong>.<br>Denk daran: Du kannst dieses Symbol für eine Zauber-Aktion nun aktivieren.`;

            return `
                <div style="border:2px solid ${C.border}; border-radius:9px; overflow:hidden; background: transparent !important; box-shadow: none !important; font-size:14px;">
                    <div style="display:flex; align-items:center; justify-content:center; gap:8px; padding:10px 12px; background:${C.middle} !important; color:${C.gold}; font-size:18px; font-weight:bold; text-align:center; border-bottom: 2px solid ${C.border};">
                        <img src="https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/systems/projectfu/styles/static/compendium/classes/symbolist/symbolist_magic_symbols.png" style="width: 24px; height: 24px; border: none; flex-shrink: 0;" alt="Icon">
                        <span>Magische Symbole – Erinnerung</span>
                    </div>
                    <div style="padding:12px; font-size:14px; line-height:1.4; background: transparent !important; color: inherit;">
                        ${introText}
                    </div>
                </div>
            `;
        }

        // 2. KARTEN-LAYOUT FÜR DAS AUFLÖSEN (GELÖSCHTES SYMBOL)
        const spellBlocks = eligibleSpells.map(
            ({ spell, evaluation }) => {
                const description = CONFIG.showSpellDescription ? getCleanDescription(spell) : "";
                const offensive = Boolean(foundry.utils.getProperty(spell, "system.isOffensive.value"));
                
                return `
                    <details style="margin-top:8px; padding:8px; border:1px solid ${C.border}; border-radius:7px; background: transparent !important;">
                        <summary style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                            ${spell.img ? `<img src="${escapeHtml(spell.img)}" style="width: 36px; height: 36px; object-fit: cover; border: 1px solid ${C.border}; border-radius: 4px; flex-shrink: 0;" alt="${escapeHtml(spell.name)}">` : ""}
                            <div style="flex:1;">
                                <div style="color: inherit; font-size:15px; font-weight:bold;">
                                    ${getSpellLink(spell)} ${offensive ? " @ICON[offensive]" : ""}
                                </div>
                                <div style="margin-top:2px; color: inherit; font-size:14px;">
                                    <strong>Ziele:</strong> ${escapeHtml(getTargetLabel(spell))} | <strong>Dauer:</strong> ${escapeHtml(getDurationLabel(spell))}
                                </div>
                            </div>
                            <div style="font-size:13px; color:${C.text}; background-color:${C.middle}; border: 1px solid ${C.border}; padding: 2px 6px; border-radius: 12px; font-weight:bold;">Info ▼</div>
                        </summary>
                        
                        <div style="padding-top: 10px;">
                            ${description ? `
                                <div style="margin-bottom:10px; padding:7px; border-left:3px solid ${C.middle}; color: inherit; font-size:14px; background: transparent !important;">
                                    ${description}
                                </div>
                            ` : ""}
                        </div>
                    </details>
                `;
            }
        ).join("");

        const infoText = `Du hast das Symbol <strong>${escapeHtml(getSymbolDisplayName(effect))}</strong> entfernt.<br>Wurde es selbst aufgelöst oder ist die Wirkung des Symbols in Kraft gesetzt worden?<br><br>Selbst dann: Du kannst folgende Zauber nutzen (bis zu ${maximumCost} GP):`;

        return `
            <div style="border:2px solid ${C.border}; border-radius:9px; overflow:hidden; background: transparent !important; box-shadow: none !important; font-size:14px;">
                <div style="display:flex; align-items:center; justify-content:center; gap:8px; padding:10px 12px; background:${C.middle} !important; color:${C.gold}; font-size:18px; font-weight:bold; text-align:center; border-bottom: 2px solid ${C.border};">
                    <img src="https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/systems/projectfu/styles/static/compendium/classes/symbolist/symbolist_magic_symbols.png" style="width: 24px; height: 24px; border: none; flex-shrink: 0;" alt="Icon">
                    <span>Magische Symbole – Aufgelöst</span>
                </div>
                
                <div style="padding:12px; font-size:14px; line-height:1.4; border-bottom: 1px solid ${C.border}; background: transparent !important; color: inherit;">
                    ${infoText}
                </div>

                <div style="padding:10px; background: transparent !important;">
                    <details>
                        <summary style="cursor:pointer; font-weight:bold; font-size:13px; color: inherit; padding:4px 0; border-bottom: 1px solid ${C.border}; margin-bottom: 5px;">
                            Verfügbare Zauber (klicken zum Aufklappen)
                        </summary>
                        <div style="padding-top: 5px;">
                            ${spellBlocks}
                        </div>
                    </details>
                </div>
                <div style="padding:12px; border-top:1px solid ${C.border}; background: transparent !important; font-size:14px; color: inherit; line-height:1.4;">
                    <strong>Wichtiger Hinweis:</strong> Ziehe den Zauber-Link direkt aus diesem Chat in deinen Charakterbogen. Führe den Zauber aus und lösche ihn danach wieder.
                </div>
            </div>
        `;
    }

    function buildErrorCard({ effect, targetActor, title, message }) {
        const C = CONFIG.colors;
        return `
            <div style="border:2px solid ${C.warning}; border-radius:8px; overflow:hidden; background:${C.dark}; color:${C.text}; font-size:14px;">
                <div style="padding:9px; background:${C.warning}; color:#ffffff; font-size:16px; font-weight:bold; text-align:center;">
                    ${escapeHtml(title)}
                </div>
                <div style="padding:10px;">
                    <p><strong>Träger:</strong> ${escapeHtml(targetActor?.name ?? "Unbekannt")}</p>
                    <p><strong>Effekt:</strong> ${escapeHtml(effect?.name ?? "Unbekannt")}</p>
                    <p>${escapeHtml(message)}</p>
                </div>
            </div>
        `;
    }

    async function sendPrivateMessage({ targetActor, content }) {
        const whisper = getWhisperRecipients(targetActor);
        if (!whisper.length) return;
        const speaker = { alias: "System" };
        await ChatMessage.create({ speaker, content, whisper });
    }

    // ========================================================================
    // 5. SYMBOL-EFFEKT VERARBEITEN
    // ========================================================================
    async function processSymbolEffect(
        effect,
        { force = false, reason = "unbekannt", mode = "create" } = {}
    ) {
        if (!effect || !isSymbolEffect(effect)) return false;
        const effectUuid = getEffectUuid(effect);
        
        if (processingEffects.has(effectUuid)) return false;
        
        if (!force && mode === "create" && notifiedEffects.has(effectUuid)) return false;
        if (!force && mode === "delete" && notifiedDeletions.has(effectUuid)) return false;

        processingEffects.add(effectUuid);
        try {
            const targetActor = getTargetActor(effect);
            if (!targetActor) return false;
            
            const sourceActor = await resolveSourceActor(effect);
            if (!sourceActor) {
                if (mode === "create") {
                    await sendPrivateMessage({
                        targetActor,
                        content: buildErrorCard({
                            effect, targetActor,
                            title: "Quelle des Symbols nicht gefunden",
                            message: `Der Charakter konnte nicht gefunden werden.`
                        })
                    });
                    notifiedEffects.add(effectUuid);
                }
                return false;
            }
            
            const skill = getMagicalSymbolsSkill(sourceActor);
            if (!skill) {
                if (mode === "create") notifiedEffects.add(effectUuid);
                return false;
            }
            
            const skillLevel = getSkillLevel(skill);
            if (skillLevel <= 0) {
                if (mode === "create") notifiedEffects.add(effectUuid);
                return false;
            }
            
            const maximumCost = skillLevel * 10;
            let eligibleSpells = [];

            // Zauber nur ermitteln, wenn das Symbol aufgelöst (delete) wird
            if (mode === "delete") {
                const spells = getKnownSpells(sourceActor);
                eligibleSpells = spells
                    .map(spell => ({
                        spell,
                        evaluation: getAllowedTargetOptions(spell, maximumCost)
                    }))
                    .filter(entry => entry.evaluation.allowed)
                    .sort((a, b) => {
                        const costA = a.evaluation.options[0]?.totalCost ?? 0;
                        const costB = b.evaluation.options[0]?.totalCost ?? 0;
                        if (costA !== costB) return costA - costB;
                        return a.spell.name.localeCompare(b.spell.name, "de");
                    });

                if (!eligibleSpells.length) {
                    return false;
                }
            }
            
            const content = buildSpellCard({
                effect,
                targetActor,
                sourceActor,
                skillLevel,
                maximumCost,
                eligibleSpells,
                mode
            });
            
            await sendPrivateMessage({ targetActor, content });
            
            if (mode === "create") notifiedEffects.add(effectUuid);
            if (mode === "delete") notifiedDeletions.add(effectUuid);
            
            return true;
        } catch (error) {
            console.error("Magische Symbole | Fehler bei der Verarbeitung:", effect, error);
            return false;
        } finally {
            processingEffects.delete(effectUuid);
        }
    }

    // ========================================================================
    // 6. VORHANDENE EFFEKTE DURCHSUCHEN
    // ========================================================================
    async function scanExistingSymbolEffects() {
        let found = 0;
        let processed = 0;
        for (const actor of game.actors) {
            for (const effect of actor.effects ?? []) {
                if (!isSymbolEffect(effect)) continue;
                found++;
                const success = await processSymbolEffect(effect, { force: false, reason: "Startprüfung", mode: "create" });
                if (success) processed++;
            }
        }
        return { found, processed };
    }

    // ========================================================================
    // 7. HOOKS REGISTRIEREN
    // ========================================================================
    const hookIdCreate = Hooks.on("createActiveEffect", async effect => {
        if (!game.user.isGM) return;
        if (!isSymbolEffect(effect)) return;
        await new Promise(resolve => setTimeout(resolve, 250));
        await processSymbolEffect(effect, { force: false, reason: "neuer Symbol-Effekt", mode: "create" });
    });

    const hookIdDelete = Hooks.on("deleteActiveEffect", async effect => {
        if (!game.user.isGM) return;
        if (!isSymbolEffect(effect)) return;
        await processSymbolEffect(effect, { force: false, reason: "Symbol-Effekt entfernt", mode: "delete" });
    });

    // ========================================================================
    // 8. ABENDSTATUS SPEICHERN
    // ========================================================================
    globalThis[CONFIG.stateKey] = {
        hookIdCreate,
        hookIdDelete,
        notifiedEffects,
        notifiedDeletions,
        processingEffects,
        processSymbolEffect,
        scanExistingSymbolEffects,
        startedAt: new Date(),
        startedBy: game.user.id
    };

    // ========================================================================
    // 9. BEREITS VORHANDENE SYMBOLE PRÜFEN
    // ========================================================================
    let scanResult = { found: 0, processed: 0 };
    if (CONFIG.scanExistingEffects) {
        scanResult = await scanExistingSymbolEffects();
    }

    // ========================================================================
    // 10. STARTMELDUNG
    // ========================================================================
    if (CONFIG.showStartupNotification) {
        ui.notifications.info(
            `Magische Symbole aktiv: ${scanResult.found} vorhandene Symbol-Effekte geprüft, ${scanResult.processed} neue Nachrichten erstellt.`
        );
    }
})();