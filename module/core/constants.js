export const OPCOES_DEFESAS_HP = [
  { value: "arm", label: "ARM" },
  { value: "arm_metade", label: "ARM/2" },
  { value: "armm", label: "ARMM" },
  { value: "armm_metade", label: "ARMM/2" },
  { value: "true_damage", label: "True Damage" }
];

export const OPCOES_PERCENTUAIS_CURA = [
  { value: "0.75", label: "75%" },
  { value: "1.0", label: "100%", checked: true },
  { value: "1.25", label: "125%" }
];

export const opcoesTaxasGil = [
  { value: "0", label: "0%" },
  { value: "1", label: "+5%" },
  { value: "2", label: "-5%" },
  { value: "3", label: "+10%" },
  { value: "4", label: "-10%" },
  { value: "5", label: "+15%" },
  { value: "6", label: "-15%" },
  { value: "7", label: "+20%" },
  { value: "8", label: "-20%" },
  { value: "9", label: "-25%" }
];

export const ATTRIBUTES_KEYS = ["forca", "vitalidade", "agilidade", "velocidade", "magia", "espirito"];
export const COMBAT_KEYS = ["evasao", "evasao_magica", "armadura", "armadura_magica", "precisao", "precisao_magica", "destreza", "mente", "expert"];
export const MODIFICADORES_STATUS = {
  agility_up: 1.25,
  agility_down: 0.75,
  agility_break: 0.50,
  spirit_up: 1.25,
  spirit_down: 0.75,
  spirit_break: 0.50
};

export const EFFECT_CATEGORIES = {
  BUFF: "buff",
  DEBUFF: "debuff",
  PERMANENTE: "permanente",
  CONDICIONAL: "condicional"
};

export const ITEM_TYPES = {
  JOB: "job",
  RACE: "race",
  EFFECT: "effects",
  EQUIPMENT: "equipment"
};

export const ARMOR_SLOTS = {
  helmet: "Capacete",
  chestplate: "Armadura",
  arms: "Braçadeiras",
  shield: "Escudo",
  accessory: "Acessório"
};

export const INVENTORY_SLOT_TAG_MAP = {
  helmet: "armors",
  chestplate: "armors",
  arms: "armors",
  accessory: "accessories",
  shield: "shields",
  weapon: "weapons",
  key: "key",
  heal: "heal",
  combat: "combat",
  support: "support",
  ammo: "ammo"
};


export const WEAPON_DAMAGE_TYPE = {
  magic: "Mágico",
  physical: "Físico"
}

export const WEAPON_TYPES = {
  bow: "Arco",
  firearms: "Arma de Fogo",
  haste: "Arma de Haste",
  missile: "Arma de Projétil",
  bigsword: "Bastarda",
  bat: "Bastão",
  crossbow: "Besta",
  boomerang: "Boomerang",
  staves: "Cajado",
  whipe: "Chicote",
  swords: "Espada",
  lightswords: "Espadas Leve",
  knife: "Faca",
  ninjaknife: "Faca Ninja",
  claw: "Garras",
  musical: "Instrumento M.",
  kanata: "Katana",
  gloves: "Luvas",
  axes: "Machados",
  swallow: "Swallow"
};

export const TIERS = Object.freeze(
  Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i + 1, String(i + 1)]))
);

