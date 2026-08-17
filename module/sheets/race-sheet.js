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
      submitOnChange: true, // Salva os dados de forma reativa ao mudar de campo
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
    
    // Atalhos para o Handlebars ler o banco de dados do item de raça
    context.item = this.document;
    context.system = this.document.system;

    // --- CORREÇÃO 1: ENRIQUECIMENTO OBRIGATÓRIO DO PROSEMIRROR NO V14 ---
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
    
    // Acopla o ouvinte de cliques das abas ao HTML renderizado da janela
    this.controladorAbas.bind(this.element);

    // --- CORREÇÃO 2: SUPORTE A SELEÇÃO DE ARTE/IMAGEM DA RAÇA ---
    const imagemEditavel = this.element.querySelector('img[data-edit="img"]');
    if (imagemEditavel && !imagemEditavel.dataset.hasListener) {
      imagemEditavel.dataset.hasListener = "true"; // Evita vazamento de memória e listeners fantasmas
      imagemEditavel.addEventListener("click", (event) => {
        event.preventDefault();
        
        const fp = new foundry.applications.apps.FilePicker.implementation({
          type: "image",
          current: this.document.img,
          callback: async (path) => {
            // O próprio update notifica a AppV2 e redesenha a folha de forma reativa
            await this.document.update({ img: path });
          }
        });
        fp.browse();
      });
    }
  }
}
