import { safeInt, obterModificadorArmadura } from "./core/utils.js";
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

      current_gil : Field.Number(0),
      extract_gil : Field.Array(Field.Object(), []),

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
        damage:Field.Number(1)
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
        damage_bonus:Field.Number(1)
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

    // 4. Garante que nenhum atributo passe do cap máximo (30)
    this._applyHardCap();

    // 5. Calcula os status de combate uma única vez com os atributos finais travados
    this._recalculateCombat();

    // 6. Roda o loop unificado de níveis (1 a 99) para HP, MP e Somas Globais
    this._recalculateMaxHpMpByTable();

    // 7. Aplica percent_bonus em todos os campos total
    this._applyAttributePercentBonuses();

    this._applyCombatPercentBonuses();

    this._applyHpMpPercentBonuses();

    // 8. Aplica modificador de armadura por atributo (só armadura e armadura_magica)
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

  _applyHpMpPercentBonuses(){
    
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

    const vitalidade = attr.vitalidade?.total || 0;
    const espirito = attr.espirito?.total || 0;

    if (this.combate.armadura) {
      const mod = obterModificadorArmadura(vitalidade);
      this.combate.armadura.total = Math.round(this.combate.armadura.total * mod);
    }

    if (this.combate.armadura_magica) {
      const mod = obterModificadorArmadura(espirito);
      this.combate.armadura_magica.total = Math.round(this.combate.armadura_magica.total * mod);
    }
  }

  _recalculateMaxHpMpByTable() {
    const nivel = parseInt(this.level || 1, 10);
    const nivelSeguro = Math.max(1, Math.min(nivel, 99));
    const progressao = this.progressao_niveis || {};

    // Inicializadores para o total geral (1 a 99)
    const somas = { dhp: 0, vit: 0, dmp: 0, esp: 0 };

    // Inicializadores para o HP/MP máximo do nível atual do personagem
    let somaHpPersonagem = 0;
    let somaMpPersonagem = 0;

    // UM ÚNICO LOOP DE 1 A 99 PARA RESOLVER TUDO
    for (let i = 1; i <= 99; i++) {
      const dados = progressao[`nv${i}`] || {};
      const dhp = parseInt(dados.dhp || 0, 10) || 0;
      const vit = parseInt(dados.vit || 0, 10) || 0;
      const dmp = parseInt(dados.dmp || 0, 10) || 0;
      const esp = parseInt(dados.esp || 0, 10) || 0;

      // 1. Acumula nas somas globais (antigo _recalculateProgressaoSomas)
      somas.dhp += dhp;
      somas.vit += vit;
      somas.dmp += dmp;
      somas.esp += esp;

      // 2. Acumula no HP/MP máximo apenas se estiver dentro do nível do personagem
      if (i <= nivelSeguro) {
        somaHpPersonagem += dhp + vit;
        somaMpPersonagem += dmp + esp;
      }
    }

    // Aplica os valores na memória (dados derivados)
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
        this.atributos[chave].total = (this.atributos[chave].base || 0) + (this.atributos[chave].bonus || 0);
      }
    }
  }

  _applySoftCap() {
    const limites = this._getSoftCapLimits();

    for (const chave of ATTRIBUTES_KEYS) {
      if (this.atributos[chave]) {
        this.atributos[chave].max = Math.min(limites[chave], 30);
        this.atributos[chave].total = (this.atributos[chave].base || 0) + (this.atributos[chave].bonus || 0);
        this.atributos[chave].teste = ((this.atributos[chave].total || 0) * 3) + 10;
        this.atributos[chave].padrao = Math.trunc((this.atributos[chave].teste || 0) / 2);
      }
    }
  }

  _getSoftCapLimits() {
    const limites = {
      forca: 0, vitalidade: 0, agilidade: 0, velocidade: 0, magia: 0, espirito: 0
    };

    // Percorre a lista de itens uma única vez e extrai o que precisa
    const items = this.parent.items || [];
    let itemJob = null;
    let itemRaca = null;

    for (const item of items) {
      if (item.type === "job") itemJob = item;
      else if (item.type === "race") itemRaca = item;
      
      // Se já achou os dois, pode parar o loop mais cedo (otimização extra)
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
    // 1. Cria o mapa de status diretamente
    const statusAtivos = {
      agility_up: false, agility_down: false, agility_break: false,
      spirit_up: false, spirit_down: false, spirit_break: false
    };

    // 2. Acessa appliedEffects UMA ÚNICA VEZ e armazena em cache
    const efeitosAtivos = this.parent.appliedEffects;
    if (efeitosAtivos) {
      for (const efeito of efeitosAtivos) {
        if (efeito.disabled) continue;
        const idsDoEfeito = efeito.statuses;
        if (!idsDoEfeito) continue;

        // Ativa as flags no mapa se o efeito existir
        for (const status of Object.keys(statusAtivos)) {
          if (idsDoEfeito.has(status)) statusAtivos[status] = true;
        }
      }
    }

    // 3. Aplica os multiplicadores nos atributos de forma direta, sem funções extras intermediárias
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
          break; // Aplica apenas o primeiro status relevante encontrado (Up, Down ou Break)
        }
      }
    }
  }

  _getStatusMultiplier(atributo, statusAtivos) {
    const mapeamento = {
      agilidade: ["agility_up", "agility_down", "agility_break"],
      espirito: ["spirit_up", "spirit_down", "spirit_break"]
    };

    const statusRelevantes = mapeamento[atributo];
    if (!statusRelevantes) return null;

    for (const status of statusRelevantes) {
      if (statusAtivos[status]) {
        return MODIFICADORES_STATUS[status];
      }
    }

    return null;
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

    this.combate.evasao.base = (attr.agilidade?.total || 0) + (attr.velocidade?.total || 0);
    this.combate.evasao_magica.base = (attr.espirito?.total || 0) + (attr.magia?.total || 0);
    this.combate.destreza.base = level + ((attr.agilidade?.total || 0) * 2) + 50;
    this.combate.mente.base = level + ((attr.magia?.total || 0) * 2) + 50;
    this.combate.precisao.base = level + ((attr.agilidade?.total || 0) * 2);
    this.combate.precisao_magica.base = level + ((attr.magia?.total || 0) * 2) + 100;

    for (const chave of COMBAT_KEYS) {
      if (this.combate[chave]) {
        this.combate[chave].total = (this.combate[chave].base || 0) + (this.combate[chave].bonus || 0);
      }
    }
  }

  _applyPercentBonus(field, percentKey) {
    const percent = this.percent_bonus[percentKey] || 0;
    const base = field.base || 0;
    const bonus = field.bonus || 0;
    return (base + bonus) * (1 + percent / 100);
  }

  get forcaTotal() { return this._applyPercentBonus(this.atributos.forca, "forca"); }
  get vitalidadeTotal() { return this._applyPercentBonus(this.atributos.vitalidade, "vitalidade"); }
  get agilidadeTotal() { return this._applyPercentBonus(this.atributos.agilidade, "agilidade"); }
  get velocidadeTotal() { return this._applyPercentBonus(this.atributos.velocidade, "velocidade"); }
  get magiaTotal() { return this._applyPercentBonus(this.atributos.magia, "magia"); }
  get espiritoTotal() { return this._applyPercentBonus(this.atributos.espirito, "espirito"); }

  get armaduraTotal() { return this._applyPercentBonus(this.combate.armadura, "armadura"); }
  get armaduraMagicaTotal() { return this._applyPercentBonus(this.combate.armadura_magica, "armadura_magica"); }
  get evasaoTotal() { return this._applyPercentBonus(this.combate.evasao, "evasao"); }
  get evasaoMagicaTotal() { return this._applyPercentBonus(this.combate.evasao_magica, "evasao_magica"); }
  get precisaoTotal() { return this._applyPercentBonus(this.combate.precisao, "precisao"); }
  get precisaoMagicaTotal() { return this._applyPercentBonus(this.combate.precisao_magica, "precisao_magica"); }
  get destrezaTotal() { return this._applyPercentBonus(this.combate.destreza, "destreza"); }
  get menteTotal() { return this._applyPercentBonus(this.combate.mente, "mente"); }
  get expertTotal() { return this._applyPercentBonus(this.combate.expert, "expert"); }

  get hpTotal() { return this._applyPercentBonus(this.hp, "hp"); }
  get mpTotal() { return this._applyPercentBonus(this.mp, "mp"); }

  get totalBaseAttr() {
    const attr = this.atributos;
    if (!attr) return 0;
    return ATTRIBUTES_KEYS.reduce((total, chave) => total + (attr[chave]?.base || 0), 0);
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

export class EffectsItemModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      descricao: Field.Rich(),
      tipo_status: Field.String("buff")
    };
  }
}