export const EQUIPPABLE_BONUS_TARGETS = [
  { key: "forca", display: "Força", displayShort: "FOR", category: "attributes", flatTarget: "system.atributos.forca.bonus", percentTarget: "system.percent_bonus.forca" },
  { key: "vitalidade", display: "Vitalidade", displayShort: "VIT", category: "attributes", flatTarget: "system.atributos.vitalidade.bonus", percentTarget: "system.percent_bonus.vitalidade" },
  { key: "agilidade", display: "Agilidade", displayShort: "AGI", category: "attributes", flatTarget: "system.atributos.agilidade.bonus", percentTarget: "system.percent_bonus.agilidade" },
  { key: "velocidade", display: "Velocidade", displayShort: "VEL", category: "attributes", flatTarget: "system.atributos.velocidade.bonus", percentTarget: "system.percent_bonus.velocidade" },
  { key: "magia", display: "Magia", displayShort: "MAG", category: "attributes", flatTarget: "system.atributos.magia.bonus", percentTarget: "system.percent_bonus.magia" },
  { key: "espirito", display: "Espírito", displayShort: "ESP", category: "attributes", flatTarget: "system.atributos.espirito.bonus", percentTarget: "system.percent_bonus.espirito" },
  { key: "armadura", display: "Armadura", displayShort: "ARM", category: "combat", flatTarget: "system.combate.armadura.bonus", percentTarget: "system.percent_bonus.armadura" },
  { key: "armadura_magica", display: "Armadura Mágica", displayShort: "ARMM", category: "combat", flatTarget: "system.combate.armadura_magica.bonus", percentTarget: "system.percent_bonus.armadura_magica" },
  { key: "evasao", display: "Evasão", displayShort: "EVA", category: "combat", flatTarget: "system.combate.evasao.bonus", percentTarget: "system.percent_bonus.evasao" },
  { key: "evasao_magica", display: "Evasão Mágica", displayShort: "EVAM", category: "combat", flatTarget: "system.combate.evasao_magica.bonus", percentTarget: "system.percent_bonus.evasao_magica" },
  { key: "precisao", display: "Precisão", displayShort: "PRE", category: "combat", flatTarget: "system.combate.precisao.bonus", percentTarget: "system.percent_bonus.precisao" },
  { key: "precisao_magica", display: "Precisão Mágica", displayShort: "PREM", category: "combat", flatTarget: "system.combate.precisao_magica.bonus", percentTarget: "system.percent_bonus.precisao_magica" },
  { key: "destreza", display: "Destreza", displayShort: "DES", category: "combat", flatTarget: "system.combate.destreza.bonus", percentTarget: "system.percent_bonus.destreza" },
  { key: "mente", display: "Mente", displayShort: "MEN", category: "combat", flatTarget: "system.combate.mente.bonus", percentTarget: "system.percent_bonus.mente" },
  { key: "expert", display: "Expert", displayShort: "EXP", category: "combat", flatTarget: "system.combate.expert.bonus", percentTarget: "system.percent_bonus.expert" },
  { key: "crit", display: "Crítico", displayShort: "CRIT", category: "combat", flatTarget: "system.combate.critical_chance", percentTarget: "system.percent_bonus.critical" },
  { key: "damage", display: "Dano", displayShort: "DMG", category: "combat", flatTarget: "system.combate.damage_bonus", percentTarget: "system.percent_bonus.damage" },
  { key: "hp", display: "HP Máx", displayShort: "HP", category: "basic", flatTarget: "system.hp.bonus", percentTarget: "system.percent_bonus.hp" },
  { key: "mp", display: "MP Máx", displayShort: "MP", category: "basic", flatTarget: "system.mp.bonus", percentTarget: "system.percent_bonus.mp" }
];

export const DEFAULT_BONUS_LIST = [
  { status: "armadura", value: 0, mode: "flat" },
  { status: "armadura_magica", value: 0, mode: "flat" },
  { status: "evasao", value: 0, mode: "flat" },
  { status: "evasao_magica", value: 0, mode: "flat" }
];

export const STATUS_LABELS = {
  "system.atributos.forca.total": "FOR",
  "system.atributos.vitalidade.total": "VIT",
  "system.atributos.agilidade.total": "AGI",
  "system.atributos.velocidade.total": "VEL",
  "system.atributos.magia.total": "MAG",
  "system.atributos.espirito.total": "ESP"
};

export const ITEM_TYPE_CATEGORY_MAP = {
  gear_weapon: "weapon",
  gear_armor: "armor",
  gear_consumable: "consumable"
};

export const GEAR_ITEM_TYPES = Object.keys(ITEM_TYPE_CATEGORY_MAP);

export const GEAR_TYPES = {
  WEAPON: "gear_weapon",
  ARMOR: "gear_armor",
  CONSUMABLE: "gear_consumable"
};

export const GIL_TAX_MULTIPLIERS = {
  "0": 1.0,
  "1": 1.05,
  "2": 0.95,
  "3": 1.10,
  "4": 0.90,
  "5": 1.15,
  "6": 0.85,
  "7": 1.20,
  "8": 0.80,
  "9": 0.75
};

export const CLASS_LIST = {
  warrior: "Guerreiro",
  expert: "Expert",
  mage: "Mago",
  adept: "Adepto"
}