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

export const ATTRIBUTES_KEYS = ["strength", "vitality", "agility", "speed", "magic", "spirit"];
export const COMBAT_KEYS = ["evasion", "magicEvasion", "armor", "magicArmor", "precision", "magicAccuracy", "dexterity", "mind", "expert"];
export const MODIFICADORES_STATUS = {
  agility_up: 1.25,
  agility_down: 0.75,
  agility_break: 0.50,
  spirit_up: 1.25,
  spirit_down: 0.75,
  spirit_break: 0.50
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

export const EFFECT_TYPES = {
  buff: "Buff",
  debuff: "Debuff"
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
  { key: "strength", display: "Força", displayShort: "FOR", category: "attributes", flatTarget: "system.attributes.strength.bonus", percentTarget: "system.percent_bonus.strength" },
  { key: "vitality", display: "Vitalidade", displayShort: "VIT", category: "attributes", flatTarget: "system.attributes.vitality.bonus", percentTarget: "system.percent_bonus.vitality" },
  { key: "agility", display: "Agilidade", displayShort: "AGI", category: "attributes", flatTarget: "system.attributes.agility.bonus", percentTarget: "system.percent_bonus.agility" },
  { key: "speed", display: "Velocidade", displayShort: "VEL", category: "attributes", flatTarget: "system.attributes.speed.bonus", percentTarget: "system.percent_bonus.speed" },
  { key: "magic", display: "Magia", displayShort: "MAG", category: "attributes", flatTarget: "system.attributes.magic.bonus", percentTarget: "system.percent_bonus.magic" },
  { key: "spirit", display: "Espírito", displayShort: "ESP", category: "attributes", flatTarget: "system.attributes.spirit.bonus", percentTarget: "system.percent_bonus.spirit" },
  { key: "armor", display: "Armadura", displayShort: "ARM", category: "combat", flatTarget: "system.combat.armor.bonus", percentTarget: "system.percent_bonus.armor" },
  { key: "magicArmor", display: "Armadura Mágica", displayShort: "ARMM", category: "combat", flatTarget: "system.combat.magicArmor.bonus", percentTarget: "system.percent_bonus.magicArmor" },
  { key: "evasion", display: "Evasão", displayShort: "EVA", category: "combat", flatTarget: "system.combat.evasion.bonus", percentTarget: "system.percent_bonus.evasion" },
  { key: "magicEvasion", display: "Evasão Mágica", displayShort: "EVAM", category: "combat", flatTarget: "system.combat.magicEvasion.bonus", percentTarget: "system.percent_bonus.magicEvasion" },
  { key: "precision", display: "Precisão", displayShort: "PRE", category: "combat", flatTarget: "system.combat.precision.bonus", percentTarget: "system.percent_bonus.precision" },
  { key: "magicAccuracy", display: "Precisão Mágica", displayShort: "PREM", category: "combat", flatTarget: "system.combat.magicAccuracy.bonus", percentTarget: "system.percent_bonus.magicAccuracy" },
  { key: "dexterity", display: "Destreza", displayShort: "DES", category: "combat", flatTarget: "system.combat.dexterity.bonus", percentTarget: "system.percent_bonus.dexterity" },
  { key: "mind", display: "Mente", displayShort: "MEN", category: "combat", flatTarget: "system.combat.mind.bonus", percentTarget: "system.percent_bonus.mind" },
  { key: "expert", display: "Expert", displayShort: "EXP", category: "combat", flatTarget: "system.combat.expert.bonus", percentTarget: "system.percent_bonus.expert" },
  { key: "crit", display: "Crítico", displayShort: "CRIT", category: "combat", flatTarget: "system.combat.critical_chance", percentTarget: "system.percent_bonus.critical" },
  { key: "damage", display: "Dano", displayShort: "DMG", category: "combat", flatTarget: "system.combat.damage_bonus", percentTarget: "system.percent_bonus.damage" },
  { key: "hp", display: "HP Máx", displayShort: "HP", category: "basic", flatTarget: "system.hp.bonus", percentTarget: "system.percent_bonus.hp" },
  { key: "mp", display: "MP Máx", displayShort: "MP", category: "basic", flatTarget: "system.mp.bonus", percentTarget: "system.percent_bonus.mp" }
];

export const DEFAULT_BONUS_LIST = [
  { status: "armor", value: 0, mode: "flat" },
  { status: "magicArmor", value: 0, mode: "flat" },
  { status: "evasion", value: 0, mode: "flat" },
  { status: "magicEvasion", value: 0, mode: "flat" }
];

export const STATUS_LABELS = {
  "system.attributes.strength.total": "FOR",
  "system.attributes.vitality.total": "VIT",
  "system.attributes.agility.total": "AGI",
  "system.attributes.speed.total": "VEL",
  "system.attributes.magic.total": "MAG",
  "system.attributes.spirit.total": "ESP"
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

export const SKILL_JOB_TYPES = {
  active: "Ativa",
  passive: "Passiva"
}

export const PROFICIENCY_BASIC_MAP = [
    {
      groupLabel: "Perícias Artísticas",
      groupMastery: "system.proficiency.performances.mastery",
      list: [
        { key: "system.proficiency.performances.arts", label: "Artes", isBlocked: false },
        { key: "system.proficiency.performances.dance", label: "Dança", isBlocked: false },
        { key: "system.proficiency.performances.instruments", label: "Instrumentos", isBlocked: false },
        { key: "system.proficiency.performances.vocal", label: "Canto", isBlocked: false },
        { key: "system.proficiency.performances.acting", label: "Atuação", isBlocked: false }
      ]
    },
    {
      groupLabel: "Perícias Gerais",
      groupMastery: "system.proficiency.basics.mastery",
      list: [
        { key: "system.proficiency.basics.acrobatics", label: "Acrobacias", isBlocked: false },
        { key: "system.proficiency.basics.awareness", label: "Prontidão", isBlocked: false },
        { key: "system.proficiency.basics.coocking", label: "Culinária", isBlocked: false },
        { key: "system.proficiency.basics.bargain", label: "Negociar", isBlocked: false }
      ]
    },
    {
      groupLabel: "Perícias Técnicas",
      groupMastery: "system.proficiency.crafts.mastery",
      list: [
        { key: "system.proficiency.crafts.alchemic", label: "Alquimia", isBlocked: false },
        { key: "system.proficiency.crafts.explosive", label: "Explosivos", isBlocked: false },
        { key: "system.proficiency.crafts.heal", label: "Cura", isBlocked: false },
        { key: "system.proficiency.crafts.tinkering", label: "Inventar", isBlocked: false },
        { key: "system.proficiency.crafts.repair", label: "Reparos", isBlocked: false },
        { key: "system.proficiency.crafts.system", label: "Sistemas", isBlocked: false },
        { key: "system.proficiency.crafts.vehicle", label: "Veículos", isBlocked: false }
      ]
    },
    {
      groupLabel: "Perícias Sociais",
      groupMastery: "system.proficiency.social.mastery",
      list: [
        { key: "system.proficiency.social.etiquette", label: "Etiqueta", isBlocked: false },
        { key: "system.proficiency.social.intimation", label: "Intimidação", isBlocked: false },
        { key: "system.proficiency.social.leadership", label: "Liderança", isBlocked: false },
        { key: "system.proficiency.social.deception", label: "Lábia", isBlocked: false },
        { key: "system.proficiency.social.seduction", label: "Sedução", isBlocked: false }
      ]
    },
    {
      groupLabel: "Perícias com Armas",
      groupMastery: "system.proficiency.weapons.mastery",
      isWeapons: true,
      hasModifiers: true,
      list: [
        { key: "system.proficiency.weapons.axe", label: "Machados", isBlocked: false },
        { key: "system.proficiency.weapons.bow", label: "Arcos", isBlocked: false },
        { key: "system.proficiency.weapons.fight", label: "Briga", isBlocked: false },
        { key: "system.proficiency.weapons.staff", label: "Cajados", isBlocked: false },
        { key: "system.proficiency.weapons.whip", label: "Chicotes", isBlocked: false },
        { key: "system.proficiency.weapons.fire_weapon", label: "Armas de Fogo", isBlocked: false },
        { key: "system.proficiency.weapons.knife", label: "Facas", isBlocked: false },
        { key: "system.proficiency.weapons.haste", label: "Armas de Haste", isBlocked: false },
        { key: "system.proficiency.weapons.sword", label: "Espadas", isBlocked: false },
        { key: "system.proficiency.weapons.throw", label: "Armas de Arremesso", isBlocked: false },
        { key: "system.proficiency.weapons.two_weapon", label: "Duas Armas", isBlocked: false },
        { key: "system.proficiency.weapons.fixed_weapon", label: "S. de Armas", isBlocked: false },
        { key: "system.proficiency.performances.instruments", label: "Instrumentos" , isBlocked: true },
      ]
    },
    {
      groupLabel: "Perícias Selvagens",
      groupMastery: "system.proficiency.wilds.mastery",
      list: [
        { key: "system.proficiency.wilds.animal_training", label: "Treinar Animais", isBlocked: false },
        { key: "system.proficiency.wilds.climbing", label: "Escalada", isBlocked: false },
        { key: "system.proficiency.wilds.navigation", label: "Navegação", isBlocked: false },
        { key: "system.proficiency.wilds.loot", label: "Pilhagem", isBlocked: false },
        { key: "system.proficiency.wilds.ride", label: "Cavalgar", isBlocked: false },
        { key: "system.proficiency.wilds.survival", label: "Sobrevivência", isBlocked: false },
        { key: "system.proficiency.wilds.swimming", label: "Natação", isBlocked: false },
        { key: "system.proficiency.wilds.tracker", label: "Rastreamento", isBlocked: false }
      ]
    },
    {
      groupLabel: "Perícias Ladinas",
      groupMastery: "system.proficiency.underworld.mastery",
      list: [
        { key: "system.proficiency.underworld.disguise", label: "Disfarces", isBlocked: false },
        { key: "system.proficiency.underworld.escape", label: "Fuga", isBlocked: false },
        { key: "system.proficiency.underworld.games", label: "Jogos", isBlocked: false },
        { key: "system.proficiency.underworld.lockpick", label: "Abrir Fechaduras", isBlocked: false },
        { key: "system.proficiency.underworld.pickpocket", label: "Punga", isBlocked: false },
        { key: "system.proficiency.underworld.stealth", label: "Furtividade", isBlocked: false },
        { key: "system.proficiency.underworld.streetwise", label: "Manha", isBlocked: false },
        { key: "system.proficiency.underworld.trap", label: "Armadilhas", isBlocked: false }
      ]
    },
    {
      groupLabel: "Ofícios",
      groupMastery: "system.proficiency.academics.mastery",
      list: [
        { key: "system.proficiency.academics.investigation", label: "Investigação", isBlocked: false },
        { key: "system.proficiency.academics.carpinter", label: "Carpinteiro", isBlocked: false },
        { key: "system.proficiency.academics.jeweler", label: "Joalheiro", isBlocked: false },
        { key: "system.proficiency.academics.armorsmith", label: "Armeiro", isBlocked: false },
        { key: "system.proficiency.academics.tailor", label: "Alfaiate", isBlocked: false },
        { key: "system.proficiency.academics.sculpor", label: "Escultor", isBlocked: false }
      ]
    }
  ];
