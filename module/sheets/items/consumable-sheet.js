import { CONSUMABLE_TYPES, EFFECT_TYPES, EQUIPPABLE_BONUS_TARGETS, TIERS } from "../../core/constants.js";
import { safeInt, sortByLabel, datasetInt } from "../../core/utils.js";
import { ItemSheetBase } from "./item-core.js";

function statusDisplay(statusKey) {
  const target = EQUIPPABLE_BONUS_TARGETS.find(t => t.key === statusKey);
  return target ? target.display : statusKey;
}

function modeDisplay(mode) {
  if (mode === "percent") return "Porc";
  return "Flat";
}

export class ConsumableSheet extends ItemSheetBase {

  static DEFAULT_OPTIONS = {
    ...ItemSheetBase.DEFAULT_OPTIONS,
    classes: ["ffrpg3e", "sheet", "consumable-window", "custom-consumable"],
    tag: "form",
    window: {
      resizable: false,
      minimizable: true,
      width: 940,
      height: 740,
      title: "Configurador de Consumível"
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      addGeneralTag: ConsumableSheet.prototype.addGeneralTag,
      removeGeneralTag: ConsumableSheet.prototype.removeGeneralTag,
      addEffectTag: ConsumableSheet.prototype.addEffectTag,
      removeEffectTag: ConsumableSheet.prototype.removeEffectTag,
      addEffectModifier: ConsumableSheet.prototype.addEffectModifier,
      removeEffectModifier: ConsumableSheet.prototype.removeEffectModifier
    }
  };

  static PARTS = {
    form: {
      template: "systems/ffrpg3e/templates/items/consumable-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContextBase(options);
    context.tierOptions = sortByLabel(Object.entries(TIERS).map(([value, label]) => ({ value, label })));
    context.statusOptions = sortByLabel(EQUIPPABLE_BONUS_TARGETS.map(t => ({ key: t.key, display: t.display })));
    context.statusDisplay = statusDisplay;
    context.modeDisplay = modeDisplay;

    context.consumableTypes = sortByLabel(Object.entries(CONSUMABLE_TYPES).map(([value, label]) => ({ value, label })));

    const effect = this.document.system?.effect || {};
    const desc = effect.description || "";
    context.effectDescriptionEnriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(desc, {
      secrets: this.document.isOwner, async: true
    });

    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this._bindImagePicker();
  }

  async addGeneralTag(event, target) {
    event.preventDefault();
    const input = this.element.querySelector(".add-tag-input");
    const value = input?.value?.trim();
    if (!value) return;

    const tags = this.document.system?.tags || [];
    if (!tags.includes(value)) {
      tags.push(value);
      await this.document.update({ "system.tags": tags });
    }
    if (input) input.value = "";
    this.render();
  }

  async removeGeneralTag(event, target) {
    event.preventDefault();
    const index = datasetInt(target, "index");
    const tags = this.document.system?.tags || [];
    if (index < tags.length) {
      tags.splice(index, 1);
      await this.document.update({ "system.tags": tags });
    }
    this.render();
  }

  async addEffectTag(event, target) {
    event.preventDefault();
    const input = this.element.querySelector(".add-effect-tag-input");
    const value = input?.value?.trim();
    if (!value) return;

    const effect = this.document.system?.effect || {};
    const tags = effect.tags || [];
    if (!tags.includes(value)) {
      tags.push(value);
      await this.document.update({ "system.effect.tags": tags });
    }
    if (input) input.value = "";
    this.render();
  }

  async removeEffectTag(event, target) {
    event.preventDefault();
    const index = datasetInt(target, "index");
    const effect = this.document.system?.effect || {};
    const tags = effect.tags || [];
    if (index < tags.length) {
      tags.splice(index, 1);
      await this.document.update({ "system.effect.tags": tags });
    }
    this.render();
  }

  async addEffectModifier(event, target) {
    console.log("[FFRPG3E][CONSUMABLE] addEffectModifier chamado");
    event.preventDefault();
    const statusSelect = this.element.querySelector(".add-modifier-status");
    const valueInput = this.element.querySelector(".add-modifier-value");
    const modeSelect = this.element.querySelector(".add-modifier-mode");
    const status = statusSelect?.value;
    const value = parseInt(valueInput?.value, 10);
    const mode = modeSelect?.value || "flat";

    if (!status || isNaN(value)) return;

    const effect = this.document.system?.effect || {};
    const effectList = effect.modifiers || [];
    effectList.push({ status, value, mode });
    await this.document.update({ "system.effect.modifiers": effectList });
    if (valueInput) valueInput.value = "";
    this.render();
  }

  async removeEffectModifier(event, target) {
    event.preventDefault();
    const index = datasetInt(target, "index");
    const effect = this.document.system?.effect || {};
    const effectList = effect.modifiers || [];
    if (index < effectList.length) {
      effectList.splice(index, 1);
      await this.document.update({ "system.effect.modifiers": effectList });
    }
    this.render();
  }
}
