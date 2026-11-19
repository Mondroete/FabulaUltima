# 🌈 Symbol der Elemente

> Fertigkeitsmakro für den Symbolisten. Das Makro berechnet die Kosten einer Schadensumwandlung, lässt das gewünschte Element auswählen, bezahlt die benötigten GP automatisch und erstellt anschließend eine passende Chatkarte.

## ✨ Funktionen

Das Makro übernimmt:

- Auswahl des Symbolisten über den kontrollierten Token
- alternativ Verwendung des zugewiesenen Spielercharakters
- Eingabe des gesamten Schadens
- automatische Berechnung der GP-Kosten
- Auswahl der gewünschten Schadensart
- Prüfung der verfügbaren GP
- automatischen GP-Abzug
- Erstellung eines passenden `@DMG`-Links
- Erstellung einer Fabula-Chatkarte mit dem Ergebnis
- Live-Anzeige der benötigten GP im Dialog
- Warnung, wenn nicht genügend GP vorhanden sind

---

## ⚙️ Voraussetzungen

Das Makro ist für folgende Umgebung erstellt:

- **FoundryVTT V14**
- **Project FU 5.x**
- Fabula Ultima
- Charakter mit ausreichend GP
- ausgewählter Symbolisten-Token oder zugewiesener Spielercharakter

---

# 🐾 Charakter bestimmen

Das Makro verwendet bevorzugt den aktuell ausgewählten Token:

```js
const actor =
    canvas.tokens.controlled[0]?.actor ||
    game.user.character;
```

Ist kein Token ausgewählt, wird der dem Benutzer zugewiesene Charakter verwendet.

Kann kein Charakter bestimmt werden, erscheint:

```text
Bitte wähle zuerst deinen Symbolisten-Token aus!
```

---

# 💠 GP-Ressource

Das Makro versucht zunächst, die GP über folgenden Systempfad zu lesen:

```text
system.resources.mp.value
```

Falls dieser Pfad nicht existiert, werden zusätzlich folgende Alternativen geprüft:

```text
system.mp.value
system.gp.value
```

Der funktionierende Pfad wird anschließend auch für den automatischen GP-Abzug verwendet.

---

# 💥 Gesamtschaden eingeben

Im Dialog wird zunächst der gesamte Schaden eingegeben.

Beispiel:

```text
30 Schaden
```

Aus diesem Wert berechnet das Makro unmittelbar die benötigten GP.

---

# 💰 GP-Kosten

Die Kosten entsprechen einem Drittel des eingegebenen Gesamtschadens und werden im Makro mit folgender Berechnung ermittelt:

```js
const gpCost = Math.floor(totalDamage / 3);
```

## Beispiele

| Gesamtschaden | GP-Kosten |
|---:|---:|
| **15** | **5 GP** |
| **18** | **6 GP** |
| **24** | **8 GP** |
| **30** | **10 GP** |
| **36** | **12 GP** |
| **45** | **15 GP** |

> Das Makro rundet bei der Berechnung über `Math.floor()` ab.

---

# 🎨 Element auswählen

Nach der Schadenseingabe kann die gewünschte Schadensart gewählt werden.

| Auswahl | Schadensart |
|---|---|
| 🌪️ **Luft** | Luftschaden |
| ⚡ **Blitz** | Blitzschaden |
| 🌑 **Finster** | Finsterschaden |
| 🪨 **Erde** | Erdschaden |
| 🔥 **Feuer** | Feuerschaden |
| ❄️ **Eis** | Eisschaden |
| ✨ **Licht** | Lichtschaden |
| ☠️ **Gift** | Giftschaden |
| ⚔️ **Physisch** | physischer Schaden |

Im Dialog wird für jedes Element das entsprechende Project-FU-Symbol dargestellt.

---

# 🔄 Live-Kostenberechnung

Während die Schadenszahl verändert wird, aktualisiert das Makro automatisch die Kostenanzeige.

Beispiel:

```text
Gesamtschaden: 30
Erforderliche GP: 10
```

Ist der berechnete Wert höher als die aktuell vorhandenen GP, erscheint unmittelbar:

```text
⚠️ Warnung: Nicht genug GP vorhanden!
```

---

# ✅ Umwandlung durchführen

Mit:

**Umwandeln & GP zahlen**

wird die Schadensumwandlung bestätigt.

Das Makro prüft dabei erneut:

1. Ist der eingegebene Schaden gültig?
2. Welches Element wurde gewählt?
3. Wie hoch sind die tatsächlichen GP-Kosten?
4. Wie viele GP besitzt der Charakter aktuell?
5. Reichen die GP für die Umwandlung?

Sind nicht genügend GP vorhanden, wird der Vorgang ohne Zahlung abgebrochen.

---

# 💠 GP automatisch bezahlen

Sind genügend GP vorhanden, werden die Kosten direkt vom Charakter abgezogen.

```js
const newMP = latestMP - gpCost;

await actor.update({
    [mpPath]: newMP
});
```

### Beispiel

```text
Vorher: 24 GP
Kosten: 10 GP
Danach: 14 GP
```

---

# 💥 Umgewandelten Schaden erzeugen

Das Makro erstellt einen Project-FU-Schadensbefehl:

