import { ARMOR_SLOTS, EQUIPPABLE_BONUS_TARGETS, TIERS } from "../../core/constants.js";
import { ItemSheetBase } from "./item-core.js";
import { sortByLabel } from "../../core/utils.js";

export class ArmorSheet extends ItemSheetBase {

  static DEFAULT_OPTIONS = {
    ...ItemSheetBase.DEFAULT_OPTIONS,
    classes: ["ffrpg3e", "sheet", "armor-window", "custom-armor-sheet"],
    window: {
      resizable: false,
      minimizable: true,
      width: 940,
      height: 740,
      title: "Configurador de Equipamento"
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      addGeneralTag: ArmorSheet.prototype.addGeneralTag,
      removeGeneralTag: ArmorSheet.prototype.removeGeneralTag,
      addMaterial: ArmorSheet.prototype.addMaterial,
      removeMaterial: ArmorSheet.prototype.removeMaterial,
      addTempAbilityTag: ArmorSheet.prototype.addTempAbilityTag,
      removeTempAbilityTag: ArmorSheet.prototype.removeTempAbilityTag,
      addTempModifier: ArmorSheet.prototype.addTempModifier,
      removeTempModifier: ArmorSheet.prototype.removeTempModifier,
      saveNewAbility: ArmorSheet.prototype.saveNewAbility,
      deleteAbility: ArmorSheet.prototype.deleteAbility,
      addSavedAbilityTag: ArmorSheet.prototype.addSavedAbilityTag,
      removeSavedAbilityTag: ArmorSheet.prototype.removeSavedAbilityTag,
      addSavedModifier: ArmorSheet.prototype.addSavedModifier
    }
  };

  static PARTS = {
    form: {
      template: "systems/ffrpg3e/templates/items/armor-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContextBase(options);
    context.armorSlotsOptions = sortByLabel(Object.entries(ARMOR_SLOTS).map(([value, label]) => ({ value, label })));
    return context;
  }
}
