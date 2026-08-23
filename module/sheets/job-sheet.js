const { HandlebarsApplicationMixin } = foundry.applications.api;

import { SKILL_JOB_TYPES } from "../core/constants.js";

export class JobSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {

  constructor(options = {}) {
    super(options);
    
    console.log("[JobSheet] constructor iniciado");
    
    this.activeSkillIndex = 0;
    this.tempSkill = null;
    
    this.controladorAbas = new foundry.applications.ux.Tabs({
      navSelector: '.sheet-tabs[data-group="primary"]',
      contentSelector: '.sheet-body',
      initial: 'principal'
    });
    
    console.log("[JobSheet] constructor finalizado", {
      activeSkillIndex: this.activeSkillIndex,
      tempSkill: this.tempSkill
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
      addProficiencyBonus: JobSheet._onAddProficiencyBonus,
      removeProficiencyBonus: JobSheet._onRemoveProficiencyBonus,
      addAllowedWeapon: JobSheet._onAddAllowedWeapon,
      removeAllowedWeapon: JobSheet._onRemoveAllowedWeapon,
      addJobTag: JobSheet._onAddJobTag,
      removeJobTag: JobSheet._onRemoveJobTag,
      addAllowedArmor: JobSheet._onAddAllowedArmor,
      removeAllowedArmor: JobSheet._onRemoveAllowedArmor,
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

  /** @override */
  async _prepareContext(options) {
    console.log("[JobSheet] _prepareContext iniciado", { activeSkillIndex: this.activeSkillIndex, tempSkill: this.tempSkill });
    
    const context = await super._prepareContext(options);
    const itemData = this.item.toObject();

    context.system = itemData.system || {};
    context.item = itemData;

    if (!context.system.proficiency) context.system.proficiency = { bonus: [] };
    if (!context.system.proficiency.bonus) context.system.proficiency.bonus = [];
    if (!context.system.mainWeapons) context.system.mainWeapons = [];
    if (!context.system.tags) context.system.tags = [];
    if (!context.system.allowedArmors) context.system.allowedArmors = [];
    if (!context.system.skills) context.system.skills = [];

    context.activeSkillIndex = this.activeSkillIndex;

    const safeIndex = Math.max(0, Math.min(this.activeSkillIndex, (context.system.skills || []).length - 1));
    context.tempSkill = this.tempSkill !== null ? this.tempSkill : null;
    console.log("[JobSheet] _prepareContext tempSkill definido", { safeIndex, tempSkill: context.tempSkill });

    context.descricaoEnriquecida = await foundry.applications.ux.TextEditor.implementation.enrichHTML(context.system.description || "", {
      secrets: this.item.isOwner, rollData: this.item.getRollData(), relativeTo: this.item
    });
    context.notasEnriquecidas = await foundry.applications.ux.TextEditor.implementation.enrichHTML(context.system.notes || "", {
      secrets: this.item.isOwner, rollData: this.item.getRollData(), relativeTo: this.item
    });

    const skillSource = context.tempSkill;
    if (skillSource) {
      context.tempSkillDescriptionEnriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(skillSource.description || "", {
        secrets: this.item.isOwner, rollData: this.item.getRollData(), relativeTo: this.item
      });
      context.tempSkillNotesEnriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(skillSource.notes || "", {
        secrets: this.item.isOwner, rollData: this.item.getRollData(), relativeTo: this.item
      });
    }

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

    context.selectedSkill = context.tempSkill ? {
      ...context.tempSkill,
      typeLabel: SKILL_JOB_TYPES[context.tempSkill.type] || context.tempSkill.type,
      descriptionEnriched: context.tempSkillDescriptionEnriched || "",
      notesEnriched: context.tempSkillNotesEnriched || ""
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

    console.log("[JobSheet] _prepareContext finalizado", {
      skillsCount: context.system.skills?.length,
      activeSkillIndex: context.activeSkillIndex,
      hasTempSkill: !!context.tempSkill,
      hasSelectedSkill: !!context.selectedSkill
    });
    
    return context;
  }

  /** @override */
  _onRender(context, options) {
    console.log("[JobSheet] _onRender iniciado", { activeSkillIndex: this.activeSkillIndex, tempSkill: this.tempSkill });
    super._onRender(context, options);
    this.controladorAbas.bind(this.element);
    console.log("[JobSheet] _onRender finalizado");
  }

  static async _onAddProficiencyBonus(event, target) {
    console.log("[JobSheet] _onAddProficiencyBonus iniciado");
    const key = this.form.querySelector(".add-prof-key").value;
    const value = parseInt(this.form.querySelector(".add-prof-value").value, 10) || 0;
    const currentList = foundry.utils.deepClone(this.item.system.proficiency?.bonus || []);
    
    currentList.push({ key, value });
    await this.item.update({ "system.proficiency.bonus": currentList });
    console.log("[JobSheet] _onAddProficiencyBonus finalizado", { key, value, newLength: currentList.length });
  }

  static async _onRemoveProficiencyBonus(event, target) {
    console.log("[JobSheet] _onRemoveProficiencyBonus iniciado");
    const index = parseInt(target.dataset.index, 10);
    const currentList = foundry.utils.deepClone(this.item.system.proficiency?.bonus || []);
    
    currentList.splice(index, 1);
    await this.item.update({ "system.proficiency.bonus": currentList });
    console.log("[JobSheet] _onRemoveProficiencyBonus finalizado", { index, newLength: currentList.length });
  }

  static async _onAddAllowedWeapon(event, target) {
    console.log("[JobSheet] _onAddAllowedWeapon iniciado");
    const weapon = this.form.querySelector(".add-weapon-select").value;
    const currentList = foundry.utils.deepClone(this.item.system.mainWeapons || []);
    
    if (!currentList.includes(weapon)) {
      currentList.push(weapon);
      await this.item.update({ "system.mainWeapons": currentList });
      console.log("[JobSheet] _onAddAllowedWeapon finalizado", { weapon, newLength: currentList.length });
    } else {
      console.log("[JobSheet] _onAddAllowedWeapon cancelado (já existe)", { weapon });
    }
  }

  static async _onRemoveAllowedWeapon(event, target) {
    console.log("[JobSheet] _onRemoveAllowedWeapon iniciado");
    const index = parseInt(target.dataset.index, 10);
    const currentList = foundry.utils.deepClone(this.item.system.mainWeapons || []);
    
    currentList.splice(index, 1);
    await this.item.update({ "system.mainWeapons": currentList });
    console.log("[JobSheet] _onRemoveAllowedWeapon finalizado", { index, newLength: currentList.length });
  }

  static async _onAddJobTag(event, target) {
    console.log("[JobSheet] _onAddJobTag iniciado");
    const input = this.form.querySelector(".add-job-tag-input");
    const tag = input.value.trim();
    const currentList = foundry.utils.deepClone(this.item.system.tags || []);
    
    if (tag && !currentList.includes(tag)) {
      currentList.push(tag);
      await this.item.update({ "system.tags": currentList });
      input.value = "";
      console.log("[JobSheet] _onAddJobTag finalizado", { tag, newLength: currentList.length });
    } else {
      console.log("[JobSheet] _onAddJobTag cancelado", { tag, exists: currentList.includes(tag) });
    }
  }

  static async _onRemoveJobTag(event, target) {
    console.log("[JobSheet] _onRemoveJobTag iniciado");
    const index = parseInt(target.dataset.index, 10);
    const currentList = foundry.utils.deepClone(this.item.system.tags || []);
    
    currentList.splice(index, 1);
    await this.item.update({ "system.tags": currentList });
    console.log("[JobSheet] _onRemoveJobTag finalizado", { index, newLength: currentList.length });
  }

  static async _onAddAllowedArmor(event, target) {
    console.log("[JobSheet] _onAddAllowedArmor iniciado");
    const armor = this.form.querySelector(".add-armor-select").value;
    const currentList = foundry.utils.deepClone(this.item.system.allowedArmors || []);
    
    if (!currentList.includes(armor)) {
      currentList.push(armor);
      await this.item.update({ "system.allowedArmors": currentList });
      console.log("[JobSheet] _onAddAllowedArmor finalizado", { armor, newLength: currentList.length });
    } else {
      console.log("[JobSheet] _onAddAllowedArmor cancelado (já existe)", { armor });
    }
  }

  static async _onRemoveAllowedArmor(event, target) {
    console.log("[JobSheet] _onRemoveAllowedArmor iniciado");
    const index = parseInt(target.dataset.index, 10);
    const currentList = foundry.utils.deepClone(this.item.system.allowedArmors || []);
    
    currentList.splice(index, 1);
    await this.item.update({ "system.allowedArmors": currentList });
    console.log("[JobSheet] _onRemoveAllowedArmor finalizado", { index, newLength: currentList.length });
  }

  static async _onAddNewJobSkill(event, target) {
    console.log("[JobSheet] _onAddNewJobSkill iniciado");
    const currentSkills = foundry.utils.deepClone(this.item.system.skills || []);
    
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
    
    this.activeSkillIndex = currentSkills.length - 1;
    await this.item.update({ "system.skills": currentSkills });
    this.render();
    console.log("[JobSheet] _onAddNewJobSkill finalizado", { newIndex: this.activeSkillIndex, totalSkills: currentSkills.length });
  }

  static _onSelectJobSkill(event, target) {
    console.log("[JobSheet] _onSelectJobSkill iniciado");
    const item = target.closest('.sidebar-skill-item');
    if (!item) {
      console.log("[JobSheet] _onSelectJobSkill cancelado (item não encontrado)");
      return;
    }
    const index = parseInt(item.dataset.index, 10);
    this.activeSkillIndex = index;
    const skill = this.item.system.skills[this.activeSkillIndex];
    if (skill) {
      this.tempSkill = foundry.utils.deepClone(skill.toObject ? skill.toObject() : skill);
      console.log("[JobSheet] _onSelectJobSkill tempSkill clonado", { index, skillName: this.tempSkill.name });
    } else {
      console.log("[JobSheet] _onSelectJobSkill cancelado (skill não encontrada no índice)", { index });
      this.tempSkill = null;
    }
    this.render();
    console.log("[JobSheet] _onSelectJobSkill finalizado", { index, hasTempSkill: !!this.tempSkill });
  }

  static async _onAddValidatedFormula(event, target) {
    console.log("[JobSheet] _onAddValidatedFormula iniciado", { hasTempSkill: !!this.tempSkill });
    const input = this.form.querySelector(".temp-combat-formula");
    const formula = input.value.trim();
    if (!formula || !this.tempSkill) {
      console.log("[JobSheet] _onAddValidatedFormula cancelado", { hasFormula: !!formula, hasTempSkill: !!this.tempSkill });
      return;
    }

    this.tempSkill.combat = this.tempSkill.combat || {};
    this.tempSkill.combat.formula = formula;
    input.value = "";
    this.render();
    console.log("[JobSheet] _onAddValidatedFormula finalizado", { formula });
  }

  static async _onRemoveValidatedFormula(event, target) {
    console.log("[JobSheet] _onRemoveValidatedFormula iniciado", { hasTempSkill: !!this.tempSkill });
    if (!this.tempSkill) {
      console.log("[JobSheet] _onRemoveValidatedFormula cancelado (sem tempSkill)");
      return;
    }

    this.tempSkill.combat = this.tempSkill.combat || {};
    this.tempSkill.combat.formula = "";
    this.render();
    console.log("[JobSheet] _onRemoveValidatedFormula finalizado");
  }

  static async _onAddSkillTag(event, target) {
    console.log("[JobSheet] _onAddSkillTag iniciado", { hasTempSkill: !!this.tempSkill });
    const input = this.form.querySelector(".add-skill-tag-input");
    const tag = input.value.trim();
    if (!tag || !this.tempSkill) {
      console.log("[JobSheet] _onAddSkillTag cancelado", { hasTag: !!tag, hasTempSkill: !!this.tempSkill });
      return;
    }

    this.tempSkill.tags = this.tempSkill.tags || [];
    if (!this.tempSkill.tags.includes(tag)) {
      this.tempSkill.tags.push(tag);
      input.value = "";
      this.render();
      console.log("[JobSheet] _onAddSkillTag finalizado", { tag, tagsLength: this.tempSkill.tags.length });
    } else {
      console.log("[JobSheet] _onAddSkillTag cancelado (tag já existe)", { tag });
    }
  }

  static async _onRemoveSkillTag(event, target) {
    console.log("[JobSheet] _onRemoveSkillTag iniciado", { hasTempSkill: !!this.tempSkill });
    if (!this.tempSkill) {
      console.log("[JobSheet] _onRemoveSkillTag cancelado (sem tempSkill)");
      return;
    }

    const tagIndex = parseInt(target.dataset.tagIndex, 10);
    this.tempSkill.tags = this.tempSkill.tags || [];
    if (tagIndex >= 0 && tagIndex < this.tempSkill.tags.length) {
      const removed = this.tempSkill.tags[tagIndex];
      this.tempSkill.tags.splice(tagIndex, 1);
      this.render();
      console.log("[JobSheet] _onRemoveSkillTag finalizado", { tagIndex, removed, tagsLength: this.tempSkill.tags.length });
    } else {
      console.log("[JobSheet] _onRemoveSkillTag cancelado (índice inválido)", { tagIndex, tagsLength: this.tempSkill.tags.length });
    }
  }

  static async _onDeleteJobSkill(event, target) {
    console.log("[JobSheet] _onDeleteJobSkill iniciado", { activeSkillIndex: this.activeSkillIndex, hasTempSkill: !!this.tempSkill });
    event.stopPropagation();
    this._onCloseDetailsSkill();
    
    const item = target.closest('.sidebar-skill-item');
    if (!item) {
      console.log("[JobSheet] _onDeleteJobSkill cancelado (item não encontrado)");
      return;
    }
    const index = parseInt(item.dataset.index, 10);
    const currentSkills = foundry.utils.deepClone(this.item.system.skills || []);
    if (index < 0 || index >= currentSkills.length) {
      console.log("[JobSheet] _onDeleteJobSkill cancelado (índice inválido)", { index, skillsLength: currentSkills.length });
      return;
    }

    currentSkills.splice(index, 1);
    this.activeSkillIndex = currentSkills.length > 0
      ? Math.min(this.activeSkillIndex, currentSkills.length - 1)
      : -1;
    await this.item.update({ "system.skills": currentSkills });
    this.render();
    console.log("[JobSheet] _onDeleteJobSkill finalizado", { deletedIndex: index, newActiveIndex: this.activeSkillIndex, totalSkills: currentSkills.length });
  }

  static async _onSaveSkillTrayChanges(event, target) {
    console.log("[JobSheet] _onSaveSkillTrayChanges iniciado", { hasTempSkill: !!this.tempSkill, activeSkillIndex: this.activeSkillIndex });
    
    if (!this.tempSkill) {
      console.log("[JobSheet] _onSaveSkillTrayChanges cancelado (sem tempSkill)");
      return;
    }

    const skillIndex = this.activeSkillIndex;
    const form = this.form;
    const q = (sel) => form.querySelector(sel);

    try {
      const skill = this.tempSkill;
      const formData = new FormData(form);
      
      skill.name = formData.get(`system.skills.${skillIndex}.name`)?.toString().trim() || skill.name;
      skill.minLevel = parseInt(formData.get(`system.skills.${skillIndex}.minLevel`)?.toString(), 10) || 0;
      skill.type = formData.get(`system.skills.${skillIndex}.type`)?.toString() || skill.type;
      skill.support = formData.has(`system.skills.${skillIndex}.support`);
      skill.cost.type = formData.get(`system.skills.${skillIndex}.cost.type`)?.toString() || skill.cost.type;
      skill.cost.material = formData.get(`system.skills.${skillIndex}.cost.material`)?.toString() || "";
      skill.cost.value = parseInt(formData.get(`system.skills.${skillIndex}.cost.value`)?.toString(), 10) || 0;
      skill.combat.type = formData.get(`system.skills.${skillIndex}.combat.type`)?.toString() || skill.combat.type;
      skill.combat.area = formData.has(`system.skills.${skillIndex}.combat.area`);
      skill.combat.range = formData.get(`system.skills.${skillIndex}.combat.range`)?.toString() || "";
      skill.combat.ally = formData.has(`system.skills.${skillIndex}.combat.ally`);
      skill.tags = skill.tags || [];
      
      const descEl = form.querySelector(`[name="system.skills.${skillIndex}.description"]`);
      const notesEl = form.querySelector(`[name="system.skills.${skillIndex}.notes"]`);
      
      const getProseHtml = (el) => {
        if (!el) return null;
        if (typeof el.getHTML === "function") {
          const html = el.getHTML();
          if (html && html.includes('menu-container')) {
            const pm = el.querySelector('.ProseMirror');
            return pm ? pm.innerHTML : html;
          }
          return html;
        }
        const pm = el.querySelector?.('.ProseMirror');
        return pm ? pm.innerHTML : el.innerHTML || null;
      };
      
      const descHtml = getProseHtml(descEl);
      const notesHtml = getProseHtml(notesEl);
      
      const hasRealText = (html) => {
        if (!html) return false;
        const text = html.replace(/<[^>]*>/g, '').trim();
        return text.length > 0;
      };
      
      console.log("[JobSheet] _onSaveSkillTrayChanges ProseMirror extraído", {
        descHtml: descHtml?.substring(0, 200),
        notesHtml: notesHtml?.substring(0, 200),
        hasDesc: hasRealText(descHtml),
        hasNotes: hasRealText(notesHtml)
      });

      const updateData = {
        [`system.skills.${skillIndex}.name`]: skill.name,
        [`system.skills.${skillIndex}.minLevel`]: skill.minLevel,
        [`system.skills.${skillIndex}.type`]: skill.type,
        [`system.skills.${skillIndex}.support`]: skill.support,
        [`system.skills.${skillIndex}.cost.type`]: skill.cost.type,
        [`system.skills.${skillIndex}.cost.material`]: skill.cost.material,
        [`system.skills.${skillIndex}.cost.value`]: skill.cost.value,
        [`system.skills.${skillIndex}.combat.type`]: skill.combat.type,
        [`system.skills.${skillIndex}.combat.formula`]: skill.combat.formula || "",
        [`system.skills.${skillIndex}.combat.area`]: skill.combat.area,
        [`system.skills.${skillIndex}.combat.range`]: skill.combat.range,
        [`system.skills.${skillIndex}.combat.ally`]: skill.combat.ally,
        [`system.skills.${skillIndex}.tags`]: skill.tags
      };

      if (hasRealText(descHtml)) {
        updateData[`system.skills.${skillIndex}.description`] = descHtml;
      }
      if (hasRealText(notesHtml)) {
        updateData[`system.skills.${skillIndex}.notes`] = notesHtml;
      }

      console.log("[JobSheet] _onSaveSkillTrayChanges enviando update", updateData);
      await this.item.update(updateData);
      console.log("[JobSheet] _onSaveSkillTrayChanges update concluído");
      ui.notifications.info("Habilidade salva com sucesso.");
    } catch (err) {
      console.error("[JobSheet] _onSaveSkillTrayChanges erro", err);
      ui.notifications.error("Erro ao salvar habilidade: " + err.message);
      throw err;
    } finally {
      console.log("[JobSheet] _onSaveSkillTrayChanges finally, fechando detalhes");
      JobSheet._onCloseDetailsSkill.call(this);
    }
  }

  static _onCloseSkillTray(event, target) {
    console.log("[JobSheet] _onCloseSkillTray iniciado", { activeSkillIndex: this.activeSkillIndex, hasTempSkill: !!this.tempSkill });
    JobSheet._onCloseDetailsSkill.call(this);
    console.log("[JobSheet] _onCloseSkillTray finalizado");
  }

  static _onCloseDetailsSkill() {
    console.log("[JobSheet] _onCloseDetailsSkill iniciado", { activeSkillIndex: this.activeSkillIndex, hasTempSkill: !!this.tempSkill });
    this.tempSkill = null;
    this.render();
    console.log("[JobSheet] _onCloseDetailsSkill finalizado", { activeSkillIndex: this.activeSkillIndex, hasTempSkill: !!this.tempSkill });
  }
}
