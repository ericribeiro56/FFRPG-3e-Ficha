import { safeInt } from "./utils.js";
import { EQUIPPABLE_BONUS_TARGETS } from "./constants.js";

function buildChange(key, value) {
  const numericValue = safeInt(value, 0);
  if (!key || !numericValue) return null;
  return { key, mode: "add", value: numericValue };
}

export function getEquipBonusTarget(key) {
  return EQUIPPABLE_BONUS_TARGETS.find(t => t.key === key) || null;
}

function hasTag(item, tag) {
  return (item.system?.tags || []).some(t => t === tag);
}

export function determinarSlot(item, actor) {
  if (hasTag(item, "weapon")) {
    if (item.system?.isOffhand) return "offhand";
    if (item.system?.twoHanded) return "main_hand";
    return "main_hand";
  }
  if (hasTag(item, "shield")) return "offhand";
  if (hasTag(item, "armor")) return item.system?.slot || "chestplate";
  if (hasTag(item, "accessory")) {
    const acc1 = actor.items.find(i => i.system?.slot === "accessory_1" && i.system?.equipped && i.id !== item.id);
    if (!acc1) return "accessory_1";
    const acc2 = actor.items.find(i => i.system?.slot === "accessory_2" && i.system?.equipped && i.id !== item.id);
    if (!acc2) return "accessory_2";
    return "accessory_1";
  }
  return null;
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

export function buildEquipmentEffect(item) {
  const sistema = item.system || {};
  const changes = [];
  const flatMap = new Map();

  const bonusList = Array.isArray(sistema.bonusList) ? sistema.bonusList : [];
  const abilities = Array.isArray(sistema.abilities) ? sistema.abilities : [];

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

    const current = flatMap.get(targetPath) || 0;
    flatMap.set(targetPath, current + value);
  }

  for (const ability of abilities) {
    const abilityBonuses = Array.isArray(ability.bonusList) ? ability.bonusList : [];
    for (const bonus of abilityBonuses) {
      if (bonus.mode === "percent") continue;
      const target = getEquipBonusTarget(bonus.status);
      if (!target) continue;

      const value = safeInt(bonus.value, 0);
      if (!value) continue;

      const current = flatMap.get(target.flatTarget) || 0;
      flatMap.set(target.flatTarget, current + value);
    }
  }

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

  for (const bonus of [...bonusList, ...abilities.flatMap(a => Array.isArray(a.bonusList) ? a.bonusList : [])]) {
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

  return effect;
}

export async function removeEquipmentEffect(actor, itemId) {
  const effect = findEquipmentEffect(actor, itemId);
  if (!effect) return false;

  const item = actor.items.find(i => i.id === itemId);
  if (item) {
    const sistema = item.system || {};
    const abilities = Array.isArray(sistema.abilities) ? sistema.abilities : [];

    for (const bonus of [...(Array.isArray(sistema.bonusList) ? sistema.bonusList : []), ...abilities.flatMap(a => Array.isArray(a.bonusList) ? a.bonusList : [])]) {
      if (bonus.mode !== "percent") continue;
      const target = getEquipBonusTarget(bonus.status);
      if (!target) continue;
      const key = target.percentTarget.replace("system.", "").split(".").pop();
      const current = safeInt(actor.system?.percent_bonus?.[key], 0);
      await actor.update({ [target.percentTarget]: Math.max(0, current - safeInt(bonus.value, 0)) });
    }
  }

  await actor.deleteEmbeddedDocuments("ActiveEffect", [effect.id], { render: false });
  return true;
}
