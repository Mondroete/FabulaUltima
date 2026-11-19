# 🛡️ Übersinnliches Schild

> Fertigkeitsmakro für die Esper-Fähigkeit **Übersinnliches Schild** in Fabula Ultima.

Das Makro liest automatisch die Werte des ausgewählten Charakters aus, sucht die letzte passende Angriffs- oder Zauberkarte im Chat und prüft, ob der Angriff durch das Übersinnliche Schild abgewehrt werden kann.

Vor dem Einsatz zeigt ein ausführliches Bestätigungsfenster:

- verwendete Willenskraft
- aktuellen Stand der Gehirnwellenuhr
- berechneten übersinnlichen Verteidigungswert
- normalen DEF- oder MDEF-Wert
- endgültig verwendeten Verteidigungswert
- aktuellen Angriffswert
- benötigte GP
- erwartetes Ergebnis nach dem Einsatz

Erst nach der Bestätigung werden die GP abgezogen und eine angepasste Chatkarte erstellt.

---

## 📂 Dateien

```text
Uebersinnliches-Schild/
├── README.md
└── Uebersinnliches-Schild.js
```

- **README.md:** Beschreibung, Voraussetzungen und Bedienung
- **Uebersinnliches-Schild.js:** vollständiger Makrocode

---

# ✨ Funktionen

Das Makro übernimmt automatisch:

- Bestimmung des ausgewählten Charakters
- Auslesen der aktuellen Willenskraft
- Auslesen von DEF und MDEF
- Auslesen der aktuellen GP
- Auslesen der Gehirnwellenuhr
- Berechnung des übersinnlichen Verteidigungswerts
- automatische Erkennung von DEF oder MDEF
- Suche nach der letzten passenden Angriffs- oder Zauberkarte
- erneute Auswertung von Treffer oder Fehlschlag
- Vorschau vor dem Einsatz
- Prüfung der verfügbaren GP
- automatischen GP-Abzug
- Erstellung einer angepassten Angriffskarte
- Erstellung einer separaten Nachricht für die Gehirnwellenuhr
- Kontrolle, ob sich Werte während des geöffneten Dialogs verändert haben
- Fehlermeldungen bei unvollständigen oder nicht erkannten Daten

---

# ⚙️ Voraussetzungen

Das Makro ist für folgende Umgebung erstellt:

- **FoundryVTT V14**
- **Project FU 5.x**
- Fabula-Ultima-Charakter mit Esper-Fähigkeiten
- vorhandene Gehirnwellenuhr
- gültige Werte für DEF und MDEF
- ausreichend GP
- eine passende Angriffs- oder Zauberkarte als letzte relevante Chatnachricht

---

# 🎯 Charakter bestimmen

Das Makro verwendet zuerst den aktuell ausgewählten Token:

```js
const controlledToken = canvas.tokens.controlled[0] ?? null;
```

Ist kein Token ausgewählt, wird der dem Benutzer zugewiesene Charakter verwendet:

```js
const actor = controlledToken?.actor ?? game.user.character ?? null;
```

Kann kein Charakter gefunden werden, endet das Makro mit einer Warnung.

> **Empfehlung:** Vor dem Einsatz immer den betroffenen Token auswählen.

---

# 📊 Verwendete Charakterwerte

Das Makro liest folgende Project-FU-Werte:

| Wert | Systempfad |
|---|---|
| **Willenskraft** | `system.attributes.wlp.current` |
| **DEF** | `system.derived.def.value` |
| **MDEF** | `system.derived.mdef.value` |
| **Aktuelle GP** | `system.resources.mp.value` |
| **Gehirnwellenuhr aktuell** | `system.clocks.brainwave.value` |
| **Gehirnwellenuhr Maximum** | `system.clocks.brainwave.max` |

Fehlt einer dieser Werte, wird der Vorgang abgebrochen.

---

# 🧠 Übersinnlichen Verteidigungswert berechnen

Der übersinnliche Verteidigungswert wird folgendermaßen berechnet:

```text
Willenskraft + (Gehirnwellenuhr × 2)
```

## Beispiel

Ein Charakter besitzt:

- **Willenskraft:** W10
- **Gehirnwellenuhr:** 2

