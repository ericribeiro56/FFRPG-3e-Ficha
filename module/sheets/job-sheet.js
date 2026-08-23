const { HandlebarsApplicationMixin } = foundry.applications.api;

import { SKILL_JOB_TYPES } from "../core/constants.js";

export class JobSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {

  constructor(options = {}) {
    super(options);
    
    // Armazena em cache o índice da habilidade que está aberta no detalhar
    this.activeSkillIndex = 0;
    
    // Instancia o controlador nativo de abas mapeado para a section .sheet-body
    this.controladorAbas = new foundry.applications.ux.Tabs({
      navSelector: '.sheet-tabs[data-group="primary"]',
      contentSelector: '.sheet-body',
      initial: 'principal'
    });
  }

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["sheet", "item", "job-window"],
    position: {
      width: 940,
      height: 820
    },
    actions: {
      // Listeners macros do Job (Aba Principal)
      addProficiencyBonus: JobSheet._onAddProficiencyBonus,
      removeProficiencyBonus: JobSheet._onRemoveProficiencyBonus,
      addAllowedWeapon: JobSheet._onAddAllowedWeapon,
      removeAllowedWeapon: JobSheet._onRemoveAllowedWeapon,
      addJobTag: JobSheet._onAddJobTag,
      removeJobTag: JobSheet._onRemoveJobTag,
      addAllowedArmor: JobSheet._onAddAllowedArmor,
      removeAllowedArmor: JobSheet._onRemoveAllowedArmor,

      // Listeners de navegação e edição da Aba de Skills
      addNewJobSkill: JobSheet._onAddNewJobSkill,
      selectJobSkill: JobSheet._onSelectJobSkill,
      addValidatedFormula: JobSheet._onAddValidatedFormula,
      removeValidatedFormula: JobSheet._onRemoveValidatedFormula,
      addSkillTag: JobSheet._onAddSkillTag,
      removeSkillTag: JobSheet._onRemoveSkillTag,
      deleteJobSkill: JobSheet._onDeleteJobSkill,
      saveSkillTrayChanges: JobSheet._onSaveSkillTrayChanges,
      closeSkillTray: JobSheet._onCloseSkillTray
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: "systems/ffrpg3e/templates/job/job-sheet.hbs"
    }
  };
  /* ==========================================================================
   BLOCO 2 DE 4: js/job-sheet.js (Preparação do Contexto e Enriquecimento HTML)
   ========================================================================== */

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const itemData = this.item.toObject();

    // Injeta os dados brutos e estruturados do system na raiz do context para o HBS ler
    context.system = itemData.system || {};
    context.item = itemData;

    // Garante que os vetores essenciais existam no banco para evitar quebras do #each
    if (!context.system.proficiency) context.system.proficiency = { bonus: [] };
    if (!context.system.proficiency.bonus) context.system.proficiency.bonus = [];
    if (!context.system.mainWeapons) context.system.mainWeapons = [];
    if (!context.system.tags) context.system.tags = [];
    if (!context.system.allowedArmors) context.system.allowedArmors = [];
    if (!context.system.skills) context.system.skills = [];

    // Passa o índice ativo para o template gerenciar a classe .selected na sidebar
    context.activeSkillIndex = this.activeSkillIndex;

    // Resgata e expõe a habilidade atualmente selecionada no detalhar central
    context.currentSkill = context.system.skills[this.activeSkillIndex] || null;

    // Enriquecimento HTML NARRATIVO 1: Descrição e Notas Gerais da Vocação/Job (Aba 1)
    context.descricaoEnriquecida = await foundry.applications.ux.TextEditor.implementation.enrichHTML(context.system.description || "", {
      secrets: this.item.isOwner, rollData: this.item.getRollData(), relativeTo: this.item
    });
    context.notasEnriquecidas = await foundry.applications.ux.TextEditor.implementation.enrichHTML(context.system.notes || "", {
      secrets: this.item.isOwner, rollData: this.item.getRollData(), relativeTo: this.item
    });

    // Enriquecimento HTML NARRATIVO 2: Descrição e Notas OBRIGATÓRIAS da Skill Ativa (Aba 2)
    if (context.currentSkill) {
      context.currentSkillDescriptionEnriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(context.currentSkill.description || "", {
        secrets: this.item.isOwner, rollData: this.item.getRollData(), relativeTo: this.item
      });
      context.currentSkillNotesEnriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(context.currentSkill.notes || "", {
        secrets: this.item.isOwner, rollData: this.item.getRollData(), relativeTo: this.item
      });
    }

    // LISTAS DE OPÇÕES: Popula os seletores drop-down (<select>) do cabeçalho e quadrantes
    context.classList = [
      { value: "warrior", label: "Guerreiro (Warrior)" },
      { value: "mage", label: "Mago (Mage)" },
      { value: "thief", label: "Ladino (Thief)" }
    ];
    context.skillJobTypes = SKILL_JOB_TYPES;

    context.skillsFiltradas = (context.system.skills || [])
      .map((skill, index) => ({
        ...skill,
        index,
        typeLabel: SKILL_JOB_TYPES[skill.type] || skill.type
      }));

    context.selectedSkill = context.currentSkill ? {
      ...context.currentSkill,
      typeLabel: SKILL_JOB_TYPES[context.currentSkill.type] || context.currentSkill.type,
      descriptionEnriched: context.currentSkillDescriptionEnriched || "",
      notesEnriched: context.currentSkillNotesEnriched || ""
    } : null;

    context.proficiencyOptions = [
      { value: "Atk_Fisico", label: "Ataque Físico" },
      { value: "Atk_Magico", label: "Ataque Mágico" },
      { value: "Def_Fisica", label: "Defesa Física" },
      { value: "Def_Magica", label: "Defesa Mágica" }
    ];
    context.weaponOptions = [
      { value: "Espada de 2 Mãos", label: "Espada de 2 Mãos" },
      { value: "Adaga", label: "Adaga" },
      { value: "Cajado", label: "Cajado" },
      { value: "Arco Longo", label: "Arco Longo" }
    ];
    context.armorOptions = [
      { value: "Armadura Pesada", label: "Armadura Pesada" },
      { value: "Armadura Leve", label: "Armadura Leve" },
      { value: "Manto", label: "Manto" }
    ];

    return context;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    // Vincula fisicamente a escuta de cliques das abas à janela renderizada
    this.controladorAbas.bind(this.element);
  }
