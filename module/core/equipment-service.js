import { getSafeValue, safeArray, safeInt } from "./utils.js";
import { EQUIPPABLE_BONUS_TARGETS, ARMOR_SLOTS } from "./constants.js";

function buildChange(key, value) {
  const numericValue = safeInt(value, 0);
  if (!key || !numericValue) return null;
  return { key, mode: "add", value: numericValue };
}

export function getSlotLabel(slot) {
  if (!slot) return slot;
  const labels = {
    ...ARMOR_SLOTS,
    main_hand: "Mão Principal",
    offhand: "OffHand",
    accessory_0: "Acessório",
    accessory_1: "Acessório"
  };
  return labels[slot] || slot;
}

export function verificarRegrasWeapon(item, actor) {
  const slotItem = item.system?.slot;
  console.log(`[FFRPG3E][WEAPON] Iniciando verificação para ${item.name}, slot=${slotItem}`);

  if (slotItem !== "weapon") {
    console.log(`[FFRPG3E][WEAPON] Item não é weapon, retornando slot original: ${slotItem}`);
    return { ehWeapon: false, slotAlvo: slotItem, conflitos: [], mensagem: null };
  }

  const mainHand = actor.items.find(i => i.system?.equipped && i.system?.slot === "main_hand");
  const offhand = actor.items.find(i => i.system?.equipped && i.system?.slot === "offhand");

  console.log(`[FFRPG3E][WEAPON] main_hand=${mainHand?.name || "vazio"}, offhand=${offhand?.name || "vazio"}`);

  if (mainHand?.system?.weapon?.twoHanded) {
    console.log(`[FFRPG3E][WEAPON] main_hand tem arma de 2 mãos: ${mainHand.name}`);

    if (item.system?.weapon?.twoHanded) {
      console.log(`[FFRPG3E][WEAPON] Tentando equipar arma de 2 mãos com main_hand ocupada por 2 mãos`);
      return {
        ehWeapon: true,
        slotAlvo: null,
        conflitos: [mainHand],
        mensagem: `Já existe ${mainHand.name} (arma de duas mãos) na Mão Principal.`
      };
    }

    console.log(`[FFRPG3E][WEAPON] Não pode equipar na offhand porque main_hand é 2 mãos`);
    return {
      ehWeapon: true,
      slotAlvo: null,
      conflitos: [mainHand],
      mensagem: `Não é possível equipar ${item.name} na OffHand enquanto ${mainHand.name} (arma de duas mãos) estiver equipada.`
    };
  }

  if (!mainHand) {
    console.log(`[FFRPG3E][WEAPON] main_hand vazia, equipando em main_hand`);
    return { ehWeapon: true, slotAlvo: "main_hand", conflitos: [], mensagem: null };
  }

  if (!mainHand.system?.weapon?.twoHanded) {
    console.log(`[FFRPG3E][WEAPON] main_hand ocupada por arma de 1 mão: ${mainHand.name}`);

    if (offhand) {
      console.log(`[FFRPG3E][WEAPON] offhand ocupada: ${offhand.name}`);
      return {
        ehWeapon: true,
        slotAlvo: null,
        conflitos: [mainHand, offhand],
        mensagem: `Mão Principal e OffHand estão ocupadas.`
      };
    }

    console.log(`[FFRPG3E][WEAPON] offhand vazia, equipando em offhand`);
    return { ehWeapon: true, slotAlvo: "offhand", conflitos: [mainHand], mensagem: null };
  }

  return { ehWeapon: true, slotAlvo: null, conflitos: [], mensagem: "Não foi possível determinar o slot." };
}

export function escolherSlotAccessory(actor) {
  const itensEquipados = actor.items.filter(i => i.system?.equipped && ["accessory", "accessory_0", "accessory_1"].includes(i.system?.slot));
  const slotsOcupados = new Set(itensEquipados.map(i => i.system?.slot));
  
  if (!slotsOcupados.has("accessory_0")) return "accessory_0";
  if (!slotsOcupados.has("accessory_1")) return "accessory_1";
  return "accessory_0";
}

export function getEquipBonusTarget(key) {
  return EQUIPPABLE_BONUS_TARGETS.find(t => t.key === key) || null;
}

function hasTag(item, tag) {
  return (item.system?.tags || []).some(t => t === tag);
}


