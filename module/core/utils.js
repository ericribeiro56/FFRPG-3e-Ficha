import { GIL_TAX_MULTIPLIERS } from "./constants.js";

export function safeInt(value, fallback = 0) {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function getSafeValue(value, fallback = 0) {
  if (value === undefined || value === null) return fallback;
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
}

export function safeArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

export function datasetInt(element, key, fallback = 0) {
  const raw = element?.dataset?.[key];
  return safeInt(raw, fallback);
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

export function obterModificadorArmadura(valorAtributo) {
  if (!valorAtributo || valorAtributo <= 0) return 1;
  
  const valorLimitado = Math.min(valorAtributo, 30);
  
  return 1 + (Math.ceil(valorLimitado / 2) * 0.05);
}

export function sortByLabel(options) {
  return options.slice().sort((a, b) => ((a.label || a.display || "").localeCompare(b.label || b.display || "")));
}

export function sortObjectByValue(obj) {
  return Object.fromEntries(Object.entries(obj).sort((a, b) => (a[1] || "").localeCompare(b[1] || "")));
}

export function getAttributeValue(dataModel, path) {
  if (!path || typeof path !== "string") return undefined;
  
  // Remove "system." do início se existir
  const cleanPath = path.replace(/^system\./, "");
  
  // Busca o valor de forma segura dentro do modelo de dados
  return foundry.utils.getProperty(dataModel, cleanPath);
}