//Usado como base dos efeitos que serão aplicados em buffs,debuffs e passivas
export class ModificadorEstrutura extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      tipoModificador: Field.String(""),
      campo_modificador: Field.String(""),
      formula: Field.String("+5"),
      tipo_status: Field.String("buff")
    };
  }
}

//Apenas placeholder, irei usar o que esta em modificadores e diracao_turnos em breve
export class EffectsItemModelTest extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      descricao: Field.Rich(),
      duracao_turnos: Field.Number(3, true, false, { min: 0 }),
      modificadores: Field.Array(Field.Object())
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

  get fullDisplayName(){

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

  get computeAbilityDisplay(){
    const abilities = this.abilities || [];

    if (!abilities.length) return "";

    return abilities.map(a => `[${a.name}]`).join(" | ");
  }
}

export class StatusBonusBase extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      status: Field.String("", true),           // hp_max, mp_max, attack...
      value: Field.Number(0, true),             // valor numérico
      mode: Field.String("flat", true)          // flat | percent
    };
  }
}

export class ItemAbilityBase extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      name: Field.String(), // nome habilidade
      description: Field.Rich(), //descrição
      tags: Field.Array(),
      bonusList: Field.Array(StatusBonusBase) //lista de bonus
    };
  }
}

export class WeaponModel extends GearBasicModel {

