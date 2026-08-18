import { EFFECT_TYPES } from "./constants.js";

const effectContextCache = new WeakMap();

function getCacheKey(actor) {
  const effects = actor.appliedEffects || [];
  const ids = effects.map(e => e.id).sort().join(",");
  return `${actor.id}-${effects.length}-${ids}`;
}

export function buildEffectContext(actor) {
  const cacheKey = getCacheKey(actor);
  const cached = effectContextCache.get(actor);
  if (cached && cached.key === cacheKey) {
    return cached.value;
  }

  const effects = actor.appliedEffects || [];
  const categories = {
    unified: [],
    passiveBuffEffectList: [],
    buffEffectList: [],
    passiveDebuffEffectList: [],
    debuffEffectList: []
  };

  effects.forEach(efeito => {
    if (efeito.disabled) return;

    const flags = efeito.flags?.ffrpg3e || {};
    if (flags.sourceType === "item" && flags.sourceItemId) return;

    const jaExiste = categories.unified.some(e => e.id === efeito.id);
    if (jaExiste) return;

    const effectType = flags.effectType || "buff";
    const isPermanent = flags.permanent === true;
    const duration = efeito.duration;

    let turnosRestantes = "Permanente";
    if (!isPermanent && duration) {
      const temTurnos = duration.units === "turns" || duration.units === "rounds";
      const valorTurnos = duration.turns || duration.value || duration.seconds;
      if (temTurnos && valorTurnos) {
        turnosRestantes = `${valorTurnos} Turnos Restantes`;
      }
    }

    const item = {
      id: efeito.id,
      name: efeito.name,
      img: efeito.img || "icons/svg/hazard.svg",
      duration: turnosRestantes,
      description: efeito.description || "",
      category: effectType,
      sourceType: "item"
    };

    categories.unified.push(item);

    if (effectType === "buff") {
      if (isPermanent) {
        categories.passiveBuffEffectList.push(item);
      } else {
        categories.buffEffectList.push(item);
      }
    } else if (effectType === "debuff") {
      if (isPermanent) {
        categories.passiveDebuffEffectList.push(item);
      } else {
        categories.debuffEffectList.push(item);
      }
    }
  });

  effectContextCache.set(actor, { key: cacheKey, value: categories });

  return categories;
}
