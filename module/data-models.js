import { safeInt, obterModificadorArmadura, getSafeValue, safeArray } from "./core/utils.js";
import { ATTRIBUTES_KEYS, COMBAT_KEYS, ITEM_TYPE_CATEGORY_MAP, MODIFICADORES_STATUS, DEFAULT_BONUS_LIST, EQUIPPABLE_BONUS_TARGETS } from "./core/constants.js";
import { Field } from "./core/fields-utils.js";


export class CharacterData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      level: Field.Number(1, true, false, { min: 1 }),
      hp: Field.Schema({
        base: Field.Number(10),
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
        forca: Field.Number(0),
        vitalidade: Field.Number(0),
        agilidade: Field.Number(0),
        velocidade: Field.Number(0),
        magia: Field.Number(0),
        espirito: Field.Number(0),
        armadura: Field.Number(0),
        armadura_magica: Field.Number(0),
        evasao: Field.Number(0),
        evasao_magica: Field.Number(0),
        precisao: Field.Number(0),
        precisao_magica: Field.Number(0),
        destreza: Field.Number(0),
        mente: Field.Number(0),
        expert: Field.Number(0),
        hp: Field.Number(0),
        mp: Field.Number(0),
        critical: Field.Number(0),
        damage: Field.Number(1)
      }),

      information: Field.Schema({
        genero: Field.String(""),
        signo: Field.String(""),
        sangue: Field.String(""),
        idade: Field.Number(0),
        altura: Field.Number(0),
        peso: Field.Number(0),
        bgHistory: Field.Rich("", false)
      }),

      atributos: Field.Schema({
        forca: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0),
          max: Field.Number(0),
          teste: Field.Number(0),
          padrao: Field.Number(0)
        }),
        vitalidade: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0),
          max: Field.Number(0),
          teste: Field.Number(0),
          padrao: Field.Number(0)
        }),
        agilidade: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0),
          max: Field.Number(0),
          teste: Field.Number(0),
          padrao: Field.Number(0)
        }),
        velocidade: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0),
          max: Field.Number(0),
          teste: Field.Number(0),
          padrao: Field.Number(0)
        }),
        magia: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0),
          max: Field.Number(0),
          teste: Field.Number(0),
          padrao: Field.Number(0)
        }),
        espirito: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0),
          max: Field.Number(0),
          teste: Field.Number(0),
          padrao: Field.Number(0)
        })
      }),

      combate: Field.Schema({
        evasao: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0)
        }),
        evasao_magica: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0)
        }),
        armadura: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0)
        }),
        armadura_magica: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0)
        }),
        precisao: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0)
        }),
        precisao_magica: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0)
        }),
        destreza: Field.Schema({
          base: Field.Number(0),
          bonus: Field.Number(0),
          total: Field.Number(0)
        }),
        mente: Field.Schema({
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

      proficiency:Field.Schema({
        max_points:Field.Number(0),
        language:Field.Schema({
          general_points:Field.Number(0),
          especialized_points:Field.Number(0),
          list:Field.Array(Field.Schema({
            name:Field.String(""),
            invisted:Field.Number(0),
            total:Field.Number(0)
          })),
        }),
        knowledge:Field.Schema({
          general_points:Field.Number(0),
          especialized_points:Field.Number(0),
          list:Field.Array(Field.Schema({
            name:Field.String(""),
            invisted:Field.Number(0),
            total:Field.Number(0)
          })),
        }),
        performances:Field.Schema({
          mastery:Field.Boolean(false),
          arts:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          dance:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          instruments:Field.Schema({active:Field.Boolean(false),base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          vocal:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          acting:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)})
        }),
        basics:Field.Schema({
          mastery:Field.Boolean(false),
          acrobatics:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          awareness:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          coocking:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          bargain:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)})
        }),
        crafts:Field.Schema({
          mastery:Field.Boolean(false),
          achemic:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          explosive:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          heal:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          tinkering:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          repair:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          system:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          vehicle:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)})
        }),
        social:Field.Schema({
          mastery:Field.Boolean(false),
          etiquette:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          intimation:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          leadership:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          deception:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          seduction:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
        }),
        weapons:Field.Schema({
          mastery:Field.Boolean(false),
          ambimestry:Field.Boolean(false),
          inaptitude:Field.Boolean(false),
          axe:Field.Schema({active:Field.Boolean(false),base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          bow:Field.Schema({active:Field.Boolean(false),base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          fight:Field.Schema({active:Field.Boolean(false),base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          staff:Field.Schema({active:Field.Boolean(false),base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          whip:Field.Schema({active:Field.Boolean(false),base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          fire_weapon:Field.Schema({active:Field.Boolean(false),base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          knife:Field.Schema({active:Field.Boolean(false),base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          haste:Field.Schema({active:Field.Boolean(false),base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          sword:Field.Schema({active:Field.Boolean(false),base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          throw:Field.Schema({active:Field.Boolean(false),base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          two_weapon:Field.Schema({active:Field.Boolean(false),base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          fixed_weapon:Field.Schema({active:Field.Boolean(false),base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)})
        }),
        wilds:Field.Schema({
          mastery:Field.Boolean(false),
          animal_training:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          climbing:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          navigation:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          loot:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          ride:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          survival:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          swimming:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          tracker:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
        }),
        underworld:Field.Schema({
          mastery:Field.Boolean(false),
          disguise:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          escape:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          games:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          lockpick:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          pickpocket:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          stealth:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          streetwise:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          trap:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)})
        }),
        academics:Field.Schema({
          mastery:Field.Boolean(false),
          investigation:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          carpinter:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          jeweler:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          armorsmith:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          tailor:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)}),
          sculpor:Field.Schema({base: Field.Number(0),bonus: Field.Number(0),total: Field.Number(0)})
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

  prepareDerivedData() {
    super.prepareDerivedData();

    if (!this.parent) return;

    const attr = this.atributos;
    const comb = this.combate;

    if (!attr || !comb) return;

    // 1. Calcula o total inicial dos atributos (For, Vit, Agi...)
    this._calculateBaseStats();

    // 2. Define os limites máximos buscando Raça/Classe em um único loop leve
    this._applySoftCap();

    // 3. Aplica buffs/debuffs baseados nos efeitos ativos
    this._applyStatusModifiers();

    // 4. Aplica percent_bonus nos atributos
    this._applyAttributePercentBonuses();

    // 5. Garante que nenhum atributo passe do cap máximo (30)
    this._applyHardCap();

    // 6. Calcula os status de combate uma única vez com os atributos finais travados
    this._recalculateCombat();

    // 7. Roda o loop unificado de níveis (1 a 99) para HP, MP e Somas Globais
    this._recalculateMaxHpMpByTable();

    // 8. Aplica percent_bonus no combate
    this._applyCombatPercentBonuses();

    // 9. Aplica percent_bonus no HP/MP
    this._applyHpMpPercentBonuses();

    // 10. Aplica modificador de armadura por atributo (só armadura e armadura_magica)
    this._applyArmorModifiers();
  }

  _applyAttributePercentBonuses() {
    const atributos = ["forca", "vitalidade", "agilidade", "velocidade", "magia", "espirito"];

    for (const key of atributos) {
      if (this.atributos[key]) {
        this.atributos[key].total = this._applyPercentBonus(this.atributos[key], key);
      }
    }
  }

  _applyCombatPercentBonuses() {
    const combate = ["armadura", "armadura_magica", "evasao", "evasao_magica", "precisao", "precisao_magica", "destreza", "mente", "expert"];

    for (const key of combate) {
      if (this.combate[key]) {
        this.combate[key].total = this._applyPercentBonus(this.combate[key], key);
      }
    }
  }

  _applyHpMpPercentBonuses() {

    if (this.hp) {
      this.hp.total = this._applyPercentBonus(this.hp, "hp");
    }

    if (this.mp) {
      this.mp.total = this._applyPercentBonus(this.mp, "mp");
    }
  }

  _applyArmorModifiers() {
    const attr = this.atributos;
    if (!attr) return;

    const vitalidade = getSafeValue(attr.vitalidade?.total);
    const espirito = getSafeValue(attr.espirito?.total);

    if (this.combate.armadura) {
      const mod = obterModificadorArmadura(vitalidade);
      this.combate.armadura.total = Math.round(getSafeValue(this.combate.armadura.total) * mod);
    }

    if (this.combate.armadura_magica) {
      const mod = obterModificadorArmadura(espirito);
      this.combate.armadura_magica.total = Math.round(getSafeValue(this.combate.armadura_magica.total) * mod);
    }
  }

  _recalculateMaxHpMpByTable() {
    const nivel = parseInt(this.level || 1, 10);
    const nivelSeguro = Math.max(1, Math.min(nivel, 99));
    const progressao = this.progressao_niveis || {};

    const somas = { dhp: 0, vit: 0, dmp: 0, esp: 0 };
    let somaHpPersonagem = 0;
    let somaMpPersonagem = 0;

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
        somaMpPersonagem += dmp + esp;
      }
    }

    this.hp.base = 30 + somaHpPersonagem;
    this.mp.base = 10 + somaMpPersonagem;
    this.xp.required = 500 * nivelSeguro;

    this.progressao_somas_dhp = somas.dhp;
    this.progressao_somas_vit = somas.vit;
    this.progressao_somas_dmp = somas.dmp;
    this.progressao_somas_esp = somas.esp;
  }

  _calculateBaseStats() {
    for (const chave of ATTRIBUTES_KEYS) {
      if (this.atributos[chave]) {
        this.atributos[chave].total = getSafeValue(this.atributos[chave].base) + getSafeValue(this.atributos[chave].bonus);
      }
    }
  }

  _applySoftCap() {
    const limites = this._getSoftCapLimits();

    for (const chave of ATTRIBUTES_KEYS) {
      if (this.atributos[chave]) {
        this.atributos[chave].max = Math.min(limites[chave], 30);
        this.atributos[chave].total = getSafeValue(this.atributos[chave].base) + getSafeValue(this.atributos[chave].bonus);
        this.atributos[chave].teste = (getSafeValue(this.atributos[chave].total) * 3) + 10;
        this.atributos[chave].padrao = Math.trunc(getSafeValue(this.atributos[chave].teste) / 2);
      }
    }
  }

  _getSoftCapLimits() {
    const limites = {
      forca: 0, vitalidade: 0, agilidade: 0, velocidade: 0, magia: 0, espirito: 0
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
      agilidade: ["agility_up", "agility_down", "agility_break"],
      espirito: ["spirit_up", "spirit_down", "spirit_break"]
    };

    for (const [atributo, statusRelevantes] of Object.entries(mapeamento)) {
      const attr = this.atributos[atributo];
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
      if (this.atributos[chave]) {
        this.atributos[chave].total = Math.min(this.atributos[chave].total, 30);
      }
    }
  }

  _recalculateCombat() {

    const attr = this.atributos;
    const level = parseInt(this.level || 1, 10);

    this.combate.evasao.base = getSafeValue(attr.agilidade?.total) + getSafeValue(attr.velocidade?.total);
    this.combate.evasao_magica.base = getSafeValue(attr.espirito?.total) + getSafeValue(attr.magia?.total);
    this.combate.destreza.base = level + (getSafeValue(attr.agilidade?.total) * 2) + 50;
    this.combate.mente.base = level + (getSafeValue(attr.magia?.total) * 2) + 50;
    this.combate.precisao.base = level + (getSafeValue(attr.agilidade?.total) * 2);
    this.combate.precisao_magica.base = level + (getSafeValue(attr.magia?.total) * 2) + 100;

    for (const chave of COMBAT_KEYS) {
      if (this.combate[chave]) {
        this.combate[chave].total = getSafeValue(this.combate[chave].base) + getSafeValue(this.combate[chave].bonus);
      }
    }
  }

  _applyPercentBonus(field, percentKey) {
    const percent = getSafeValue(this.percent_bonus[percentKey]);
    const currentTotal = getSafeValue(field.total);
    return currentTotal * (1 + percent / 100);
  }

  get totalBaseAttr() {
    const attr = this.atributos;
    if (!attr) return 0;
    return ATTRIBUTES_KEYS.reduce((total, chave) => total + getSafeValue(attr[chave]?.base), 0);
  }

  get totalBonusAttr() {
    const lvlAtual = parseInt(this.level);
    const lvlValidado = (!lvlAtual || lvlAtual <= 0) ? 1 : lvlAtual;
    return lvlValidado + 39;
  }
}

export class JobDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      descricao: Field.Rich(),
      forca_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      vitalidade_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      agilidade_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      velocidade_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      magia_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      espirito_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      hp_die: Field.String("d6"),
      possui_mp: Field.Boolean(false),
      mp_die: Field.String("N/A"),
      skill_points: Field.Number(0, true, false, { min: 0 }),
      skill_aptitude: Field.Number(0, true, false, { min: 0 }),
      skillsVinculadas: Field.Array(),
      classe: Field.String("")
    };
  }
}

export class RaceDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      descricao: Field.Rich(),
      classe: Field.String(""),
      forca_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      vitalidade_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      agilidade_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      velocidade_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      magia_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      espirito_max: Field.Number(10, true, false, { min: 0, max: 30 }),
      skillsVinculadas: Field.Array()
    };
  }
}

export class ItemModel extends foundry.abstract.TypeDataModel {

  static defineSchema() {

    let obj = {
      tier: Field.Number(1),
      probability: Field.Number(),
      description: Field.Rich(),
      displayName: Field.String(),
      tags: Field.Array(),
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
      materials: Field.Array(),
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
      tags: Field.Array(),
      bonusList: Field.Array(StatusBonusBase)
    };
  }
}

export class WeaponModel extends GearBasicModel {

  static defineSchema() {
    const gear = super.defineSchema();

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

    const tags = safeArray(data.system?.tags);
    if (!tags.includes("armor")) {
      tags.push("armor");
    }
    data.updateSource({ "system.tags": tags });

    if (!safeArray(data.system?.bonusList).length) {
      data.updateSource({ "system.bonusList": DEFAULT_BONUS_LIST });
    }
  }

  get computeInfoDisplay() {
    const labelMap = {
      armadura: "ARM",
      armadura_magica: "ARMM",
      evasao: "EVA",
      evasao_magica: "EVAM"
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

export class ConsumableBasicModel extends ItemModel {

  static defineSchema() {
    const item = super.defineSchema();

    let obj = {
      ...item,
      quantity: Field.Number(1),
      infinity: Field.Boolean(),
      effects: Field.Array(StatusBonusBase)
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
      area:Field.Boolean(false),
      range: Field.Number(0),
      safeAllies: Field.Boolean(false),
      tags: Field.Array(),
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