  static defineSchema() {
    const gear = super.defineSchema();

    let obj = {
      ...gear,
      weapon: Field.Schema({
        type: Field.String(), // Magico ou Fisico
        group: Field.String("physical"), // Tipo de arma ( staff, axe ...)
        twoHanded: Field.Boolean()  //Se a arma usa ambos os slots
      }),
      damage: Field.Schema({
        dice: Field.String(),
        multiplier: Field.Number(1),
        atribute: Field.String()  // Forca , AGI...
      })
    }

    return obj;
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

    let obj = {
      ...gear,
      bonusList: Field.Array(StatusBonusBase,DEFAULT_BONUS_LIST)
    }

    return obj;
  }

  static async preCreate(data, options, userId) {
    super.preCreate?.(data, options, userId);

    const tags = Array.isArray(data.system?.tags) ? data.system.tags : [];
    if (!tags.includes("armor")) {
      tags.push("armor");
    }
    data.updateSource({ "system.tags": tags });

    if (!Array.isArray(data.system?.bonusList) || data.system.bonusList.length === 0) {
      data.updateSource({ "system.bonusList": DEFAULT_BONUS_LIST });
    }
  }

  /**
   * Getter dinâmico que gera a string de resumo para o combate.
   * Executado apenas uma vez no momento do Drop Canvas/Actor.
   * @returns {string} Ex: "ARM[+5] | ARMM[+50] | EVAM[-3]"
   */
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

      const value = typeof safeInt === "function" ? safeInt(bonus.value, 0) : (parseInt(bonus.value) || 0);
      totals[key] = (totals[key] || 0) + value;
    }

    const parts = [];
    for (const [key, label] of Object.entries(labelMap)) {
      const value = totals[key] || 0;
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
      effects: Field.Array(foundry.data.fields.ObjectField) //No select só tera HP/MP 
    }

    return obj;
  }
}