# 🎲 Glückliche Sieben

> Zwei zusammengehörige Makros für die Entropisten-Fertigkeit **Glückliche Sieben**.

Mit diesen Makros kann ein Entropist einen Würfel aus dem letzten Chatwurf durch die aktuell gespeicherte Glückszahl ersetzen. Der ursprüngliche Würfelwert wird anschließend als neue Glückszahl auf dem Charakterbogen gespeichert.

Ein zweites Makro setzt die Glückszahl bei Bedarf wieder auf den Ausgangswert **7** zurück.

---

## 📂 Dateien

```text
Glueckliche-Sieben/
├── README.md
├── Glueckliche-Sieben-Anwenden.js
└── Glueckliche-Sieben-Reset.js
```

| Datei | Aufgabe |
|---|---|
| `Glueckliche-Sieben-Anwenden.js` | Ersetzt einen Würfel des letzten Wurfs durch die aktuelle Glückszahl |
| `Glueckliche-Sieben-Reset.js` | Setzt die gespeicherte Glückszahl wieder auf 7 |

---

# ✨ Funktionen

## Glückliche Sieben anwenden

Das Hauptmakro übernimmt:

- Auswahl des Entropisten
- Suche nach der Fertigkeit **Glückliche Sieben**
- Auslesen der aktuellen Glückszahl
- Suche nach dem letzten Würfelwurf im Chat
- Auflistung aller Würfel des gefundenen Wurfs
- Auswahl des Würfels, der ersetzt werden soll
- Ersetzen des gewählten Ergebnisses durch die Glückszahl
- Speichern des alten Würfelwerts als neue Glückszahl
- Neuberechnung der angezeigten Gesamtsumme
- Anpassung des höchsten Würfels
- mögliche Anpassung des Schadens
- erneute Auswertung von Treffer und Fehlschlag
- Erstellung einer neuen, angepassten Chatkarte

## Glückszahl zurücksetzen

Das Reset-Makro übernimmt:

- Suche nach der Fertigkeit **Glückliche Sieben**
- Suche nach der eingebetteten Ressource `Lucky Number`
- Zurücksetzen der Glückszahl auf **7**
- private Bestätigung an den ausführenden Spieler und alle Spielleiter

---

# ⚙️ Voraussetzungen

Die Makros wurden für folgende Umgebung erstellt:

- **FoundryVTT V14**
- **Project FU 5.x**
- Fabula Ultima
- Charakter mit der Fertigkeit **Glückliche Sieben**
- gespeicherte Ressource namens `Lucky Number`
- ein geeigneter letzter Würfelwurf im Chat

> **Empfehlung:** Vor der Ausführung den Entropisten-Token auswählen.

---

# 🐾 Charakter bestimmen

Beide Makros verwenden bevorzugt den aktuell ausgewählten Token:

```js
const actor =
    canvas.tokens.controlled[0]?.actor ||
    game.user.character;
```

Ist kein Token ausgewählt, wird der dem Benutzer zugewiesene Charakter verwendet.

Kann kein Charakter gefunden werden, endet das Makro mit einer Warnung.

---

# 🔎 Fertigkeit finden

Die Fertigkeit wird über ihren Namen oder ihre FUID gesucht:

```js
actor.items.find(item =>
    item.name === "Glückliche Sieben" ||
    item.system?.fuid === "gluckliche-sieben"
);
```

Das Reset-Makro beendet sich mit einer Warnung, wenn die Fertigkeit nicht gefunden wurde.

---

# 🔢 Glückszahl auslesen

Das Makro sucht innerhalb der Fertigkeit nach einer Ressource mit dem Namen:

```text
Lucky Number
```

Unterstützt werden zwei mögliche Strukturen:

```text
system.rp.current
```

oder eine Ressource unter:

```text
system.resources.[RESSOURCE].current
```

Die aktuelle Zahl wird anschließend im Dialog angezeigt.

Kann kein Wert gelesen werden, verwendet das Hauptmakro zunächst **7** als Ausgangswert.

---

# 🎲 Glückliche Sieben anwenden

## 1. Letzten Wurf suchen

Das Makro durchsucht die Chatnachrichten nach Würfen:

```js
const rollMessages = game.messages.filter(
    message =>
        message.isRoll ||
        (message.rolls && message.rolls.length > 0)
);
```

Verwendet wird der zuletzt gefundene Wurf.

Wurde kein geeigneter Wurf gefunden, erscheint:

```text
Kein Wurf gefunden!
```

---

## 2. Würfel auflisten

Alle einzelnen Würfelergebnisse des letzten Wurfs werden gesammelt.

Im Dialog erscheinen beispielsweise:

```text
W10 – Ergebnis 4
W8 – Ergebnis 7
```

Der Spieler wählt den Würfel aus, dessen Ergebnis durch die aktuelle Glückszahl ersetzt werden soll.

---

