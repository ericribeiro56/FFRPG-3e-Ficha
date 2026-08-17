import {
  safeInt,
  normalizeName,
  formatDatePtBR,
  applyGilTax,
  safeArrayCopy,
  findItemByTypeAndName,
  getEffectDurationTurns
} from "../core/utils.js";

import { DropDispatcher } from "../core/drop-handler.js";
import { buildEffectContext } from "../core/context-builders.js";
import { OPCOES_DEFESAS_HP, OPCOES_PERCENTUAIS_CURA, opcoesTaxasGil } from "../core/constants.js";
import { determinarSlot, getSlotErrorMessage, applyEquipmentEffect, removeEquipmentEffect } from "../core/equipment-service.js";

const { HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class PlayerSheet extends HandlebarsApplicationMixin(ActorSheetV2) {

  constructor(options={}) {
    options.id = options.document ? `actor-sheet-${options.document.id}` : options.id;
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["ffrpg3e", "sheet", "actor"],
    tag: "form",
    window: {
      resizable: false,
      minimizable: true,
      width: 950,
      height: 850,
      title: "FFRPG 3E - Ficha do Jogador"
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      abrirGil: PlayerSheet.prototype.abrirGil,
      abrirCombateHP: PlayerSheet.prototype.abrirCombateHP,
      removerItemFicha: PlayerSheet.prototype.removerItemFicha,
      abrirSheetItem: PlayerSheet.prototype.abrirSheetItem,
      rolarAtributo: PlayerSheet.prototype.rolarAtributo,
      deletarStatusJogador: PlayerSheet.prototype.deletarStatusJogador,
      toggleGroup: PlayerSheet.prototype.toggleGroup,
      equiparItem: PlayerSheet.prototype.equiparItem,
      desequiparItem: PlayerSheet.prototype.desequiparItem
    }
  };

  static PARTS = {
    form: {
      template: "systems/ffrpg3e/templates/actor/actor-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.actor = this.document;
    context.system = this.document.system;

    // --- LISTAS PARA OS SEUS SELECTS DINÂMICOS ---
    context.opcoesAtributos = {
      "": "Nenhum Atributo",
      "agilidade": "Agilidade",
      "magia": "Magia",
      "espirito": "Espírito"
    };

    context.opcoesPericias = {
      "": "Nenhuma Perícia",
      "alquimia": "Alquimia",
      "atuacao": "Atuação",
      "canto": "Canto",
      "danca": "Dança",
      "etiqueta": "Etiqueta",
      "invencao": "Invenção",
      "jogos": "Jogos",
      "labia": "Lábia"
    };

    // --- ENRIQUECIMENTO OBRIGATÓRIO DO PROSEMIRROR (v14) ---
    // Transforma a string crua em HTML assíncrono interpretável pela AppV2
    context.enrichBackground = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.document.system.information.bgHistory || "",
      { secrets: this.document.isOwner, async: true }
    );
    // ------------------------------------------------------

    const raceItem = this.document.items.find(i => i.type === "race");
    const jobItem = this.document.items.find(i => i.type === "job");

    context.raceItem = raceItem;
    context.jobItem = jobItem;
    context.raceName = raceItem?.name || "";
    context.jobName = jobItem?.name || "";

    context.statusEfeitos = this._buildEffectContext();
    const effectCategories = context.statusEfeitos;
    context.statusEfeitosPassivos = effectCategories.permanentes || [];
    context.statusEfeitosBuffs = effectCategories.buffs || [];
    context.statusEfeitosCurses = effectCategories.permanentes || [];
    context.statusEfeitosDebuffs = effectCategories.debuffs || [];
    context.listaNiveis = this._buildLevelProgressionContext();

    const equipmentContext = this._buildEquipmentContext();
    Object.assign(context, equipmentContext);

    return context;
  }

  // Registra e configura editores ProseMirror na ApplicationV2 (v14)
  _configureEditors(options) {
    super._configureEditors(options);

    // Adiciona o seu editor no pipeline gerenciado da folha
    this.editors["bgHistory"] = {
      target: "system.information.bgHistory",
      button: false, // Mantém inline (sempre aberto para digitação)
      engine: "prosemirror",
      collaborative: false
    };
  }

  async _onRender(context, options) {
    super._onRender(context, options);

    this._bindTabs();
    this._bindImagePicker();
    this._restoreProfileImage();
  }

  _restoreProfileImage() {
    const img = this.element.querySelector(".profile-img");
    if (!img) return;
    const currentSrc = img.getAttribute("src");
    if (!currentSrc) return;
    if (!this._lastProfileImageSrc) {
      this._lastProfileImageSrc = currentSrc;
      return;
    }
    if (this._lastProfileImageSrc !== currentSrc) {
      img.src = this._lastProfileImageSrc;
      const newImg = new Image();
      newImg.src = currentSrc;
      newImg.onload = () => {
        img.src = currentSrc;
        this._lastProfileImageSrc = currentSrc;
      };
    }
  }

  _bindTabs() {
    if (!this.controladorAbas) {
      this.controladorAbas = new foundry.applications.ux.Tabs({
        navSelector: '.sheet-tabs',
        contentSelector: '.sheet-body',
        initial: 'atributos'
      });
    }
    this.controladorAbas.bind(this.element);
  }

 _abrirDialogGil(event, target) {
    const templateSource = `
<div class="dialog-base dialog-gil">
  
  <!-- Seção Vertical da Operação -->
  <div class="dialog-group-vertical">
    <span class="dialog-section-title">Tipo de Ação:</span>
    <div class="dialog-radio-stack">
      <label class="dialog-radio-row">
        <input type="radio" name="gil-operacao" value="adicionado" checked />
        <span>Adicionar</span>
      </label>
      <label class="dialog-radio-row">
        <input type="radio" name="gil-operacao" value="removido" />
        <span>Remover</span>
      </label>
    </div>
  </div>

  <!-- Linha Nivelada: Valor (Fluido) e Taxa (75px fixos) -->
  <div class="dialog-row-split">
    <div class="dialog-field-half">
      <label for="gil-quantidade">Valor:</label>
      <input type="number" id="gil-quantidade" value="0" min="1" />
    </div>
    
    <div class="dialog-field-tax">
      <label for="gil-taxes">Taxa:</label>
      <select id="gil-taxes">
        {{#each taxas}}
          <option value="{{this.value}}">{{this.label}}</option>
        {{/each}}
      </select>
    </div>
  </div>

  <!-- Campo de Descrição (Empilhado Verticalmente) -->
  <div class="dialog-group-vertical">
    <label for="gil-descricao" class="dialog-section-title">Descrição:</label>
    <input type="text" id="gil-descricao" placeholder="Opcional (Ex: Venda de Espada)" />
  </div>
</div>`;

    const templateCompilado = Handlebars.compile(templateSource);
    // opcoesTaxasGil deve vir do seu constants.js
    const htmlContent = templateCompilado({ taxas: opcoesTaxasGil });

    DialogV2.prompt({
      window: { 
        title: "Movimentação de Caixa (Gil)" 
      },
      position: {
        width: 320
      },
      content: htmlContent,
      ok: {
        label: "Confirmar",
        callback: async (ev, button) => {
          const dialog = button.form;
          const operacao = dialog.querySelector('input[name="gil-operacao"]:checked').value;
          const taxes = dialog.querySelector("#gil-taxes").value;
          const quantidade = Math.abs(safeInt(dialog.querySelector("#gil-quantidade").value, 0));
          const descricao = dialog.querySelector("#gil-descricao").value.trim();

          if (quantidade <= 0) return;

          let gilAtual = safeInt(this.document.system.current_gil, 0);
          let historicoAtual = safeArrayCopy(this.document.system.extract_gil);

          const gilTaxado = applyGilTax(quantidade, taxes);

          if (operacao === "adicionado") {
            gilAtual += gilTaxado;
          } else {
            gilAtual -= gilTaxado;
          }

          const novaTransacao = {
            acao: operacao,
            valor: gilTaxado,
            descricao: descricao || "",
            data: formatDatePtBR(),
            autor: game.user.name
          };

          historicoAtual.unshift(novaTransacao);

          const resultado = await this.document.update({
            "system.current_gil": gilAtual,
            "system.extract_gil": historicoAtual
          });
        }
      }
    });
  }

  _abrirCombateHP(event, target) {
    // 1. O TEMPLATE SOURCE: Envelopado em uma linha flex para travar o lado a lado horizontamente!
    const templateSource = `
<div class="dialog-base dialog-combate-split" style="display: flex; flex-direction: row; padding: 4px 0;">

  <!-- COLUNA DA ESQUERDA: CONFIGURAÇÕES DE CURA -->
  <div class="combate-coluna coluna-cura" style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
    <!-- Título Centralizado com Fundo -->
    <div class="popup-header-block header-cura">
      <span>Cura</span>
    </div>

    <div class="dialog-group-vertical" style="margin-top: 4px;">
      <label for="cura-quantidade">Valor:</label>
      <input type="number" id="cura-quantidade" value="0" min="0" style="height: 24px;" />
    </div>

    <div class="dialog-group-vertical">
      <span class="dialog-section-title">Porcentagem:</span>
      <div class="dialog-radio-inline" style="display: flex; flex-direction: row; gap: 10px; flex-wrap: wrap; margin-top: 4px;">
        {{#each percentuaisCura}}
          <label class="dialog-radio-row">
            <input type="radio" name="vida-pct-cura" value="{{this.value}}" {{#if this.checked}}checked{{/if}} />
            <span>{{this.label}}</span>
          </label>
        {{/each}}
      </div>
    </div>
  </div>

  <!-- DIVISOR VERTICAL DISCRETO -->
  <div style="width: 1px; background: #7a6b58; opacity: 0.3; align-self: stretch; margin: 0 4px;"></div>

  <!-- COLUNA DA DIREITA: CONFIGURAÇÕES DE DANO -->
  <div class="combate-coluna coluna-dano" style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
    <!-- Título Centralizado com Fundo -->
    <div class="popup-header-block header-dano">
      <span>Dano</span>
    </div>

    <!-- Linha Nivelada Horizontalmente: Valor e Defesa lado a lado -->
    <div class="dialog-row-split" style="display: flex; flex-direction: row; gap: 8px; margin-top: 4px;">
      <div style="flex: 1; display: flex; flex-direction: column;gap: 5px">
        <label for="dano-quantidade">Valor:</label>
        <input type="number" id="dano-quantidade" value="0" min="0" style="height: 24px;" />
      </div>
      
      <div style="flex: 1; display: flex; flex-direction: column;gap: 5px">
        <label for="dano-tipo-defesa">Defesa:</label>
        <select id="dano-tipo-defesa" style="height: 24px;">
          {{#each defesas}}
            <option value="{{this.value}}">{{this.label}}</option>
          {{/each}}
        </select>
      </div>
    </div>

    <div class="dialog-group-vertical" style="margin-top: 4px;">
      <span class="dialog-section-title">Resistências Ativas:</span>
      <div class="dialog-checkbox-stack" style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
        <label class="dialog-checkbox-row" style="display: flex; align-items: center; gap: 4px;">
          <input type="checkbox" id="dano-res-elemental" />
          <span>Resistência Elemental</span>
        </label>
        <label class="dialog-checkbox-row" style="display: flex; align-items: center; gap: 4px;">
          <input type="checkbox" id="dano-fraq-elemental" />
          <span>Fraqueza Elemental</span>
        </label>
        <label class="dialog-checkbox-row" style="display: flex; align-items: center; gap: 4px;">
          <input type="checkbox" id="dano-protect-shell" />
          <span>Protect / Shell</span>
        </label>
        <label class="dialog-checkbox-row" style="display: flex; align-items: center; gap: 4px;">
          <input type="checkbox" id="dano-guard" />
          <span>Guard</span>
        </label>
      </div>
    </div>
  </div>

</div>`;

    const templateCompilado = Handlebars.compile(templateSource);
    const htmlContent = templateCompilado({ 
      defesas: OPCOES_DEFESAS_HP, 
      percentuaisCura: OPCOES_PERCENTUAIS_CURA 
    });

    // 2. CONSTRUTOR NATIVO DO DIALOGV2 (Totalmente fluido, leve e móvel)
    const dialogHP = new foundry.applications.api.DialogV2({
      window: { 
        title: "" 
      },
      position: {
        width: 460 // Largura reduzida e compactada
      },
      content: htmlContent,
      buttons: [
        {
          action: "cura",
          label: "❤️ Aplicar Cura",
          callback: async (ev, button) => {
            const form = button.form;
            const actor = this.document;

            const quantidade = Math.abs(safeInt(form.querySelector("#cura-quantidade").value, 0));
            if (quantidade <= 0) return;

            let hpAtual = safeInt(actor.system.hp.atual, 0);
            let hpMax = safeInt(actor.system.hp.total, 10);

            const multiplicadorCura = parseFloat(form.querySelector('input[name="vida-pct-cura"]:checked').value);
            const curaCalculada = Math.floor(quantidade * multiplicadorCura);
            const novoHp = Math.min(hpMax, hpAtual + curaCalculada);

            await actor.update({ "system.hp.atual": novoHp });
            ui.notifications.info(`FFRPG 3E | ${actor.name} foi curado em ${curaCalculada} de HP.`);
          }
        },
        {
          action: "dano",
          label: "⚔️ Aplicar Dano",
          callback: async (ev, button) => {
            const form = button.form;
            const actor = this.document;

            const quantidade = Math.abs(safeInt(form.querySelector("#dano-quantidade").value, 0));
            if (quantidade <= 0) return;

            let hpAtual = safeInt(actor.system.hp.atual, 0);
            const tipoDefesa = form.querySelector("#dano-tipo-defesa").value;
            const resElemental = form.querySelector("#dano-res-elemental").checked;
            const fraqElemental = form.querySelector("#dano-fraq-elemental").checked;
            const protectShell = form.querySelector("#dano-protect-shell").checked;
            const guard = form.querySelector("#dano-guard").checked;

            const armaduraFisica = safeInt(actor.system.combate?.armadura?.total, 0);
            const armaduraMagica = safeInt(actor.system.combate?.armadura_magica?.total, 0);

            let danoCalculado = quantidade;

            if (fraqElemental) danoCalculado = Math.floor(danoCalculado * 1.5);
            if (resElemental)  danoCalculado = Math.floor(danoCalculado * 0.5);
            if (protectShell)  danoCalculado = Math.floor(danoCalculado * 0.5);
            if (guard)         danoCalculado = Math.floor(danoCalculado * 0.5);

            switch (tipoDefesa){
              case "arm" :         
                          danoCalculado = Math.max(0, danoCalculado - armaduraFisica); 
                          break;
              case "arm_metade" :
                          danoCalculado = Math.max(0, danoCalculado - Math.floor(armaduraFisica / 2));
                          break;
              case "armm" :
                          danoCalculado = Math.max(0, danoCalculado - armaduraMagica);
                          break;
              case "armm_metade" :
                          danoCalculado = Math.max(0, danoCalculado - Math.floor(armaduraMagica / 2));
                          break;
              default: 
                          break;
            }

            const novoHp = Math.max(0, hpAtual - danoCalculado);

            await actor.update({ "system.hp.atual": novoHp });
            ui.notifications.warn(`FFRPG 3E | ${actor.name} sofreu ${danoCalculado} de dano.`);
          }
        }
      ]
    });

    dialogHP.render(true);
  }

  async _onDropItem(event, data) {
    const itemOriginal = await Item.fromDropData(data);
    if (!itemOriginal) return super._onDropItem(event, data);

    await DropDispatcher.dispatch(this.document, itemOriginal, event, data);
  }

  _buildEffectContext() {
    const categories = buildEffectContext(this.document);
    return categories;
  }

  _buildLevelProgressionContext() {
    const listaNiveis = [];

    for (let i = 1; i <= 99; i++) {
      const chave = `nv${i}`;
      const dadosNivel = this.document.system.progressao_niveis?.[chave] || { dhp: 0, vit: 0, dmp: 0, esp: 0 };

      listaNiveis.push({
        id: chave,
        label: `Nv${i}`,
        dhp: safeInt(dadosNivel.dhp, 0),
        vit: safeInt(dadosNivel.vit, 0),
        dmp: safeInt(dadosNivel.dmp, 0),
        esp: safeInt(dadosNivel.esp, 0)
      });
    }

    return listaNiveis;
  }

  _buildEquipmentContext() {
    const gearTypes = ["gear_weapon", "gear_armor", "gear_consumable"];
    const gearItems = this.document.items.filter(i => gearTypes.includes(i.type));
    const equipados = gearItems.filter(i => i.system?.equipped);
    const naoEquipados = gearItems.filter(i => !i.system?.equipped);

    const slotsList = [
      { slot: "main_hand", label: "Mão Principal", item: equipados.find(i => i.system?.slot === "main_hand") },
      { slot: "offhand", label: "OffHand", item: equipados.find(i => i.system?.slot === "offhand") },
      { slot: "helmet", label: "Capacete", item: equipados.find(i => i.system?.slot === "helmet") },
      { slot: "chestplate", label: "Peito", item: equipados.find(i => i.system?.slot === "chestplate") },
      { slot: "arms", label: "Braços", item: equipados.find(i => i.system?.slot === "arms") },
      { slot: "accessory_1", label: "Acessório [1]", item: equipados.find(i => i.system?.slot === "accessory_1") },
      { slot: "accessory_2", label: "Acessório [2]", item: equipados.find(i => i.system?.slot === "accessory_2") }
    ];

    const weapons = naoEquipados.filter(i => i.system?.slot === "main_hand" || i.system?.slot === "offhand");
    const shields = naoEquipados.filter(i => i.system?.slot === "shield");
    const accessories = naoEquipados.filter(i => i.system?.slot === "accessory" || i.system?.slot === "accessory_1" || i.system?.slot === "accessory_2");
    const armors = naoEquipados.filter(i => !i.system?.slot || i.system?.slot === "helmet" || i.system?.slot === "chestplate" || i.system?.slot === "arms");

    const keyItems = this.document.items.filter(i => (i.system?.tags || []).some(t => t === "keyItem"));

    const consumables = naoEquipados.filter(i => i.type === "gear_consumable");

    const prioridadeTags = ["cura", "batalha", "suporte", "municao"];
    const categories = { cura: [], combatItem: [], supportItem: [], ammo: [], others: [] };

    for (const item of consumables) {
      const tags = item.system?.tags || [];
      const tagEncontrada = prioridadeTags.find(p => tags.includes(p));

      if (!tagEncontrada) {
        categories.others.push(item);
      } else {
        categories[tagEncontrada === "batalha" ? "combatItem" : tagEncontrada].push(item);
      }
    }

    const healList = categories.cura;
    const combatList = categories.combatItem;
    const supportList = categories.supportItem;
    const ammoList = categories.ammo;
    const othersList = categories.others;

    return {
      slotsList,
      weapons,
      shields,
      armor: armors,
      accessories,
      keyItems,
      healList,
      combatList,
      supportList,
      ammoList,
      othersList,
      consumables,
      gruposVazios: {
        heal: healList.length === 0,
        combat: combatList.length === 0,
        support: supportList.length === 0,
        ammo: ammoList.length === 0,
        weapons: weapons.length === 0,
        shields: shields.length === 0,
        armor: armors.length === 0,
        accessories: accessories.length === 0,
        keyItems: keyItems.length === 0,
        others: othersList.length === 0
      }
    };
  }

  _findEffectsItemByName(name) {
    return findItemByTypeAndName(this.document.items, "effects", name);
  }

  _bindImagePicker() {
    const img = this.element.querySelector(".profile-img");
    if (img && !img.dataset.hasListener) {
      img.dataset.hasListener = "true";
      img.addEventListener("click", (event) => {
        event.preventDefault();
        const fp = new foundry.applications.apps.FilePicker.implementation({
          type: "image",
          current: this.document.img,
          callback: async (path) => { await this.document.update({ img: path }); }
        });
        fp.browse();
      });
    }
  }

  abrirGil(event, target) {
    this._abrirDialogGil();
  }
  abrirCombateHP(event, target) {
    this._abrirCombateHP();
  }

  async removerItemFicha(event, target) {
    if (!this.document.isOwner && !game.user.isGM) {
      ui.notifications.warn("Sem permissão para remover itens.");
      return;
    }
    let itemId = target.dataset.itemId;
    let item = this.document.items.get(itemId);

    if (!item && target.dataset.tipo) {
      item = this.document.items.find(i => i.type === target.dataset.tipo);
    }

    if (!item) return;

    const confirmar = await DialogV2.confirm({
      window: { title: "Remover Item", classes: ["ffrpg3e-dialog-confirm"] },
      content: `<p style="margin:0;font-size:13px;">Deseja realmente remover <strong>${item.name}</strong>?</p>`,
      yes: { label: "Remover", default: true },
      no: { label: "Cancelar" }
    });

    if (!confirmar) return;
    await item.delete();
  }

  async toggleGroup(event, target) {
    const targetId = target.dataset.target;
    if (!targetId) return;

    const container = target.closest(`[data-grupo="${targetId}"]`);
    if (!container) return;

    container.classList.toggle("is-collapsed");
  }

  async refreshItemDisplays(item) {
    if (!item?.system) return;
    await item.update({
      "system.displayName": item.system.fullDisplayName,
      "system.combatDisplay": item.system.computeInfoDisplay || "",
      "system.abilityDisplay": item.system.computeAbilityDisplay || ""
    }, { render: false });
  }

  async equiparItem(event, target) {
    const itemId = target.dataset.itemId;
    const item = this.document.items.get(itemId);
    if (!item) return;

    const slot = determinarSlot(item, this.document);
    if (!slot) {
      ui.notifications.warn(getSlotErrorMessage(item));
      return;
    }

    if (slot === "offhand") {
      const twoHandedMain = this.document.items.find(i => i.system?.equipped && i.system?.slot === "main_hand" && i.type === "gear_weapon" && i.system?.twoHanded && i.id !== item.id);
      if (twoHandedMain) {
        ui.notifications.warn(`Não é possível equipar uma arma na OffHand enquanto ${twoHandedMain.name} (arma de duas mãos) estiver equipada.`);
        return;
      }
    }

    const isTwoHanded = item.type === "gear_weapon" && item.system?.twoHanded;
    const slotsParaVerificar = isTwoHanded ? ["main_hand", "offhand"] : [slot];

    const conflitos = [];
    for (const s of slotsParaVerificar) {
      const equippedNoSlot = this.document.items.find(i => i.system?.equipped && i.system?.slot === s && i.id !== item.id);
      if (equippedNoSlot) conflitos.push(equippedNoSlot);
    }

    if (conflitos.length > 0) {
      const nomes = conflitos.map(i => i.name).join(", ");
      const slotsTexto = slotsParaVerificar.join(" e ");
      const confirmar = await DialogV2.confirm({
        window: { title: "Slots Ocupados", classes: ["ffrpg3e-dialog-confirm"] },
        content: `<p style="margin:0;font-size:13px;">Os slots <strong>${slotsTexto}</strong> estão ocupados por <strong>${nomes}</strong>. Deseja substituir?</p>`,
        yes: { label: "Substituir", default: true },
        no: { label: "Cancelar" }
      });
      if (!confirmar) return;

      const itensDesequippeds = conflitos.map(c => ({ item: c, slotAnterior: c.system.slot }));
      for (const conflito of conflitos) {
        await conflito.update({ "system.equipped": false }, { render: false });
      }

      try {
        await applyEquipmentEffect(this.document, item);
        await item.update({ "system.equipped": true, "system.slot": slot });
      } catch (erro) {
        console.error("[FFRPG3E][ROLLBACK] Falha ao equipar, restaurando itens...", erro);
        for (const dado of itensDesequippeds) {
          await dado.item.update({ "system.equipped": true, "system.slot": dado.slotAnterior || "" }, { render: false });
        }
        ui.notifications.warn("Falha ao equipar item. O estado foi restaurado.");
        return;
      }
      await this.refreshItemDisplays(item);
    } else {
      try {
        await applyEquipmentEffect(this.document, item);
        await item.update({ "system.equipped": true, "system.slot": slot });
      } catch (erro) {
        ui.notifications.warn("Falha ao equipar item.");
        return;
      }
      await this.refreshItemDisplays(item);
    }
  }

  async desequiparItem(event, target) {
    if (!this.document.isOwner && !game.user.isGM) {
      ui.notifications.warn("Sem permissão para desequipar itens.");
      return;
    }
    const itemId = target.dataset.itemId;
    const item = this.document.items.get(itemId);
    if (!item) return;

    const estadoAnterior = {
      equipped: item.system.equipped,
      slot: item.system.slot
    };

    try {
      const removido = await removeEquipmentEffect(this.document, itemId);
      await item.update({ "system.equipped": false });
      await this.refreshItemDisplays(item);
    } catch (erro) {
      console.error("[FFRPG3E][ROLLBACK] Falha ao desequipar, restaurar estado...", erro);
      try {
        await applyEquipmentEffect(this.document, item);
      } catch (rollbackErro) {
        console.error("[FFRPG3E][ROLLBACK] Falha ao restaurar bônus...", rollbackErro);
      }
      await item.update({ "system.equipped": estadoAnterior.equipped, "system.slot": estadoAnterior.slot || "" }, { render: false });
      ui.notifications.warn("Falha ao desequipar item. O estado foi restaurado.");
    }
  }

  async abrirSheetItem(event, target) {
    const idAlvo = target.dataset.itemId;
    let itemLocalizado = null;

    itemLocalizado = this.document.items.get(idAlvo);

    if (!itemLocalizado) {
      for (let item of this.document.items) {
        if (item.effects && item.effects.has(idAlvo)) {
          itemLocalizado = item;
          break;
        }
      }
    }

    if (!itemLocalizado && this.document.effects) {
      const efeitoPuro = this.document.effects.get(idAlvo) || this.document.appliedEffects?.find(ef => ef.id === idAlvo);
      if (efeitoPuro) {
        if (efeitoPuro.sheet.options?.form) efeitoPuro.sheet.options.form.editable = false;
        else efeitoPuro.sheet.options.editable = false;
        return await efeitoPuro.sheet.render(true, { focus: true });
      }
    }

    if (itemLocalizado) {
      if (itemLocalizado.sheet.options?.form) {
        itemLocalizado.sheet.options.form.editable = false;
      } else {
        itemLocalizado.sheet.options.editable = false;
      }

      return await itemLocalizado.sheet.render(true, { 
        document: itemLocalizado,
        focus: true 
      });
    }
  }

  async rolarAtributo(event, target) {
    const nomeAtributo = target.dataset.atributo;
    const valorTeste = target.dataset.teste;
    if (!nomeAtributo || !valorTeste) return;

    const rollFormula = `${valorTeste}-d100`;
    const roll = await new Roll(rollFormula).evaluate();

    await roll.toMessage({
      flavor: `Teste de ${nomeAtributo}`,
      speaker: ChatMessage.getSpeaker({ actor: this.document })
    });
  }

  async deletarStatusJogador(event, target) {
    if (!this.document.isOwner && !game.user.isGM) {
      ui.notifications.warn("Sem permissão para remover efeitos.");
      return;
    }
    const efeitoId = target.dataset.itemId;
    
    // Na V2, os efeitos aplicados ficam no document do Actor
    const efeitoNoJogador = this.document.appliedEffects.find(ef => ef.id === efeitoId);
    if (!efeitoNoJogador) return;

    const confirmarExclusao = await DialogV2.confirm({
      window: { title: "Remover Efeito", classes: ["ffrpg3e-dialog-confirm"] },
      content: `<p style="margin:0;font-size:13px;">Deseja realmente remover o status <strong>${efeitoNoJogador.name}</strong>?</p>`,
      yes: { label: "Remover", default: true },
      no: { label: "Cancelar" }
    });

    if (!confirmarExclusao) return;

    const itemAplicador = this._findEffectsItemByName(efeitoNoJogador.name);
    if (itemAplicador) {
      await itemAplicador.delete();
      return;
    }
    await efeitoNoJogador.delete();
  }

}

Hooks.once("init", async function () {
  await foundry.applications.handlebars.loadTemplates([
    "systems/ffrpg3e/templates/actor/tabs/atributos-sheet.hbs",
    "systems/ffrpg3e/templates/actor/tabs/extrato-sheet.hbs",
    "systems/ffrpg3e/templates/actor/tabs/status-sheet.hbs",
    "systems/ffrpg3e/templates/actor/tabs/background-sheet.hbs",
    "systems/ffrpg3e/templates/generics/inventory-sheet.hbs",
  ]);
});
