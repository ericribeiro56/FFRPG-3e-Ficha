import { EQUIPPABLE_BONUS_TARGETS, TIERS, WEAPON_DAMAGE_TYPE, WEAPON_TYPES } from "../../core/constants.js";

export class WeaponSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {

  constructor(options = {}) {
    options.id = options.document ? `weapon-sheet-${options.document.id}` : options.id;
    super(options);
    this._creationFormState = {};
  }

  static DEFAULT_OPTIONS = {
    classes: ["ffrpg3e", "sheet", "weapon-window", "custom-weapon-sheet"],
    tag: "form",
    window: {
      resizable: false,
      minimizable: true,
      width: 940,
      height: 740,
      title: "Configurador de Arma"
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      addGeneralTag: WeaponSheet.prototype.addGeneralTag,
      removeGeneralTag: WeaponSheet.prototype.removeGeneralTag,
      addMaterial: WeaponSheet.prototype.addMaterial,
      removeMaterial: WeaponSheet.prototype.removeMaterial,
      addTempAbilityTag: WeaponSheet.prototype.addTempAbilityTag,
      removeTempAbilityTag: WeaponSheet.prototype.removeTempAbilityTag,
      addTempModifier: WeaponSheet.prototype.addTempModifier,
      removeTempModifier: WeaponSheet.prototype.removeTempModifier,
      saveNewAbility: WeaponSheet.prototype.saveNewAbility,
      deleteAbility: WeaponSheet.prototype.deleteAbility,
      addSavedAbilityTag: WeaponSheet.prototype.addSavedAbilityTag,
      removeSavedAbilityTag: WeaponSheet.prototype.removeSavedAbilityTag,
      addSavedModifier: WeaponSheet.prototype.addSavedModifier
    }
  };

  static PARTS = {
    form: {
      template: "systems/ffrpg3e/templates/items/weapon-sheet.hbs"
    }
  };

  static ACTIONS = {
    removeSavedModifier: async function(event, target) {
      event.preventDefault();
      const bonusIndex = parseInt(target.dataset.bonusIndex, 10);
      const abilityIndexFromDOM = parseInt(target.dataset.abilityIndex, 10);
      
      let abilityIndex = abilityIndexFromDOM;
      if (!Number.isInteger(abilityIndex)) {
        const abilityRow = target.closest(".ability-accordion-item");
        if (abilityRow) {
          const parent = abilityRow.parentElement;
          const children = parent ? Array.from(parent.children).filter(el => el.tagName === "DETAILS") : [];
          abilityIndex = children.indexOf(abilityRow);
        }
      }
      
      if (!Number.isInteger(abilityIndex)) return;
      
      const abilities = foundry.utils.deepClone(this.document.system.abilities || []);
      const ability = abilities[abilityIndex];
      
      if (!ability?.bonusList || bonusIndex >= ability.bonusList.length) return;

      ability.bonusList.splice(bonusIndex, 1);
      await this.document.update({ "system.abilities": abilities });
      this.render();
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.item = this.document;
    context.system = this.document.system;
    context.editable = this.document.isOwner;

    const tags = this.document.system?.tags || [];
    if (!tags.includes("weapon")) {
      tags.push("weapon");
      await this.document.update({ "system.tags": tags });
    }

    context.descricaoEnriquecida = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.document.system?.description || "",
      {
        secrets: this.document.isOwner,
        rollData: this.document.getRollData(),
        relativeTo: this.document
      }
    );

    context.tempAbilities = this.document.system?.tempAbilities || { name: "", description: "", tags: [], bonusList: [] };
    context.tempAbilities.descriptionEnriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      context.tempAbilities.description || "",
      {
        secrets: this.document.isOwner,
        rollData: this.document.getRollData(),
        relativeTo: this.document
      }
    );

