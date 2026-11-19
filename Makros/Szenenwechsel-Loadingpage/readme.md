# 🎬 Szenenwechsel mit Loadingpage

> GM-/SL-Makro für einen vorbereiteten Szenenwechsel in FoundryVTT.

Dieses Makro speichert die aktuell geöffnete Szene als neue Zielszene in einem vorhandenen Spieler-Makro und aktiviert anschließend automatisch eine festgelegte **Loadingpage**.

Damit kann die eigentliche Abendszene vorbereitet werden, während die Spieler zunächst auf einer separaten Lade- oder Startszene bleiben.

---

## ✨ Was macht das Makro?

Beim Ausführen führt das Makro automatisch folgende Schritte durch:

1. Es sucht das festgelegte **Spieler-Makro**.
2. Es ermittelt die aktuell geöffnete Szene.
3. Es liest den bestehenden Code des Spieler-Makros aus.
4. Es sucht dort nach:
   ```js
   const zielUuid = "...";
   ```
5. Die vorhandene UUID wird durch die UUID der aktuell geöffneten Szene ersetzt.
6. Der geänderte Code wird im Spieler-Makro gespeichert.
7. Anschließend wird die festgelegte **Loadingpage** geladen.
8. Die Loadingpage wird aktiviert.

Nach erfolgreicher Ausführung erscheint eine entsprechende Foundry-Benachrichtigung.

---

# 🎯 Typischer Einsatz

Das Makro ist dafür gedacht, vor oder während eines Spielabends eine Szene als nächste Zielszene vorzubereiten.

Beispielhafter Ablauf:

**Gewünschte Spielszene öffnen**

↓

**GM-/SL-Makro ausführen**

↓

**Aktuelle Szene wird im Spieler-Makro als Ziel gespeichert**

↓

**Loadingpage wird aktiviert**

↓

**Die vorbereitete Zielszene kann anschließend über das dazugehörige Spieler-Makro verwendet werden**

---

# ⚙️ Konfiguration

Am Anfang des Makros befinden sich zwei wichtige Werte:

```js
const spielerMakroId = "OZhaGrQMeafPC15h";
const loadingPageUuid = "Scene.Yrh4yMyhaO5NrFxh";
```

## `spielerMakroId`

```js
const spielerMakroId = "OZhaGrQMeafPC15h";
```

Hier wird die ID des Spieler-Makros eingetragen, dessen Zielszene automatisch geändert werden soll.

---

## `loadingPageUuid`

```js
const loadingPageUuid = "Scene.Yrh4yMyhaO5NrFxh";
```

Hier wird die UUID der Szene eingetragen, die als Loadingpage verwendet werden soll.

---

# ⚠️ Voraussetzung im Spieler-Makro

Damit das automatische Ersetzen funktioniert, muss das Spieler-Makro eine Zeile in diesem Format besitzen:

```js
const zielUuid = "Scene.DEINE-SZENE";
```

Das GM-/SL-Makro sucht gezielt nach dieser Deklaration:

```js
/const\s+zielUuid\s*=\s*"[^"]+";/
```

und ersetzt anschließend die vorhandene UUID.

> **Wichtig:** Wird die Schreibweise von `const zielUuid = "...";` im Spieler-Makro verändert, kann die automatische Ersetzung möglicherweise nicht mehr greifen.

---

# 🛡️ Fehlerprüfungen

Das Makro enthält mehrere einfache Prüfungen.

## Spieler-Makro nicht gefunden

Wurde die eingetragene Makro-ID nicht gefunden, erscheint:

```text
Das Spieler-Makro wurde nicht gefunden. Bitte ID prüfen!
```

---

## Keine Szene geöffnet

Ist beim Ausführen keine aktuelle Szene vorhanden, erscheint:

```text
Du hast keine Szene geöffnet!
```

---

## Loadingpage nicht gefunden

Kann die konfigurierte Loadingpage nicht über ihre UUID gefunden werden, erscheint:

```text
Die Loadingpage konnte nicht gefunden werden! Bitte UUID prüfen.
```

---

# ✅ Erfolgreicher Szenenwechsel

Bei erfolgreicher Vorbereitung wird eine Meldung nach diesem Muster angezeigt:

```text
Erfolg! 'Name der Szene' wurde als neue Abendkarte in den Code geschrieben. Loadingpage ist aktiv.
```

Damit lässt sich direkt erkennen, welche Szene gerade als neue Zielszene gespeichert wurde.

---

# 🔧 Technischer Ablauf

## Aktuelle Szene

Die momentan geöffnete Szene wird über:

```js
const aktuelleSzene = canvas.scene;
```

ermittelt.

---

## Spieler-Makro

Das konfigurierte Spieler-Makro wird über seine ID geladen:

```js
const makro = game.macros.get(spielerMakroId);
```

---

## Zielszene ersetzen

Der vorhandene Makrocode wird ausgelesen:

```js
let alterCode = makro.command;
```

Anschließend wird die bisherige `zielUuid` durch die UUID der aktuellen Szene ersetzt:

```js
let neuerCode = alterCode.replace(
    /const\s+zielUuid\s*=\s*"[^"]+";/,
    `const zielUuid = "${aktuelleSzene.uuid}";`
);
```

Der geänderte Code wird anschließend gespeichert:

```js
await makro.update({ command: neuerCode });
```

---

## Loadingpage aktivieren

Die Loadingpage wird über ihre UUID geladen:

```js
const loadingScene = await fromUuid(loadingPageUuid);
```

Anschließend wird sie aktiviert:

```js
await loadingScene.activate();
```

---

# 📂 Zugehörige Dateien

```text
Szenenwechsel-Loadingpage/
├── README.md
└── Szenenwechsel-Loadingpage.js
```

- **README.md** → Beschreibung und Einrichtung
- **Szenenwechsel-Loadingpage.js** → eigentlicher Makrocode

---

# ⚡ Kurzfassung

1. Gewünschte Zielszene öffnen.
2. GM-/SL-Makro ausführen.
3. Aktuelle Szenen-UUID wird in das Spieler-Makro geschrieben.
4. Loadingpage wird aktiviert.
5. Die neue Zielszene ist für den weiteren Ablauf vorbereitet.

> **Merksatz:** Spielszene öffnen → Makro starten → Zielszene speichern → Loadingpage aktivieren.

---

# 📝 Hinweis

Dieses Makro ist für meine eigene **Fabula-Ultima-Spielrunde in FoundryVTT** entstanden.

Die IDs und UUIDs sind weltabhängig und müssen bei einer Übernahme in eine andere Foundry-Welt entsprechend angepasst werden.