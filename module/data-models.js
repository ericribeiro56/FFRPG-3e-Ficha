import { safeInt, obterModificadorArmadura, getSafeValue, safeArray, getAttributeValue } from "./core/utils.js";
import { ATTRIBUTES_KEYS, COMBAT_KEYS, ITEM_TYPE_CATEGORY_MAP, MODIFICADORES_STATUS, DEFAULT_BONUS_LIST, EQUIPPABLE_BONUS_TARGETS, PROFICIENCY_BASIC_MAP } from "./core/constants.js";
import { Field } from "./core/fields-utils.js";


export class CharacterData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      level: Field.Number(1, true, false, { min: 1 }),
      hp: Field.Schema({
        base: Field.Number(30),
        bonus: Field.Number(0),
        atual: Field.Number(10),
        total: Field.Number(10)
      }),
      mp: Field.Schema({
        base: Field.Number(5),
        bonus: Field.Number(0),
        atual: Field.Number(5),
        total: Field.Number(5)
      }),
      xp: Field.Schema({
        current: Field.Number(0),
        required: Field.Number(100, true, false, { min: 1 })
      }),

      current_gil: Field.Number(0),
      extract_gil: Field.Array(Field.Object(), []),
      accessory: Field.Array(Field.String(), []),

      percent_bonus: Field.Schema({
        strength: Field.Number(0),
        vitality: Field.Number(0),
        agility: Field.Number(0),
        speed: Field.Number(0),
        magic: Field.Number(0),
        spirit: Field.Number(0),
        armor: Field.Number(0),
        magicArmor: Field.Number(0),
        evasion: Field.Number(0),
        magicEvasion: Field.Number(0),
        precision: Field.Number(0),
        magicAccuracy: Field.Number(0),
        dexterity: Field.Number(0),
        mind: Field.Number(0),
        expert: Field.Number(0),
        hp: Field.Number(0),
        mp: Field.Number(0),
        critical: Field.Number(0),
        damage: Field.Number(1)
      }),

      info: Field.Schema({
        gender: Field.String(""),
        sign: Field.String(""),
        bloodType: Field.String(""),
        age: Field.Number(0),
        height: Field.Number(0),
        weight: Field.Number(0),
        backstory: Field.Rich("", false),
        notes: Field.Rich("", false),
        personality: Field.Rich("", false)
      }),

      attributes: Field.Schema({
        strength: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0),
          limit: Field.Number(0),
          test: Field.Number(0),
          default: Field.Number(0)
        }),
        vitality: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0),
          limit: Field.Number(0),
          test: Field.Number(0),
          default: Field.Number(0)
        }),
        agility: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0),
          limit: Field.Number(0),
          test: Field.Number(0),
          default: Field.Number(0)
        }),
        speed: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0),
          limit: Field.Number(0),
          test: Field.Number(0),
          default: Field.Number(0)
        }),
        magic: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0),
          limit: Field.Number(0),
          test: Field.Number(0),
          default: Field.Number(0)
        }),
        spirit: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0),
          limit: Field.Number(0),
          test: Field.Number(0),
          default: Field.Number(0)
        })
      }),

      combat: Field.Schema({
        evasion: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0)
        }),
        magicEvasion: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0)
        }),
        armor: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0)
        }),
        magicArmor: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0)
        }),
        precision: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0)
        }),
        magicAccuracy: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0)
        }),
        dexterity: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0)
        }),
        mind: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0)
        }),
        expert: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0)
        }),
        critical_chance: Field.Number(0),
        damage_bonus: Field.Number(1)
      }),

      proficiency: Field.Schema({
        max_points: Field.Number(0),
        languages: Field.Array(Field.Schema({
          name: Field.String(""),
          base: Field.Number(0),
          total: Field.Number(0)
        })),
        knowledge: Field.Array(Field.Schema({
          name: Field.String(""),
          base: Field.Number(0),
          total: Field.Number(0)
        })),
        performances: Field.Schema({
          mastery: Field.Boolean(false),
          arts: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          dance: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          instruments: Field.Schema({ active: Field.Boolean(false), base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          vocal: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          acting: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) })
        }),
        basics: Field.Schema({
          mastery: Field.Boolean(false),
          acrobatics: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          awareness: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          coocking: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          bargain: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) })
        }),
        crafts: Field.Schema({
          mastery: Field.Boolean(false),
          alchemic: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          explosive: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          heal: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          tinkering: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          repair: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          system: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          vehicle: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) })
        }),
        social: Field.Schema({
          mastery: Field.Boolean(false),
          etiquette: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          intimation: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          leadership: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          deception: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          seduction: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
        }),
        weapons: Field.Schema({
          mastery: Field.Boolean(false),
          ambimestry: Field.Boolean(false),
          inaptitude: Field.Boolean(false),
          axe: Field.Schema({ active: Field.Boolean(false), base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          bow: Field.Schema({ active: Field.Boolean(false), base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          fight: Field.Schema({ active: Field.Boolean(false), base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          staff: Field.Schema({ active: Field.Boolean(false), base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          whip: Field.Schema({ active: Field.Boolean(false), base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          fire_weapon: Field.Schema({ active: Field.Boolean(false), base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          knife: Field.Schema({ active: Field.Boolean(false), base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          haste: Field.Schema({ active: Field.Boolean(false), base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          sword: Field.Schema({ active: Field.Boolean(false), base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          throw: Field.Schema({ active: Field.Boolean(false), base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          two_weapon: Field.Schema({ active: Field.Boolean(false), base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          fixed_weapon: Field.Schema({ active: Field.Boolean(false), base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) })
        }),
        wilds: Field.Schema({
          mastery: Field.Boolean(false),
          animal_training: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          climbing: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          navigation: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          loot: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          ride: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          survival: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          swimming: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          tracker: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
        }),
        underworld: Field.Schema({
          mastery: Field.Boolean(false),
          disguise: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          escape: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          games: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          lockpick: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          pickpocket: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          stealth: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          streetwise: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          trap: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) })
        }),
        academics: Field.Schema({
          mastery: Field.Boolean(false),
          investigation: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          carpinter: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          jeweler: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          armorsmith: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          tailor: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) }),
          sculpor: Field.Schema({ base: Field.Number(0), bonus: Field.Number(0), total: Field.Number(0) })
        })
      }),

      expert_class: Field.Schema({
        expert_atributo: Field.String(""),
        expert_pericia: Field.String("")
      }),

      progressao_niveis: Field.Object(() => {
        const obj = {};
        for (let i = 1; i <= 99; i++) {
          obj[`nv${i}`] = { dhp: 0, vit: 0, dmp: 0, esp: 0 };
        }
        return obj;
      }),

      progressao_somas_dhp: Field.Number(0, true, false, { min: 0 }),
      progressao_somas_vit: Field.Number(0, true, false, { min: 0 }),
      progressao_somas_dmp: Field.Number(0, true, false, { min: 0 }),
      progressao_somas_esp: Field.Number(0, true, false, { min: 0 }),
    };
  }

  _migrateLegacyFields() {
    const system = this.parent?.system;
    if (!system) return;

    const updates = {};

    if (system.combate && !system.combat) {
      updates["system.combate"] = undefined;
      updates["system.combat"] = system.combate;
    }

    if (system.atributos && !system.attributes) {
      updates["system.atributos"] = undefined;
      updates["system.attributes"] = system.atributos;
    }

    if (system.information && !system.info) {
      updates["system.information"] = undefined;
      updates["system.info"] = system.information;
    }

    if (system.proficiency?.language && !system.proficiency?.languages) {
      updates["system.proficiency.language"] = undefined;
      updates["system.proficiency.languages"] = system.proficiency.language;
    }

    if (system.proficiency?.knowledge?.list && !system.proficiency?.knowledge) {
      updates["system.proficiency.knowledge.list"] = undefined;
      updates["system.proficiency.knowledge"] = system.proficiency.knowledge.list;
    }

    const attrMap = {
      forca: "strength",
      vitalidade: "vitality",
      agilidade: "agility",
      velocidade: "speed",
      magia: "magic",
      espirito: "spirit"
    };

    const attrSource = system.atributos || system.attributes;
    if (attrSource) {
      for (const [oldKey, newKey] of Object.entries(attrMap)) {
        const source = system.atributos ? system.atributos[oldKey] : system.attributes[newKey];
        const target = system.attributes[newKey];

        if (source && target && source.max !== undefined && target.limit === undefined) {
          updates[`system.attributes.${newKey}.limit`] = source.max;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      this.parent.update(updates);
    }
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    if (!this.parent) return;

    this._migrateLegacyFields();

    const attr = this.attributes;
    const comb = this.combat;

    if (!attr || !comb) return;

    
    this._calculateBaseStats();

    
    this._applySoftCap();

    
    this._applyStatusModifiers();

    
    this._applyAttributePercentBonuses();

    
    this._applyHardCap();

    
    this._recalculateCombat();

    
    this._recalculateMaxHpMpByTable();

    
    this._applyCombatPercentBonuses();

    
    this._applyHpMpPercentBonuses();

    
    this._applyArmorModifiers();

    
    this._calculateProficiency();

    
    this._calculateExpertBase();
  }

  _applyAttributePercentBonuses() {
    const attributes = ["strength", "vitality", "agility", "speed", "magic", "spirit"];

    for (const key of attributes) {
      if (this.attributes[key]) {
        this.attributes[key].total = this._applyPercentBonus(this.attributes[key], key);
      }
    }
  }

  _applyCombatPercentBonuses() {
    const combate = ["armor", "magicArmor", "evasion", "magicEvasion", "precision", "magicAccuracy", "dexterity", "mind", "expert"];

    for (const key of combate) {
      if (this.combat[key]) {
        this.combat[key].total = this._applyPercentBonus(this.combat[key], key);
      }
    }
  }

  _applyHpMpPercentBonuses() {

    if (this.hp) {
      const subtotal = getSafeValue(this.hp.base) + getSafeValue(this.hp.bonus);
      this.hp.total = subtotal + (subtotal * (safeInt(this.percent_bonus?.hp, 0) / 100));
    }

    if (this.mp) {
      const subtotal = getSafeValue(this.mp.base) + getSafeValue(this.mp.bonus);
      this.mp.total = subtotal + (subtotal * (safeInt(this.percent_bonus?.mp, 0) / 100));
    }
  }

  _applyArmorModifiers() {
    const attr = this.attributes;
    if (!attr) return;

    const vitality = getSafeValue(attr.vitality?.total);
    const spirit = getSafeValue(attr.spirit?.total);

    if (this.combat.armor) {
      const mod = obterModificadorArmadura(vitality);
      this.combat.armor.total = Math.round(getSafeValue(this.combat.armor.total) * mod);
    }

    if (this.combat.magicArmor) {
      const mod = obterModificadorArmadura(spirit);
      this.combat.magicArmor.total = Math.round(getSafeValue(this.combat.magicArmor.total) * mod);
    }
  }

  _calculateProficiency() {
    const prof = this.proficiency;
    if (!prof) return;

    for (const group of PROFICIENCY_BASIC_MAP) {
      const masteryPath = group.groupMastery;
      const relativeMasteryPath = masteryPath.replace(/^system\./, "");
      const masteryValue = getSafeValue(foundry.utils.getProperty(this, relativeMasteryPath), 0);
      const hasMastery = !!masteryValue;

      for (const skill of group.list) {
        const relativeSkillPath = skill.key.replace(/^system\./, "");
        const skillData = foundry.utils.getProperty(this, relativeSkillPath);
        if (!skillData) continue;

        const base = getSafeValue(skillData.base);
        const bonus = getSafeValue(skillData.bonus);
        skillData.total = hasMastery ? (2 * base) + bonus : base + bonus;
      }
    }

    
    
  }

  _calculateExpertBase() {

    const jobItem = this.parent?.items?.find(i => i.type === "job");

    if (!jobItem) {
      this.combat.expert.base = 0;
      this.combat.expert.total = 0;
      return;
    }

    const jobClasse = jobItem.system?.classe;

    const level = parseInt(this.level || 1, 10);
    const jobName = jobItem.name || "";

    let valorBase = 0;

    if (jobClasse === "expert" && jobName === "Inventor") {

      const tinkeringTotal = getAttributeValue(this, "system.proficiency.crafts.tinkering.total")
      const agilityTotal = getSafeValue(this.attributes.agility.total, 0);

      valorBase = tinkeringTotal + level + (agilityTotal * 2);
    }

    if (jobClasse === "expert" && jobName !== "Inventor") {

      const expertPericia = getSafeValue(getAttributeValue(this, this.expert_class.expert_pericia), 0);
      const expertAtributo = getSafeValue(getAttributeValue(this, this.expert_class.expert_atributo), 0);

      valorBase = safeInt((expertPericia / 2) + level + (expertAtributo * 2));
    }

    this.combat.expert.base = valorBase;

    const bonus = getSafeValue(this.combat.expert.bonus);

    this.combat.expert.total = valorBase + bonus;
  }

  _recalculateMaxHpMpByTable() {
    const nivel = parseInt(this.level || 1, 10);
    const nivelSeguro = Math.max(1, Math.min(nivel, 99));
    const progressao = this.progressao_niveis || {};

    const somas = { dhp: 0, vit: 0, dmp: 0, esp: 0 };
    let somaHpPersonagem = 0;
    let somaMpPersonagem = 0;

    const items = this.parent.items || [];
    let itemJob = null;
    for (const item of items) {
      if (item.type === "job") {
        itemJob = item;
        break;
      }
    }

    const hasMp = itemJob?.system?.possui_mp === true;

    for (let i = 1; i <= 99; i++) {
      const dados = progressao[`nv${i}`] || {};
      const dhp = safeInt(dados.dhp, 0);
      const vit = safeInt(dados.vit, 0);
      const dmp = safeInt(dados.dmp, 0);
      const esp = safeInt(dados.esp, 0);

      somas.dhp += dhp;
      somas.vit += vit;
      somas.dmp += dmp;
      somas.esp += esp;

      if (i <= nivelSeguro) {
        somaHpPersonagem += dhp + vit;
        if (hasMp) {
          somaMpPersonagem += dmp + esp;
        }
      }
    }

    this.hp.base = 30 + somaHpPersonagem;
    this.mp.base = hasMp ? (10 + somaMpPersonagem) : 0;
    this.xp.required = 500 * nivelSeguro;

    this.progressao_somas_dhp = somas.dhp;
    this.progressao_somas_vit = somas.vit;
    this.progressao_somas_dmp = somas.dmp;
    this.progressao_somas_esp = somas.esp;
  }

  _calculateBaseStats() {
    for (const chave of ATTRIBUTES_KEYS) {
      if (this.attributes[chave]) {
        this.attributes[chave].total = getSafeValue(this.attributes[chave].base) + getSafeValue(this.attributes[chave].bonus);
      }
    }
  }

  _applySoftCap() {
    const limites = this._getSoftCapLimits();

    for (const chave of ATTRIBUTES_KEYS) {
      if (this.attributes[chave]) {
        this.attributes[chave].limit = Math.min(limites[chave], 30);
        this.attributes[chave].total = getSafeValue(this.attributes[chave].base) + getSafeValue(this.attributes[chave].bonus);
        this.attributes[chave].test = (getSafeValue(this.attributes[chave].total) * 3) + 10;
        this.attributes[chave].default = Math.trunc(getSafeValue(this.attributes[chave].test) / 2);
      }
    }
  }

  _getSoftCapLimits() {
    const limites = {
      strength: 0, vitality: 0, agility: 0, speed: 0, magic: 0, spirit: 0
    };

    const items = this.parent.items || [];
    let itemJob = null;
    let itemRaca = null;

    for (const item of items) {
      if (item.type === "job") itemJob = item;
      else if (item.type === "race") itemRaca = item;

      if (itemJob && itemRaca) break;
    }

    if (itemJob) this._accumulateSoftCap(limites, itemJob.system);
    if (itemRaca) this._accumulateSoftCap(limites, itemRaca.system);

    return limites;
  }

  _accumulateSoftCap(limites, systemData) {
    for (const chave of ATTRIBUTES_KEYS) {
      const maxField = `${chave}_max`;
      if (systemData[maxField]) {
        limites[chave] += safeInt(systemData[maxField], 0);
      }
    }
  }

  _applyStatusModifiers() {
    const statusAtivos = {
      agility_up: false, agility_down: false, agility_break: false,
      spirit_up: false, spirit_down: false, spirit_break: false
    };

    const efeitosAtivos = this.parent.appliedEffects;
    if (efeitosAtivos) {
      for (const efeito of efeitosAtivos) {
        if (efeito.disabled) continue;
        const idsDoEfeito = efeito.statuses;
        if (!idsDoEfeito) continue;

        for (const status of Object.keys(statusAtivos)) {
          if (idsDoEfeito.has(status)) statusAtivos[status] = true;
        }
      }
    }

    const mapeamento = {
      agility: ["agility_up", "agility_down", "agility_break"],
      spirit: ["spirit_up", "spirit_down", "spirit_break"]
    };

    for (const [atributo, statusRelevantes] of Object.entries(mapeamento)) {
      const attr = this.attributes[atributo];
      if (!attr) continue;

      for (const status of statusRelevantes) {
        if (statusAtivos[status]) {
          attr.total = Math.floor(attr.total * MODIFICADORES_STATUS[status]);
          break;
        }
      }
    }
  }

  _applyHardCap() {
    for (const chave of ATTRIBUTES_KEYS) {
      if (this.attributes[chave]) {
        this.attributes[chave].total = Math.min(this.attributes[chave].total, 30);
      }
    }
  }

  _recalculateCombat() {

    const attr = this.attributes;
    const level = parseInt(this.level || 1, 10);

    this.combat.evasion.base = getSafeValue(attr.agility?.total) + getSafeValue(attr.speed?.total);
    this.combat.magicEvasion.base = getSafeValue(attr.spirit?.total) + getSafeValue(attr.magic?.total);
    this.combat.dexterity.base = level + (getSafeValue(attr.agility?.total) * 2) + 50;
    this.combat.mind.base = level + (getSafeValue(attr.magic?.total) * 2) + 50;
    this.combat.precision.base = level + (getSafeValue(attr.agility?.total) * 2);
    this.combat.magicAccuracy.base = level + (getSafeValue(attr.magic?.total) * 2) + 100;

    for (const chave of COMBAT_KEYS) {
      if (this.combat[chave]) {
        this.combat[chave].total = getSafeValue(this.combat[chave].base) + getSafeValue(this.combat[chave].bonus);
      }
    }
  }

  _applyPercentBonus(field, percentKey) {
    const percent = getSafeValue(this.percent_bonus[percentKey]);
    const currentTotal = getSafeValue(field.total);
    return currentTotal * (1 + percent / 100);
  }

  get totalBaseAttr() {
    const attr = this.attributes;
    if (!attr) return 0;
    return ATTRIBUTES_KEYS.reduce((total, chave) => total + getSafeValue(attr[chave]?.base), 0);
  }

  get totalBonusAttr() {
    const lvlAtual = parseInt(this.level);
    const lvlValidado = (!lvlAtual || lvlAtual <= 0) ? 1 : lvlAtual;
    return lvlValidado + 39;
  }
}

export class RaceDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      descricao: Field.Rich(),
      classe: Field.String(""),
      strength_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      vitality_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      agility_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      speed_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      magic_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      spirit_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      skillsVinculadas: Field.Array(Field.String())
    };
  }

  _migrateLegacyFields() {
    if (!this.parent) return;

    const system = this.parent.system;
    if (!system) return;

    const updates = {};
    const maxMap = {
      forca_max: "strength_max",
      vitalidade_max: "vitality_max",
      agilidade_max: "agility_max",
      velocidade_max: "speed_max",
      magia_max: "magic_max",
      espirito_max: "spirit_max"
    };

    for (const [oldKey, newKey] of Object.entries(maxMap)) {
      if (system[oldKey] !== undefined && system[newKey] === undefined) {
        updates[`system.${newKey}`] = system[oldKey];
      }
    }

    if (system.classe && !system.class) {
      updates["system.class"] = system.classe;
    }

    if (system.descricao && !system.description) {
      updates["system.description"] = system.descricao;
    }

    if (Object.keys(updates).length > 0) {
      this.parent.update(updates);
    }
  }

  prepareDerivedData() {
    this._migrateLegacyFields();
    super.prepareDerivedData?.();
  }
}

export class ItemModel extends foundry.abstract.TypeDataModel {

  static defineSchema() {

    let obj = {
      uuidItem:Field.String(),
      tier: Field.Number(1),
      probability: Field.Number(),
      description: Field.Rich(),
      displayName: Field.String(),
      tags: Field.Array(Field.String()),
      gil: Field.Number()
    };

    return obj;
  }

  get fullDisplayName() {

    const tier = this.tier || "T1";
    const probability = this.probability ?? 0;
    const name = this.parent?.name || "";

    return `[${tier}] [${probability}%] ${name}`;
  }

}

export class GearBasicModel extends ItemModel {

  static defineSchema() {
    const item = super.defineSchema();

    let obj = {
      ...item,
      combatDisplay: Field.String(),
      abilityDisplay: Field.String(),
      materials: Field.Array(Field.String()),
      slot: Field.String("", false),
      equipped: Field.Boolean(),
      abilities: Field.Array(ItemAbilityBase),
      tempAbilities: Field.Embedded(ItemAbilityBase, { persisted: false })
    }

    return obj;
  }

  get computeAbilityDisplay() {
    const abilities = this.abilities || [];

    if (!abilities.length) return "";

    return abilities.map(a => `[${a.name}]`).join(" | ");
  }
}

export class StatusBonusBase extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      status: Field.String("", true),
      value: Field.Number(0, true),
      mode: Field.String("flat", true)
    };
  }
}

export class ItemAbilityBase extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      name: Field.String(),
      description: Field.Rich(),
      tags: Field.Array(Field.String()),
      bonusList: Field.Array(StatusBonusBase)
    };
  }
}

export class WeaponModel extends GearBasicModel {

  static defineSchema() {
    const gear = super.defineSchema();

    if (gear.tags.initial || !gear.tags.initial.includes("weapon")) {
      gear.tags.initial.push("weapon")
    }

    if (gear.slot) {
      gear.slot.initial = "weapon";
    }

    let obj = {
      ...gear,
      weapon: Field.Schema({
        type: Field.String(),
        group: Field.String("physical"),
        twoHanded: Field.Boolean()
      }),
      damage: Field.Schema({
        dice: Field.String(),
        multiplier: Field.Number(1),
        atribute: Field.String()
      })
    }

    return obj;
  }

  static async preCreate(data, options, userId) {
    super.preCreate?.(data, options, userId);

    const tags = safeArray(data.system?.tags);
    if (!tags.includes("weapon")) {
      tags.push("weapon");
    }
    data.updateSource({ "system.tags": tags });
  }

  get computeInfoDisplay() {
    const attr = this.damage?.atribute || "";
    const target = EQUIPPABLE_BONUS_TARGETS.find(t => t.key === attr);
    const label = target ? target.displayShort : (attr ? attr.toUpperCase() : "");
    const dice = this.damage?.dice || "d6";
    const mult = this.damage?.multiplier ?? 1;

    const bonus = label ? `(${mult}*${label})` : mult;

    return `${dice}+${bonus}`;
  }

}

export class ArmorModel extends GearBasicModel {

  static defineSchema() {
    const gear = super.defineSchema();

    if (gear.tags.initial || !gear.tags.initial.includes("armor")) {
      gear.tags.initial.push("armor")
    }

    if (gear.slot) {
      gear.slot.initial = "accessory";
    }

    let obj = {
      ...gear,
      bonusList: Field.Array(StatusBonusBase, DEFAULT_BONUS_LIST)
    }

    return obj;
  }

  static async preCreate(data, options, userId) {
    super.preCreate?.(data, options, userId);

    if (!safeArray(data.system?.bonusList).length) {
      data.updateSource({ "system.bonusList": DEFAULT_BONUS_LIST });
    }
  }

  get computeInfoDisplay() {
    const labelMap = {
      armor: "ARM",
      magicArmor: "ARMM",
      evasion: "EVA",
      magicEvasion: "EVAM"
    };

    const totals = {};
    const list = this.bonusList || [];

    for (const bonus of list) {
      const key = bonus.status;
      if (!key || !labelMap[key]) continue;

      const value = getSafeValue(bonus.value, 0);
      totals[key] = getSafeValue(totals[key]) + value;
    }

    const parts = [];
    for (const [key, label] of Object.entries(labelMap)) {
      const value = getSafeValue(totals[key]);
      if (value === 0) continue;

      const sign = value > 0 ? "+" : "";
      parts.push(`${label}[${sign}${value}]`);
    }

    return parts.length > 0 ? parts.join(" | ") : "";
  }
}

export class ConsumableModel extends ItemModel {

  static defineSchema() {
    const item = super.defineSchema();

    let obj = {
      ...item,
      type:Field.String(),
      quantity: Field.Number(1),
      infinity: Field.Boolean(),
      effect: Field.Schema({
        name:Field.String(),
        description: Field.Rich(),
        effectType: Field.String("buff"),
        duration: Field.Number(0),
        permanent: Field.Boolean(false),
        tags: Field.Array(Field.String()),
        modifiers: Field.Array(StatusBonusBase)
      })
    }

    return obj;
  }
}

export class EffectModel extends foundry.abstract.TypeDataModel {

  static defineSchema() {

    let obj = {
      description: Field.Rich(),
      effectType: Field.String("buff"),
      duration: Field.Number(0),
      permanent: Field.Boolean(false),
      area: Field.Boolean(false),
      range: Field.Number(0),
      safeAllies: Field.Boolean(false),
      tags: Field.Array(Field.String()),
      effect: Field.Array(StatusBonusBase)
    };

    return obj;
  }

  static async preCreate(data, options, userId) {
    super.preCreate?.(data, options, userId);

    if (!data.system?.tags) {
      data.updateSource({ "system.tags": [] });
    }
    if (!data.system?.effect) {
      data.updateSource({ "system.effect": [] });
    }
  }
}

export class JobSkillModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      name: Field.String(),
      description: Field.Rich(),
      type: Field.String(),
      minLevel: Field.Number(),
      support: Field.Boolean(),
      cost: Field.Schema({
        type: Field.String(),
        material: Field.String(),
        value: Field.Number()
      }),
      combat: Field.Schema({
        type: Field.String(),
        formula: Field.String(),
        area: Field.Boolean(),
        range: Field.Number(),
        ally: Field.Boolean()
      }),
      tags: Field.Array(Field.String()),
      notes: Field.Rich()
    };
  }
}

