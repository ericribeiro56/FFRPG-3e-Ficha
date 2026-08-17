import { RACAS_INICIAIS } from "../resources/defaults-data.js";
import { PlayerSheet } from "./sheets/actor-sheet.js";
import { CharacterData, JobDataModel, RaceDataModel, EffectsItemModel, WeaponModel, ArmorModel, ConsumableBasicModel, StatusBonusBase, ItemAbilityBase, ModificadorEstrutura } from "./data-models.js";
import { EffectsSheet } from "./sheets/effect-sheet.js";
import { JobSheet } from "./sheets/job-sheet.js";
import { RaceSheet } from "./sheets/race-sheet.js";
import { WeaponSheet as WeaponSheetCustom } from "./sheets/items/weapon-sheet.js";
import { ArmorSheet as ArmorSheetCustom } from "./sheets/items/armor-sheet.js";
import { ARMOR_SLOTS } from "./core/constants.js";

CONFIG.dataModels = CONFIG.dataModels || {};
CONFIG.dataModels.StatusBonusBase = StatusBonusBase;
CONFIG.dataModels.ItemAbilityBase = ItemAbilityBase;
CONFIG.dataModels.ModificadorEstrutura = ModificadorEstrutura;

game.dataModels = game.dataModels || {};
game.dataModels.StatusBonusBase = StatusBonusBase;
game.dataModels.ItemAbilityBase = ItemAbilityBase;
game.dataModels.ModificadorEstrutura = ModificadorEstrutura;

Hooks.once("preInit", async function() {
  // Pré-inicializando o sistema de RPG
  CONFIG.dataModels = CONFIG.dataModels || {};
  CONFIG.dataModels.StatusBonusBase = StatusBonusBase;
  CONFIG.dataModels.ItemAbilityBase = ItemAbilityBase;
  CONFIG.dataModels.ModificadorEstrutura = ModificadorEstrutura;

  game.dataModels = game.dataModels || {};
  game.dataModels.StatusBonusBase = StatusBonusBase;
  game.dataModels.ItemAbilityBase = ItemAbilityBase;
  game.dataModels.ModificadorEstrutura = ModificadorEstrutura;
});

Hooks.once("init", async function() {
  // Inicializando o sistema de RPG

  // Busca o arquivo de português diretamente da pasta do seu sistema
  try {
    const response = await fetch("systems/ffrpg3e/lang/pt-BR.json");
    if (response.ok) {
      const ptTranslations = await response.json();
      
      // Injeta as traduções na tabela padrão (Inglês/Fallback) do Foundry
      foundry.utils.mergeObject(game.i18n._fallback, ptTranslations);
      
      // Também injeta na linguagem ativa atual por segurança
      foundry.utils.mergeObject(game.i18n.translations, ptTranslations);
    }
  } catch (err) {
    console.error("[FFRPG3E]] | Erro ao forçar idioma em português:", err);
  }

  Handlebars.registerHelper("traduzirSlot", function(slot) {
    return `[${ARMOR_SLOTS[slot] || slot}]`;
  });

  // 1. REGISTRO DE ESQUEMAS DOS ATORES (Ficha do Personagem)
  CONFIG.Actor.dataModels = {
    character: CharacterData
  };

  // 🚨 2. REGISTRO DE ESQUEMAS DOS ITENS: Vincula as classes do data-models aos saquinhos do inventário (v14)
  CONFIG.Item.dataModels = {
    effects: EffectsItemModel,
    job: JobDataModel,
    race: RaceDataModel,
    gear_weapon: WeaponModel,
    gear_armor: ArmorModel,
    gear_consumable: ConsumableBasicModel
  };

  // Cadastra as condições oficiais do sistema
  CONFIG.statusEffects = [
    { id: "agility_up", name: "Agilidade Aumentada", icon: "icons/svg/upgrade.svg" },
    { id: "agility_down", name: "Agilidade Reduzida", icon: "icons/svg/downgrade.svg" },
    { id: "agility_break", name: "Agilidade Quebrada", icon: "icons/svg/hazard.svg" },
    { id: "spirit_up", name: "Espírito Aumentado", icon: "icons/svg/upgrade.svg" },
    { id: "spirit_down", name: "Espírito Reduzido", icon: "icons/svg/downgrade.svg" },
    { id: "spirit_break", name: "Espírito Quebrado", icon: "icons/svg/hazard.svg" }
  ];

  // Desregistra a folha padrão do núcleo do Foundry
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);

  // Registra a sua folha customizada do personagem jogador
  foundry.documents.collections.Actors.registerSheet("ffrpg3e", PlayerSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Ficha do Jogador FFRPG 3E"
  });

  // Vincula a sua tela de gerenciamento escuro de efeitos ao item do tipo 'effects'
  foundry.documents.collections.Items.registerSheet("ffrpg3e", EffectsSheet, {
    types: ["effects"],
    makeDefault: true,
    label: "Gerenciador de Status FFRPG 3E"
  });

  // Vincula a folha de configuração ao item do tipo 'job'
  foundry.documents.collections.Items.registerSheet("ffrpg3e", JobSheet, {
    types: ["job"],
    makeDefault: true,
    label: "Configurador de Classe FFRPG 3E"
  });

  // 🚨 ADICIONE ESTE BLOCO: Vincula a nova folha ao item do tipo 'race'
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

