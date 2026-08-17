const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

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
      submitOnChange: true, // Mantém salvando os inputs comuns de forma reativa ao digitar
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

    // Enriquecimento oficial v14 seguro (limpo e sem avisos de obsolescência)
    context.descricaoEnriquecida = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.descricao || "", {
      secrets: this.document.isOwner,
      rollData: this.document.getRollData(),
      relativeTo: this.document
    });

    return context;
  }

  /**
   * Intercepta e garante a estrutura correta do objeto de submissão
   * @override
   */
  _prepareSubmitData(event, form, formData) {
    const data = super._prepareSubmitData(event, form, formData);
    
    // Garante que o Foundry não perca a referência do objeto system
    if (!data.system) data.system = {};
    
    // Se o campo mp_die veio no formulário, higieniza apenas se o foco mudou (blur),
    // mas para evitar travar o teclado ao digitar, deixamos a string fluir livre.
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
    
    // Vincula o gerenciador de abas persistente ao HTML
    this.controladorAbas.bind(this.element);

    // Clique na imagem grande abre o FilePicker nativo do Foundry
    const imagemEditavel = this.element.querySelector('img[data-edit="img"]');
    // Adiciona trava de segurança para o listener não se duplicar na memória do navegador
    if (imagemEditavel && !imagemEditavel.dataset.hasListener) {
      imagemEditavel.dataset.hasListener = "true";
      imagemEditavel.addEventListener("click", (event) => {
        event.preventDefault();
        
        const fp = new foundry.applications.apps.FilePicker.implementation({
          type: "image",
          current: this.document.img,
          callback: async (path) => {
            // O update já notifica a AppV2 e redesenha a ficha de forma reativa sozinhos!
            await this.document.update({ img: path });
          }
        });
        fp.browse();
      });
    }
  }
}
