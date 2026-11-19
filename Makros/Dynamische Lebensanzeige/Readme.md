# 🟢🟡🟠🔴 Lebenspunkte-Ringe

Automatische farbliche Darstellung der verbleibenden Lebenspunkte eines Tokens über den **Token-Ring in FoundryVTT**.

Das Makro überwacht die Lebenspunkte der Akteure und passt die Ringfarbe automatisch an den aktuellen prozentualen Lebenspunktestand an.

Dadurch lässt sich direkt auf der Szene erkennen, wie angeschlagen ein Charakter oder Gegner bereits ist, ohne dafür den Charakterbogen öffnen zu müssen.

---

## ✨ Funktionen

Das Makro übernimmt automatisch:

- Überwachung von Änderungen der Lebenspunkte
- Berechnung der verbleibenden Lebenspunkte in Prozent
- automatische Anpassung der Token-Ringfarbe
- Aktualisierung aller aktiven Tokens eines Akteurs
- Aktualisierung der Tokens nach einem Szenenwechsel
- einmalige Aktualisierung der bereits geladenen Szene beim Start des Makros
- Entfernung zuvor registrierter Hooks des Makros vor einer erneuten Aktivierung

> **Wichtig:** Die automatische Färbung wird nur auf Tokens angewendet, bei denen der Token-Ring aktiviert ist.

---

## 🎨 Farbstufen

Die Farbe richtet sich nach dem Verhältnis von aktuellen zu maximalen Lebenspunkten.

| Lebenspunkte | Ringfarbe | Bedeutung |
|---|---|---|
| **über 80 %** | 🟢 Grün | guter Zustand |
| **über 60 bis 80 %** | 🟡 Gelb | erste Verletzungen |
| **über 40 bis 60 %** | 🟠 Orange | deutlich angeschlagen |
| **über 10 bis 40 %** | 🔴 Rot | schwer angeschlagen |
| **0 bis 10 %** | 🩸 Dunkelrot | kritischer Zustand |

Die Hintergrundfarbe des Rings wird dabei nicht verwendet.

---

## ⚙️ Funktionsweise

Das Makro registriert zwei Hooks.

### `updateActor`

Dieser Hook reagiert auf Änderungen eines Akteurs.

Das Makro prüft dabei gezielt, ob sich die Lebenspunkte unter

```text
system.resources.hp
```

geändert haben.

Ist dies der Fall:

1. aktuelle Lebenspunkte werden gelesen,
2. maximale Lebenspunkte werden gelesen,
3. der prozentuale Lebenspunktestand wird berechnet,
4. die passende Farbe wird bestimmt,
5. alle aktiven Tokens des Akteurs werden aktualisiert.

---

### `canvasReady`

Dieser Hook wird verwendet, wenn eine Szene beziehungsweise ein Canvas bereit ist.

Dadurch werden beim Laden oder Wechseln einer Szene die vorhandenen Tokens überprüft und ihre Ringfarben anhand der aktuellen Lebenspunkte aktualisiert.

---

## 🔄 Aktivierung

Das Makro wird einmal ausgeführt, um die automatische Überwachung zu aktivieren.

Nach erfolgreicher Aktivierung erscheint die Meldung:

> **Fabula Ultima: 5-Stufen-Ringe erfolgreich AKTIVIERT!**

Danach reagieren die registrierten Hooks automatisch auf Lebenspunktänderungen und Szenenwechsel.

---

## ♻️ Erneutes Ausführen

Das Makro speichert die registrierten Hooks am Makro selbst.

Wird es erneut ausgeführt, versucht es zuerst, die zuvor registrierten Hooks zu entfernen und anschließend neu anzulegen.

Dadurch sollen nicht bei jeder erneuten Ausführung zusätzliche identische Hooks entstehen.

---

## 🧩 Voraussetzungen

- FoundryVTT
- Fabula Ultima
- Token mit aktiviertem Token-Ring
- Lebenspunkte unter `system.resources.hp.value`
- maximale Lebenspunkte unter `system.resources.hp.max`

---

## 📜 Makro

Der eigentliche Makrocode befindet sich in:

[`Lebenspunkte-Ringe.js`](./Lebenspunkte-Ringe.js)

---

## 📝 Hinweis

Dieses Makro ist für meine eigene Fabula-Ultima-Spielrunde entstanden.

Es darf gerne als Vorlage für die eigene Runde verwendet und an die eigenen Bedürfnisse angepasst werden.