/* ==========================================================================
   BLOCO 3 DE 4: js/job-sheet.js (Rotinas de Banco dos Quadrantes da Aba 1)
   ========================================================================== */

  // --------------------------------------------------------------------------
  // LÓGICA DO QUADRANTE 1: BÔNUS DE PROFICIÊNCIA
  // --------------------------------------------------------------------------
  static async _onAddProficiencyBonus(event, target) {
    const key = this.form.querySelector(".add-prof-key").value;
    const value = parseInt(this.form.querySelector(".add-prof-value").value) || 0;
    const currentList = foundry.utils.deepClone(this.item.system.proficiency?.bonus || []);
    
    currentList.push({ key, value });
    await this.item.update({ "system.proficiency.bonus": currentList });
  }

  static async _onRemoveProficiencyBonus(event, target) {
    const index = parseInt(target.dataset.index);
    const currentList = foundry.utils.deepClone(this.item.system.proficiency?.bonus || []);
    
    currentList.splice(index, 1);
    await this.item.update({ "system.proficiency.bonus": currentList });
  }

  // --------------------------------------------------------------------------
  // LÓGICA DO QUADRANTE 2: ARMAS PERMITIDAS
  // --------------------------------------------------------------------------
  static async _onAddAllowedWeapon(event, target) {
    const weapon = this.form.querySelector(".add-weapon-select").value;
    const currentList = foundry.utils.deepClone(this.item.system.mainWeapons || []);
    
    if (!currentList.includes(weapon)) {
      currentList.push(weapon);
      await this.item.update({ "system.mainWeapons": currentList });
    }
  }

  static async _onRemoveAllowedWeapon(event, target) {
    const index = parseInt(target.dataset.index);
    const currentList = foundry.utils.deepClone(this.item.system.mainWeapons || []);
    
    currentList.splice(index, 1);
    await this.item.update({ "system.mainWeapons": currentList });
  }

  // --------------------------------------------------------------------------
  // LÓGICA DO QUADRANTE 3: TAGS DO JOB
  // --------------------------------------------------------------------------
  static async _onAddJobTag(event, target) {
    const input = this.form.querySelector(".add-job-tag-input");
    const tag = input.value.trim();
    const currentList = foundry.utils.deepClone(this.item.system.tags || []);
    
    if (tag && !currentList.includes(tag)) {
      currentList.push(tag);
      await this.item.update({ "system.tags": currentList });
      input.value = "";
    }
  }

  static async _onRemoveJobTag(event, target) {
    const index = parseInt(target.dataset.index);
    const currentList = foundry.utils.deepClone(this.item.system.tags || []);
    
    currentList.splice(index, 1);
    await this.item.update({ "system.tags": currentList });
  }

  // --------------------------------------------------------------------------
  // LÓGICA DO QUADRANTE 4: ARMADURAS PERMITIDAS
  // --------------------------------------------------------------------------
  static async _onAddAllowedArmor(event, target) {
    const armor = this.form.querySelector(".add-armor-select").value;
    const currentList = foundry.utils.deepClone(this.item.system.allowedArmors || []);
    
    if (!currentList.includes(armor)) {
      currentList.push(armor);
      await this.item.update({ "system.allowedArmors": currentList });
    }
  }

  static async _onRemoveAllowedArmor(event, target) {
    const index = parseInt(target.dataset.index);
    const currentList = foundry.utils.deepClone(this.item.system.allowedArmors || []);
    
    currentList.splice(index, 1);
    await this.item.update({ "system.allowedArmors": currentList });
  }
