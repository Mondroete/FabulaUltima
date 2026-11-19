# 🌀 Regionen-Teleporter

> Ein Regionen-Makro für FoundryVTT, das Spieler nach einer kurzen Wartezeit und Bestätigung zu einer festgelegten Zielregion teleportiert.

Der Regionen-Teleporter verbindet Foundry-Regionen mit `socketlib`, damit auch Spieler einen Teleport auslösen können, während die notwendigen Änderungen an Szenen und Tokens über einen GM-Client ausgeführt werden.

Das Makro bietet:

- Teleportation innerhalb derselben Szene
- Teleportation zwischen verschiedenen Szenen
- automatische Platzierung im Zentrum der Zielregion
- Berücksichtigung rechteckiger, elliptischer und polygonaler Regionen
- Einrasten des Zielpunkts ins Szenenraster
- Bestätigungsdialog vor der Teleportation
- 2,5 Sekunden Wartezeit innerhalb der auslösenden Region
- automatisches Pausieren des Spiels
- Chatnachrichten für Spieler und Spielleitung
- Buttons für alte und neue Szene
- Schutz vor mehrfacher Ausführung
- Ausführung der eigentlichen Teleportation mit GM-Rechten

---

## 📂 Dateien

```text
Regionen-Teleporter/
├── README.md
└── Regionen-Teleporter.js
```

- **README.md:** Beschreibung, Einrichtung und Hinweise
- **Regionen-Teleporter.js:** vollständiger Makrocode

---

# ⚙️ Voraussetzungen

Für dieses Makro werden benötigt:

- FoundryVTT mit Regionsunterstützung
- Fabula Ultima als Spielsystem
- aktiviertes Modul **socketlib**
- mindestens ein aktiver GM-Client
- eine Zielregion auf einer Foundry-Szene
- ein Regionsverhalten, das dieses Makro ausführt
- die UUID der gewünschten Zielregion

> **Wichtig:** Ohne aktives `socketlib` beendet sich das Makro. Ein GM erhält dabei eine entsprechende Fehlermeldung.

---

# 🎯 Grundidee

Der Teleport läuft in mehreren Schritten ab:

1. Ein Token betritt die auslösende Region.
2. Der Token muss sich 2,5 Sekunden innerhalb der Region befinden.
3. Der Spieler erhält einen Bestätigungsdialog.
4. Bei Bestätigung wird eine Systemnachricht erstellt.
5. Die Zielszene wird für den Spieler geöffnet.
6. `socketlib` lässt die eigentliche Teleportation durch einen GM-Client ausführen.
7. Das Spiel wird pausiert.
8. Der Spieler und die Spielleitung erhalten eine geflüsterte Nachricht mit Szenenbuttons.
9. Der Token wird in der Zielregion sichtbar platziert.
10. Ein kurzzeitiges Teleport-Flag verhindert eine sofortige erneute Auslösung.

---

# 🗺️ Zielregion festlegen

Im unteren Konfigurationsbereich des Makros wird die UUID der Zielregion eingetragen:

```js
const zielUuid = "Scene.sbGbXLtPlidfaUmQ.Region.IVaYrkGNPDK0g0nW";
```

Ersetze den vorhandenen Wert durch die UUID deiner eigenen Zielregion.

Das benötigte Format lautet:

```text
Scene.SZENEN-ID.Region.REGIONS-ID
```

> Für jede Teleporter-Region kann eine Kopie des Makros mit einer anderen `zielUuid` verwendet werden.

---

# 🖼️ Systembild anpassen

Das Makro verwendet ein Bild innerhalb der Chatkarte und des Bestätigungsdialogs.

Die Konstante muss eine reine Bildadresse enthalten:

```js
const botImg = "DEINE-BILDADRESSE";
```

Beispiel:

```js
const botImg = "https://example.com/fabula-system.webp";
```

> **Wichtig:** In `botImg` gehört nur die Bildadresse. Dort darf kein vollständiger HTML-Link mit `<a href="...">` eingetragen sein.

---

# 🧙 GM-Logik mit socketlib

Das Makro registriert beim ersten Aufruf einen Socket für das aktuelle Spielsystem:

```js
window.lunaFabulaSocket = socketlib.registerSystem(game.system.id);
```

Anschließend wird die GM-Funktion registriert:

```js
window.lunaFabulaSocket.register("teleportAsGM", async (tokenUuid, regionUuid, zielName) => {
    // Teleportation mit GM-Rechten
});
```

