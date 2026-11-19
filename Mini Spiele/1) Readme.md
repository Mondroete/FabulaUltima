# ⚔️ Fabula Ultima – Makros, Minispiele & Spielhilfen

Willkommen in meiner persönlichen Sammlung für **Fabula Ultima**.

Hier sammle ich Inhalte, die im Laufe meiner eigenen Spielrunde entstanden sind oder die ich für unsere Runde angepasst habe. Dazu gehören vor allem **FoundryVTT-Makros**, automatisierte Hilfen für Klassen und Fertigkeiten sowie kleine **Tavernen-, Fest- und Jahrmarktspiele** für Situationen, in denen die Gruppe spontan etwas abseits des eigentlichen Abenteuers unternehmen möchte.

Die Sammlung soll vor allem eines sein:

> **Praktisch, schnell einsetzbar und leicht wiederzufinden.**

---

# 🎲 FoundryVTT-Makros

Die Makros sind für meine eigene Fabula-Ultima-Runde entstanden und automatisieren oder vereinfachen verschiedene Abläufe in **FoundryVTT**.

Viele Makros greifen direkt auf Werte des Charakterbogens, Chatkarten, Effekte, Regionen oder andere Funktionen des verwendeten Systems zurück.

## 🧰 Allgemeine Makros

### 🟢 Lebenspunkte-Ringe

Automatische farbliche Darstellung der verbleibenden Lebenspunkte über den Token-Ring.

Die Ringfarbe verändert sich abhängig vom aktuellen Lebenspunktestand und wird automatisch bei Änderungen sowie beim Szenenwechsel aktualisiert.

**Bereich:** Token & Darstellung

---

### 🎬 Szenenwechsel mit Loadingpage

Hilfsmakro für die Spielleitung.

Die aktuell vorbereitete Szene wird als Zielszene gespeichert und anschließend automatisch eine festgelegte Loadingpage aktiviert.

**Bereich:** Szenenverwaltung

---

### 🌀 Regionen-Teleporter

Teleportiert Spieler über Foundry-Regionen zwischen Bereichen oder verschiedenen Szenen.

Der Teleporter bietet unter anderem:

- kurze Wartezeit vor der Aktivierung
- Bestätigungsdialog
- automatische Zielpositionierung
- Teleport über GM-Rechte
- Spielpause während des Szenenwechsels
- Buttons zur alten und neuen Szene
- Schutz vor mehrfacher Auslösung

**Bereich:** Regionen & Szenen

---

# ✨ Fertigkeitsmakros

Einige Klassen und Fertigkeiten besitzen eigene Makros, die ihre besonderen Mechaniken direkt unterstützen.

---

## 🧠 Esper

### 🛡️ Übersinnliches Schild

Unterstützt die Esper-Fähigkeit **Übersinnliches Schild**.

Das Makro:

- liest Willenskraft und Gehirnwellenuhr
- berechnet den neuen DEF- oder MDEF-Wert
- erkennt die letzte passende Angriffs- oder Zauberkarte
- zeigt Kosten und Ergebnis vor dem Einsatz
- bezahlt die benötigten GP
- erstellt eine angepasste Angriffskarte
- stellt anschließend die Aktion zum Vorranschreiten der Gehirnwellenuhr bereit

---

## 🔮 Symbolist

### ✨ Magische Symbole

Eine Abendüberwachung für die Fertigkeit **Magische Symbole**.

Die Spielleitung startet das Makro einmal zu Beginn des Spielabends.

Danach werden automatisch:

- neu erzeugte Symbol-Effekte erkannt
- Symbolträger und Symbolist bestimmt
- private Erinnerungen gesendet
- entfernte Symbole erkannt
- passende Zauber des Symbolisten geprüft
- verfügbare Zauber in einer privaten Chatkarte angezeigt

---

### 🌈 Symbol der Elemente

Unterstützt die Schadensumwandlung durch das **Symbol der Elemente**.

Das Makro:

- nimmt den Gesamtschaden entgegen
- berechnet die erforderlichen GP
- bietet verschiedene Schadensarten zur Auswahl
- prüft die vorhandenen GP
- bezahlt die Kosten automatisch
- erzeugt den umgewandelten Schaden
- erstellt eine passende Chatkarte

---

## 🎲 Entropist

### 🍀 Glückliche Sieben

