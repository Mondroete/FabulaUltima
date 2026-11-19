# 🔮 Magische Symbole – Abendüberwachung

> Automatische Überwachung der Symbolist-Fertigkeit **Magische Symbole** für einen vollständigen Spielabend.

Das Makro überwacht neu erstellte und entfernte Symbol-Effekte. Wird einem Charakter ein magisches Symbol verliehen, erhalten die berechtigten Benutzer eine private Erinnerung.

Wird der Symbol-Effekt später entfernt, sucht das Makro nach den Zaubern des Symbolisten, die abhängig von der Fertigkeitsstufe über das aufgelöste Symbol verwendet werden können.

Die verfügbaren Zauber werden anschließend in einer privaten und übersichtlichen Chatkarte angezeigt.

---

## 📂 Dateien

```text
Magische-Symbole/
├── README.md
└── Magische-Symbole.js
```

- **README.md:** Beschreibung, Einrichtung und Bedienung
- **Magische-Symbole.js:** vollständiger Makrocode

---

# ✨ Funktionen

Das Makro übernimmt automatisch:

- Prüfung, ob die ausführende Person Spielleiter ist
- Registrierung einer Abendüberwachung
- Entfernung zuvor registrierter Hooks
- Erkennung neuer Symbol-Effekte
- Erkennung entfernter Symbol-Effekte
- Prüfung bereits vorhandener Symbole beim Start
- Bestimmung des Symbolträgers
- Bestimmung des ursprünglichen Symbolisten
- Suche nach der Fertigkeit **Magische Symbole**
- Auslesen der Fertigkeitsstufe
- Berechnung der maximal erlaubten Zauberkosten
- Prüfung der bekannten Zauber des Symbolisten
- Berücksichtigung von Zauberkosten pro Ziel
- Erstellung privater Erinnerungs- und Auflösungskarten
- Versand an aktive Spielleiter und Besitzer des Symbolträgers
- Schutz vor mehrfachen Benachrichtigungen
- Schutz vor gleichzeitiger Mehrfachverarbeitung

---

# ⚙️ Voraussetzungen

Das Makro wurde für folgende Umgebung erstellt:

- **FoundryVTT V14**
- **Project FU 5.x**
- Fabula-Ultima-Charakter mit der Fertigkeit **Magische Symbole**
- Symbol-Effekte mit passendem Namen
- Project-FU-Quelldaten am Effekt
- bekannte Zauber als eingebettete Gegenstände des Symbolisten
- mindestens ein aktiver Spielleiter

> **Wichtig:** Die Abendüberwachung muss durch die Spielleitung gestartet werden.

---

# ▶️ Abendüberwachung starten

Das Makro wird zu Beginn des Spielabends einmal durch die Spielleitung ausgeführt.

Nach dem Start registriert es zwei Hooks:

```text
createActiveEffect
deleteActiveEffect
```

Diese reagieren automatisch auf neu erstellte und entfernte Symbol-Effekte.

Bei erfolgreichem Start erscheint eine Meldung nach diesem Muster:

```text
Magische Symbole aktiv: 2 vorhandene Symbol-Effekte geprüft, 1 neue Nachricht erstellt.
```

---

# ♻️ Erneutes Ausführen

Das Makro kann später erneut ausgeführt werden.

Vor der erneuten Registrierung entfernt es die zuvor gespeicherten Hooks:

```js
Hooks.off("createActiveEffect", previousState.hookIdCreate);
Hooks.off("deleteActiveEffect", previousState.hookIdDelete);
```

Dadurch sollen nicht mehrere identische Überwachungen gleichzeitig laufen.

Der Zustand wird unter folgendem globalen Schlüssel gespeichert:

```js
globalThis.magischeSymboleAbendueberwachung
```

---

# 🏷️ Symbol-Effekte erkennen

Das Makro verarbeitet nur Effekte, deren Name mit folgendem Text beginnt:

```text
Effekt: Symbol
```

Die Einstellung befindet sich im Konfigurationsbereich:

```js
symbolPrefix: "Effekt: Symbol"
```

## Beispiele für erkannte Effektnamen

```text
Effekt: Symbol des Feuers
```

```text
Effekt: Symbol der Heilung
```

```text
Effekt: Symbol des Schutzes
```

## Nicht erkannte Effektnamen

```text
Magisches Zeichen
```

```text
Symbol des Feuers
```

```text
Effekt: Rune
```

> Soll eine andere Namenskonvention verwendet werden, muss `symbolPrefix` entsprechend angepasst werden.

---

# 🐾 Symbolträger bestimmen

Das Makro versucht, den Akteur zu finden, auf dem der Symbol-Effekt liegt.

Unterstützt werden unter anderem:

- direkt auf einem Akteur liegende Effekte
- Effekte auf einem Token mit zugehörigem Akteur
- Zielinformationen des Effekts

