import {
  safeInt,
  normalizeName,
  formatDatePtBR,
  applyGilTax,
  safeArrayCopy,
  findItemByTypeAndName,
  getEffectDurationTurns,
  sortObjectByValue,
  safeArray
} from "../core/utils.js";

import { DropDispatcher } from "../core/drop-handler.js";
import { buildEffectContext } from "../core/context-builders.js";
import { INVENTORY_SLOT_TAG_MAP, OPCOES_DEFESAS_HP, OPCOES_PERCENTUAIS_CURA, opcoesTaxasGil, PROFICIENCY_BASIC_MAP } from "../core/constants.js";
import { applyEquipmentEffect, removeEquipmentEffect } from "../core/equipment-service.js";
import { MessageService } from "../core/message-service.js";

const { HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class PlayerSheet extends HandlebarsApplicationMixin(ActorSheetV2) {

  constructor(options = {}) {
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

    context.opcoesAtributos = sortObjectByValue({
      "": "Nenhum Atributo",
      "agilidade": "Agilidade",
      "magia": "Magia",
      "espirito": "Espírito"
    });

    context.opcoesPericias = sortObjectByValue({
      "": "Nenhuma Perícia",
      "alquimia": "Alquimia",
      "atuacao": "Atuação",
      "canto": "Canto",
      "danca": "Dança",
      "etiqueta": "Etiqueta",
      "invencao": "Invenção",
      "jogos": "Jogos",
      "labia": "Lábia"
    });

    context.enrichBackground = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.document.system.information.bgHistory || "",
      { secrets: this.document.isOwner, async: true }
    );

    const raceItem = this.document.items.find(i => i.type === "race");
    const jobItem = this.document.items.find(i => i.type === "job");

    context.raceItem = raceItem;
    context.jobItem = jobItem;
    context.raceName = raceItem?.name || "";
    context.jobName = jobItem?.name || "";

    context.statusEfeitos = this._buildEffectContext();
    const effectCategories = context.statusEfeitos;
    context.passiveBuffEffectList = effectCategories.passiveBuffEffectList || [];
    context.buffEffectList = effectCategories.buffEffectList || [];
    context.passiveDebuffEffectList = effectCategories.passiveDebuffEffectList || [];
    context.debuffEffectList = effectCategories.debuffEffectList || [];
    context.listaNiveis = this._buildLevelProgressionContext();

    context.proficiencyListData = PROFICIENCY_BASIC_MAP;

    const equipmentContext = this._buildEquipmentContext();
    Object.assign(context, equipmentContext);

    return context;
  }

  _configureEditors(options) {
    super._configureEditors(options);

    this.editors["bgHistory"] = {
      target: "system.information.bgHistory",
      button: false,
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
            if (resElemental) danoCalculado = Math.floor(danoCalculado * 0.5);
            if (protectShell) danoCalculado = Math.floor(danoCalculado * 0.5);
            if (guard) danoCalculado = Math.floor(danoCalculado * 0.5);

            switch (tipoDefesa) {
              case "arm":
                danoCalculado = Math.max(0, danoCalculado - armaduraFisica);
                break;
              case "arm_metade":
                danoCalculado = Math.max(0, danoCalculado - Math.floor(armaduraFisica / 2));
                break;
              case "armm":
                danoCalculado = Math.max(0, danoCalculado - armaduraMagica);
                break;
              case "armm_metade":
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

  //Aux para adiciona ao grupo corretamente
  addToGroup(item, itemGroups) {
    const slot = item.system?.slot;

    const grupoAlvo = INVENTORY_SLOT_TAG_MAP[slot] ?? "others";

    itemGroups[grupoAlvo].push(item);
  }

  processarSlotSimples(slotName, listaIndex, listaAlvo,equippedList) {
    const itens = equippedList.filter(item => item.system?.slot === slotName);
    if (itens.length > 0) {
      listaAlvo[listaIndex].item = itens[0];
      this.desequiparFatiados(itens, 1);
    }
  }

  // Pega os itens que passaram do limite e joga no inventário (itemGroups)
  desequiparFatiados(listaDeItens, limiteMaximo) {
    listaDeItens.slice(limiteMaximo).forEach(item => {
      item.system.equipped = false;
      this.addToGroup(item, itemGroups);
    });
  }

  _buildEquipmentContext() {

    const equippableTag = ["weapon", "armor"];

    const equippableItens = this.document.items.filter(item =>
      equippableTag.some(tag => safeArray(item.system?.tags).includes(tag))
    );

    const consumabelItens = this.document.items.filter(item =>
      !equippableTag.some(tag => safeArray(item.system?.tags).includes(tag))
    );


    const equippedList = [];

    const itemGroups = {
      weapons: [],
      shields: [],
      armors: [],
      accessories: [],
      keys: [],
      heals: [],
      combat: [],
      support: [],
      ammo: [],
      others: []
    }

    for (const item of equippableItens) {

      if (!item.system.equipped) {
        this.addToGroup(item, itemGroups);
        continue;
      }

      equippedList.push(item);
    }

    for (const item of consumabelItens) {

      if(safeArray(item.system?.tags).includes("key")){
        itemGroups.keys.push(item);
        continue;
      }

      if(safeArray(item.system?.tags).includes("heal")){
        itemGroups.heals.push(item);
        continue; 
      }

      if(safeArray(item.system?.tags).includes("support")){
        itemGroups.support.push(item);
        continue; 
      }

      if(safeArray(item.system?.tags).includes("combat")){
        itemGroups.combat.push(item);
        continue; 
      }

      if(safeArray(item.system?.tags).includes("ammo")){
        itemGroups.ammo.push(item);
        continue; 
      }

      this.addToGroup(item, itemGroups);

    }

    const listaSlots = [
      { slot: "main_hand", label: "Mão Principal", item: null },
      { slot: "offhand", label: "Mão Secundária", item: null },
      { slot: "helmet", label: "Capacete", item: null },
      { slot: "chestplate", label: "Armadura", item: null },
      { slot: "arms", label: "Braçadeiras", item: null },
      { slot: "accessory", label: "Acessório [1]", item: null },
      { slot: "accessory", label: "Acessório [2]", item: null }
    ];

    equippedList.sort((a, b) => a.system.slot.localeCompare(b.system.slot));

    const allWeapons = equippedList.filter(item => item.system?.slot === "weapon");
    const allShields = equippedList.filter(item => item.system?.slot === "shield");

    // Lógica de Armas e Shield
    if (allWeapons.length > 0) {
      listaSlots[0].item = allWeapons[0]; // Equipa Arma Principal

      if (allWeapons[0].system?.weapon?.twoHanded) {
        // Arma de 2 Mãos: Desequipa qualquer outra arma extra e todos os escudos
        this.desequiparFatiados(allWeapons, 1);
        this.desequiparFatiados(allShields, 0);
      } else {
        // Arma de 1 Mão:
        if (allWeapons.length > 1) {
          listaSlots[1].item = allWeapons[1]; // Segunda arma na Mão Secundária
          this.desequiparFatiados(allWeapons, 2); // Desequipa da 3ª em diante
          this.desequiparFatiados(allShields, 0); // Desequipa todos os escudos
        } else if (allShields.length > 0) {
          listaSlots[1].item = allShields[0]; // Escudo na Mão Secundária
          this.desequiparFatiados(allShields, 1); // Desequipa segundos escudos em diante
        }
      }
    } else if (allShields.length > 0) {
      // Sem armas: Coloca o primeiro escudo na mão secundária
      listaSlots[1].item = allShields[0];
      this.desequiparFatiados(allShields, 1);
    }

    //Processamento de outros slots
    this.processarSlotSimples("helmet", 2, listaSlots, equippedList);     // Capacete vai no índice 2
    this.processarSlotSimples("chestplate", 3, listaSlots, equippedList); // Peitoral vai no índice 3
    this.processarSlotSimples("arms", 4, listaSlots, equippedList);       // Braçadeiras vão no índice 4

    //Processamento dos slots
    const allAccessory = equippedList.filter(item => item.system?.slot === "accessory");
    if (allAccessory.length > 0) {
      listaSlots[5].item = allAccessory[0]; // Primeiro acessório
      if (allAccessory.length > 1) {
        listaSlots[6].item = allAccessory[1]; // Segundo acessório
      }
      this.desequiparFatiados(allAccessory, 2); // Desequipa do 3º em diante
    }

    this.slotsList = listaSlots;

    return {
      slotsList: listaSlots,
      weapons: itemGroups.weapons,
      shields: itemGroups.shields,
      armor: itemGroups.armors,
      accessories: itemGroups.accessories,
      keyItems:itemGroups.keys,
      healList: itemGroups.heals,
      combatList: itemGroups.combat,
      supportList: itemGroups.support,
      ammoList: itemGroups.ammo,
      othersList: itemGroups.others,
      gruposVazios: {
        heal: itemGroups.heals.length === 0,
        combat: itemGroups.combat.length === 0,
        support: itemGroups.support.length === 0,
        ammo: itemGroups.ammo.length === 0,
        weapons: itemGroups.weapons.length === 0,
        shields: itemGroups.shields.length === 0,
        armor: itemGroups.armors.length === 0,
        accessories: itemGroups.accessories.length === 0,
        keyItems: itemGroups.keys.length === 0,
        others: itemGroups.others.length === 0
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

  async _updateItemToActive(item){
    await item.update({ "system.equipped": true});
    await this.document.prepareData();
    await applyEquipmentEffect(this.document, item);
    await this.document.prepareData();
    await this.refreshItemDisplays(item);
    this.render();
  }
  
  async equiparItem(event, target) {
    const itemId = target.dataset.itemId;
    const item = this.document.items.get(itemId);

    if (!item) return;

    const title = "Slot Ocupado";
    const msg = "Você não pode equipar devido ao slot já está ocupado.";

    const slotItem = item.system.slot;

    if(slotItem == "weapon"){
      if(item.system.weapon.twoHanded == true){

        if(this.slotsList[0].item == null && this.slotsList[1].item==null){
          await this._updateItemToActive(item);
          return;
        }else{
          MessageService.showError(title,msg);
          return;
        }

      }else{
        if(this.slotsList[0].item == null || this.slotsList[1].item == null){
          await this._updateItemToActive(item);
          return;
        }
        MessageService.showError(title,msg);
        return;
      }
    }

    if(slotItem == "accessory"){
      if(this.slotsList[5].item == null || this.slotsList[6].item == null){
        await this._updateItemToActive(item);
        return;
      }
      MessageService.showError(title,msg);
      return;
    }

    if("helmet" == slotItem && this.slotsList[2].item == null){
      await this._updateItemToActive(item);
      return;
    }
    if("chestplate" == slotItem && this.slotsList[3].item == null){
      await this._updateItemToActive(item);
      return;
    }
    if("arms" == slotItem && this.slotsList[4].item == null){
      await this._updateItemToActive(item);
      return;
    }

    MessageService.showError(title,msg);

  }

  async desequiparItem(event, target) {

    const itemId = target.dataset.itemId;
    const item = this.document.items.get(itemId);
    if (!item) return;

    await removeEquipmentEffect(this.document, itemId);
    await item.update({ "system.equipped": false });
    await this.document.prepareData();
    await this.refreshItemDisplays(item);
    this.render();
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
    await MessageService.createEffectRemovedMessage(this.document, efeitoNoJogador.name);
  }

}

Hooks.once("init", async function () {
  await foundry.applications.handlebars.loadTemplates([
    "systems/ffrpg3e/templates/actor/tabs/atributos-sheet.hbs",
    "systems/ffrpg3e/templates/actor/tabs/extrato-sheet.hbs",
    "systems/ffrpg3e/templates/actor/tabs/proficiency.hbs",
    "systems/ffrpg3e/templates/actor/tabs/status-sheet.hbs",
    "systems/ffrpg3e/templates/actor/tabs/background-sheet.hbs",
    "systems/ffrpg3e/templates/generics/inventory-sheet.hbs",
  ]);
});