Besteht aus zwei zusammengehörigen Makros.

#### Glückliche Sieben anwenden

Ein Würfel des letzten Wurfs kann durch die aktuelle Glückszahl ersetzt werden.

Dabei werden nach Möglichkeit:

- Gesamtergebnis
- gewählter Würfel
- höchste Würfelzahl
- Treffer oder Fehlschlag
- und abhängiger Schaden

angepasst.

Der ursprüngliche Würfelwert wird anschließend zur neuen Glückszahl.

#### Glückliche Sieben zurücksetzen

Setzt die gespeicherte Glückszahl wieder auf:

**7**

und informiert Spieler und Spielleitung über die Änderung.

---

# 🍻 Minispiele

Ich bin über verschiedene kleine Minispiele für Tavernen, Feste und ähnliche Spielsituationen gestolpert und fand die Idee viel zu schön, um sie nicht auch für **Fabula Ultima** zu verwenden.

Die ursprünglichen Ideen dienten als Inspiration. Anschließend habe ich die Spiele an Fabula Ultima angepasst, erweitert oder teilweise neu interpretiert.

Entstanden ist eine Sammlung kleiner Wettbewerbe, die sich ohne große Vorbereitung einsetzen lassen:

- in Tavernen,
- auf Festen,
- auf Jahrmärkten,
- am Lagerfeuer,
- während einer Rast,
- auf Reisen,
- oder einfach dann, wenn die Helden spontan etwas spielen möchten.

> Die Minispiele sollen **schnell erklärt, unkompliziert gespielt und leicht in ein laufendes Abenteuer eingebaut** werden können.

---

# 🎭 Die Spiele

## 🎲 Goblin-Würfel

Ein Bluffspiel mit:

**Einsicht + Willenskraft**

Die Ergebnisse bleiben geheim, Ansagen dürfen gelogen sein und der Gegner muss entscheiden:

> **Überbieten oder anzweifeln?**

Ideal für Tavernen, Glücksspielrunden und zwielichtige NSC.

---

## 🧙 Gnomwerfen

Ein ebenso alberner wie ernst genommener Wettbewerb.

Gewürfelt wird:

**Macht + Macht**

Die Stärke des Werfers, das Verhalten des Gnomes und ein möglicher Anlauf bestimmen den Modifikator.

Das Endergebnis entspricht direkt der Wurfweite in Schritt.

---

## 💪 Armdrücken

Der schnelle Klassiker.

**Macht + Macht**

als Konkurrenzprobe.

Höheres Ergebnis gewinnt.

Bei Gleichstand wird erneut gewürfelt.

---

## ⚔️ Stabstoßen

Eine alte Tradition zur Beilegung von Streitigkeiten oder einfach zum Kräftemessen.

Zwei Kontrahenten stehen ohne Rüstung auf einem Baumstamm über Wasser oder Schlamm und versuchen, sich mit weich gepolsterten Stäben herunterzustoßen.

**Konkurrenzprobe: Macht + Willenskraft**

Wer vom Stamm fällt, verliert.

---

## 🎯 Darts

Ein klassisches Zielwurfspiel.

**Geschicklichkeit + Einsicht**

Bei einem erfolgreichen Wurf werden Punkte gesammelt.

Ein besonders gutes Probenergebnis bringt zusätzliche Würfel für die Punkte.

### Perfekte 20

Eine schwierigere Variante, bei der exakt:

**20 Punkte**

erreicht werden müssen.

Zu viel ist genauso schlecht wie zu wenig.

---

## 🌍 Rund um die Welt

Eine Variante von Darts.

Statt Punkte anzuhäufen, müssen die Ergebnisse:

**1, 2, 3 und 4**

gesammelt werden.

Bei einem besonders guten Wurf darf mit 2W4 gewürfelt und einer der beiden Würfel ausgewählt werden.

---

## 🍺 Trinken oder Erbrechen

Ein klassisches Trinkduell.

**Macht + Willenskraft**

Der Verlierer jeder Konkurrenzprobe erhält Trunkenheit.

Mit zunehmender Trunkenheit werden die Proben schwieriger.

Wer zuerst nicht mehr kann, verliert.

---

## 💃 Tanzwettbewerb

Der große Wettbewerb für längere Tavernen- oder Festszenen.