## 3. Würfel ersetzen

Der gewählte Würfel wird auf die aktuelle Glückszahl gesetzt.

### Beispiel

Der letzte Wurf enthält:

```text
W10 = 4
W8 = 6
```

Die aktuelle Glückszahl lautet:

```text
7
```

Wird der W10 gewählt, verändert sich der Wurf zu:

```text
W10 = 7
W8 = 6
```

---

## 4. Neue Glückszahl speichern

Der ursprüngliche Wert des ersetzten Würfels wird als neue Glückszahl gespeichert.

Im Beispiel:

```text
Alte Glückszahl: 7
Ersetzter Würfelwert: 4
Neue Glückszahl: 4
```

Die Glückszahl wandert damit von Wurf zu Wurf weiter.

---

# 🧮 Gesamtsumme aktualisieren

Das Makro berechnet die Veränderung zwischen Glückszahl und ursprünglichem Würfelwert:

```js
const diff = currentLucky - oldVal;
```

Die angezeigte Gesamtsumme wird anschließend entsprechend angepasst:

```js
const actualNewTotal =
    currentDisplayedTotal + diff;
```

### Beispiel

```text
Alter Gesamtwert: 12
Alter Würfelwert: 4
Glückszahl: 7
Differenz: +3
Neuer Gesamtwert: 15
```

---

# ⬆️ Höchsten Würfel aktualisieren

Das Makro prüft außerdem, ob sich durch den Austausch der höchste Würfel verändert hat.

```js
const newHighestValue =
    Math.max(...allNewValues);

const hwDiff =
    newHighestValue - oldHighest;
```

Ändert sich der höchste Würfel, versucht das Makro folgende Anzeigen zu korrigieren:

- `HW`
- `HR`
- den vom höchsten Würfel abhängigen Schaden

---

# ⚔️ Treffer und Fehlschlag neu auswerten

Enthält die Chatkarte ein Ergebnis wie:

```text
TREFFER vs 14
```

oder:

```text
MISS vs 12
```

vergleicht das Makro die neue Gesamtsumme erneut mit dem Verteidigungswert.

## Treffer

```text
Neue Gesamtsumme ≥ Verteidigung
```

## Fehlschlag

```text
Neue Gesamtsumme < Verteidigung
```

Das Makro versucht anschließend:

- Treffer in Fehlschlag umzuwandeln
- Fehlschlag in Treffer umzuwandeln
- deutsche und englische Ergebniswörter anzupassen
- passende CSS-Klassen der Chatkarte zu aktualisieren

Unter anderem werden folgende Begriffe erkannt:

- `TREFFER`
- `GETROFFEN`
- `VERFEHLT`
- `HIT`
- `MISS`
- `CRITICAL`
- `FUMBLE`

---

# 💥 Schaden aktualisieren

Wenn der Schaden vom höchsten Würfel abhängt und sich dieser verändert, versucht das Makro den passenden Schadenswert in der Chatkarte anzupassen.

Dazu sucht es nach Symbolen oder Beschriftungen, die auf Schaden oder eine Schadensart hinweisen.

Unterstützt werden unter anderem Hinweise auf:

- physisch
- Luft
- Blitz
- Feuer
- Eis
- Erde
- Gift
- Finster
- Licht

> Die Erkennung basiert auf der HTML-Struktur der vorhandenen Chatkarte. Veränderungen an der Project-FU-Chatkarte können deshalb Anpassungen erforderlich machen.

---

# 💬 Neue Chatkarte

Die ursprüngliche Chatnachricht wird nicht verändert.

Stattdessen erstellt das Makro eine Kopie und ergänzt oberhalb der angepassten Karte eine eigene Information für **Glückliche Sieben**.

Die Information zeigt:

- ursprünglichen Würfelwert
- eingesetzte Glückszahl
- neue Glückszahl auf dem Charakterbogen
- gegebenenfalls den neuen höchsten Würfel

### Beispiel

```text
W10: 4 → 7
Neue Glückszahl auf dem Bogen: 4
Neuer HW: 7
```

---

# ♻️ Glückszahl zurücksetzen

Das zweite Makro setzt die gespeicherte Glückszahl wieder auf:

```text
7
```

Dazu wird die Ressource der Fertigkeit direkt aktualisiert.

```js
await targetItem.update({
    [updatePath]: 7
});
```

---

## Private Bestätigung

Nach dem Zurücksetzen wird eine geflüsterte Chatnachricht erzeugt.

Empfänger sind:

- der Benutzer, der das Makro ausgeführt hat
- alle Spielleiter

Doppelte Empfänger werden entfernt.

Die Nachricht bestätigt:

```text
Die Glückszahl von [Charaktername] wurde wieder auf 7 gesetzt.
```

---

# 🖼️ Bildpfad korrigieren

In beiden geposteten Makros wurde die Bildadresse beim Kopieren in einen vollständigen HTML-Link umgewandelt.

