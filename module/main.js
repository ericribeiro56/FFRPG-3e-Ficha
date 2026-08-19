import { RACAS_INICIAIS } from "../resources/defaults-data.js";
import { PlayerSheet } from "./sheets/actor-sheet.js";
import { CharacterData, JobDataModel, RaceDataModel, EffectModel, WeaponModel, ArmorModel, ConsumableBasicModel, StatusBonusBase, ItemAbilityBase } from "./data-models.js";
import { EffectsSheet } from "./sheets/items/effect-sheet.js";
import { JobSheet } from "./sheets/job-sheet.js";
import { RaceSheet } from "./sheets/race-sheet.js";
import { WeaponSheet as WeaponSheetCustom } from "./sheets/items/weapon-sheet.js";
import { ArmorSheet as ArmorSheetCustom } from "./sheets/items/armor-sheet.js";
import { ARMOR_SLOTS } from "./core/constants.js";

Hooks.once("preInit", async function() {
  CONFIG.dataModels = CONFIG.dataModels || {};
  CONFIG.dataModels.StatusBonusBase = StatusBonusBase;
  CONFIG.dataModels.ItemAbilityBase = ItemAbilityBase;

  game.dataModels = game.dataModels || {};
  game.dataModels.StatusBonusBase = StatusBonusBase;
  game.dataModels.ItemAbilityBase = ItemAbilityBase;
});

Hooks.once("init", async function() {
  try {
    const response = await fetch("systems/ffrpg3e/lang/pt-BR.json");
    if (response.ok) {
      const ptTranslations = await response.json();
      foundry.utils.mergeObject(game.i18n._fallback, ptTranslations);
      foundry.utils.mergeObject(game.i18n.translations, ptTranslations);
    }
  } catch (err) {
    console.error("[FFRPG3E]] | Erro ao forçar idioma em português:", err);
  }

  Handlebars.registerHelper("traduzirSlot", function(slot) {
    return `[${ARMOR_SLOTS[slot] || slot}]`;
  });

  const STATUS_DISPLAY_MAP = {
    forca: "Força", vitalidade: "Vitalidade", agilidade: "Agilidade", velocidade: "Velocidade",
    magia: "Magia", espirito: "Espírito", armadura: "Armadura", armadura_magica: "Armadura Mágica",
    evasao: "Evasão", evasao_magica: "Evasão Mágica", precisao: "Precisão", precisao_magica: "Precisão Mágica",
    destreza: "Destreza", mente: "Mente", expert: "Expert", crit: "Crítico", damage: "Dano",
    hp: "HP Máx", mp: "MP Máx"
  };

  Handlebars.registerHelper("statusDisplay", function(statusKey) {
    return STATUS_DISPLAY_MAP[statusKey] || statusKey || "";
  });

  Handlebars.registerHelper("modeDisplay", function(mode) {
    if (mode === "percent") return "%";
    if (mode === "flat") return "Direto";
    return mode;
  });

  Handlebars.registerHelper("getProperty", (obj, path) => {
        if (!obj || typeof path !== "string" || !path) return "";
        return foundry.utils.getProperty(obj, path);
    });

  CONFIG.Actor.dataModels = {
    character: CharacterData
  };

  CONFIG.Item.dataModels = {
    effects: EffectModel,
    job: JobDataModel,
    race: RaceDataModel,
    gear_weapon: WeaponModel,
    gear_armor: ArmorModel,
    gear_consumable: ConsumableBasicModel
  };

  CONFIG.statusEffects = [
    { id: "agility_up", name: "Agilidade Aumentada", icon: "icons/svg/upgrade.svg" },
    { id: "agility_down", name: "Agilidade Reduzida", icon: "icons/svg/downgrade.svg" },
    { id: "agility_break", name: "Agilidade Quebrada", icon: "icons/svg/hazard.svg" },
    { id: "spirit_up", name: "Espírito Aumentado", icon: "icons/svg/upgrade.svg" },
    { id: "spirit_down", name: "Espírito Reduzido", icon: "icons/svg/downgrade.svg" },
    { id: "spirit_break", name: "Espírito Quebrado", icon: "icons/svg/hazard.svg" }
  ];

  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);

  foundry.documents.collections.Actors.registerSheet("ffrpg3e", PlayerSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Ficha do Jogador FFRPG 3E"
  });

  foundry.documents.collections.Items.registerSheet("ffrpg3e", EffectsSheet, {
    types: ["effects"],
    makeDefault: true,
    label: "Gerenciador de Status FFRPG 3E"
  });

  foundry.documents.collections.Items.registerSheet("ffrpg3e", JobSheet, {
    types: ["job"],
    makeDefault: true,
    label: "Configurador de Classe FFRPG 3E"
  });

  foundry.documents.collections.Items.registerSheet("ffrpg3e", RaceSheet, {
    types: ["race"],
    makeDefault: true,
    label: "Configurador de Raça FFRPG 3E"
  });

  foundry.documents.collections.Items.registerSheet("ffrpg3e", WeaponSheetCustom, {
    types: ["gear_weapon"],
    makeDefault: true,
    label: "Configurador de Arma"
  });

  foundry.documents.collections.Items.registerSheet("ffrpg3e", ArmorSheetCustom, {
    types: ["gear_armor"],
    makeDefault: true,
    label: "Configurador de Equipamento"
  });
});

Hooks.on("updateCombat", async (combat, updateData, options, userId) => {
  if (game.user.id !== userId || !game.user.isGM) return;

  const mudouTurno = "turn" in updateData;
  const mudouRodada = "round" in updateData;
  if (!mudouTurno && !mudouRodada) return;

  if (combat.turn === null || !combat.combatant) return;

  const actor = combat.combatant.actor;
  if (!actor) return;

  const efeitosTemporarios = actor.items.filter(item => item.type === "effects");
  const itensParaAtualizar = [];
  const idsParaDeletar = [];

  for (const item of efeitosTemporarios) {
    if (item.system.duracao_turnos === null || item.system.is_permanente === true) continue;

    const turnosRestantes = item.system.duracao_turnos - 1;

    if (turnosRestantes <= 0) {
      idsParaDeletar.push(item.id);
    } else {
      itensParaAtualizar.push({
        _id: item.id,
        "system.duracao_turnos": turnosRestantes
      });
    }
  }

  if (itensParaAtualizar.length > 0) {
    await actor.updateEmbeddedDocuments("Item", itensParaAtualizar);
  }

  if (idsParaDeletar.length > 0) {
    await actor.deleteEmbeddedDocuments("Item", idsParaDeletar);
    ui.notifications.info(`[FFRPG3E] Efeitos expirados foram removidos de ${actor.name}.`);
  }
});

Hooks.once("ready", async () => {
  if (!game.user.isGM) return;
});

async function criarPastaEInjetarItens(nomeDaPasta, listaDeDados, corHex = "#4a154b") {
  if (!listaDeDados || listaDeDados.length === 0) return;

  try {
    let pasta = game.folders.find(f => f.name === nomeDaPasta && f.type === "Item");
    
    if (!pasta) {
      pasta = await Folder.create({ name: nomeDaPasta, type: "Item", color: corHex });
      
      const dadosProntos = listaDeDados.map(item => ({ ...item, folder: pasta.id }));
      await Item.createDocuments(dadosProntos);
      
      console.log(`FFRPG3E | ${nomeDaPasta} injetado com sucesso!`);
    }
  } catch (error) {
    console.error(`FFRPG3E | Erro crítico ao injetar o banco de dados de: "${nomeDaPasta}"`, error);
  }
}
