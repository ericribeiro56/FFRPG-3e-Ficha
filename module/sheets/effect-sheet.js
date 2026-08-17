import { safeInt } from "../core/utils.js";
const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

/**
 * Gerenciador de Efeitos e Status para o FFRPG 3E (Application V2)
 */
export class EffectsSheet extends HandlebarsApplicationMixin(ItemSheetV2) {

  constructor(options={}) {
    options.id = options.document ? `effect-item-${options.document.id}` : options.id;
    super(options);
  }

  static DEFAULT_OPTIONS = {
    id: "ffrpg3e-effects-manager",
    classes: ["ffrpg3e", "sheet", "effects-window"],
    tag: "form",
    window: {
      resizable: false,
      width: 380,
      height: 440,
      title: "Configurador de Status"
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    }
  };

  static PARTS = {
    form: {
      template: "systems/ffrpg3e/templates/effect/effect-sheet.hbs"
    }
  };

  static ACTIONS = {
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.item = this.document;
    context.system = this.document.system;

    const estaNoJogador = this.document.parent && this.document.parent.documentName === "Actor";

    if (estaNoJogador) {
      context.isEditable = options.form?.editable !== false && this.isEditable;
    } else {
      context.isEditable = true;
      if (options.form) options.form.editable = true;
    }

    context.condicoesDisponiveis = CONFIG.statusEffects || [];

    context.statusEfeitos = this.document.effects.map(e => {
      const efData = e.toObject();
      let textoDuracao = "Permanente";

      const duration = e.duration || efData.duration;
      let turnosv14 = 0;

      if (duration) {
        if (duration.units === "turns" || duration.units === "rounds") {
          turnosv14 = duration.value;
        } else if (duration.units === "seconds") {
          turnosv14 = duration.value / 6;
        }
      }

      if (turnosv14) {
        textoDuracao = `${turnosv14} Turnos`;
      }
      
      return {
        id: e.id,
        name: e.name,
        img: e.img || "icons/svg/hazard.svg",
        duracao: textoDuracao,
        description: efData.description || ""
      };
    });

    return context;
  }


  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);

    const btnAdd = this.element.querySelector(".btn-add-effect");
    if (btnAdd) {
      btnAdd.addEventListener("click", async (event) => {
        event.preventDefault();

        if (this.document.effects.size >= 1) return;

        const statusId = this.element.querySelector("#status-selector").value;
        const turnos = safeInt(this.element.querySelector("#status-duration").value, 3);
        const descricaoTexto = this.element.querySelector("#status-description").value.trim();
        
        const dadosCondicao = CONFIG.statusEffects.find(c => c.id === statusId);
        if (!dadosCondicao) return;
        
        const nomeOficial = this.document.name;

        await this.document.createEmbeddedDocuments("ActiveEffect", [{
          name: nomeOficial,
          img: dadosCondicao.icon,
          statuses: Array.from(new Set([statusId])),
          transfer: true,       
          description: descricaoTexto, 
          duration: {
            turns: turnos,
            rounds: null, 
            seconds: null       
          }
        }]);
      });
    }

    const areaLista = this.element.querySelector('.effects-list-section');
    if (areaLista && !areaLista.dataset.listenerAtivo) {
      areaLista.dataset.listenerAtivo = "true";

      areaLista.addEventListener("click", async (event) => {
        const botaoLixeira = event.target.closest('.btn-delete-effect');
        if (!botaoLixeira) return;

        event.preventDefault();
        event.stopPropagation();

        const efeitoId = botaoLixeira.dataset.efeitoId;
        const efeito = this.document.effects.get(efeitoId);

        if (efeito) {
          await efeito.delete();
        }
      });
    }
  }
}
