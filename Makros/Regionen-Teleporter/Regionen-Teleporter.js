// ======================================================================== 
 // 1. SOCKETLIB & GM-LOGIK INITIALISIEREN (Der DSK-Trick für Fabula) 
 // ======================================================================== 
 if (!game.modules.get("socketlib")?.active) { 
     if (game.user.isGM) ui.notifications.error("Luna sagt 🌙: Bitte aktiviere das Modul 'socketlib'!"); 
     return; 
 } 

 if (!window.lunaFabulaSocket) { 
     window.lunaFabulaSocket = socketlib.registerSystem(game.system.id); 
      
     // Das ist das unsichtbare Skript, das der GM für den Spieler ausführt: 
     window.lunaFabulaSocket.register("teleportAsGM", async (tokenUuid, regionUuid, zielName) => { 
         const token = await fromUuid(tokenUuid); 
         const region = await fromUuid(regionUuid); 
         if (!token || !region) return; 
         const zielSzene = region.parent; 
         const alteSzene = token.parent;

         // --- ZENTRUM BERECHNEN & INS RASTER EINRASTEN --- 
         let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity; 
         for (const shape of region.shapes) { 
             if (shape.type === "rectangle") { 
                 minX = Math.min(minX, shape.x); maxX = Math.max(maxX, shape.x + shape.width); 
                 minY = Math.min(minY, shape.y); maxY = Math.max(maxY, shape.y + shape.height); 
             } else if (shape.type === "ellipse") { 
                 let rx = shape.radiusX ?? shape.radius; let ry = shape.radiusY ?? shape.radius; 
                 minX = Math.min(minX, shape.x - rx); maxX = Math.max(maxX, shape.x + rx); 
                 minY = Math.min(minY, shape.y - ry); maxY = Math.max(maxY, shape.y + ry); 
             } else if (shape.type === "polygon" && shape.points) { 
                 for (let i = 0; i < shape.points.length; i += 2) { 
                     minX = Math.min(minX, shape.points[i]); maxX = Math.max(maxX, shape.points[i]); 
                     minY = Math.min(minY, shape.points[i+1]); maxY = Math.max(maxY, shape.points[i+1]); 
                 } 
             } 
         } 
          
         let tx = 0, ty = 0; 
         if (minX !== Infinity) { 
             let centerX = minX + (maxX - minX) / 2; 
             let centerY = minY + (maxY - minY) / 2; 
             const gridSize = zielSzene.grid.size; 
              
             let colsToCenter = Math.floor((centerX - minX) / gridSize) - Math.floor(((token.width || 1) - 1) / 2); 
             let rowsToCenter = Math.floor((centerY - minY) / gridSize) - Math.floor(((token.height || 1) - 1) / 2); 
             tx = minX + (colsToCenter * gridSize); 
             ty = minY + (rowsToCenter * gridSize); 
         } else { 
             tx = zielSzene.width / 2; ty = zielSzene.height / 2; 
         } 

         const tokenUpdateData = { 
             x: tx, y: ty, hidden: false, 
             "flags.world.justTeleported": true 
         }; 

         let neueTokens = null; 
         if (alteSzene.id === zielSzene.id) { 
             await token.update(tokenUpdateData); 
         } else { 
             // Altes Token verstecken, neues Token drüben erschaffen! 
             await token.update({ hidden: true }); 
             const existierenderToken = zielSzene.tokens.find(t => t.actorId === token.actorId); 
             if (existierenderToken) { 
                 await existierenderToken.update(tokenUpdateData); 
             } else { 
                 const tokenDatenNeu = foundry.utils.duplicate(token.toObject()); 
                 delete tokenDatenNeu._id; 
                 tokenDatenNeu.x = tx; tokenDatenNeu.y = ty; tokenDatenNeu.hidden = false; 
                 foundry.utils.setProperty(tokenDatenNeu, "flags.world.justTeleported", true); 
                 neueTokens = await zielSzene.createEmbeddedDocuments("Token", [tokenDatenNeu]); 
             } 
         } 

         // Spiel pausieren 
         if (!game.paused) await game.togglePause(true, true); 

         // DIE ÜBERFLÜSSIGE GM-NACHRICHT WURDE HIER KOMPLETT ENTFERNT

         setTimeout(async () => { 
             let finalToken = neueTokens ? neueTokens[0] : (zielSzene.tokens.find(t => t.actorId === token.actorId)); 
             if (finalToken) await finalToken.unsetFlag("world", "justTeleported"); 
         }, 800); 
     }); 
 } 

 // ======================================================================== 
 // 2. SPIELER-LOGIK & REGIONS-EVENT (Verzögerung & UI) 
 // ======================================================================== 
 const eventToken = event?.data?.token;  
 const ausloeser = event?.user; 
 const aktuelleRegion = event?.region; 

 if (!eventToken || !ausloeser || !aktuelleRegion) return; 
 if (game.user.id !== ausloeser.id) return; 
 if (eventToken.getFlag("world", "justTeleported")) return; 

 // --- VERZÖGERUNG (2,5 Sekunden Stillstand) --- 
 if (eventToken.getFlag("world", "teleportWartezeit")) return; 
 await eventToken.setFlag("world", "teleportWartezeit", true); 
 await new Promise(resolve => setTimeout(resolve, 2500)); 
 await eventToken.unsetFlag("world", "teleportWartezeit"); 
 if (!aktuelleRegion.tokens.has(eventToken)) return; 

 // --- CHAT-HOOK FÜR SZENEN-BUTTON (mit Fehlerprüfung) --- 
 if (!window.fabulaSzeneHookRegistriert) { 
     Hooks.on("renderChatMessage", (message, html, data) => { 
         html.find('.fabula-szene-btn').click(async (ev) => { 
             ev.preventDefault(); 
             const sceneId = ev.currentTarget.dataset.sceneId; 
             const scene = game.scenes.get(sceneId); 
             if (scene) {
                 await scene.view(); 
             } else {
                 ui.notifications.error("Die Szene konnte nicht gefunden werden.");
             }
         }); 
     }); 
     window.fabulaSzeneHookRegistriert = true; 
 } 

 // --- ROBOTER-DESIGN-KONSTANTE IM FABULA-LOOK --- 
 const botImg = "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/worlds/fabula-spiel/assets/Allgemein/fabula-system.webp"; 
 const botStyle = "width: 60px; height: 60px; border-radius: 5px; border: 1px solid #29695d; box-shadow: 0 0 5px rgba(0,0,0,0.5); flex-shrink: 0;"; 
 const btnStyle = "background-color: #1c3b38; color: #b9c991; border: 1px solid #29695d; border-radius: 4px; padding: 5px 8px; font-weight: bold; cursor: pointer; font-family: sans-serif; font-size: 0.9em; box-shadow: 1px 1px 3px rgba(0,0,0,0.3); width: 100%; text-align: left;"; 

 // Die Chat-Box MIT ZWEI KLAREN BUTTONS
 const botBox = (text, alteSzeneId = null, alteSzeneName = null, zielSzeneId = null, zielSzeneName = null) => { 
   let buttonsHtml = ""; 
   if (alteSzeneId && alteSzeneName) { 
     buttonsHtml += `<button class="fabula-szene-btn" data-scene-id="${alteSzeneId}" style="${btnStyle} margin-bottom: 5px;"><i class="fas fa-undo"></i> Zurück nach ${alteSzeneName}</button>`; 
   } 
   if (zielSzeneId && zielSzeneName) { 
     buttonsHtml += `<button class="fabula-szene-btn" data-scene-id="${zielSzeneId}" style="${btnStyle}"><i class="fas fa-map"></i> Szene ansehen: ${zielSzeneName}</button>`; 
   } 
   return `<div style="border: 2px solid #29695d; border-radius: 5px; overflow: hidden; margin-bottom: 5px; background: transparent;"><div style="background-color: #29695d; color: #b9c991; padding: 4px 8px; font-weight: bold; font-family: sans-serif;">Systemnachricht</div><div style="padding: 8px;"><div style="display: flex; align-items: center; gap: 10px;"><img src="${botImg}" style="${botStyle}"><div>${text}</div></div>${buttonsHtml ? `<div style="margin-top: 10px; display: flex; flex-direction: column; padding-left: 70px;">${buttonsHtml}</div>` : ""}</div></div>`; 
 }; 

 // ======================================================================== 
 // HIER NUR NOCH DEINE REGION-UUID EINTRAGEN – MEHR NICHT! 
 // ======================================================================== 
 const zielUuid = "Scene.sbGbXLtPlidfaUmQ.Region.IVaYrkGNPDK0g0nW"; 
 // ======================================================================== 

 const zielRegion = await fromUuid(zielUuid); 
 if (!zielRegion) return ui.notifications.error("Die Ziel-Region wurde nicht gefunden!"); 
 const zielSzene = zielRegion.parent; 
 const zielName = zielRegion.name || zielRegion.id; 

 // Aktuelle Szene merken, bevor der Spieler weg ist
 const aktuelleSzene = canvas.scene;

 // Spam-Schutz 
 const isPending = eventToken.getFlag("world", "isTeleportPending"); 

 if (!isPending) { 
     await eventToken.setFlag("world", "isTeleportPending", true); 
     ChatMessage.create({ 
         // Nur Textnachricht ohne Buttons
         content: botBox(`<b>${eventToken.name}</b> will nach <b>${zielName}</b> teleportieren. Das Spiel wird dann pausiert, bitte begebt euch zu <b>${eventToken.name}</b> falls ihr ebenso teleportiert werden wollt.`), 
         speaker: { alias: "System" } 
     }); 
 } 

 // --- BESTÄTIGUNGS-DIALOG IM FABULA-LOOK --- 
 new Dialog({ 
   title: `Teleportation nach ${zielName}`, 
   content: ` 
     <div style="border: 2px solid #29695d; border-radius: 5px; overflow: hidden; margin-bottom: 10px; background: transparent;"> 
       <div style="background-color: #29695d; color: #b9c991; padding: 4px 8px; font-weight: bold; font-family: sans-serif;">Systemnachricht</div> 
       <div style="display: flex; align-items: flex-start; gap: 15px; padding: 10px;"> 
           <img src="${botImg}" style="${botStyle}"> 
           <div> 
               <p style="margin: 0 0 8px 0;">Möchtest du <b>${eventToken.name}</b> nach <b>${zielName}</b> teleportieren?</p> 
               <p style="margin: 0; font-size: 0.9em; font-style: italic; color: #29695d;"><b>Achtung!</b> Das Spiel wird für <b>ALLE</b> pausiert. Rede also mit allen, ob sie ebenso mitwollen, und gedulde dich, bis sie da sind.</p> 
           </div> 
       </div> 
     </div> 
   `, 
   buttons: { 
     yes: { 
       icon: '<i class="fas fa-check"></i>', 
       label: "Ja, Teleport & Pause", 
       callback: async () => { 
         // Spam-Schutz vom Token entfernen 
         await eventToken.unsetFlag("world", "isTeleportPending"); 

         // Besitzer UND Spielleiter (GMs) sammeln für die Flüsternachricht
         const ownerIds = eventToken.actor?.ownership ? Object.entries(eventToken.actor.ownership).filter(([id, level]) => level === 3).map(([id]) => id) : [ausloeser.id]; 
         const gmIds = game.users.filter(u => u.isGM).map(u => u.id);
         const whisperIds = Array.from(new Set([...ownerIds, ...gmIds]));
          
         // Alte Szene auswerten für die Buttons
         let alteId = (aktuelleSzene && aktuelleSzene.id !== zielSzene.id) ? aktuelleSzene.id : null;
         let alteName = aktuelleSzene ? aktuelleSzene.name : null;

         // Der kombinierte Text mit Charakter-Info, Strich (hr) und Gedulds-Hinweis
         const kombiText = `<b>${eventToken.name}</b> hat den Teleport nach <b>${zielName}</b> genutzt.<hr style="border-color: #29695d; margin: 5px 0;">Bitte habe etwas Geduld, bis jeder den Teleport bestätigt hat und der Spielleiter die neue Szene betreten und vorbereitet hat.<br>Das Spiel wird anschließend wieder freigegeben.`;

         // Eine einzige, geflüsterte Nachricht an Spieler und Spielleiter
         ChatMessage.create({ 
             content: botBox(kombiText, alteId, alteName, zielSzene.id, zielName), 
             whisper: whisperIds, 
             speaker: { alias: "System" } 
         }); 

         // Spieler direkt auf die neue Szene schauen lassen 
         if (zielSzene.id !== canvas.scene.id) await zielSzene.view(); 

         // ✨ HIER PASSIERT DIE MAGIE: Der GM übernimmt die Rechte-Arbeit! 
         try { 
             await window.lunaFabulaSocket.executeAsGM("teleportAsGM", eventToken.uuid, zielUuid, zielName); 
         } catch (error) { 
             console.log("Luna sagt 🌙: SocketLib-Status abgefangen (Teleport erfolgreich)."); 
         } 
       } 
     }, 
     no: {  
       icon: '<i class="fas fa-times"></i>',  
       label: "Abbrechen", 
       callback: async () => { 
         // Spam-Schutz vom Token entfernen 
         await eventToken.unsetFlag("world", "isTeleportPending"); 
         ChatMessage.create({ 
             content: botBox(`Entwarnung: <b>${eventToken.name}</b> hat den Teleport abgebrochen und ist weitergezogen.`), 
             speaker: { alias: "System" } 
         }); 
       } 
     } 
   }, 
   default: "yes" 
 }).render(true);