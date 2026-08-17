import { EQUIPPABLE_BONUS_TARGETS, TIERS, WEAPON_DAMAGE_TYPE, WEAPON_TYPES } from "../../core/constants.js";
import { ItemSheetBase } from "./item-core.js";
import { sortByLabel } from "../../core/utils.js";

export class WeaponSheet extends ItemSheetBase {

  static DEFAULT_OPTIONS = {
    ...ItemSheetBase.DEFAULT_OPTIONS,
    classes: ["ffrpg3e", "sheet", "weapon-window", "custom-weapon-sheet"],
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

  async _prepareContext(options) {
    const context = await super._prepareContextBase(options);
    context.weaponTypes = sortByLabel(Object.entries(WEAPON_TYPES).map(([value, label]) => ({ value, label })));
    context.weaponDamageType = sortByLabel(Object.entries(WEAPON_DAMAGE_TYPE).map(([value, label]) => ({ value, label })));
    context.attributeList = sortByLabel(EQUIPPABLE_BONUS_TARGETS
                                                  .filter(item => item.category === "attributes")
                                                  .map(item => ({ value: item.key, label: item.display })));
    return context;
  }
}