Bis zu **8 Runden** prüfen unterschiedliche Fähigkeiten:

- Rhythmus
- Partnerwahl
- Geschwindigkeit
- Tanzduelle
- Gedächtnis
- Kraft
- Ausdauer
- Freestyle

Wer alle Herausforderungen übersteht, erreicht das große Finale.

---

## 🐖 Schwanz an das Schweinefleisch

Ein Zielwurfspiel mit selbst gewähltem Risiko.

Gewürfelt wird:

**Geschicklichkeit + Einsicht**

Zur Auswahl stehen verschiedene Entfernungen mit unterschiedlichen Schwellenwerten und Punktzahlen.

Jeder besitzt drei Würfe.

Ein erfolgreicher Pasch zählt als perfekter Treffer und bringt einen Zusatzpunkt.

---

## 🎃 Verkleide die Vogelscheuche

Ein Kreativwettbewerb.

Die Teilnehmer versuchen, einen Kürbis so unappetitlich, abschreckend oder schwer auffindbar zu gestalten, dass ein Schwein lieber die Kürbisse der Konkurrenz frisst.

Die verwendete Attributskombination hängt von der beschriebenen Idee ab.

Am Ende gilt:

> **Der höchste Unattraktivitätswert gewinnt.**

---

## 🎲 Wilde Jagd

Ein schnelles Glücksspiel:

**2W6 · maximal 5 Züge · ein Pasch**

Nach einem erfolglosen Wurf darf ein Würfel gesperrt werden.

Wer mehr riskieren möchte, kann **Drücken**, den Einsatz verdoppeln und wieder mit beiden Würfeln würfeln.

---

## 🪙 Schlinge

Ein raues Würfelspiel für **3–8 Spieler**.

Jeder beginnt mit 10 Münzen.

Ein W6 entscheidet, ob Münzen:

- in den Pott wandern,
- aus dem Pott genommen werden,
- oder der gesamte Pott gewonnen wird.

Der Spieler mit dem kleinsten Einsatz wird zum **Jäger** und darf seinen eigenen Zug für ein riskantes Gambit opfern.

---

# ⚡ Minispiele auf einen Blick

| Spiel | Mechanik | Schwerpunkt |
|---|---|---|
| **Goblin-Würfel** | EIN + WLK | Bluffen |
| **Gnomwerfen** | MAC + MAC | Kraft & Weite |
| **Armdrücken** | MAC + MAC | Kräftemessen |
| **Stabstoßen** | MAC + WLK | Kraft & Standfestigkeit |
| **Darts** | GES + EIN | Zielwurf |
| **Rund um die Welt** | GES + EIN | Sammelspiel |
| **Trinken oder Erbrechen** | MAC + WLK | Durchhalten |
| **Tanzwettbewerb** | verschiedene Attribute | Wettbewerb |
| **Schwanz an das Schweinefleisch** | GES + EIN | Zielwurf & Risiko |
| **Verkleide die Vogelscheuche** | abhängig von der Idee | Kreativität |
| **Wilde Jagd** | 2W6 | Glücksspiel |
| **Schlinge** | 1W6 + Münzen | Glücksspiel & Risiko |

---

# 📂 Empfohlene Struktur

```text
FabulaUltima/
├── README.md
│
├── Makros/
│   ├── Allgemein/
│   │   ├── Lebenspunkte-Ringe/
│   │   ├── Szenenwechsel-Loadingpage/
│   │   └── Regionen-Teleporter/
│   │
│   └── Fertigkeiten/
│       ├── Esper/
│       │   └── Uebersinnliches-Schild/
│       │
│       ├── Symbolist/
│       │   ├── Magische-Symbole/
│       │   └── Symbol-der-Elemente/
│       │
│       └── Entropist/
│           └── Glueckliche-Sieben/
│
└── Minispiele/
    ├── README.md
    ├── Goblin-Wuerfel.md
    ├── Gnomwerfen.md
    ├── Armdruecken.md
    ├── Stabstossen.md
    ├── Darts.md
    ├── Rund-um-die-Welt.md
    ├── Trinken-oder-Erbrechen.md
    ├── Tanzwettbewerb.md
    ├── Schwanz-an-das-Schweinefleisch.md
    ├── Verkleide-die-Vogelscheuche.md
    ├── Wilde-Jagd.md
    └── Schlinge.md