Die Berechnung lautet:

```text
10 + (2 × 2) = 14
```

Der übersinnliche Verteidigungswert beträgt damit **14**.

---

# 🛡️ DEF und MDEF

Das Makro erkennt anhand der letzten passenden Chatkarte, ob der Angriff gegen **DEF** oder **MDEF** gerichtet ist.

Anschließend wird der höhere Wert verwendet:

```text
Normaler Verteidigungswert
oder
übersinnlicher Verteidigungswert
```

## Berechnung

```js
const finalDef = Math.max(normalDef, psychicDefense);
const finalMdef = Math.max(normalMdef, psychicDefense);
```

Das Übersinnliche Schild kann den vorhandenen Verteidigungswert damit erhöhen, aber nicht verschlechtern.

### Beispiel

```text
Normale MDEF: 11
Übersinnlicher Wert: 14
Verwendete MDEF: 14
```

---

# 💠 GP-Kosten

Die GP-Kosten richten sich nach dem aktuellen Stand der Gehirnwellenuhr.

```text
Gehirnwellenuhr × 5 GP
```

Die Mindestkosten betragen **5 GP**.

```js
const mindPointCost = Math.max(5, currentClock * 5);
```

## Kostenübersicht

| Gehirnwellenuhr | GP-Kosten |
|---:|---:|
| **0** | **5 GP** |
| **1** | **5 GP** |
| **2** | **10 GP** |
| **3** | **15 GP** |
| **4** | **20 GP** |
| **5** | **25 GP** |
| **6** | **30 GP** |

> Höhere Stufen sind abhängig vom eingetragenen Maximum der Gehirnwellenuhr möglich.

Besitzt der Charakter nicht genügend GP, wird das Makro ohne Änderung abgebrochen.

---

# 🔍 Geeignete Chatkarte finden

Das Makro durchsucht die vorhandenen Chatnachrichten rückwärts und verwendet die zuletzt gefundene passende Angriffs- oder Zauberkarte.

Erkannt werden unter anderem folgende Begriffe:

- `TREFFER`
- `GETROFFEN`
- `VERFEHLT`
- `HIT`
- `MISS`
- `DEF`
- `MDEF`
- `M.DEF`
- `VERTEIDIGUNG`
- `MAGIE-VERTEIDIGUNG`

Auch Formulierungen mit `vs.` oder `gegen` werden berücksichtigt.

## Beispiele

```text
TREFFER gegen 12
```

```text
MISS vs. 14
```

```text
15 gegen MDEF
```

Wird keine passende Chatkarte gefunden, endet das Makro mit einer Warnung.

---

# 🎲 Angriffswert bestimmen

Das Makro versucht zuerst, Angriffswert und Verteidigungsart aus dem Text der Chatkarte zu lesen.

Werden diese Angaben dort nicht erkannt, verwendet das Makro ersatzweise das erste vorhandene Würfelergebnis der Nachricht.

Kann auch dort kein Wert gefunden werden, wird der Vorgang abgebrochen.

---

# ⚔️ Treffer neu auswerten

Der ausgelesene Angriffswert wird mit dem durch das Schild verwendeten Verteidigungswert verglichen.

```js
const attackHits =
    attackInformation.attackTotal >= calculatedDefense;
```

Das bedeutet:

```text
Angriffswert mindestens so hoch wie Verteidigung
= Treffer
```

```text
Angriffswert niedriger als Verteidigung
= Fehlschlag
```

---

# 🪟 Bestätigungsfenster

Vor dem eigentlichen Einsatz wird ein ausführliches Bestätigungsfenster geöffnet.

Das Fenster zeigt:

| Anzeige | Bedeutung |
|---|---|
| **Willenskraft** | verwendeter Attributswert |
| **Gehirnwellenuhr** | aktueller und nächster Stand |
| **GP** | aktueller und erwarteter neuer Wert |
| **Kosten** | GP-Kosten des Einsatzes |
| **Normaler DEF/MDEF-Wert** | regulärer Verteidigungswert |
| **Übersinnlicher Wert** | Willenskraft + Gehirnwellenuhr × 2 |
| **Verwendeter Wert** | höherer Verteidigungswert |
| **Aktuelle Probe** | Angriffswert gegen neue Verteidigung |
| **Vorschau** | Treffer bleibt bestehen oder wird abgewehrt |