Kann kein Symbolträger bestimmt werden, wird der Effekt nicht weiter verarbeitet.

---

# 🔍 Symbolisten bestimmen

Das Makro versucht anschließend, den ursprünglichen Ersteller des Symbols zu finden.

Die Suche erfolgt in dieser Reihenfolge:

1. `flags.projectfu.Source.actorUuid`
2. `flags.projectfu.Source.itemUuid`
3. Name der Quelle
4. passender Akteur unter den Tokens der aktuellen Szene
5. passender Akteur im Akteursverzeichnis

## Verwendete Quelldaten

```text
flags.projectfu.Source
```

Mögliche Felder:

```text
actorUuid
itemUuid
name
```

Kann der Quellakteur nicht gefunden werden, erhält der Symbolträger eine private Fehlerkarte.

---

# 🪄 Fertigkeit „Magische Symbole“ finden

Das Makro sucht beim Quellakteur zunächst nach einer Fertigkeit mit folgendem FUID:

```text
magische-symbole
```

Wird darüber nichts gefunden, sucht das Makro nach einem Gegenstand mit:

- Typ `skill`
- Name `Magische Symbole`

Die Fertigkeitsstufe wird aus folgendem Pfad gelesen:

```text
system.level.value
```

Ist die Fertigkeit nicht vorhanden oder besitzt sie keine positive Stufe, wird der Effekt nicht weiter verarbeitet.

---

# 💠 Maximale Zauberkosten

Die maximal erlaubten Zauberkosten ergeben sich aus der Stufe von **Magische Symbole**:

```text
Fertigkeitsstufe × 10 GP
```

## Übersicht

| Fertigkeitsstufe | Maximale Zauberkosten |
|---:|---:|
| **1** | **10 GP** |
| **2** | **20 GP** |
| **3** | **30 GP** |
| **4** | **40 GP** |
| **5** | **50 GP** |

### Beispiel

Der Symbolist besitzt:

```text
Magische Symbole Stufe 3
```

Damit können Zauber mit Gesamtkosten von höchstens:

```text
3 × 10 GP = 30 GP
```

über das Symbol verfügbar gemacht werden.

---

# ✨ Bekannte Zauber

Das Makro berücksichtigt die Zauber, die direkt auf dem Charakterbogen des Symbolisten vorhanden sind.

Gesucht werden Gegenstände mit:

```js
item.type === "spell"
```

Jeder gefundene Zauber wird anhand seiner Kosten geprüft.

---

# 💰 Zauberkosten lesen

Das Makro verwendet folgende Systempfade:

| Wert | Systempfad |
|---|---|
| Grundkosten | `system.cost.amount` |
| Ressource | `system.cost.resource` |
| Kosten pro Ziel | `system.cost.perTarget` |
| maximale Zielzahl | `system.targeting.max` |
| Zielregel | `system.targeting.rule` |

Numerische Kosten werden auch aus Textfeldern ausgelesen, sofern darin eine erkennbare Zahl enthalten ist.

---

# 👥 Kosten pro Ziel

Besitzt ein Zauber Kosten pro Ziel, berechnet das Makro automatisch, wie viele Ziele innerhalb der maximal erlaubten Kosten möglich wären.

## Beispiel

Der Symbolist darf Zauber bis zu **30 GP** verwenden.

Ein Zauber kostet:

```text
10 GP pro Ziel
```

Damit wären grundsätzlich bis zu:

```text
3 Ziele
```

bezahlbar.

Zusätzlich wird die maximale Zielzahl des Zaubers berücksichtigt.

---

# 🔔 Neues Symbol erstellt

Wird ein passender Symbol-Effekt erstellt, erzeugt das Makro eine private Erinnerung.

Die Nachricht enthält:

- Namen des Symbolträgers
- Namen des Symbols
- Namen des Symbolisten
- Hinweis auf die spätere Aktivierungsmöglichkeit

## Beispiel

```text
Symbolträger Übersicht:

- Minka hat das Symbol „Symbol des Feuers“ von Luna.

Denk daran: Du kannst dieses Symbol für eine Zauber-Aktion aktivieren.
```

Bei der Erstellung eines Symbols wird noch keine Zauberliste angezeigt.

---

# 🗑️ Symbol entfernt

Wird ein passender Symbol-Effekt gelöscht, erstellt das Makro eine private Auflösungskarte.

Dafür werden:

1. Symbolträger und Symbolist bestimmt
2. Fertigkeitsstufe gelesen
3. maximales Kostenlimit berechnet
4. bekannte Zauber gesammelt
5. erlaubte Zauber nach Kosten gefiltert
6. erlaubte Zauber sortiert und in der Chatkarte angezeigt

Die Sortierung erfolgt zuerst nach Kosten und anschließend alphabetisch.

