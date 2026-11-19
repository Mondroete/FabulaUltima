// ============================================================================
// ÜBERSINNLICHES SCHILD
// Project FU 5.x / Foundry VTT V14
// ============================================================================

(async () => {
    try {

// ============================================================================
// 1. KONFIGURATION
// ============================================================================

        const CONFIG = {
            title: "Übersinnliches Schild",

            image:
                "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/modules/fabula_ultima/Klasse/Esper/Gaben/ubersinnliches-schild.webp",

            colors: {
                dark: "#1c3b38",
                middle: "#286e67",
                light: "rgba(38, 115, 106, 0.12)",
                gold: "#e6e1c5",
                border: "#3d968b",
                success: "#378b45",
                failure: "#a33b3b"
            }
        };

// ============================================================================
// 2. HILFSFUNKTIONEN
// ============================================================================

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

        function toNumber(value) {
            const number = Number(value);

            return Number.isFinite(number)
                ? number
                : null;
        }

        function wait(milliseconds) {
            return new Promise(resolve =>
                setTimeout(resolve, milliseconds)
            );
        }

        function messagePlainText(message) {
            const document =
                new DOMParser().parseFromString(
                    String(message?.content ?? ""),
                    "text/html"
                );

            return document.body.textContent ?? "";
        }

// ============================================================================
// 3. CHARAKTER BESTIMMEN
// ============================================================================

        const controlledToken =
            canvas.tokens.controlled[0] ?? null;

        const actor =
            controlledToken?.actor ??
            game.user.character ??
            null;

        if (!actor) {
            ui.notifications.warn(
                "Bitte wähle zuerst deinen Token aus!"
            );

            return;
        }

// ============================================================================
// 4. PROJECT-FU-WERTE LESEN
// ============================================================================

        const willpower = toNumber(
            actor.system?.attributes?.wlp?.current
        );

        const normalDef = toNumber(
            actor.system?.derived?.def?.value
        );

        const normalMdef = toNumber(
            actor.system?.derived?.mdef?.value
        );

        const currentMP = toNumber(
            actor.system?.resources?.mp?.value
        );

        const currentClock = toNumber(
            actor.system?.clocks?.brainwave?.value
        );

        const maximumClock = toNumber(
            actor.system?.clocks?.brainwave?.max
        );

        if (willpower === null) {
            ui.notifications.error(
                "Die aktuelle Willenskraft konnte nicht gelesen werden."
            );
            return;
        }

        if (
            normalDef === null ||
            normalMdef === null
        ) {
            ui.notifications.error(
                "DEF oder MDEF konnte nicht gelesen werden."
            );
            return;
        }

        if (currentMP === null) {
            ui.notifications.error(
                "Die aktuellen GP konnten nicht gelesen werden."
            );
            return;
        }

        if (
            currentClock === null ||
            maximumClock === null
        ) {
            ui.notifications.error(
                "Die Gehirnwellenuhr konnte nicht gelesen werden."
            );
            return;
        }

// ============================================================================
// 5. SCHILDWERT UND KOSTEN
// ============================================================================

        const psychicDefense =
            willpower +
            (currentClock * 2);

        const finalDef =
            Math.max(
                normalDef,
                psychicDefense
            );

        const finalMdef =
            Math.max(
                normalMdef,
                psychicDefense
            );

        const mindPointCost =
            Math.max(
                5,
                currentClock * 5
            );

        const newMP =
            currentMP -
            mindPointCost;

        const nextClock =
            Math.min(
                maximumClock,
                currentClock + 1
            );

        if (currentMP < mindPointCost) {
            ui.notifications.warn(
                `${actor.name} besitzt nur ${currentMP} GP. Benötigt werden ${mindPointCost} GP.`
            );
            return;
        }

// ============================================================================
// 6. LETZTE PASSENDE CHATKARTE FINDEN
// ============================================================================

        function isSuitableMessage(message) {
            const text =
                messagePlainText(message);

            const hasResult =
                /\b(TREFFER|GETROFFEN|VERFEHLT|HIT|MISS)\b/i
                    .test(text);

            const hasResultDefense =
                /\b(TREFFER|GETROFFEN|VERFEHLT|HIT|MISS)\s*(?:vs\.?|gegen)\s*\d+\b/i
                    .test(text);

            const hasDefenseType =
                /\b(?:M\.?\s*DEF|MDEF|DEF|MAGIE-VERTEIDIGUNG|VERTEIDIGUNG)\b/i
                    .test(text);

            return (
                hasResult &&
                (
                    hasResultDefense ||
                    hasDefenseType
                )
            );
        }

        const originalMessage =
            Array.from(game.messages ?? [])
                .reverse()
                .find(isSuitableMessage)
            ?? null;

        if (!originalMessage) {
            ui.notifications.warn(
                "Es wurde keine passende Angriffs- oder Zauberkarte gefunden."
            );
            return;
        }

// ============================================================================
// 7. PROBENWERT UND VERTEIDIGUNGSART LESEN
// ============================================================================

        function readAttackInformation(message) {
            const text =
                messagePlainText(message);

            const forwardMatch =
                text.match(
                    /(\d+)\s*(?:vs\.?|gegen)\s*(M\.?\s*DEF|MDEF|DEF|MAGIE-VERTEIDIGUNG|VERTEIDIGUNG)/i
                );

            if (forwardMatch) {
                return {
                    attackTotal:
                        Number(forwardMatch[1]),

                    defenseType:
                        forwardMatch[2]
                };
            }

            const reverseMatch =
                text.match(
                    /(M\.?\s*DEF|MDEF|DEF|MAGIE-VERTEIDIGUNG|VERTEIDIGUNG)\s*(?:vs\.?|gegen)\s*(\d+)/i
                );

            if (reverseMatch) {
                return {
                    attackTotal:
                        Number(reverseMatch[2]),

                    defenseType:
                        reverseMatch[1]
                };
            }

            const roll =
                message.rolls?.[0] ??
                message.roll ??
                null;

            const rollTotal =
                toNumber(
                    roll?.total
                );

            if (rollTotal !== null) {
                return {
                    attackTotal:
                        rollTotal,

                    defenseType:
                        "DEF"
                };
            }

            return null;
        }

        const attackInformation =
            readAttackInformation(
                originalMessage
            );

        if (!attackInformation) {
            ui.notifications.error(
                "Der Probenwert konnte aus der letzten Chatkarte nicht gelesen werden."
            );
            return;
        }

// ============================================================================
// 8. DEF ODER MDEF BESTIMMEN
// ============================================================================

        const normalizedDefenseType =
            normalize(
                attackInformation.defenseType
            );

        const usesMdef =
            normalizedDefenseType.includes("mdef") ||
            normalizedDefenseType.includes("m.def") ||
            normalizedDefenseType.includes("magie");

        const displayedDefenseType =
            usesMdef
                ? "MDEF"
                : "DEF";

        const normalDefense =
            usesMdef
                ? normalMdef
                : normalDef;

        const calculatedDefense =
            usesMdef
                ? finalMdef
                : finalDef;

        const attackHits =
            attackInformation.attackTotal >=
            calculatedDefense;

// ============================================================================
// 9. ERGEBNISWORT
// ============================================================================

        function getResultWord(
            originalWord,
            resultIsHit
        ) {
            const upperCase =
                originalWord ===
                originalWord.toUpperCase();

            const english =
                /hit|miss/i.test(
                    originalWord
                );

            if (resultIsHit) {
                if (english) {
                    return upperCase
                        ? "HIT"
                        : "Hit";
                }

                return upperCase
                    ? "TREFFER"
                    : "Treffer";
            }

            if (english) {
                return upperCase
                    ? "MISS"
                    : "Miss";
            }

            return upperCase
                ? "VERFEHLT"
                : "Verfehlt";
        }

// ============================================================================
// 10. FARBKLASSEN DER CHATKARTE ANPASSEN
// ============================================================================

        function updateResultClasses(
            element,
            resultIsHit
        ) {
            let currentElement =
                element;

            while (
                currentElement &&
                currentElement !==
                    currentElement.ownerDocument.body
            ) {
                if (
                    typeof currentElement.className ===
                    "string"
                ) {
                    if (resultIsHit) {
                        currentElement.className =
                            currentElement.className
                                .replace(
                                    /\bmiss\b/gi,
                                    "hit"
                                )
                                .replace(
                                    /\bfailure\b/gi,
                                    "success"
                                )
                                .replace(
                                    /\bfailed\b/gi,
                                    "success"
                                )
                                .replace(
                                    /\bverfehlt\b/gi,
                                    "treffer"
                                );
                    } else {
                        currentElement.className =
                            currentElement.className
                                .replace(
                                    /\bhit\b/gi,
                                    "miss"
                                )
                                .replace(
                                    /\bsuccess\b/gi,
                                    "failure"
                                )
                                .replace(
                                    /\bsucceeded\b/gi,
                                    "failure"
                                )
                                .replace(
                                    /\btreffer\b/gi,
                                    "verfehlt"
                                );
                    }
                }

                currentElement =
                    currentElement.parentElement;
            }
        }

// ============================================================================
// 11. ANGEPASSTE ANGRIFFSKARTE
// ============================================================================

        function createModifiedMessageContent(
            latestMP,
            actualNewMP
        ) {
            const document =
                new DOMParser().parseFromString(
                    String(
                        originalMessage.content ??
                        ""
                    ),
                    "text/html"
                );

            let resultLineUpdated =
                false;

            const textWalker =
                document.createTreeWalker(
                    document.body,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );

            let textNode;

            while (
                (
                    textNode =
                        textWalker.nextNode()
                )
            ) {
                const text =
                    textNode.nodeValue ?? "";

                const resultMatch =
                    text.match(
                        /\b(TREFFER|GETROFFEN|VERFEHLT|HIT|MISS)\s*(vs\.?|gegen)\s*(\d+)\b/i
                    );

                if (!resultMatch) {
                    continue;
                }

                const oldResultWord =
                    resultMatch[1];

                const connector =
                    resultMatch[2];

                const newResultWord =
                    getResultWord(
                        oldResultWord,
                        attackHits
                    );

                textNode.nodeValue =
                    text.replace(
                        resultMatch[0],
                        `${newResultWord} ${connector} ${calculatedDefense}`
                    );

                updateResultClasses(
                    textNode.parentElement,
                    attackHits
                );

                resultLineUpdated =
                    true;

                break;
            }

            if (!resultLineUpdated) {
                const allTextNodes = [];

                const fallbackWalker =
                    document.createTreeWalker(
                        document.body,
                        NodeFilter.SHOW_TEXT,
                        null,
                        false
                    );

                let fallbackNode;

                while (
                    (
                        fallbackNode =
                            fallbackWalker.nextNode()
                    )
                ) {
                    allTextNodes.push(
                        fallbackNode
                    );
                }

                const resultNode =
                    allTextNodes.find(
                        node =>
                            /\b(TREFFER|GETROFFEN|VERFEHLT|HIT|MISS)\b/i
                                .test(
                                    node.nodeValue ??
                                    ""
                                )
                    )
                    ?? null;

                if (resultNode) {
                    const wordMatch =
                        resultNode.nodeValue
                            .match(
                                /\b(TREFFER|GETROFFEN|VERFEHLT|HIT|MISS)\b/i
                            );

                    if (wordMatch) {
                        const newWord =
                            getResultWord(
                                wordMatch[1],
                                attackHits
                            );

                        resultNode.nodeValue =
                            resultNode.nodeValue
                                .replace(
                                    wordMatch[1],
                                    newWord
                                );

                        updateResultClasses(
                            resultNode.parentElement,
                            attackHits
                        );
                    }

                    let defenseNumberNode =
                        null;

                    let container =
                        resultNode.parentElement;

                    for (
                        let level = 0;
                        level < 5 &&
                        container;
                        level++
                    ) {
                        const numberWalker =
                            document.createTreeWalker(
                                container,
                                NodeFilter.SHOW_TEXT,
                                null,
                                false
                            );

                        let numberNode;

                        while (
                            (
                                numberNode =
                                    numberWalker.nextNode()
                            )
                        ) {
                            if (
                                numberNode ===
                                resultNode
                            ) {
                                continue;
                            }

                            const numberText =
                                numberNode.nodeValue
                                    ?.trim()
                                ?? "";

                            if (
                                /^\d+$/.test(
                                    numberText
                                )
                            ) {
                                defenseNumberNode =
                                    numberNode;

                                break;
                            }
                        }

                        if (defenseNumberNode) {
                            break;
                        }

                        container =
                            container.parentElement;
                    }

                    if (defenseNumberNode) {
                        defenseNumberNode.nodeValue =
                            String(
                                calculatedDefense
                            );
                    }

                    resultLineUpdated =
                        true;
                }
            }

            const shieldCard = `
                <div style="
                    border:2px solid ${CONFIG.colors.border};
                    border-radius:8px;
                    overflow:hidden;
                    margin-bottom:6px;
                    font-size:14px;
                    line-height:1.4;
                ">
                    <div style="
                        display:flex;
                        align-items:center;
                        gap:9px;
                        padding:8px 10px;
                        background:${CONFIG.colors.dark};
                        color:${CONFIG.colors.gold};
                        font-size:17px;
                        font-weight:bold;
                    ">
                        <img
                            src="${CONFIG.image}"
                            style="
                                width:36px;
                                height:36px;
                                object-fit:cover;
                                border:1px solid ${CONFIG.colors.border};
                                border-radius:5px;
                                flex-shrink:0;
                            "
                            alt="Übersinnliches Schild"
                        >

                        <span>
                            Übersinnliches Schild
                        </span>
                    </div>

                    <div style="
                        padding:10px;
                        font-size:14px;
                    ">
                        <strong>
                            ${escapeHtml(actor.name)}
                        </strong>
                        setzt das Übersinnliche Schild ein.

                        <ul style="
                            margin:7px 0 0 18px;
                            padding:0;
                            font-size:14px;
                        ">
                            <li>
                                Neuer ${displayedDefenseType}-Wert:
                                <strong>
                                    ${calculatedDefense}
                                </strong>
                            </li>

                            <li>
                                GP:
                                <strong>
                                    ${latestMP}
                                    →
                                    ${actualNewMP}
                                </strong>
                            </li>

                            <li>
                                Gehirnwellenuhr:
                                <strong>
                                    ${currentClock}/${maximumClock}
                                    →
                                    ${nextClock}/${maximumClock}
                                </strong>
                            </li>
                        </ul>
                    </div>
                </div>
            `;

            return {
                content:
                    shieldCard +
                    document.body.innerHTML,

                resultLineUpdated
            };
        }

// ============================================================================
// 12. AUSFÜHRLICHES BESTÄTIGUNGSFENSTER
// ============================================================================

        const previewResultText =
            attackHits
                ? "Der Angriff bleibt ein Treffer."
                : "Der Angriff wird zu einem Fehlschlag.";

        const previewResultColor =
            attackHits
                ? CONFIG.colors.failure
                : CONFIG.colors.success;

        const clockAfterText =
            nextClock === currentClock
                ? `${currentClock}/${maximumClock} – vollständig`
                : `${currentClock}/${maximumClock} → ${nextClock}/${maximumClock}`;

        const dialogContent = `
            <div style="
                border:2px solid ${CONFIG.colors.border};
                border-radius:8px;
                overflow:hidden;
                font-size:14px;
                line-height:1.4;
            ">
                <div style="
                    display:flex;
                    align-items:center;
                    gap:10px;
                    padding:9px 12px;
                    background:${CONFIG.colors.dark};
                    color:${CONFIG.colors.gold};
                    font-size:17px;
                    font-weight:bold;
                ">
                    <img
                        src="${CONFIG.image}"
                        style="
                            width:42px;
                            height:42px;
                            object-fit:cover;
                            border:1px solid ${CONFIG.colors.border};
                            border-radius:5px;
                            flex-shrink:0;
                        "
                        alt="Übersinnliches Schild"
                    >

                    <span>
                        Übersinnliches Schild
                    </span>
                </div>

                <div style="
                    padding:12px;
                    font-size:14px;
                ">
                    <p style="
                        margin:0 0 10px 0;
                    ">
                        Möchtest du das
                        <strong>
                            Übersinnliche Schild
                        </strong>
                        für die letzte Probe einsetzen?
                    </p>

                    <div style="
                        display:grid;
                        grid-template-columns:1fr 1fr;
                        gap:8px;
                    ">
                        <div style="
                            padding:8px;
                            border:1px solid ${CONFIG.colors.border};
                            border-radius:5px;
                        ">
                            <strong>
                                Willenskraft
                            </strong>

                            <div style="
                                margin-top:5px;
                                font-weight:bold;
                            ">
                                W${willpower}
                            </div>
                        </div>

                        <div style="
                            padding:8px;
                            border:1px solid ${CONFIG.colors.border};
                            border-radius:5px;
                        ">
                            <strong>
                                Gehirnwellenuhr
                            </strong>

                            <div style="
                                margin-top:5px;
                                font-weight:bold;
                            ">
                                ${clockAfterText}
                            </div>
                        </div>

                        <div style="
                            padding:8px;
                            border:1px solid ${CONFIG.colors.border};
                            border-radius:5px;
                        ">
                            <strong>
                                GP
                            </strong>

                            <div style="
                                margin-top:5px;
                                font-weight:bold;
                            ">
                                ${currentMP}
                                →
                                ${newMP}
                            </div>
                        </div>

                        <div style="
                            padding:8px;
                            border:1px solid ${CONFIG.colors.border};
                            border-radius:5px;
                        ">
                            <strong>
                                Kosten
                            </strong>

                            <div style="
                                margin-top:5px;
                                font-weight:bold;
                                color:#b52626;
                            ">
                                ${mindPointCost} GP
                            </div>
                        </div>
                    </div>

                    <div style="
                        margin-top:10px;
                        padding:9px;
                        border:1px solid ${CONFIG.colors.middle};
                        border-radius:5px;
                        background:${CONFIG.colors.light};
                        font-size:14px;
                        line-height:1.4;
                    ">
                        <div>
                            <strong>
                                Normaler ${displayedDefenseType}-Wert:
                            </strong>

                            ${normalDefense}
                        </div>

                        <div style="
                            margin-top:3px;
                        ">
                            <strong>
                                Übersinnlicher Wert:
                            </strong>

                            ${willpower}
                            +
                            (${currentClock} × 2)
                            =
                            ${psychicDefense}
                        </div>

                        <div style="
                            margin-top:3px;
                        ">
                            <strong>
                                Verwendeter ${displayedDefenseType}-Wert:
                            </strong>

                            ${calculatedDefense}
                        </div>

                        <div style="
                            margin-top:3px;
                        ">
                            <strong>
                                Aktuelle Probe:
                            </strong>

                            ${attackInformation.attackTotal}
                            gegen
                            ${calculatedDefense}
                        </div>

                        <div style="
                            margin-top:7px;
                            padding:5px 8px;
                            border-radius:5px;
                            background:${previewResultColor};
                            color:#ffffff;
                            text-align:center;
                            font-weight:bold;
                        ">
                            ${previewResultText}
                        </div>
                    </div>

                    <p style="
                        margin:10px 0 0 0;
                        font-size:14px;
                    ">
                        Die Verteidigung wird mit dem aktuellen Stand
                        der Gehirnwellenuhr berechnet. Nach dem Einsatz
                        werden die GP automatisch bezahlt. Anschließend
                        bestätigst du das Vorranschreiten deiner
                        Gehirnwellenuhr über die separate Chatnachricht.
                    </p>
                </div>
            </div>
        `;

// ============================================================================
// 13. BESTÄTIGUNGSFENSTER ÖFFNEN
// ============================================================================

        new Dialog({
            title:
                CONFIG.title,

            content:
                dialogContent,

            buttons: {
                apply: {
                    icon:
                        '<i class="fas fa-shield-alt"></i>',

                    label:
                        "Schild einsetzen",

                    callback: async () => {
                        try {

// ============================================================================
// 14. AKTUELLE WERTE ERNEUT PRÜFEN
// ============================================================================

                            const latestMP =
                                toNumber(
                                    actor.system
                                        ?.resources
                                        ?.mp
                                        ?.value
                                );

                            const latestClock =
                                toNumber(
                                    actor.system
                                        ?.clocks
                                        ?.brainwave
                                        ?.value
                                );

                            if (latestMP === null) {
                                ui.notifications.error(
                                    "Die aktuellen GP konnten nicht erneut gelesen werden."
                                );
                                return;
                            }

                            if (latestClock === null) {
                                ui.notifications.error(
                                    "Die Gehirnwellenuhr konnte nicht erneut gelesen werden."
                                );
                                return;
                            }

                            if (
                                latestClock !==
                                currentClock
                            ) {
                                ui.notifications.warn(
                                    "Die Gehirnwellenuhr wurde seit dem Öffnen des Fensters verändert. Bitte führe das Makro erneut aus."
                                );
                                return;
                            }

                            if (
                                latestMP <
                                mindPointCost
                            ) {
                                ui.notifications.warn(
                                    `${actor.name} besitzt nicht mehr genügend GP.`
                                );
                                return;
                            }

                            const actualNewMP =
                                latestMP -
                                mindPointCost;

// ============================================================================
// 15. CHATKARTE VORBEREITEN
// ============================================================================

                            const modifiedContent =
                                createModifiedMessageContent(
                                    latestMP,
                                    actualNewMP
                                );

                            if (
                                !modifiedContent
                                    .resultLineUpdated
                            ) {
                                ui.notifications.error(
                                    "Die Trefferzeile der Chatkarte konnte nicht erkannt werden. Es wurden keine GP ausgegeben."
                                );
                                return;
                            }

// ============================================================================
// 16. GP ABZIEHEN
// ============================================================================

                            await actor.update({
                                "system.resources.mp.value":
                                    actualNewMP
                            });

                            await wait(150);

                            const updatedMP =
                                toNumber(
                                    actor.system
                                        ?.resources
                                        ?.mp
                                        ?.value
                                );

                            if (
                                updatedMP !==
                                actualNewMP
                            ) {
                                ui.notifications.error(
                                    `Die GP konnten nicht korrekt abgezogen werden. Erwartet: ${actualNewMP}, tatsächlich: ${updatedMP}.`
                                );
                                return;
                            }

// ============================================================================
// 17. KORRIGIERTE ANGRIFFSKARTE ERSTELLEN
// ============================================================================

                            const newMessageData =
                                originalMessage
                                    .toObject();

                            delete newMessageData._id;

                            newMessageData.content =
                                modifiedContent.content;

                            await ChatMessage.create(
                                newMessageData
                            );

// ============================================================================
// 18. GEHIRNWELLENUHR-NACHRICHT
// ============================================================================

                            const clockSpeaker =
                                ChatMessage.getSpeaker({
                                    actor,
                                    token:
                                        controlledToken?.document
                                });

                            const clockContent = `
                                <div style="
                                    border:1px solid ${CONFIG.colors.border};
                                    border-radius:7px;
                                    overflow:hidden;
                                    font-size:13px;
                                    line-height:1.35;
                                ">

                                    <div style="
                                        display:flex;
                                        align-items:center;
                                        gap:6px;
                                        padding:4px 7px;
                                        background:${CONFIG.colors.dark};
                                        color:${CONFIG.colors.gold};
                                        font-weight:bold;
                                        font-size:14px;
                                    ">
                                        <img
                                            src="${CONFIG.image}"
                                            style="
                                                width:22px;
                                                height:22px;
                                                object-fit:cover;
                                                border:0;
                                                border-radius:3px;
                                                flex-shrink:0;
                                            "
                                            alt="Übersinnliches Schild"
                                        >

                                        <span>
                                            Übersinnliches Schild
                                        </span>
                                    </div>

                                    <div style="
                                        padding:8px 9px;
                                    ">

                                        <div style="
                                            margin-bottom:7px;
                                            font-size:14px;
                                        ">
                                            Bestätige das Vorranschreiten deiner Gehirnwellenuhr.
                                        </div>

                                        <div style="
                                            display:flex;
                                            align-items:center;
                                            justify-content:center;
                                            padding-top:6px;
                                            border-top:1px solid ${CONFIG.colors.border};
                                        ">
                                            @CLOCK[brainwave-clock update 1]{Erweiterte Gehirnwellenuhr}
                                        </div>

                                    </div>

                                </div>
                            `;

                            await ChatMessage.create({
                                speaker:
                                    clockSpeaker,

                                content:
                                    clockContent
                            });

// ============================================================================
// 19. ERFOLGSMELDUNG
// ============================================================================

                            ui.notifications.info(
                                `Übersinnliches Schild eingesetzt: ${displayedDefenseType} ${calculatedDefense} | GP ${latestMP} → ${updatedMP}.`
                            );

                        } catch (error) {
                            console.error(
                                "Übersinnliches Schild | Fehler beim Anwenden:",
                                error
                            );

                            ui.notifications.error(
                                `Übersinnliches Schild: ${error.message}`
                            );
                        }
                    }
                },

                cancel: {
                    icon:
                        '<i class="fas fa-times"></i>',

                    label:
                        "Abbrechen"
                }
            },

            default:
                "apply"

        }).render(true);

    } catch (error) {
        console.error(
            "Übersinnliches Schild | Allgemeiner Fehler:",
            error
        );

        ui.notifications.error(
            `Übersinnliches Schild: ${error.message}`
        );
    }
})();