// ==========================================================================
// AUTOMAÇÃO DE COMBATE: Reduz turnos de status de forma performática na v14
// ==========================================================================
Hooks.on("updateCombat", async (combat, updateData, options, userId) => {
  // TRAVA DE PERFORMANCE 1: Só o mestre (GM) executa a alteração no banco de dados.
  // Isso impede que 5 jogadores tentem deletar o mesmo item ao mesmo tempo, gerando lag.
  if (game.user.id !== userId || !game.user.isGM) return;

  // TRAVA DE PERFORMANCE 2: Só avança se a mudança foi REALMENTE passar o turno ou rodada.
  // Se o mestre apenas mudar o nome do combate ou adicionar um token, o código morre aqui sem processar nada.
  const mudouTurno = "turn" in updateData;
  const mudouRodada = "round" in updateData;
  if (!mudouTurno && !mudouRodada) return;

  // TRAVA DE PERFORMANCE 3: Ignora se o combate começou agora ou se não há combatente ativo.
  if (combat.turn === null || !combat.combatant) return;

  // Captura o Actor (personagem) que ACABOU de encerrar o seu turno no Combate Tracker
  const actor = combat.combatant.actor;
  if (!actor) return;

  console.log(`[FFRPG3E][COMBAT] Processando fim de turno`);

  // Coleta APENAS os itens do tipo 'effects' que pertencem a esse personagem específico
  const efeitosTemporarios = actor.items.filter(item => item.type === "effects");
  
  // Lista para acumular as atualizações e disparar um único update no banco de dados (Garante Performance!)
  const itensParaAtualizar = [];
  const idsParaDeletar = [];

  for (const item of efeitosTemporarios) {
    // SEU CONTROLE: Se for permanente (via nulo ou check), ignora e pula para o próximo!
    if (item.system.duracao_turnos === null || item.system.is_permanente === true) continue;

    const turnosRestantes = item.system.duracao_turnos - 1;

    if (turnosRestantes <= 0) {
      // Guarda o ID para deletar em lote depois do loop
      idsParaDeletar.push(item.id);
    } else {
      // Guarda os novos dados para atualizar em lote depois do loop
      itensParaAtualizar.push({
        _id: item.id,
        "system.duracao_turnos": turnosRestantes
      });
    }
  }

  // DISPAROS EM LOTE (Acelera a performance do banco de dados do Foundry)
  if (itensParaAtualizar.length > 0) {
    await actor.updateEmbeddedDocuments("Item", itensParaAtualizar);
  }

  if (idsParaDeletar.length > 0) {
    await actor.deleteEmbeddedDocuments("Item", idsParaDeletar);
    ui.notifications.info(`[FFRPG3E] Efeitos expirados foram removidos de ${actor.name}.`);
  }
});

//Criação de bibliotecas/copmpendium

Hooks.once("ready", async () => {
  if (!game.user.isGM) return;

  /*
  await criarPastaEInjetarItens("Raças Iniciais (FFRPG 3E)",RACAS_INICIAIS);
  await criarPastaEInjetarItens("Jobs Iniciais (FFRPG 3E)",JOBS_INICIAIS);
  */
});

async function criarPastaEInjetarItens(nomeDaPasta, listaDeDados, corHex = "#4a154b") {
  // Proteção simples: se a lista estiver vazia ou inválida, nem tenta rodar
  if (!listaDeDados || listaDeDados.length === 0) return;

  try {
    // 1. Procura se a pasta já existe no mundo
    let pasta = game.folders.find(f => f.name === nomeDaPasta && f.type === "Item");
    
    // 2. Se não existir, cria a pasta e injeta os itens
    if (!pasta) {
      pasta = await Folder.create({ name: nomeDaPasta, type: "Item", color: corHex });
      
      const dadosProntos = listaDeDados.map(item => ({ ...item, folder: pasta.id }));
      await Item.createDocuments(dadosProntos);
      
      console.log(`FFRPG3E | ${nomeDaPasta} injetado com sucesso!`);
    }
  } catch (error) {
    // Captura o erro, avisa no console exatamente onde quebrou, mas NÃO trava o resto do sistema
    console.error(`FFRPG3E | Erro crítico ao injetar o banco de dados de: "${nomeDaPasta}"`, error);
  }
}