## Verfügbare Aktionen

### Schild einsetzen

- Werte werden erneut geprüft
- GP werden abgezogen
- angepasste Angriffskarte wird erstellt
- Nachricht für die Gehirnwellenuhr wird erzeugt

### Abbrechen

- keine GP werden ausgegeben
- keine neue Chatkarte wird erstellt
- keine weiteren Änderungen werden vorgenommen

---

# 🔄 Erneute Sicherheitsprüfung

Beim Bestätigen liest das Makro die aktuellen GP und den aktuellen Stand der Gehirnwellenuhr erneut aus.

Der Vorgang wird abgebrochen, wenn:

- die Gehirnwellenuhr seit dem Öffnen des Fensters verändert wurde
- die aktuellen GP nicht mehr ausreichen
- die Werte nicht mehr gelesen werden können

Damit soll verhindert werden, dass das Makro mit veralteten Werten arbeitet.

---

# 💠 GP automatisch bezahlen

Nach erfolgreicher Prüfung werden die benötigten GP direkt vom Charakter abgezogen:

```js
await actor.update({
    "system.resources.mp.value": actualNewMP
});
```

Anschließend kontrolliert das Makro, ob der erwartete neue Wert tatsächlich gespeichert wurde.

---

# 💬 Angepasste Angriffskarte

Das Makro erstellt eine neue Fassung der ursprünglichen Angriffs- oder Zauberkarte.

Dabei werden nach Möglichkeit angepasst:

- Treffer oder Fehlschlag
- verwendeter DEF- oder MDEF-Wert
- passende Treffer- beziehungsweise Fehlschlagsklassen
- farbliche Ergebnisdarstellung

Oberhalb der kopierten Angriffskarte wird eine eigene Karte für das Übersinnliche Schild ergänzt.

Diese zeigt:

- Namen des Charakters
- neuen DEF- oder MDEF-Wert
- ausgegebene GP
- aktuellen und nächsten Stand der Gehirnwellenuhr

> **Wichtig:** Die ursprüngliche Chatnachricht wird nicht überschrieben. Das Makro erstellt eine neue, angepasste Chatnachricht.

---

# 🧠 Gehirnwellenuhr

Nach erfolgreichem Einsatz erstellt das Makro eine zusätzliche Chatnachricht:

```text
Bestätige das Vorranschreiten deiner Gehirnwellenuhr.
```

Die Nachricht enthält den Link:

```text
@CLOCK[brainwave-clock update 1]{Erweiterte Gehirnwellenuhr}
```

Damit kann das Vorranschreiten der Gehirnwellenuhr separat bestätigt werden.

> **Wichtig:** Das Makro erhöht die Gehirnwellenuhr nicht direkt. Es erstellt die notwendige Chataktion zur Bestätigung.

---

# 🎨 Gestaltung

Das Makro verwendet ein eigenes Fabula-Design mit:

- dunklem Grün
- türkisgrünen Rahmen
- heller goldfarbener Schrift
- farbiger Treffer- oder Fehlschlagsanzeige
- Bild der Esper-Fähigkeit
- kompakten Informationsfeldern

Die Farben befinden sich im Konfigurationsbereich:

```js
colors: {
    dark: "#1c3b38",
    middle: "#286e67",
    light: "rgba(38, 115, 106, 0.12)",
    gold: "#e6e1c5",
    border: "#3d968b",
    success: "#378b45",
    failure: "#a33b3b"
}
```

---

# 🖼️ Bild konfigurieren

Im Makro muss die Bildadresse als reiner String eingetragen werden:

```js
image:
    "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/modules/fabula_ultima/Klasse/Esper/Gaben/ubersinnliches-schild.webp",
```

> **Wichtig:** An dieser Stelle darf kein vollständiger HTML-Link mit `<a href="...">` eingefügt werden.

Der aus der Oberfläche kopierte Wert

```js
image:
    "<a href="https://...">https://...</a>",
```

ist kein gültiger JavaScript-String und muss vor dem Speichern korrigiert werden.

---

# ▶️ Bedienung