Der beschädigte Wert sieht sinngemäß so aus:

```js
const botImg =
    "<a href="https://...">https://...</a>";
```

Das ist kein gültiger JavaScript-String.

Verwende in beiden Makros stattdessen die reine Bildadresse:

```js
const botImg =
    "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/systems/projectfu/styles/static/compendium/classes/entropist/entropist_lucky_seven.png";
```

---

# ▶️ Bedienung

## Glückliche Sieben anwenden

1. Entropisten-Token auswählen.
2. Gewünschten Wurf normal ausführen.
3. Darauf achten, dass der zu verändernde Wurf der letzte Wurf im Chat ist.
4. `Glueckliche-Sieben-Anwenden.js` ausführen.
5. Im Dialog den zu ersetzenden Würfel auswählen.
6. **Anwenden** anklicken.
7. Neue Chatkarte und neue Glückszahl prüfen.

## Glückszahl zurücksetzen

1. Entropisten-Token auswählen.
2. `Glueckliche-Sieben-Reset.js` ausführen.
3. Die Glückszahl wird auf **7** gesetzt.
4. Spieler und Spielleitung erhalten eine private Bestätigung.

---

# 🧪 Beispiel

## Ausgangslage

```text
Glückszahl: 7
Letzter Wurf: W10 + W8
Ergebnisse: 4 und 6
Gesamtsumme: 10
```

Der W10 mit Ergebnis **4** wird ausgewählt.

## Ergebnis

```text
W10: 4 → 7
W8: 6
Neue Gesamtsummekszahl: 4
```

Falls der höchste Würfel den Schaden bestimmt, wird auch der entsprechende HW und gegebenenfalls der Schaden angepasst.

---

# 🛡️ Sicherheitsprüfungen

Das Hauptmakro beendet sich mit einer Warnung, wenn:

- kein Charakter gefunden wurde
- kein Würfelwurf im Chat vorhanden ist
- der letzte Wurf kein auswertbares Roll-Objekt besitzt
- keine Einzelwürfel im Wurf enthalten sind

Das Reset-Makro beendet sich mit einer Warnung, wenn:

- kein Charakter gefunden wurde
- die Fertigkeit **Glückliche Sieben** fehlt
- die Ressource `Lucky Number` nicht gefunden wurde

---

# ⚠️ Hinweise und Grenzen

## Letzter Wurf

Das Hauptmakro verwendet den letzten gefundenen Würfelwurf im Chat.

Prüfe daher vor der Anwendung, ob dies wirklich der gewünschte Wurf ist.

## Neue Chatnachricht

Die ursprüngliche Nachricht bleibt erhalten. Das Makro erzeugt eine neue, angepasste Fassung.

## HTML-Erkennung

Gesamtsumme, Attribute, HW, Trefferstatus und Schaden werden anhand der HTML-Struktur der Chatkarte gesucht.

Ändert sich die Chatkartengestaltung von Project FU, kann eine Anpassung der Erkennung notwendig werden.

## Kritische Ergebnisse

Das Makro kann Ergebniswörter wie `CRITICAL` und `FUMBLE` erkennen. Die vollständige regeltechnische Neubestimmung aller besonderen kritischen Effekte ist jedoch nicht als eigenständiges System umgesetzt.

## Stapelbare Anwendung

Das Makro versucht, eine bereits angepasste angezeigte Gesamtsumme zu berücksichtigen. Dadurch kann Glückliche Sieben auch auf einer zuvor erzeugten Karte erneut angewendet werden, sofern deren Struktur weiterhin erkannt wird.

---

# ⚡ Kurzfassung

## Anwenden

1. Entropisten auswählen.
2. Gewünschten Wurf ausführen.
3. Makro starten.
4. Würfel auswählen.
5. Gewählter Wert wird durch die Glückszahl ersetzt.
6. Alter Würfelwert wird zur neuen Glückszahl.
7. Gesamtsumme wird angepasst.
8. HW und Schaden werden gegebenenfalls aktualisiert.
9. Treffer oder Fehlschlag wird neu geprüft.
10. Neue Chatkarte wird erstellt.

## Zurücksetzen

1. Entropisten auswählen.
2. Reset-Makro starten.
3. Glückszahl wird auf **7** gesetzt.
4. Private Bestätigung wird versendet.

> **Merksatz:** Einen Würfel durch die Glückszahl ersetzen, den alten Wert als neue Glückszahl bewahren und das Schicksal neu ordnen.

---

# 📝 Hinweis

Diese Makros wurden für meine eigene Fabula-Ultima-Spielrunde mit **Project FU 5.x** und **FoundryVTT V14** erstellt.

Die Makros werten konkrete Project-FU-Systempfade sowie die HTML-Struktur vorhandener Chatkarten aus. Änderungen am System oder an der Chatkartendarstellung können Anpassungen erforderlich machen.