Der Spieler ruft diese Funktion später über Folgendes auf:

```js
await window.lunaFabulaSocket.executeAsGM(
    "teleportAsGM",
    eventToken.uuid,
    zielUuid,
    zielName
);
```

Die eigentliche Änderung der Tokens und Szenen wird dadurch über einen GM-Client ausgeführt.

---

# 📐 Zielposition berechnen

Das Makro untersucht die Formen der Zielregion und berechnet deren Begrenzungen.

Unterstützt werden:

- Rechtecke
- Ellipsen
- Polygone

Aus dem kleinsten und größten X- beziehungsweise Y-Wert wird das Zentrum der gesamten Region berechnet.

Anschließend wird die Position auf das Raster der Zielszene ausgerichtet.

Wenn keine auswertbare Form gefunden wird, verwendet das Makro als Ersatz das Zentrum der Zielszene.

---

# 🚪 Teleport innerhalb derselben Szene

Befinden sich Ausgang und Ziel auf derselben Szene, wird das vorhandene Token aktualisiert:

```js
await token.update(tokenUpdateData);
```

Dabei werden unter anderem gesetzt:

- neue X-Position
- neue Y-Position
- Token sichtbar
- kurzzeitiges Teleport-Flag

---

# 🌍 Teleport zwischen Szenen

Liegt die Zielregion auf einer anderen Szene, führt das Makro folgende Schritte aus:

1. Das bisherige Token wird verborgen.
2. Auf der Zielszene wird nach einem Token desselben Akteurs gesucht.
3. Existiert bereits ein entsprechendes Token, wird es verschoben und sichtbar gemacht.
4. Existiert kein entsprechendes Token, wird eine Kopie des bisherigen Tokens auf der Zielszene erzeugt.
5. Das neue Token wird im Zentrum der Zielregion platziert.

> Das alte Token wird nicht gelöscht, sondern auf der Ausgangsszene verborgen.

---

# ⏳ Wartezeit in der Region

Nach dem Betreten der Teleporter-Region wartet das Makro:

```js
await new Promise(resolve => setTimeout(resolve, 2500));
```

Das entspricht einer Wartezeit von **2,5 Sekunden**.

Verlässt der Token die Region während dieser Zeit wieder, wird kein Teleportdialog geöffnet.

Das Flag

```text
flags.world.teleportWartezeit
```

verhindert, dass die Wartezeit mehrfach gleichzeitig gestartet wird.

---

# ✅ Bestätigungsdialog

Nach der Wartezeit erhält der Spieler einen Dialog mit zwei Möglichkeiten:

## Ja, Teleport & Pause

- Teleport wird bestätigt
- Zielszene wird geöffnet
- GM-Teleport wird über `socketlib` ausgeführt
- Spiel wird pausiert
- Spieler und GM erhalten eine geflüsterte Systemnachricht

## Abbrechen

- Teleport wird nicht ausgeführt
- das ausstehende Teleport-Flag wird entfernt
- eine Entwarnung wird im Chat ausgegeben

---

# ⏸️ Spielpause

Nach der Teleportation wird das Spiel pausiert, sofern es nicht bereits pausiert ist:

```js
if (!game.paused) {
    await game.togglePause(true, true);
}
```

Dadurch können weitere Spieler den Teleporter nacheinander verwenden, während die Spielleitung die neue Szene vorbereitet.

Das erneute Freigeben des Spiels erfolgt nicht automatisch durch dieses Makro.

---

# 💬 Systemnachrichten

Das Makro erzeugt Systemnachrichten in einem eigenen Fabula-Design.

Verwendet werden:

- grün-türkise Umrandung
- olivgrüne Schrift
- Systembild
- Hinweis auf den teleportierenden Charakter
- Hinweis auf die Spielpause
- Buttons zur alten und neuen Szene

---

# 🗺️ Szenenbuttons

Die geflüsterte Nachricht kann zwei Buttons enthalten:

## Zurück zur alten Szene

Öffnet für den Spieler wieder die Ausgangsszene.

## Szene ansehen

Öffnet die Zielszene.

Die Buttons verändern nur die angezeigte Szene des jeweiligen Benutzers. Sie führen keinen weiteren Token-Teleport aus.

---

# 👥 Empfänger der geflüsterten Nachricht

Nach erfolgreicher Bestätigung werden folgende Benutzer gesammelt:

- alle Besitzer des teleportierten Akteurs mit Besitzerrechten
- alle aktiven oder vorhandenen GM-Benutzer aus der Benutzerliste

