const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

import { CLASS_LIST } from "../core/constants.js";
import { sortByLabel } from "../core/utils.js";

/**
 * Ficha de Controle e Configuração para os Itens do tipo "Job" (Classes) - v14 (Application V2)
 */
export class JobSheet extends HandlebarsApplicationMixin(ItemSheetV2) {

  constructor(options={}) {
    options.id = options.document ? `job-item-${options.document.id}` : options.id;
    super(options);
    this.controladorAbas = new foundry.applications.ux.Tabs({
      navSelector: '.sheet-tabs',
      contentSelector: '.sheet-body',
      initial: 'general'
    });
  }

  /** @override */
  static DEFAULT_OPTIONS = {
    id: "ffrpg3e-job-sheet",
    classes: ["ffrpg3e", "sheet", "job-window"],
    tag: "form",
    window: {
      resizable: false,
      minimizable: true,
      width: 550,
      height: 650,
      title: "Configurador de Classe / Job"
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: "systems/ffrpg3e/templates/job/job-sheet.hbs"
    }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    
    context.item = this.document;
    context.system = this.document.system;

    context.descricaoEnriquecida = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.descricao || "", {
      secrets: this.document.isOwner,
      rollData: this.document.getRollData(),
      relativeTo: this.document
    });

    context.classList = sortByLabel(Object.entries(CLASS_LIST).map(([value, label]) => ({ value, label })));

    return context;
  }

  /**
   * Intercepta e garante a estrutura correta do objeto de submissão
   * @override
   */
  _prepareSubmitData(event, form, formData) {
    const data = super._prepareSubmitData(event, form, formData);
    
    if (!data.system) data.system = {};
    
    const textoMpDie = data.system?.mp_die;
    if ( typeof textoMpDie === "string" ) {
      const trimmed = textoMpDie.trim().toLowerCase();
      if (trimmed === "" || trimmed === "n/a" || trimmed === "0") {
        data.system.possui_mp = false;
      } else {
        data.system.possui_mp = true;
      }
    }

    return data;
  }


  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    
    this.controladorAbas.bind(this.element);

    const imagemEditavel = this.element.querySelector('img[data-edit="img"]');
    if (imagemEditavel && !imagemEditavel.dataset.hasListener) {
      imagemEditavel.dataset.hasListener = "true";
      imagemEditavel.addEventListener("click", (event) => {
        event.preventDefault();
        
        const fp = new foundry.applications.apps.FilePicker.implementation({
          type: "image",
          current: this.document.img,
          callback: async (path) => {
            await this.document.update({ img: path });
          }
        });
        fp.browse();
      });
    }
  }
}
