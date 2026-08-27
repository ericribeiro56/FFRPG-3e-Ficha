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
  consumable: "consumable"
};

export const GEAR_ITEM_TYPES = Object.keys(ITEM_TYPE_CATEGORY_MAP);

export const GEAR_TYPES = {
  WEAPON: "gear_weapon",
  ARMOR: "gear_armor",
  CONSUMABLE: "consumable"
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

export const CONSUMABLE_TYPES = {
  key: "Importante",
  heal: "Cura/Consumivel",
  support: "Suporte",
  combat: "Combate",
  ammo: "Projétil/Munição",
  other: "Outros",
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

export const ROLL_FORMULA_TARGETS = [
  { key: "system.attributes.strength.base", nameReff: ["FORCA_BASE", "FOR_BASE"] },
  { key: "system.attributes.strength.total", nameReff: ["FORCA_TOTAL", "FOR_TOTAL"] },
  { key: "system.attributes.vitality.base", nameReff: ["VITALIDADE_BASE", "VIT_BASE"] },
  { key: "system.attributes.vitality.total", nameReff: ["VITALIDADE_TOTAL", "VIT_TOTAL"] },
  { key: "system.attributes.agility.base", nameReff: ["AGILIDADE_BASE", "AGI_BASE"] },
  { key: "system.attributes.agility.total", nameReff: ["AGILIDADE_TOTAL", "AGI_TOTAL"] },
  { key: "system.attributes.speed.base", nameReff: ["VELOCIDADE_BASE", "VEL_BASE"] },
  { key: "system.attributes.speed.total", nameReff: ["VELOCIDADE_TOTAL", "VEL_TOTAL"] },
  { key: "system.attributes.magic.base", nameReff: ["MAGIA_BASE", "MAG_BASE"] },
  { key: "system.attributes.magic.total", nameReff: ["MAGIA_TOTAL", "MAG_TOTAL"] },
  { key: "system.attributes.spirit.base", nameReff: ["ESPIRITO_BASE", "ESP_BASE"] },
  { key: "system.attributes.spirit.total", nameReff: ["ESPIRITO_TOTAL", "ESP_TOTAL"] },
  { key: "system.combat.evasion.base", nameReff: ["EVASAO_BASE", "EVA_BASE"] },
  { key: "system.combat.evasion.total", nameReff: ["EVASAO_TOTAL", "EVA_TOTAL"] },
  { key: "system.combat.magicEvasion.base", nameReff: ["EVASAO_MAGICA_BASE", "EVAM_BASE"] },
  { key: "system.combat.magicEvasion.total", nameReff: ["EVASAO_MAGICA_TOTAL", "EVAM_TOTAL"] },
  { key: "system.combat.armor.base", nameReff: ["ARMADURA_BASE", "ARM_BASE"] },
  { key: "system.combat.armor.total", nameReff: ["ARMADURA_TOTAL", "ARM_TOTAL"] },
  { key: "system.combat.magicArmor.base", nameReff: ["ARMADURA_MAGICA_BASE", "ARMM_BASE"] },
  { key: "system.combat.magicArmor.total", nameReff: ["ARMADURA_MAGICA_TOTAL", "ARMM_TOTAL"] },
  { key: "system.combat.precision.base", nameReff: ["PRECISAO_BASE", "PRE_BASE"] },
  { key: "system.combat.precision.total", nameReff: ["PRECISAO_TOTAL", "PRE_TOTAL"] },
  { key: "system.combat.magicAccuracy.base", nameReff: ["PRECISAO_MAGICA_BASE", "PREM_BASE"] },
  { key: "system.combat.magicAccuracy.total", nameReff: ["PRECISAO_MAGICA_TOTAL", "PREM_TOTAL"] },
  { key: "system.combat.dexterity.base", nameReff: ["DESTREZA_BASE", "DES_BASE"] },
  { key: "system.combat.dexterity.total", nameReff: ["DESTREZA_TOTAL", "DES_TOTAL"] },
  { key: "system.combat.mind.base", nameReff: ["MENTE_BASE", "MEN_BASE"] },
  { key: "system.combat.mind.total", nameReff: ["MENTE_TOTAL", "MEN_TOTAL"] },
  { key: "system.combat.expert.base", nameReff: ["EXPERT_BASE", "EXP_BASE"] },
  { key: "system.combat.expert.total", nameReff: ["EXPERT_TOTAL", "EXP_TOTAL"] },
  { key: "system.combat.critical_chance.base", nameReff: ["CRITICO_BASE", "CRIT_BASE"] },
  { key: "system.combat.critical_chance.total", nameReff: ["CRITICO_TOTAL", "CRIT_TOTAL"] },
  { key: "system.combat.damage_bonus.base", nameReff: ["DANO_BASE", "DMG_BASE"] },
  { key: "system.combat.damage_bonus.total", nameReff: ["DANO_TOTAL", "DMG_TOTAL"] },
  { key: "system.proficiency.performances.arts.base", nameReff: ["ARTES_BASE", "ARTES_BASE"] },
  { key: "system.proficiency.performances.arts.total", nameReff: ["ARTES_TOTAL", "ARTES_TOTAL"] },
  { key: "system.proficiency.performances.dance.base", nameReff: ["DANCA_BASE", "DANCA_BASE"] },
  { key: "system.proficiency.performances.dance.total", nameReff: ["DANCA_TOTAL", "DANCA_TOTAL"] },
  { key: "system.proficiency.performances.instruments.base", nameReff: ["INSTRUMENTOS_BASE", "INSTRUMENTOS_BASE"] },
  { key: "system.proficiency.performances.instruments.total", nameReff: ["INSTRUMENTOS_TOTAL", "INSTRUMENTOS_TOTAL"] },
  { key: "system.proficiency.performances.vocal.base", nameReff: ["CANTO_BASE", "CANTO_BASE"] },
  { key: "system.proficiency.performances.vocal.total", nameReff: ["CANTO_TOTAL", "CANTO_TOTAL"] },
  { key: "system.proficiency.performances.acting.base", nameReff: ["ATUACAO_BASE", "ATUACAO_BASE"] },
  { key: "system.proficiency.performances.acting.total", nameReff: ["ATUACAO_TOTAL", "ATUACAO_TOTAL"] },
  { key: "system.proficiency.basics.acrobatics.base", nameReff: ["ACROBACIA_BASE", "ACROB_BASE"] },
  { key: "system.proficiency.basics.acrobatics.total", nameReff: ["ACROBACIA_TOTAL", "ACROB_TOTAL"] },
  { key: "system.proficiency.basics.awareness.base", nameReff: ["PRONTIDAO_BASE", "PRONTO_BASE"] },
  { key: "system.proficiency.basics.awareness.total", nameReff: ["PRONTIDAO_TOTAL", "PRONTO_TOTAL"] },
  { key: "system.proficiency.basics.coocking.base", nameReff: ["CULINARIA_BASE", "COOK_BASE"] },
  { key: "system.proficiency.basics.coocking.total", nameReff: ["CULINARIA_TOTAL", "COOK_TOTAL"] },
  { key: "system.proficiency.basics.bargain.base", nameReff: ["NEGOCIAR_BASE", "NEGOC_BASE"] },
  { key: "system.proficiency.basics.bargain.total", nameReff: ["NEGOCIAR_TOTAL", "NEGOC_TOTAL"] },
  { key: "system.proficiency.crafts.alchemic.base", nameReff: ["ALQUIMIA_BASE", "ALQ_BASE"] },
  { key: "system.proficiency.crafts.alchemic.total", nameReff: ["ALQUIMIA_TOTAL", "ALQ_TOTAL"] },
  { key: "system.proficiency.crafts.explosive.base", nameReff: ["EXPLOSIVOS_BASE", "EXPL_BASE"] },
  { key: "system.proficiency.crafts.explosive.total", nameReff: ["EXPLOSIVOS_TOTAL", "EXPL_TOTAL"] },
  { key: "system.proficiency.crafts.heal.base", nameReff: ["CURA_BASE", "CURA_BASE"] },
  { key: "system.proficiency.crafts.heal.total", nameReff: ["CURA_TOTAL", "CURA_TOTAL"] },
  { key: "system.proficiency.crafts.tinkering.base", nameReff: ["INVENTAR_BASE", "INV_BASE"] },
  { key: "system.proficiency.crafts.tinkering.total", nameReff: ["INVENTAR_TOTAL", "INV_TOTAL"] },
  { key: "system.proficiency.crafts.repair.base", nameReff: ["REPAROS_BASE", "REP_BASE"] },
  { key: "system.proficiency.crafts.repair.total", nameReff: ["REPAROS_TOTAL", "REP_TOTAL"] },
  { key: "system.proficiency.crafts.system.base", nameReff: ["SISTEMAS_BASE", "SIST_BASE"] },
  { key: "system.proficiency.crafts.system.total", nameReff: ["SISTEMAS_TOTAL", "SIST_TOTAL"] },
  { key: "system.proficiency.crafts.vehicle.base", nameReff: ["VEICULOS_BASE", "VEIC_BASE"] },
  { key: "system.proficiency.crafts.vehicle.total", nameReff: ["VEICULOS_TOTAL", "VEIC_TOTAL"] },
  { key: "system.proficiency.social.etiquette.base", nameReff: ["ETIQUETA_BASE", "ETIQ_BASE"] },
  { key: "system.proficiency.social.etiquette.total", nameReff: ["ETIQUETA_TOTAL", "ETIQ_TOTAL"] },
  { key: "system.proficiency.social.intimation.base", nameReff: ["INTIMIDACAO_BASE", "INTIM_BASE"] },
  { key: "system.proficiency.social.intimation.total", nameReff: ["INTIMIDACAO_TOTAL", "INTIM_TOTAL"] },
  { key: "system.proficiency.social.leadership.base", nameReff: ["LIDERANCA_BASE", "LID_BASE"] },
  { key: "system.proficiency.social.leadership.total", nameReff: ["LIDERANCA_TOTAL", "LID_TOTAL"] },
  { key: "system.proficiency.social.deception.base", nameReff: ["LABIA_BASE", "LABIA_BASE"] },
  { key: "system.proficiency.social.deception.total", nameReff: ["LABIA_TOTAL", "LABIA_TOTAL"] },
  { key: "system.proficiency.social.seduction.base", nameReff: ["SEDUCAO_BASE", "SED_BASE"] },
  { key: "system.proficiency.social.seduction.total", nameReff: ["SEDUCAO_TOTAL", "SED_TOTAL"] },
  { key: "system.proficiency.weapons.axe.base", nameReff: ["MACHADOS_BASE", "MACH_BASE"] },
  { key: "system.proficiency.weapons.axe.total", nameReff: ["MACHADOS_TOTAL", "MACH_TOTAL"] },
  { key: "system.proficiency.weapons.bow.base", nameReff: ["ARCOS_BASE", "ARCO_BASE"] },
  { key: "system.proficiency.weapons.bow.total", nameReff: ["ARCOS_TOTAL", "ARCO_TOTAL"] },
  { key: "system.proficiency.weapons.fight.base", nameReff: ["BRIGA_BASE", "BRIGA_BASE"] },
  { key: "system.proficiency.weapons.fight.total", nameReff: ["BRIGA_TOTAL", "BRIGA_TOTAL"] },
  { key: "system.proficiency.weapons.staff.base", nameReff: ["CAJADOS_BASE", "CAJ_BASE"] },
  { key: "system.proficiency.weapons.staff.total", nameReff: ["CAJADOS_TOTAL", "CAJ_TOTAL"] },
  { key: "system.proficiency.weapons.whip.base", nameReff: ["CHICOTES_BASE", "CHIC_BASE"] },
  { key: "system.proficiency.weapons.whip.total", nameReff: ["CHICOTES_TOTAL", "CHIC_TOTAL"] },
  { key: "system.proficiency.weapons.fire_weapon.base", nameReff: ["ARMAS_DE_FOGO_BASE", "ARMF_BASE"] },
  { key: "system.proficiency.weapons.fire_weapon.total", nameReff: ["ARMAS_DE_FOGO_TOTAL", "ARMF_TOTAL"] },
  { key: "system.proficiency.weapons.knife.base", nameReff: ["FACAS_BASE", "FACA_BASE"] },
  { key: "system.proficiency.weapons.knife.total", nameReff: ["FACAS_TOTAL", "FACA_TOTAL"] },
  { key: "system.proficiency.weapons.haste.base", nameReff: ["ARMAS_DE_HASTE_BASE", "HASTE_BASE"] },
  { key: "system.proficiency.weapons.haste.total", nameReff: ["ARMAS_DE_HASTE_TOTAL", "HASTE_TOTAL"] },
  { key: "system.proficiency.weapons.sword.base", nameReff: ["ESPADAS_BASE", "ESP_BASE"] },
  { key: "system.proficiency.weapons.sword.total", nameReff: ["ESPADAS_TOTAL", "ESP_TOTAL"] },
  { key: "system.proficiency.weapons.throw.base", nameReff: ["ARMAS_DE_ARREMESSO_BASE", "ARR_BASE"] },
  { key: "system.proficiency.weapons.throw.total", nameReff: ["ARMAS_DE_ARREMESSO_TOTAL", "ARR_TOTAL"] },
  { key: "system.proficiency.weapons.two_weapon.base", nameReff: ["DUAS_ARMAS_BASE", "DUAS_BASE"] },
  { key: "system.proficiency.weapons.two_weapon.total", nameReff: ["DUAS_ARMAS_TOTAL", "DUAS_TOTAL"] },
  { key: "system.proficiency.weapons.fixed_weapon.base", nameReff: ["S_DE_ARMAS_BASE", "SARM_BASE"] },
  { key: "system.proficiency.weapons.fixed_weapon.total", nameReff: ["S_DE_ARMAS_TOTAL", "SARM_TOTAL"] },
  { key: "system.proficiency.wilds.animal_training.base", nameReff: ["TREINAR_ANIMAIS_BASE", "ANIM_BASE"] },
  { key: "system.proficiency.wilds.animal_training.total", nameReff: ["TREINAR_ANIMAIS_TOTAL", "ANIM_TOTAL"] },
  { key: "system.proficiency.wilds.climbing.base", nameReff: ["ESCALADA_BASE", "ESC_BASE"] },
  { key: "system.proficiency.wilds.climbing.total", nameReff: ["ESCALADA_TOTAL", "ESC_TOTAL"] },
  { key: "system.proficiency.wilds.navigation.base", nameReff: ["NAVEGACAO_BASE", "NAV_BASE"] },
  { key: "system.proficiency.wilds.navigation.total", nameReff: ["NAVEGACAO_TOTAL", "NAV_TOTAL"] },
  { key: "system.proficiency.wilds.loot.base", nameReff: ["PILHAGEM_BASE", "PILH_BASE"] },
  { key: "system.proficiency.wilds.loot.total", nameReff: ["PILHAGEM_TOTAL", "PILH_TOTAL"] },
  { key: "system.proficiency.wilds.ride.base", nameReff: ["CAVALGAR_BASE", "CAV_BASE"] },
  { key: "system.proficiency.wilds.ride.total", nameReff: ["CAVALGAR_TOTAL", "CAV_TOTAL"] },
  { key: "system.proficiency.wilds.survival.base", nameReff: ["SOBREVIVENCIA_BASE", "SOBR_BASE"] },
  { key: "system.proficiency.wilds.survival.total", nameReff: ["SOBREVIVENCIA_TOTAL", "SOBR_TOTAL"] },
  { key: "system.proficiency.wilds.swimming.base", nameReff: ["NATACAO_BASE", "NAT_BASE"] },
  { key: "system.proficiency.wilds.swimming.total", nameReff: ["NATACAO_TOTAL", "NAT_TOTAL"] },
  { key: "system.proficiency.wilds.tracker.base", nameReff: ["RASTREAMENTO_BASE", "RAST_BASE"] },
  { key: "system.proficiency.wilds.tracker.total", nameReff: ["RASTREAMENTO_TOTAL", "RAST_TOTAL"] },
  { key: "system.proficiency.underworld.disguise.base", nameReff: ["DISFARCES_BASE", "DISF_BASE"] },
  { key: "system.proficiency.underworld.disguise.total", nameReff: ["DISFARCES_TOTAL", "DISF_TOTAL"] },
  { key: "system.proficiency.underworld.escape.base", nameReff: ["FUGA_BASE", "FUGA_BASE"] },
  { key: "system.proficiency.underworld.escape.total", nameReff: ["FUGA_TOTAL", "FUGA_TOTAL"] },
  { key: "system.proficiency.underworld.games.base", nameReff: ["JOGOS_BASE", "JOG_BASE"] },
  { key: "system.proficiency.underworld.games.total", nameReff: ["JOGOS_TOTAL", "JOG_TOTAL"] },
  { key: "system.proficiency.underworld.lockpick.base", nameReff: ["ABRIR_FECHADURAS_BASE", "FECH_BASE"] },
  { key: "system.proficiency.underworld.lockpick.total", nameReff: ["ABRIR_FECHADURAS_TOTAL", "FECH_TOTAL"] },
  { key: "system.proficiency.underworld.pickpocket.base", nameReff: ["PUNGA_BASE", "PUNG_BASE"] },
  { key: "system.proficiency.underworld.pickpocket.total", nameReff: ["PUNGA_TOTAL", "PUNG_TOTAL"] },
  { key: "system.proficiency.underworld.stealth.base", nameReff: ["FURTIVIDADE_BASE", "FURT_BASE"] },
  { key: "system.proficiency.underworld.stealth.total", nameReff: ["FURTIVIDADE_TOTAL", "FURT_TOTAL"] },
  { key: "system.proficiency.underworld.streetwise.base", nameReff: ["MANHA_BASE", "MANHA_BASE"] },
  { key: "system.proficiency.underworld.streetwise.total", nameReff: ["MANHA_TOTAL", "MANHA_TOTAL"] },
  { key: "system.proficiency.underworld.trap.base", nameReff: ["ARMADILHAS_BASE", "TRAP_BASE"] },
  { key: "system.proficiency.underworld.trap.total", nameReff: ["ARMADILHAS_TOTAL", "TRAP_TOTAL"] },
  { key: "system.proficiency.academics.investigation.base", nameReff: ["INVESTIGACAO_BASE", "INVEST_BASE"] },
  { key: "system.proficiency.academics.investigation.total", nameReff: ["INVESTIGACAO_TOTAL", "INVEST_TOTAL"] },
  { key: "system.proficiency.academics.carpinter.base", nameReff: ["CARPINTEIRO_BASE", "CARP_BASE"] },
  { key: "system.proficiency.academics.carpinter.total", nameReff: ["CARPINTEIRO_TOTAL", "CARP_TOTAL"] },
  { key: "system.proficiency.academics.jeweler.base", nameReff: ["JOALHEIRO_BASE", "JOAL_BASE"] },
  { key: "system.proficiency.academics.jeweler.total", nameReff: ["JOALHEIRO_TOTAL", "JOAL_TOTAL"] },
  { key: "system.proficiency.academics.armorsmith.base", nameReff: ["ARMEIRO_BASE", "ARMEIRO_BASE"] },
  { key: "system.proficiency.academics.armorsmith.total", nameReff: ["ARMEIRO_TOTAL", "ARMEIRO_TOTAL"] },
  { key: "system.proficiency.academics.tailor.base", nameReff: ["ALFAIATE_BASE", "ALF_BASE"] },
  { key: "system.proficiency.academics.tailor.total", nameReff: ["ALFAIATE_TOTAL", "ALF_TOTAL"] },
  { key: "system.proficiency.academics.sculpor.base", nameReff: ["ESCULTOR_BASE", "ESCULT_BASE"] },
  { key: "system.proficiency.academics.sculpor.total", nameReff: ["ESCULTOR_TOTAL", "ESCULT_TOTAL"] }
];