---

# 📜 Zauberliste

Jeder verfügbare Zauber wird in einem aufklappbaren Bereich dargestellt.

Die Anzeige kann enthalten:

- Zaubername
- Zauberbild
- Link zum Zauber
- Angriffskennzeichnung
- mögliche Ziele
- Dauer
- Beschreibung

Die gesamte Zauberliste befindet sich ebenfalls in einem aufklappbaren Bereich, damit die Chatkarte kompakt bleibt.

---

# 🔗 Zauber in den Charakterbogen ziehen

Die Auflösungskarte enthält den Hinweis:

> Ziehe den Zauber-Link direkt aus diesem Chat in deinen Charakterbogen. Führe den Zauber aus und lösche ihn danach wieder.

Der Zauberlink wird nach Möglichkeit aus der ursprünglichen Kompendiumsquelle erzeugt.

Das Makro prüft zuerst:

```text
flags.core.sourceId
```

Ist keine Kompendiumsquelle vorhanden, wird ein konfigurierter Ersatzpfad verwendet.

---

# 📚 Kompendium-Fallback

Der Ersatzpfad befindet sich im Konfigurationsbereich:

```js
spellCompendiumFallback:
    "Compendium.fabula-ultima-ger.item-1-artikel.Item."
```

Dieser Pfad wird mit der ID des Zaubers verbunden.

> **Wichtig:** Der Fallback ist welt- und modulabhängig. Prüfe, ob der Pfad in deiner Foundry-Installation zum richtigen Kompendium führt.

---

# 📝 Zauberbeschreibungen

Die Anzeige der Zauberbeschreibung kann über folgende Einstellung gesteuert werden:

```js
showSpellDescription: true
```

Die maximale Länge wird hier festgelegt:

```js
descriptionMaximum: 900
```

Ist eine Beschreibung länger, wird sie gekürzt und mit einem Auslassungszeichen beendet.

---

# 🎯 Zielanzeige

Das Makro versucht, die Zielregel verständlich darzustellen.

Unterstützt werden beispielsweise:

| Zielregel | Anzeige |
|---|---|
| `self` | Selbst |
| `single` | ein Ziel |
| `multiple` | bis zu X Ziele |
| `special` | besonders |
| unbekannt | laut Zauber |

---

# ⏳ Daueranzeige

Bestimmte Dauerwerte werden automatisch übersetzt:

| Systemwert | Anzeige |
|---|---|
| `scene` | Szene |
| `instantaneous` | Unmittelbar |
| `instant` | Unmittelbar |
| `rest` | Rast |
| `turn` | Zug |
| `round` | Runde |

Andere Werte werden unverändert angezeigt.

---

# 🔒 Private Nachrichten

Die Nachrichten werden standardmäßig an folgende Benutzer geflüstert:

- aktive Spielleiter
- aktive Besitzer des Symbolträgers

Die Einstellungen befinden sich im Konfigurationsbereich:

```js
onlyActiveGMs: true
whisperOwners: true
```

## Nur aktive Spielleiter

```js
onlyActiveGMs: true
```

Ist diese Einstellung aktiv, erhalten nur momentan aktive Spielleiter die Nachricht.

## Besitzer benachrichtigen

```js
whisperOwners: true
```

Ist diese Einstellung aktiv, erhalten aktive Besitzer des Symbolträgers ebenfalls die private Nachricht.

---

# 🔎 Vorhandene Symbole beim Start prüfen

Mit folgender Einstellung werden bereits vorhandene Symbol-Effekte beim Start durchsucht:

```js
scanExistingEffects: true
```

Das ist hilfreich, wenn:

- das Makro erst nach dem Erstellen eines Symbols gestartet wurde,
- Foundry neu geladen wurde,
- oder eine Sitzung mit bestehenden Symbol-Effekten fortgesetzt wird.

Das Makro durchsucht dabei die Effekte aller Akteure im Akteursverzeichnis.

---

# 🛡️ Schutz vor doppelten Nachrichten

Das Makro verwendet mehrere Sets:

```text
notifiedEffects
notifiedDeletions
processingEffects
```

## `notifiedEffects`

Speichert Symbol-Effekte, für die bereits eine Erstellungsnachricht gesendet wurde.

## `notifiedDeletions`

Speichert entfernte Symbol-Effekte, für die bereits eine Auflösungsnachricht verarbeitet wurde.

## `processingEffects`

Verhindert, dass derselbe Effekt gleichzeitig mehrfach verarbeitet wird.

---

# 🎨 Gestaltung

Das Makro verwendet ein eigenes Fabula-Design mit:

- grün-türkisen Rahmen
- transparenter Kartenfläche
- heller Schrift
- Symbolisten-Bild
- kompakten Erinnerungsnachrichten
- aufklappbarer Zauberliste
- aufklappbaren Zauberinformationen
- eigener Fehlerkarte