/* ==========================================================================
   BLOCO 4 DE 4: js/job-sheet.js (Rotinas Internas das Habilidades/Skills)
   ========================================================================== */

  // --------------------------------------------------------------------------
  // SISTEMA NATIVO MASTER-DETAIL: SELEÇÃO E CRIAÇÃO DE NOVA HABILIDADE
  // --------------------------------------------------------------------------
  static async _onAddNewJobSkill(event, target) {
    const currentSkills = foundry.utils.deepClone(this.item.system.skills || []);
    
    // Instancia uma estrutura padrão vazia e limpa para a nova Skill
    const newSkill = {
      name: "Nova Habilidade",
      minLevel: 1,
      type: "active",
      support: false,
      cost: { type: "nothing", material: "", value: 0 },
      combat: { type: "physical", formula: "", area: false, range: "", ally: false },
      tags: [],
      description: "",
      notes: ""
    };

    currentSkills.push(newSkill);
    
    // Salva no banco e força o foco visual a pular imediatamente para a skill recém-criada
    this.activeSkillIndex = currentSkills.length - 1;
    await this.item.update({ "system.skills": currentSkills });
    this.render();
  }

  static _onSelectJobSkill(event, target) {
    const item = target.closest('.sidebar-skill-item');
    if (!item) return;
    this.activeSkillIndex = parseInt(item.dataset.index);
    this.render();
  }

  // --------------------------------------------------------------------------
  // PARÂMETROS SUB-INTERNOS: VALIDADOR DE FÓRMULA DE COMBATE EM LINHA ÚNICA
  // --------------------------------------------------------------------------
  static async _onAddValidatedFormula(event, target) {
    const input = this.form.querySelector(".temp-combat-formula");
    const formula = input.value.trim();
    if (!formula) return;

    const skillIndex = parseInt(target.dataset.skillIndex);
    await this.item.update({ [`system.skills.${skillIndex}.combat.formula`]: formula });
    input.value = "";
  }

  static async _onRemoveValidatedFormula(event, target) {
    const skillIndex = parseInt(target.dataset.skillIndex);
    await this.item.update({ [`system.skills.${skillIndex}.combat.formula`]: "" });
  }

  // --------------------------------------------------------------------------
  // PARÂMETROS SUB-INTERNOS: ADICIONADOR DE CHIPS DE TAGS DA HABILIDADE
  // --------------------------------------------------------------------------
  static async _onAddSkillTag(event, target) {
    const input = this.form.querySelector(".add-skill-tag-input");
    const tag = input.value.trim();
    if (!tag) return;

    const skillIndex = parseInt(target.dataset.skillIndex);
    const currentTags = this.item.system.skills[skillIndex]?.tags || [];
    if (!currentTags.includes(tag)) {
      await this.item.update({ [`system.skills.${skillIndex}.tags`]: [...currentTags, tag] });
      input.value = "";
    }
  }

  static async _onRemoveSkillTag(event, target) {
    const skillIndex = parseInt(target.dataset.skillIndex);
    const tagIndex = parseInt(target.dataset.tagIndex);
    const currentTags = this.item.system.skills[skillIndex]?.tags || [];
    if (tagIndex >= 0 && tagIndex < currentTags.length) {
      currentTags.splice(tagIndex, 1);
      await this.item.update({ [`system.skills.${skillIndex}.tags`]: currentTags });
    }
  }

  static async _onDeleteJobSkill(event, target) {
    event.stopPropagation();
    const item = target.closest('.sidebar-skill-item');
    if (!item) return;
    const index = parseInt(item.dataset.index);
    const currentSkills = foundry.utils.deepClone(this.item.system.skills || []);
    if (index < 0 || index >= currentSkills.length) return;

    currentSkills.splice(index, 1);
    if (this.activeSkillIndex >= currentSkills.length) {
      this.activeSkillIndex = Math.max(0, currentSkills.length - 1);
    }
    await this.item.update({ "system.skills": currentSkills });
    this.render();
  }

  static async _onSaveSkillTrayChanges(event, target) {
    const skillIndex = this.activeSkillIndex;
    const skill = this.item.system.skills[skillIndex];
    if (!skill) return;

    const form = this.form;
    const q = (sel) => form.querySelector(sel);

    const support = !!q(`[name="system.skills.${skillIndex}.support"]`)?.checked;
    const area = !!q(`[name="system.skills.${skillIndex}.combat.area"]`)?.checked;
    const ally = !!q(`[name="system.skills.${skillIndex}.combat.ally"]`)?.checked;

    const name = q(`[name="system.skills.${skillIndex}.name"]`)?.value?.trim() || skill.name;
    const minLevel = parseInt(q(`[name="system.skills.${skillIndex}.minLevel"]`)?.value) || 0;
    const type = q(`[name="system.skills.${skillIndex}.type"]`)?.value || skill.type;
    const costType = q(`[name="system.skills.${skillIndex}.cost.type"]`)?.value || skill.cost.type;
    const costMaterial = q(`[name="system.skills.${skillIndex}.cost.material"]`)?.value || "";
    const costValue = parseInt(q(`[name="system.skills.${skillIndex}.cost.value"]`)?.value) || 0;
    const combatType = q(`[name="system.skills.${skillIndex}.combat.type"]`)?.value || skill.combat.type;
    const range = q(`[name="system.skills.${skillIndex}.combat.range"]`)?.value || "";

    const descriptionEl = document.getElementById(`skill-description-${skillIndex}`);
    const notesEl = document.getElementById(`skill-notes-${skillIndex}`);

    const getProseContent = (el) => {
      if (!el) return null;
      if (typeof el.getHTML === "function") return el.getHTML();
      const pm = el.querySelector?.(".ProseMirror");
      if (pm) return pm.innerHTML;
      return el.innerHTML || null;
    };

    const descHtml = getProseContent(descriptionEl);
    const notesHtml = getProseContent(notesEl);

    const hasRealText = (html) => {
      if (!html) return false;
      const text = html.replace(/<[^>]*>/g, '').trim();
      return text.length > 0;
    };

    const updateData = {
      [`system.skills.${skillIndex}.name`]: name,
      [`system.skills.${skillIndex}.minLevel`]: minLevel,
      [`system.skills.${skillIndex}.type`]: type,
      [`system.skills.${skillIndex}.support`]: support,
      [`system.skills.${skillIndex}.cost.type`]: costType,
      [`system.skills.${skillIndex}.cost.material`]: costMaterial,
      [`system.skills.${skillIndex}.cost.value`]: costValue,
      [`system.skills.${skillIndex}.combat.type`]: combatType,
      [`system.skills.${skillIndex}.combat.formula`]: skill.combat.formula || "",
      [`system.skills.${skillIndex}.combat.area`]: area,
      [`system.skills.${skillIndex}.combat.range`]: range,
      [`system.skills.${skillIndex}.combat.ally`]: ally,
      [`system.skills.${skillIndex}.tags`]: skill.tags || []
    };

    if (hasRealText(descHtml)) {
      updateData[`system.skills.${skillIndex}.description`] = descHtml;
    }
    if (hasRealText(notesHtml)) {
      updateData[`system.skills.${skillIndex}.notes`] = notesHtml;
    }

    await this.item.update(updateData);
    ui.notifications.info("Alterações da habilidade salvas.");
  }

  static _onCloseSkillTray(event, target) {
    this.activeSkillIndex = -1;
    this.render();
  }
}
