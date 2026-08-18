import { EFFECT_TYPES, EQUIPPABLE_BONUS_TARGETS } from "../../core/constants.js";
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

export class EffectsSheet extends ItemSheetBase {

  static DEFAULT_OPTIONS = {
    ...ItemSheetBase.DEFAULT_OPTIONS,
    classes: ["ffrpg3e", "sheet", "effect-window", "custom-effect"],
    tag: "form",
    window: {
      resizable: false,
      width: 540,
      height: 720,
      title: "Configurador de Efeito / Status"
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      addAbilityTag: EffectsSheet.prototype.addAbilityTag,
      removeAbilityTag: EffectsSheet.prototype.removeAbilityTag,
      addModifier: EffectsSheet.prototype.addModifier,
      removeModifier: EffectsSheet.prototype.removeModifier
    }
  };

  static PARTS = {
    form: {
      template: "systems/ffrpg3e/templates/items/effect-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContextBase(options);
    context.effectTypeList = sortByLabel(Object.entries(EFFECT_TYPES).map(([value, label]) => ({ value, label })));
    context.statusDisplay = statusDisplay;
    context.modeDisplay = modeDisplay;
    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this._bindImagePicker();
  }

  async addAbilityTag(event, target) {
    event.preventDefault();
    const input = this.element.querySelector(".add-ability-tag-input");
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

  async removeAbilityTag(event, target) {
    event.preventDefault();
    const index = datasetInt(target, "index");
    const tags = this.document.system?.tags || [];
    if (index < tags.length) {
      tags.splice(index, 1);
      await this.document.update({ "system.tags": tags });
    }
    this.render();
  }

  async addModifier(event, target) {
    event.preventDefault();
    const statusSelect = this.element.querySelector(".add-modifier-status");
    const valueInput = this.element.querySelector(".add-modifier-value");
    const modeSelect = this.element.querySelector(".add-modifier-mode");
    const status = statusSelect?.value;
    const value = parseInt(valueInput?.value, 10);
    const mode = modeSelect?.value || "flat";

    if (!status || isNaN(value)) return;

    const effect = this.document.system?.effect || [];
    effect.push({ status, value, mode });
    await this.document.update({ "system.effect": effect });
    if (valueInput) valueInput.value = "";
    this.render();
  }

  async removeModifier(event, target) {
    event.preventDefault();
    const index = datasetInt(target, "index");
    const effect = this.document.system?.effect || [];
    if (index < effect.length) {
      effect.splice(index, 1);
      await this.document.update({ "system.effect": effect });
    }
    this.render();
  }
}
