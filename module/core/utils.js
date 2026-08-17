import { GIL_TAX_MULTIPLIERS } from "./constants.js";

export function safeInt(value, fallback = 0) {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function normalizeName(name) {
  return name?.toLowerCase().trim() ?? "";
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function safeArrayCopy(source) {
  return Array.isArray(source) ? [...source] : [];
}

export function formatDatePtBR(date = new Date()) {
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).replace(",", " -");
}

export function applyGilTax(amount, taxKey = "0") {
  const quantidade = Math.abs(amount);
  const multiplicador = GIL_TAX_MULTIPLIERS[taxKey] ?? 1.0;
  return Math.round(quantidade * multiplicador);
}

export function getEffectDurationText(effect, fallback = "Permanente") {
  const duracaoObjeto = effect.duration;
  const temTurnos = duracaoObjeto?.units === "turns" || duracaoObjeto?.units === "rounds";
  const valorTurnos = duracaoObjeto?.value || effect.toObject?.().duration?.value;
  
  if (temTurnos && valorTurnos) {
    return `${valorTurnos} Turnos Restantes`;
  }
  
  return fallback;
}

export function getEffectDurationTurns(effect, fallback = 3) {
  return effect.duration?.turns ?? fallback;
}

export function findItemByTypeAndName(collection, type, name) {
  return collection.find(i => {
    const bateTipo = i.type === type;
    const bateNome = normalizeName(i.name) === normalizeName(name);
    const estaNoBanco = collection.has(i.id);
    return bateTipo && bateNome && estaNoBanco;
  });
}

/**
 * Calcula o fator multiplicador baseado na tabela de VIT/SPR (ex: retorna 1.25 para +25%).
 * @param {number} valorAtributo - O valor total atual de VIT ou SPR.
 * @returns {number} O fator multiplicador pronto (ex: 1.25 para multiplicar direto).
 */
export function obterModificadorArmadura(valorAtributo) {
  if (!valorAtributo || valorAtributo <= 0) return 1; // Retorna 1 se for zero (Armadura * 1 = Armadura)
  
  const valorLimitado = Math.min(valorAtributo, 30);
  
  // Somando 1 no início, a tabela passa a dar resultados entre 1.05 e 1.75
  return 1 + (Math.ceil(valorLimitado / 2) * 0.05);
}