Doppelte Benutzer-IDs werden entfernt.

Die kombinierte Nachricht wird anschließend an diese Benutzer geflüstert.

---

# 🛡️ Schutz vor Mehrfachauslösung

Das Makro verwendet mehrere Flags.

| Flag | Bedeutung |
|---|---|
| `flags.world.teleportWartezeit` | verhindert mehrere gleichzeitige Wartezeiten |
| `flags.world.isTeleportPending` | verhindert mehrere offene Teleportanfragen |
| `flags.world.justTeleported` | verhindert sofortige erneute Teleportation am Ziel |

Das Flag `justTeleported` wird kurze Zeit nach der Teleportation wieder entfernt.

---

# 🧩 Regionsverhalten einrichten

1. Erstelle oder öffne die gewünschte Ausgangsregion.
2. Füge der Region ein Verhalten zum Ausführen eines Makros hinzu.
3. Wähle den Regionen-Teleporter.
4. Verwende ein Ereignis, das beim Betreten der Region ausgelöst wird.
5. Trage im Makro die UUID der Zielregion ein.
6. Stelle sicher, dass `socketlib` aktiv ist.
7. Betritt die Region mit einem Token, dessen Akteur dem Spieler gehört.

> Das Makro erwartet Regionsdaten wie Token, auslösenden Benutzer und aktuelle Region aus dem Regionsereignis.

---

# ⚠️ Wichtige Hinweise

## Nur der auslösende Spieler verarbeitet den Dialog

Das Makro vergleicht den aktuellen Benutzer mit dem Benutzer, der das Regionsereignis ausgelöst hat.

Dadurch soll der Bestätigungsdialog nur beim tatsächlich teleportierenden Spieler erscheinen.

## Aktiver GM erforderlich

Die privilegierte Teleportfunktion muss über einen GM-Client ausgeführt werden können.

## Vorhandenes Token auf der Zielszene

Wenn auf der Zielszene bereits ein Token desselben Akteurs existiert, wird dieses Token verwendet.

## Altes Token bleibt bestehen

Bei einem Szenenwechsel wird das alte Token verborgen und nicht gelöscht.

## Weltabhängige UUID

Die Zielregion besitzt in jeder Foundry-Welt eine eigene UUID. Sie muss entsprechend angepasst werden.

---

# 🔧 Konfiguration im Überblick

| Einstellung | Bedeutung |
|---|---|
| `zielUuid` | UUID der Zielregion |
| `botImg` | Bild für Systemnachricht und Dialog |
| `2500` | Wartezeit vor dem Dialog in Millisekunden |
| `btnStyle` | Gestaltung der Szenenbuttons |
| `botStyle` | Gestaltung des Systembildes |

---

# 🧪 Empfohlener Test

1. `socketlib` aktivieren.
2. Einen GM-Client geöffnet lassen.
3. Zielregion und Zielszene prüfen.
4. Ziel-UUID im Makro eintragen.
5. Makro als Regionsverhalten konfigurieren.
6. Testspieler mit einem eigenen Token anmelden.
7. Region betreten und 2,5 Sekunden stehen bleiben.
8. Teleport bestätigen.
9. Zielposition, Sichtbarkeit und Szenenbuttons prüfen.
10. Prüfen, ob das Spiel pausiert wurde.

---

# ⚡ Kurzfassung

1. `socketlib` aktivieren.
2. Zielregion erstellen.
3. Regionen-Teleporter als Regionsverhalten einrichten.
4. `zielUuid` anpassen.
5. `botImg` als reine Bildadresse eintragen.
6. Mit einem Spieler-Token die Ausgangsregion betreten.
7. 2,5 Sekunden in der Region bleiben.
8. Teleport bestätigen.
9. GM-Client verschiebt oder erstellt das Token.
10. Spiel wird pausiert und eine Systemnachricht wird verschickt.

> **Merksatz:** Region betreten, kurz warten, Teleport bestätigen und von der Spielleitung sicher in die Zielregion setzen lassen.

---

# 📝 Hinweis

Dieses Makro wurde für meine eigene Fabula-Ultima-Spielrunde in FoundryVTT erstellt.

Das Makro verwendet `socketlib`, benutzerdefinierte Welt-Flags und weltabhängige Regionen-UUIDs. Vor der Verwendung in einer anderen Welt müssen die Konfigurationswerte angepasst und der Ablauf getestet werden.