const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

/**
 * Ficha de Controle e Configuração para os Itens do tipo "Race" (Raças) - v14 (Application V2)
 */
export class RaceSheet extends HandlebarsApplicationMixin(ItemSheetV2) {

  constructor(options={}) {
    options.id = options.document ? `race-item-${options.document.id}` : options.id;
    super(options);
    this.controladorAbas = new foundry.applications.ux.Tabs({
      navSelector: '.sheet-tabs',
      contentSelector: '.sheet-body',
      initial: 'general'
    });
  }

  /** @override */
  static DEFAULT_OPTIONS = {
    id: "ffrpg3e-race-sheet",
    classes: ["ffrpg3e", "sheet", "race-window"],
    tag: "form",
    window: {
      resizable: false,
      minimizable: true,
      width: 550,
      height: 600,
      title: "Configurador de Raça"
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: "systems/ffrpg3e/templates/race/race-sheet.hbs"
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

    return context;
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