export class JobModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: Field.Rich(),
      notes: Field.Rich(),
      class: Field.String(),
      attribute: Field.Schema({
        strength: Field.Number(),
        vitality: Field.Number(),
        agility: Field.Number(),
        speed: Field.Number(),
        magic: Field.Number(),
        spirit: Field.Number()
      }),
      dice: Field.Schema({
        hp: Field.String(),
        mp: Field.String()
      }),
      proficiency: Field.Schema({
        limit: Field.Number(),
        bonus: Field.Array(Field.Object({
          key: Field.String(),
          value: Field.Number()
        }))
      }),
      skills: Field.Array(JobSkillModel),
      tempSkill: Field.Embedded(JobSkillModel, {
        initial: {
          name: "",
          description: "",
          type: "",
          minLevel: 0,
          support: false,
          cost: { type: "", material: "", value: 0 },
          combat: { type: "", formula: "", area: false, range: 0, ally: false },
          tags: [],
          notes: ""
        },
        persisted: false
      }),
      mainWeapons: Field.Array(Field.String()),
      accuracyBonus: Field.Number(),
      allowedArmors: Field.Array(Field.String()),
      tags: Field.Array(Field.String())
    };
  }

  static async preCreate(data, options, userId) {
    super.preCreate?.(data, options, userId);

    if (!data.system) {
      data.system = {};
    }

    if (!Array.isArray(data.system.skills)) {
      data.system.skills = [];
    }
    if (!Array.isArray(data.system.mainWeapons)) {
      data.system.mainWeapons = [];
    }
    if (!Array.isArray(data.system.allowedArmors)) {
      data.system.allowedArmors = [];
    }
    if (!Array.isArray(data.system.tags)) {
      data.system.tags = [];
    }
    if (!data.system.proficiency) {
      data.system.proficiency = { limit: 0, bonus: [] };
    }
    if (!Array.isArray(data.system.proficiency.bonus)) {
      data.system.proficiency.bonus = [];
    }
    if (!data.system.attribute) {
      data.system.attribute = {
        strength: 0,
        vitality: 0,
        agility: 0,
        speed: 0,
        magic: 0,
        spirit: 0
      };
    }
  }
}