    const abilities = this.document.system?.abilities || [];
    context.abilities = await Promise.all(abilities.map(async (ability) => ({
      ...ability,
      descriptionEnriched: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        ability.description || "",
        {
          secrets: this.document.isOwner,
          rollData: this.document.getRollData(),
          relativeTo: this.document
        }
      )
    })));

    context.statusOptions = EQUIPPABLE_BONUS_TARGETS;
    context.tierOptions = TIERS;
    context.weaponTypes = Object.entries(WEAPON_TYPES).map(([value, label]) => ({ value, label }));
    context.weaponDamageType = Object.entries(WEAPON_DAMAGE_TYPE).map(([value, label]) => ({ value, label }));
    context.attributeList = EQUIPPABLE_BONUS_TARGETS
                                  .filter(item => item.category === "attributes")
                                  .map(item => ({ value: item.key, label: item.display }));
    return context;
  }

  _saveCreationFormState() {
    const nameInput = this.element.querySelector(".new-ability-name");
    const name = nameInput?.value || "";
    if (name) {
      this._creationFormState = { name };
    }
  }

  _restoreCreationFormState() {
    if (!this._creationFormState || Object.keys(this._creationFormState).length === 0) return;
    const nameInput = this.element.querySelector(".new-ability-name");
    if (nameInput && this._creationFormState.name) nameInput.value = this._creationFormState.name;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this._restoreCreationFormState();
    
    const buttons = this.element.querySelectorAll(".action-btn-remove[data-action='removeSavedModifier']");
    buttons.forEach(btn => {
      btn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const target = event.currentTarget;
        const bonusIndex = parseInt(target.dataset.bonusIndex, 10);
        const abilityIndexFromDOM = parseInt(target.dataset.abilityIndex, 10);
        
        let abilityIndex = abilityIndexFromDOM;
        if (!Number.isInteger(abilityIndex)) {
          const abilityRow = target.closest(".ability-accordion-item");
          if (abilityRow) {
            const parent = abilityRow.parentElement;
            const children = parent ? Array.from(parent.children).filter(el => el.tagName === "DETAILS") : [];
            abilityIndex = children.indexOf(abilityRow);
          }
        }
        
        if (!Number.isInteger(abilityIndex)) return;
        
        const abilities = foundry.utils.deepClone(this.document.system.abilities || []);
        const ability = abilities[abilityIndex];
        
        if (!ability?.bonusList || bonusIndex >= ability.bonusList.length) return;

        ability.bonusList.splice(bonusIndex, 1);
        await this.document.update({ "system.abilities": abilities });
        this.render();
      });
    });
  }

  async addGeneralTag(event, target) {
    if (!this.document.isOwner && !game.user.isGM) {
      ui.notifications.warn("Sem permissão para modificar tags.");
      return;
    }
    const input = this.element.querySelector(".add-tag-input");
    const value = input?.value?.trim();
    if (!value) return;

    const tags = this.document.system?.tags || [];
    if (!tags.includes(value)) {
      tags.push(value);
      await this.document.update({ "system.tags": tags });
    }
    if (input) input.value = "";
  }

  async removeGeneralTag(event, target) {
    if (!this.document.isOwner && !game.user.isGM) {
      ui.notifications.warn("Sem permissão para modificar tags.");
      return;
    }
    const index = parseInt(target.dataset.index, 10);
    const tags = this.document.system?.tags || [];
    if (index < tags.length) {
      tags.splice(index, 1);
      await this.document.update({ "system.tags": tags });
    }
  }

  async addMaterial(event, target) {
    if (!this.document.isOwner && !game.user.isGM) {
      ui.notifications.warn("Sem permissão para modificar materiais.");
      return;
    }
    const input = this.element.querySelector(".add-material-input");
    const value = input?.value?.trim();
    if (!value) return;

    const materials = this.document.system?.materials || [];
    if (!materials.includes(value)) {
      materials.push(value);
      await this.document.update({ "system.materials": materials });
    }
    if (input) input.value = "";
  }

  async removeMaterial(event, target) {
    if (!this.document.isOwner && !game.user.isGM) {
      ui.notifications.warn("Sem permissão para modificar materiais.");
      return;
    }
    const index = parseInt(target.dataset.index, 10);
    const materials = this.document.system?.materials || [];
    if (index < materials.length) {
      materials.splice(index, 1);
      await this.document.update({ "system.materials": materials });
    }
  }

  async addTempAbilityTag(event, target) {
    event.preventDefault();
    this._saveCreationFormState();
    const input = this.element.querySelector(".add-ability-tag-input");
    const value = input?.value?.trim();
    if (!value) return;

    const tempAbilities = this.document.system?.tempAbilities || { name: "", description: "", tags: [], bonusList: [] };
    if (!tempAbilities.tags.includes(value)) {
      tempAbilities.tags.push(value);
      await this.document.update({ "system.tempAbilities": tempAbilities });
    }
    if (input) input.value = "";
    this.render();
  }

  async removeTempAbilityTag(event, target) {
    event.preventDefault();
    this._saveCreationFormState();
    const index = parseInt(target.dataset.index, 10);
    const tempAbilities = this.document.system?.tempAbilities || { name: "", description: "", tags: [], bonusList: [] };
    if (index < tempAbilities.tags.length) {
      tempAbilities.tags.splice(index, 1);
      await this.document.update({ "system.tempAbilities": tempAbilities });
    }
    this.render();
  }

  async addTempModifier(event, target) {
    event.preventDefault();
    this._saveCreationFormState();
    const statusSelect = this.element.querySelector(".add-modifier-status");
    const valueInput = this.element.querySelector(".add-modifier-value");
    const modeSelect = this.element.querySelector(".add-modifier-mode");
    const status = statusSelect?.value;
    const value = parseInt(valueInput?.value, 10);
    const mode = modeSelect?.value || "flat";

    if (!status || isNaN(value)) return;

    const tempAbilities = this.document.system?.tempAbilities || { name: "", description: "", tags: [], bonusList: [] };
    tempAbilities.bonusList = tempAbilities.bonusList || [];
    tempAbilities.bonusList.push({ status, value, mode });
    await this.document.update({ "system.tempAbilities": tempAbilities });
    if (valueInput) valueInput.value = "";
    this.render();
  }

  async removeTempModifier(event, target) {
    event.preventDefault();
    this._saveCreationFormState();
    const index = parseInt(target.dataset.index, 10);
    const tempAbilities = this.document.system?.tempAbilities || { name: "", description: "", tags: [], bonusList: [] };
    if (index < (tempAbilities.bonusList?.length || 0)) {
      tempAbilities.bonusList.splice(index, 1);
      await this.document.update({ "system.tempAbilities": tempAbilities });
    }
    this.render();
  }

  async saveNewAbility(event, target) {
    event.preventDefault();
    const nameInput = this.element.querySelector(".new-ability-name");
    const name = nameInput?.value?.trim();
    if (!name) return;

    const tempAbilities = this.document.system?.tempAbilities || { name: "", description: "", tags: [], bonusList: [] };
    const description = tempAbilities.description || "";
    const tags = [...(tempAbilities.tags || [])];
    const bonusList = [...(tempAbilities.bonusList || [])];

    const abilities = this.document.system?.abilities || [];
    abilities.push({ name, description, tags, bonusList });

    await this.document.update({
      "system.abilities": abilities,
      "system.tempAbilities": { description: "", tags: [], bonusList: [] }
    });

    if (nameInput) nameInput.value = "";
    this._creationFormState = {};
    this.render();
  }

  async deleteAbility(event, target) {
    event.preventDefault();
    this._saveCreationFormState();
    const index = parseInt(target.dataset.index, 10);
    const abilities = this.document.system?.abilities || [];
    if (index < abilities.length) {
      abilities.splice(index, 1);
      await this.document.update({ "system.abilities": abilities });
    }
    this.render();
  }

  async addSavedAbilityTag(event, target) {
    event.preventDefault();
    this._saveCreationFormState();
    const abilityIndex = parseInt(target.dataset.abilityIndex, 10);
    const input = this.element.querySelector(`[data-ability-index="${abilityIndex}"].add-saved-ability-tag-input`);
    const value = input?.value?.trim();
    if (!value) return;

    const abilities = this.document.system?.abilities || [];
    const ability = abilities[abilityIndex];
    if (!ability) return;

    ability.tags = ability.tags || [];
    if (!ability.tags.includes(value)) {
      ability.tags.push(value);
      await this.document.update({ "system.abilities": abilities });
    }
    if (input) input.value = "";
    this.render();
  }

  async removeSavedAbilityTag(event, target) {
    event.preventDefault();
    this._saveCreationFormState();
    const abilityIndex = parseInt(target.dataset.abilityIndex, 10);
    const tagIndex = parseInt(target.dataset.tagIndex, 10);
    const abilities = this.document.system?.abilities || [];
    const ability = abilities[abilityIndex];
    if (!ability?.tags || tagIndex >= ability.tags.length) return;

    ability.tags.splice(tagIndex, 1);
    await this.document.update({ "system.abilities": abilities });
    this.render();
  }

  async addSavedModifier(event, target) {
    event.preventDefault();
    this._saveCreationFormState();
    const abilityIndex = parseInt(target.dataset.abilityIndex, 10);
    const statusSelect = this.element.querySelector(`.add-saved-modifier-status[data-ability-index="${abilityIndex}"]`);
    const valueInput = this.element.querySelector(`.add-saved-modifier-value[data-ability-index="${abilityIndex}"]`);
    const modeSelect = this.element.querySelector(`.add-saved-modifier-mode[data-ability-index="${abilityIndex}"]`);
    const status = statusSelect?.value;
    const value = parseInt(valueInput?.value, 10);
    const mode = modeSelect?.value || "flat";

    if (!status || isNaN(value)) return;

    const abilities = this.document.system?.abilities || [];
    const ability = abilities[abilityIndex];
    if (!ability) return;

    ability.bonusList = ability.bonusList || [];
    ability.bonusList.push({ status, value, mode });
    await this.document.update({ "system.abilities": abilities });
    this.render();
  }
}