1. Die letzte relevante Angriffs- oder Zauberkarte muss im Chat vorhanden sein.
2. Den betroffenen Token auswählen.
3. Das Makro **Übersinnliches Schild** ausführen.
4. Vorschau und Kosten kontrollieren.
5. Auf **Schild einsetzen** klicken.
6. Die neue Angriffskarte prüfen.
7. In der zusätzlichen Chatnachricht die Gehirnwellenuhr bestätigen.

---

# 🛡️ Sicherheitsprüfungen

Das Makro bricht ohne Kosten ab, wenn:

- kein Charakter gefunden wurde
- Willenskraft nicht gelesen werden konnte
- DEF oder MDEF fehlen
- GP nicht gelesen werden konnten
- die Gehirnwellenuhr fehlt
- nicht genügend GP vorhanden sind
- keine passende Chatkarte gefunden wurde
- der Angriffswert nicht gelesen werden konnte
- die Trefferzeile der Chatkarte nicht erkannt wurde
- sich die Gehirnwellenuhr während des Dialogs verändert hat
- die GP beim Bestätigen nicht mehr ausreichen

---

# ⚠️ Hinweise und Grenzen

## Letzte passende Chatkarte

Das Makro verwendet die letzte Chatnachricht, die anhand ihres Textes als passende Angriffs- oder Zauberkarte erkannt wird.

Prüfe vor dem Einsatz, ob tatsächlich die richtige Karte verwendet wird.

## Kopierte Karte

Die ursprüngliche Karte bleibt bestehen. Die angepasste Fassung wird als neue Nachricht erstellt.

## Gehirnwellenuhr

Der neue Stand der Gehirnwellenuhr wird zunächst nur berechnet und angezeigt. Die tatsächliche Erhöhung erfolgt über die separate Chataktion.

## GP-Abzug

Die GP werden vor der Erstellung der neuen Chatkarte abgezogen.

Sollte erst nach dem erfolgreichen GP-Abzug ein unerwarteter Fehler auftreten, besitzt das Makro derzeit keinen automatischen Rücksetzmechanismus für die bereits ausgegebenen GP.

## Systemabhängige Pfade

Das Makro verwendet konkrete Project-FU-Systempfade. Änderungen am System können Anpassungen erforderlich machen.

---

# 🧪 Empfohlener Test

1. Einen Esper-Charakter mit Willenskraft und Gehirnwellenuhr vorbereiten.
2. Ausreichend GP eintragen.
3. Eine Angriffskarte gegen DEF erzeugen.
4. Übersinnliches Schild ausführen.
5. Berechnung und Vorschau prüfen.
6. Einsatz bestätigen.
7. GP-Abzug kontrollieren.
8. Neue Angriffskarte prüfen.
9. Gehirnwellenuhr über die Nachricht erhöhen.
10. Den Vorgang zusätzlich mit einer Karte gegen MDEF testen.

---

# ⚡ Kurzfassung

1. Passende Angriffs- oder Zauberkarte im Chat erzeugen.
2. Betroffenen Esper-Token auswählen.
3. Makro ausführen.
4. Willenskraft und Gehirnwellenuhr werden gelesen.
5. Übersinnliche Verteidigung wird berechnet.
6. Höherer Wert aus normaler Verteidigung und Schildwert wird verwendet.
7. Vorschau und GP-Kosten prüfen.
8. **Schild einsetzen** bestätigen.
9. GP werden automatisch abgezogen.
10. Angepasste Angriffskarte wird erstellt.
11. Gehirnwellenuhr über die separate Chatnachricht bestätigen.

> **Merksatz:** Letzte Angriffskarte prüfen, Schild berechnen lassen, GP bezahlen und den Angriff mit dem neuen DEF- oder MDEF-Wert erneut auswerten.

---

# 📝 Hinweis

Dieses Makro wurde für meine eigene Fabula-Ultima-Spielrunde mit **Project FU 5.x** und **FoundryVTT V14** erstellt.

Es verwendet konkrete Systempfade und wertet vorhandene Chatkarten anhand ihrer Texte und HTML-Struktur aus. Bei Änderungen des Systems oder der Chatkartengestaltung können Anpassungen erforderlich werden.
