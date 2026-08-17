import { ITEM_TYPES } from "./constants.js";
import { MessageService } from "./message-service.js";
import { safeInt } from "./utils.js";
import { GearBasicModel } from "../data-models.js";

export class DropDispatcher {
  static async dispatch(actor, item, event, data) {
    if (!item) return;

    switch (item.type) {
      case ITEM_TYPES.JOB:
        return JobDropHandler.handle(actor, item);
      case ITEM_TYPES.RACE:
        return RaceDropHandler.handle(actor, item);
      case ITEM_TYPES.EFFECT:
        return EffectDropHandler.handle(actor, item);
      case "gear":
      case "gear_weapon":
      case "gear_armor":
      case "gear_consumable":
        const tags = item.system?.tags || [];
        if (tags.includes("keyItem")) {
          return GenericDropHandler.handle(actor, event, data);
        }
        return GearDropHandler.handle(actor, item);
      default:
        return GenericDropHandler.handle(actor, event, data);
    }
  }
}

class JobDropHandler {
  static async handle(actor, item) {
    const existingJob = actor.items.find(i => i.type === ITEM_TYPES.JOB);
    if (existingJob) {
      await actor.deleteEmbeddedDocuments("Item", [existingJob.id], { render: false });
    }
    await actor.createEmbeddedDocuments("Item", [item.toObject()]);
  }
}

class RaceDropHandler {
  static async handle(actor, item) {
    const existingRace = actor.items.find(i => i.type === ITEM_TYPES.RACE);
    if (existingRace) {
      await actor.deleteEmbeddedDocuments("Item", [existingRace.id], { render: false });
    }
    await actor.createEmbeddedDocuments("Item", [item.toObject()]);
  }
}

class EffectDropHandler {
  static async handle(actor, item) {
    const existingEffect = actor.items.find(i => i.type === ITEM_TYPES.EFFECT && i.name === item.name);
    if (existingEffect) {
      await actor.deleteEmbeddedDocuments("Item", [existingEffect.id], { render: false });
    }
    await actor.createEmbeddedDocuments("Item", [item.toObject()]);
    await MessageService.createEffectAppliedMessage(actor, item);
  }
}

class GenericDropHandler {
  static async handle(actor, event, data) {
  }
}

class GearDropHandler {
  static async handle(actor, item) {

    const tags = item.system?.tags || [];
    const sourceId = item.sourceId || item.uuid || null;
    const name = item.name;
    const type = item.type;

    const isConsumable = tags.some(t => t === "consumable");
    const isWeapon = tags.some(t => t === "weapon");
    const isArmor = tags.some(t => t === "armor");
    const isShield = tags.some(t => t === "shield");
    const isAccessory = tags.some(t => t === "accessory");

    console.log(`[FFRPG3E][DROP] item=${name}, type=${type}, tags=${JSON.stringify(tags)}, isAccessory=${isAccessory}, isArmor=${isArmor}`);

    if (isConsumable && sourceId) {
      const gearTypes = ["gear", "gear_weapon", "gear_armor", "gear_consumable"];
      const existente = actor.items.find(i => 
        gearTypes.includes(i.type) && 
        (i.system?.tags || []).some(t => t === "consumable") && 
        i.system?.sourceId === sourceId
      );

      if (existente) {
        const novaQuantidade = safeInt(existente.system.quantity, 1) + safeInt(item.system.quantity, 1);
        await existente.update({ "system.quantity": Math.max(1, novaQuantidade) }, { render: false });
        await MessageService.createItemStackedMessage(actor, existente, Math.max(1, novaQuantidade));
        return;
      }
    }

    const objeto = item.toObject();

    if (!objeto.system) objeto.system = {};

    objeto.system.displayName = item.system.fullDisplayName;

    if (item.system && "computeInfoDisplay" in item.system) {
      objeto.system.combatDisplay = item.system.computeInfoDisplay || "";
    }

    if (item.system && "computeAbilityDisplay" in item.system) {
      objeto.system.abilityDisplay = item.system.computeAbilityDisplay || "";
    }

    objeto.system.combatDisplay = item.system.computeInfoDisplay;
    
    if (isConsumable && !objeto.system.quantity) {
      objeto.system.quantity = 1;
    }
    if ((isWeapon || isArmor || isShield || isAccessory) && safeInt(objeto.system.quantity, 1) !== 1) {
      objeto.system.quantity = 1;
    }
    if (isConsumable && safeInt(objeto.system.quantity, 1) < 0) {
      objeto.system.quantity = 1;
    }

    await actor.createEmbeddedDocuments("Item", [objeto]);
  }
}