```js
const dmgCommand =
    `@DMG[${totalDamage} ${selectedElement}]`;
```

Bei beispielsweise:

```text
30 Schaden
Feuer
```

wird daraus:

```text
@DMG[30 fire]
```

Die Schadenshöhe selbst bleibt dabei unverändert. Die ausgewählte Schadensart wird auf den vollständigen eingegebenen Schaden angewendet.

---

# 💬 Chatkarte

Nach erfolgreicher Umwandlung erstellt das Makro eine eigene Chatkarte.

Die Karte zeigt:

- Symbol der Elemente
- Namen des Symbolisten
- umgewandelten Schaden
- gewählte Schadensart
- benötigte GP
- vorherige GP
- verbleibende GP
- ausführbaren `@DMG`-Befehl

Die Karte bestätigt außerdem, dass der gesamte eingegebene Schaden in die gewählte Schadensart umgewandelt wurde.

---

# 🎨 Darstellung

Das Makro verwendet ein an die übrigen Fabula-Makros angepasstes Design:

- dunkelgrüner Kopfbereich
- türkisgrüne Rahmen
- helle Schrift
- Symbolbild der Fertigkeit
- Schadensart-Icons
- rahmenloses GP-Symbol
- zweispaltige Elementauswahl

---

# 🖼️ Bildpfade

Im geposteten Code wurden die Bildadressen beim Kopieren als vollständige HTML-Links eingefügt.

Das betrifft:

```js
botImg
baseUrl
mpIconUrl
```

Diese Werte sollten als reine URLs eingetragen werden.

## Symbolbild

```js
const botImg =
    "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/modules/fabula_ultima/Klasse/Symbolist/Symbole/symbol-der-elemente.webp";
```

## Element-Icons

```js
const baseUrl =
    "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/systems/projectfu/styles/static/affinities/icons/";
```

## GP-Icon

```js
const mpIconUrl =
    "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/systems/projectfu/styles/static/icons/resources/mp_borderless.png";
```

> **Wichtig:** Die Werte dürfen nicht als `<a href="...">...</a>` im JavaScript stehen.

---

# ▶️ Bedienung

1. Symbolisten-Token auswählen.
2. **Symbol der Elemente** ausführen.
3. Gesamtschaden eingeben.
4. Gewünschtes Element auswählen.
5. Angezeigte GP-Kosten prüfen.
6. **Umwandeln & GP zahlen** auswählen.
7. GP werden automatisch bezahlt.
8. Die fertige Chatkarte verwenden.

---

# 🧪 Beispiel

Der Symbolist besitzt:

```text
24 GP
```

Der Angriff verursacht:

```text
30 Schaden
```

Gewählt wird:

```text
Feuer
```

### Berechnung

```text
30 / 3 = 10 GP
```

Nach der Zahlung:

```text
24 → 14 GP
```

Der erzeugte Schadensbefehl lautet:

```text
@DMG[30 fire]
```

Die Chatkarte enthält damit den vollständigen umgewandelten **30 Feuerschaden**.

---

# 🛡️ Sicherheitsprüfungen

Das Makro bricht ohne weitere Verarbeitung ab, wenn:

- kein Charakter gefunden wurde
- keine unterstützte GP-Ressource gefunden wurde
- kein gültiger positiver Schaden eingegeben wurde
- die aktuellen GP nicht ausreichen

Die verfügbaren GP werden beim Bestätigen erneut aus dem Charakterbogen gelesen.

Dadurch berücksichtigt das Makro Änderungen, die nach dem Öffnen des Dialogs erfolgt sind.

---

# ⚠️ Hinweise

## Keine eigene Schadensberechnung

Der einzugebende Wert ist der bereits feststehende **Gesamtschaden**.

Das Makro würfelt keinen Angriff und berechnet den ursprünglichen Schaden nicht selbst.

## GP werden direkt geändert

Die GP werden unmittelbar über den ermittelten Ressourcenpfad aktualisiert.

## Elementauswahl

Standardmäßig ist beim Öffnen des Dialogs das erste Element der Liste ausgewählt.

## Kein automatisches Ziel

Das Makro bestimmt kein Ziel des Schadens. Die erzeugte Chatkarte stellt lediglich den umgewandelten Schaden bereit.

---

# ⚡ Kurzfassung

1. Symbolisten-Token auswählen.
2. Makro starten.
3. Gesamtschaden eingeben.
4. Element auswählen.
5. Kosten = **abgerundetes Drittel des Schadens**.
6. Genügend GP vorhanden? Dann bestätigen.
7. GP werden automatisch abgezogen.
8. `@DMG` für den vollständigen Schaden wird erzeugt.
9. Chatkarte zeigt Schadensart, Kosten und verbleibende GP.

> **Merksatz:** Schaden eingeben, Element bestimmen, ein Drittel als GP bezahlen und den gesamten Schaden in die gewünschte Schadensart umwandeln.

---

# 📝 Hinweis

Dieses Makro wurde für meine eigene Fabula-Ultima-Spielrunde mit **Project FU 5.x** und **FoundryVTT V14** erstellt.

Es verwendet konkrete Project-FU-Systempfade, Chatbefehle und Bildressourcen. Bei Änderungen am System können Anpassungen erforderlich werden.