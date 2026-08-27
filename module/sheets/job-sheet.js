const { HandlebarsApplicationMixin } = foundry.applications.api;

import { CLASS_LIST, CONSUMABLE_TYPES, PROFICIENCY_BASIC_MAP, ROLL_FORMULA_TARGETS, SKILL_JOB_TYPES, WEAPON_TYPES } from "../core/constants.js";
import { replaceFormulaReferences, sortByLabel } from "../core/utils.js";

export class JobSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
  constructor(options = {}) {
    super(options);
    this.activeSkillIndex = 0;
    this.tempSkill = null;
    this.controladorAbas = new foundry.applications.ux.Tabs({
      navSelector: '.sheet-tabs[data-group="primary"]',
      contentSelector: '.sheet-body',
      initial: 'principal'
    });
  }

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
      closeSkillTray: JobSheet._onCloseSkillTray,
      rollSkillFormula: JobSheet._onRollSkillFormula
    }
  };

  static PARTS = {
    form: {
      template: "systems/ffrpg3e/templates/job/job-sheet.hbs"
    }
  };

  async _prepareContext(options) {
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
    context.classList = Object.entries(CLASS_LIST).map(([key, value]) => ({
      value: key,
      label: value
    }));

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

    let proficiency = [];
    PROFICIENCY_BASIC_MAP.forEach(i=>{
      i.list.forEach(y=>{
        proficiency.push({value:y.key,label:y.label})
      })
    })
    context.proficiencyOptions = proficiency;

    const weaponTypesList = Object.entries(WEAPON_TYPES).map(([key, value]) => ({
      value: key,
      label: value
    }));

    context.weaponOptions = weaponTypesList;

    context.armorOptions = [
      { value: "Armadura Pesada", label: "Armadura Pesada" },
      { value: "Armadura Leve", label: "Armadura Leve" },
      { value: "Manto", label: "Manto" }
    ];

    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    this.controladorAbas.bind(this.element);
  }

  static async _onAddProficiencyBonus(event, target) {
    const key = this.form.querySelector(".add-prof-key").value;
    const value = parseInt(this.form.querySelector(".add-prof-value").value, 10) || 0;
    const currentList = foundry.utils.deepClone(this.item.system.proficiency?.bonus || []);
    currentList.push({ key, value });
    await this.item.update({ "system.proficiency.bonus": currentList });
  }

  static async _onRemoveProficiencyBonus(event, target) {
    const index = parseInt(target.dataset.index, 10);
    const currentList = foundry.utils.deepClone(this.item.system.proficiency?.bonus || []);
    currentList.splice(index, 1);
    await this.item.update({ "system.proficiency.bonus": currentList });
  }

  static async _onAddAllowedWeapon(event, target) {
    const weapon = this.form.querySelector(".add-weapon-select").value;
    const currentList = foundry.utils.deepClone(this.item.system.mainWeapons || []);
    if (!currentList.includes(weapon)) {
      currentList.push(weapon);
      await this.item.update({ "system.mainWeapons": currentList });
    }
  }

  static async _onRemoveAllowedWeapon(event, target) {
    const index = parseInt(target.dataset.index, 10);
    const currentList = foundry.utils.deepClone(this.item.system.mainWeapons || []);
    currentList.splice(index, 1);
    await this.item.update({ "system.mainWeapons": currentList });
  }

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
    const index = parseInt(target.dataset.index, 10);
    const currentList = foundry.utils.deepClone(this.item.system.tags || []);
    currentList.splice(index, 1);
    await this.item.update({ "system.tags": currentList });
  }

  static async _onAddAllowedArmor(event, target) {
    const armor = this.form.querySelector(".add-armor-select").value;
    const currentList = foundry.utils.deepClone(this.item.system.allowedArmors || []);
    if (!currentList.includes(armor)) {
      currentList.push(armor);
      await this.item.update({ "system.allowedArmors": currentList });
    }
  }

  static async _onRemoveAllowedArmor(event, target) {
    const index = parseInt(target.dataset.index, 10);
    const currentList = foundry.utils.deepClone(this.item.system.allowedArmors || []);
    currentList.splice(index, 1);
    await this.item.update({ "system.allowedArmors": currentList });
  }

  static async _onAddNewJobSkill(event, target) {
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
  }

  static _onSelectJobSkill(event, target) {
    const item = target.closest('.sidebar-skill-item');
    if (!item) return;
    const index = parseInt(item.dataset.index, 10);
    this.activeSkillIndex = index;
    const skill = this.item.system.skills[this.activeSkillIndex];
    if (skill) {
      this.tempSkill = foundry.utils.deepClone(skill.toObject ? skill.toObject() : skill);
    } else {
      this.tempSkill = null;
    }
    this.render();
  }

  static async _onAddValidatedFormula(event, target) {
    const input = this.form.querySelector(".temp-combat-formula");
    const formula = input.value.trim();
    if (!formula || !this.tempSkill) return;

    const unmapped = formula.match(/[A-Z][A-Z0-9_]*/g) || [];
    const invalidRefs = unmapped.filter(m => !ROLL_FORMULA_TARGETS.some(t => t.nameReff.includes(m)));
    if (invalidRefs.length > 0) {
      ui.notifications.error(`Fórmula Inválida: referência não mapeada ${invalidRefs.join(", ")}`);
      return;
    }

    const replacedFormula = replaceFormulaReferences(formula);

    if (!Roll.validate(replacedFormula)) {
      ui.notifications.error("Fórmula Inválida");
      return;
    }

    this.tempSkill.combat = this.tempSkill.combat || {};
    this.tempSkill.combat.formula = formula;
    input.value = "";
    this.render();
  }

  static async _onRemoveValidatedFormula(event, target) {
    if (!this.tempSkill) return;
    this.tempSkill.combat = this.tempSkill.combat || {};
    this.tempSkill.combat.formula = "";
    this.render();
  }

  static async _onRollSkillFormula(event, target) {
    if (!this.tempSkill?.combat?.formula) return;
    const formula = this.tempSkill.combat.formula;
    const actor = this.item.parent;
    if (!actor) return;

    const rollData = actor.getRollData();
    const formulaPronta = Roll.replaceFormulaData(formula, rollData, { missing: "0" });

    if (!Roll.validate(formulaPronta)) {
      ui.notifications.error("Fórmula Inválida");
      return;
    }

    const roll = Roll.create(formulaPronta);
    await roll.evaluate();
    roll.toMessage({ flavor: this.tempSkill.name || "Rolagem de Skill" });
  }

  static async _onAddSkillTag(event, target) {
    const input = this.form.querySelector(".add-skill-tag-input");
    const tag = input.value.trim();
    if (!tag || !this.tempSkill) return;
    this.tempSkill.tags = this.tempSkill.tags || [];
    if (!this.tempSkill.tags.includes(tag)) {
      this.tempSkill.tags.push(tag);
      input.value = "";
      this.render();
    }
  }

  static async _onRemoveSkillTag(event, target) {
    if (!this.tempSkill) return;
    const tagIndex = parseInt(target.dataset.tagIndex, 10);
    this.tempSkill.tags = this.tempSkill.tags || [];
    if (tagIndex >= 0 && tagIndex < this.tempSkill.tags.length) {
      this.tempSkill.tags.splice(tagIndex, 1);
      this.render();
    }
  }

  static async _onDeleteJobSkill(event, target) {
    event.stopPropagation();
    this._onCloseDetailsSkill();
    const item = target.closest('.sidebar-skill-item');
    if (!item) return;
    const index = parseInt(item.dataset.index, 10);
    const currentSkills = foundry.utils.deepClone(this.item.system.skills || []);
    if (index < 0 || index >= currentSkills.length) return;
    currentSkills.splice(index, 1);
    this.activeSkillIndex = currentSkills.length > 0
      ? Math.min(this.activeSkillIndex, currentSkills.length - 1)
      : -1;
    await this.item.update({ "system.skills": currentSkills });
    this.render();
  }

  static async _onSaveSkillTrayChanges(event, target) {
    if (!this.tempSkill) return;

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

      await this.item.update(updateData);
      ui.notifications.info("Habilidade salva com sucesso.");
    } catch (err) {
      ui.notifications.error("Erro ao salvar habilidade: " + err.message);
      throw err;
    } finally {
      JobSheet._onCloseDetailsSkill.call(this);
    }
  }

  static _onCloseSkillTray(event, target) {
    JobSheet._onCloseDetailsSkill.call(this);
  }

  static _onCloseDetailsSkill() {
    this.tempSkill = null;
    this.render();
  }
}