Die Farben befinden sich im Konfigurationsbereich:

```js
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
```

---

# 🖼️ Symbolbild korrigieren

Im geposteten Code wurde die Bildadresse beim Kopieren in einen vollständigen HTML-Link umgewandelt.

Aktuell steht dort sinngemäß:

```js
<img src="<a href="https://...">https://...</a>">
```

Das ist kein gültiger Wert für `src`.

Lege die Bildadresse am besten einmal in der Konfiguration ab:

```js
const CONFIG = {
    symbolImage:
        "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/systems/projectfu/styles/static/compendium/classes/symbolist/symbolist_magic_symbols.png",

    // weitere Einstellungen
};
```

Verwende anschließend in beiden Chatkarten:

```js
<img
    src="${CONFIG.symbolImage}"
    style="width:24px; height:24px; border:none; flex-shrink:0;"
    alt="Magische Symbole"
>
```

Dadurch muss der Bildpfad nur an einer Stelle gepflegt werden.

---

# ⚠️ Hinweise und Grenzen

## Abendüberwachung

Das Makro registriert Hooks nur für die laufende Foundry-Sitzung.

Nach einem vollständigen Neuladen muss die Überwachung erneut durch die Spielleitung gestartet werden.

## Nur Effekte auf Akteuren

Die Startprüfung durchsucht die Effekte der Akteure unter:

```js
game.actors
```

Effekte auf nicht eingebundenen oder anders gelagerten Dokumenten werden dadurch möglicherweise nicht erfasst.

## Quelle des Symbols

Für eine zuverlässige Verarbeitung sollte der Symbol-Effekt korrekte Project-FU-Quelldaten besitzen.

## Effektlöschung

Beim Löschen eines Effekts müssen dessen Daten noch ausreichend verfügbar sein, damit Quellakteur und Symbolträger bestimmt werden können.

## Zauber werden nicht automatisch ausgeführt

Das Makro zeigt passende Zauber an. Es führt keinen Zauber automatisch aus und bezahlt keine Zauberkosten.

## Zauberlink als temporärer Gegenstand

Der empfohlene Ablauf besteht darin, den Zauber aus der Chatkarte auf den Charakterbogen zu ziehen, auszuführen und anschließend wieder zu löschen.

## Kostenoptionen

Das Makro berechnet mögliche Zielzahlen bei Kosten pro Ziel. Die aktuelle Chatkarte zeigt jedoch vor allem die Liste der grundsätzlich erlaubten Zauber und keine eigenen Auswahlbuttons für jede mögliche Zielzahl.

---

# 🧪 Empfohlener Test

1. Einen Symbolisten mit **Magische Symbole** vorbereiten.
2. Mehrere bekannte Zauber mit unterschiedlichen Kosten hinzufügen.
3. Symbol-Effekt mit gültigen Project-FU-Quelldaten erstellen.
4. Überwachung als Spielleitung starten.
5. Prüfen, ob die private Erinnerungsnachricht erscheint.
6. Symbol-Effekt entfernen.
7. Prüfen, ob die private Auflösungskarte erscheint.
8. Zauberliste auf Kosten, Ziele und Dauer kontrollieren.
9. Zauberlink testweise auf den Charakterbogen ziehen.
10. Foundry neu laden und prüfen, dass das Makro erneut gestartet werden muss.

---

# ⚡ Kurzfassung

1. Makro zu Beginn des Abends als Spielleitung starten.
2. Vorhandene Symbol-Effekte werden geprüft.
3. Neuer Effekt mit dem Präfix `Effekt: Symbol` wird erkannt.
4. Symbolträger und Symbolist werden bestimmt.
5. Besitzer und Spielleitung erhalten eine private Erinnerung.
6. Wird das Symbol entfernt, wird die Fertigkeitsstufe des Symbolisten gelesen.
7. Maximale Zauberkosten = **Stufe × 10 GP**.
8. Bekannte und bezahlbare Zauber werden gesammelt.
9. Besitzer und Spielleitung erhalten eine private Zauberliste.
10. Zauberlink in den Charakterbogen ziehen, Zauber ausführen und danach wieder löschen.

> **Merksatz:** Überwachung starten, Symbol vergeben und beim Auflösen automatisch die passenden Zauber für den Symbolträger bereitstellen.

---

# 📝 Hinweis

Dieses Makro wurde für meine eigene Fabula-Ultima-Spielrunde mit **Project FU 5.x** und **FoundryVTT V14** erstellt.

Das Makro verwendet Project-FU-spezifische Systempfade, Effekt-Flags und Gegenstandstypen. Änderungen am System, an den Kompendiumspfaden oder an der Struktur der Effekte können Anpassungen erforderlich machen.