export function getSlotErrorMessage(item) {
  if (hasTag(item, "consumable")) {
    return "Consumíveis não são equipados.";
  }
  if (hasTag(item, "keyItem")) {
    return "Itens importantes não são equipados.";
  }
  return "Este item não pode ser equipado.";
}

function collectFlatBonuses(item) {
  const sistema = item.system || {};
  const flatMap = new Map();

  const bonusList = safeArray(sistema.bonusList);
  const abilities = safeArray(sistema.abilities);

  for (const bonus of bonusList) {
    if (bonus.mode === "percent") continue;
    const target = getEquipBonusTarget(bonus.status);
    if (!target) continue;

    const value = safeInt(bonus.value, 0);
    if (!value) continue;

    let targetPath = target.flatTarget;
    if (bonus.status === "armadura" || bonus.status === "armadura_magica") {
      targetPath = targetPath.replace(".bonus", ".base");
    }

    flatMap.set(targetPath, getSafeValue(flatMap.get(targetPath)) + value);
  }

  for (const ability of abilities) {
    const abilityBonuses = safeArray(ability.bonusList);
    for (const bonus of abilityBonuses) {
      if (bonus.mode === "percent") continue;
      const target = getEquipBonusTarget(bonus.status);
      if (!target) continue;

      const value = safeInt(bonus.value, 0);
      if (!value) continue;

      flatMap.set(target.flatTarget, getSafeValue(flatMap.get(target.flatTarget)) + value);
    }
  }

  return flatMap;
}

export function buildEquipmentEffect(item) {
  const flatMap = collectFlatBonuses(item);
  const changes = [];

  for (const [key, value] of flatMap) {
    const change = buildChange(key, value);
    if (change) changes.push(change);
  }

  if (!changes.length) return null;

  return {
    name: `[EQUIP] ${item.name || "Item"}`,
    icon: item.img || "icons/svg/hazard.svg",
    duration: null,
    transfer: true,
    changes,
    statuses: ["ffrpg3e-equipment"]
  };
}

export function findEquipmentEffect(actor, itemId) {
  const effects = actor.appliedEffects || [];
  return effects.find(e => e.flags?.ffrpg3e?.sourceItemId === itemId) || null;
}

export async function applyEquipmentEffect(actor, item) {
  const sistema = item.system || {};
  const abilities = Array.isArray(sistema.abilities) ? sistema.abilities : [];
  const bonusList = Array.isArray(sistema.bonusList) ? sistema.bonusList : [];

  for (const bonus of [...bonusList, ...abilities.flatMap(a => safeArray(a.bonusList))]) {
    if (bonus.mode !== "percent") continue;
    const target = getEquipBonusTarget(bonus.status);
    if (!target) continue;
    const key = target.percentTarget.replace("system.", "").split(".").pop();
    const current = safeInt(actor.system?.percent_bonus?.[key], 0);
    await actor.update({ [target.percentTarget]: current + safeInt(bonus.value, 0) });
  }

  const effectData = buildEquipmentEffect(item);
  if (!effectData) return null;

  const created = await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
  const effect = created?.[0];
  if (effect && item.id) {
    await effect.setFlag("ffrpg3e", "sourceItemId", item.id);
  }

  await actor.prepareData();

  return effect;
}

export async function removeEquipmentEffect(actor, itemId) {
  const effect = findEquipmentEffect(actor, itemId);
  if (!effect) return false;

  const item = actor.items.find(i => i.id === itemId);
  if (item) {
    const sistema = item.system || {};
      const abilities = safeArray(sistema.abilities);

    for (const bonus of [...safeArray(sistema.bonusList), ...abilities.flatMap(a => safeArray(a.bonusList))]) {
      if (bonus.mode !== "percent") continue;
      const target = getEquipBonusTarget(bonus.status);
      if (!target) continue;
      const key = target.percentTarget.replace("system.", "").split(".").pop();
      const current = safeInt(actor.system?.percent_bonus?.[key], 0);
      await actor.update({ [target.percentTarget]: Math.max(0, current - safeInt(bonus.value, 0)) });
    }
  }

  await actor.deleteEmbeddedDocuments("ActiveEffect", [effect.id], { render: false });

  await actor.prepareData();

  return true;
}
