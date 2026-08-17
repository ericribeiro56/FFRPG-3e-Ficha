import { EFFECT_CATEGORIES } from "./constants.js";

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
    buffs: [],
    debuffs: [],
    permanentes: [],
    condicionais: []
  };

  effects.forEach(efeito => {
    if (efeito.disabled) return;

    const statusArray = Array.isArray(efeito.statuses) ? efeito.statuses : Array.from(efeito.statuses || []);
    if (statusArray.includes("ffrpg3e-equipment")) return;
    if (efeito.flags?.ffrpg3e?.sourceItemId) return;
    const statusId = statusArray[0];
    const chaveIdentificadora = statusId || efeito.name?.toLowerCase().trim();

    const jaExiste = categories.unified.some(e => e.id === efeito.id || (e.statusId && e.statusId === chaveIdentificadora));
    if (jaExiste) return;

    const duracaoObjeto = efeito.duration;
    const temTurnos = duracaoObjeto?.units === "turns" || duracaoObjeto?.units === "rounds";
    const valorTurnos = duracaoObjeto?.turns || duracaoObjeto?.value || duracaoObjeto?.seconds;

    let turnosRestantes = "Permanente";
    if (temTurnos && valorTurnos) {
      turnosRestantes = `${valorTurnos} Turnos Restantes`;
    }

    const item = {
      id: efeito.id,
      name: efeito.name,
      img: efeito.img || "icons/svg/hazard.svg",
      duration: turnosRestantes,
      description: efeito.description || "",
      statusId: chaveIdentificadora,
      category: EFFECT_CATEGORIES.BUFF,
      sourceType: "item"
    };

    categories.unified.push(item);

    if (turnosRestantes === "Permanente") {
      categories.permanentes.push(item);
    } else {
      categories.condicionais.push(item);
    }

    if (efeito.statuses?.includes("agility_up") || efeito.statuses?.includes("spirit_up")) {
      categories.buffs.push(item);
    } else if (efeito.statuses?.includes("agility_down") || efeito.statuses?.includes("spirit_down") || efeito.statuses?.includes("agility_break") || efeito.statuses?.includes("spirit_break")) {
      categories.debuffs.push(item);
    } else {
      categories.buffs.push(item);
    }
  });

  effectContextCache.set(actor, { key: cacheKey, value: categories });

  return categories;
}
