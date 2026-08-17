const fields = foundry.data.fields;

export const Field = {
  Boolean(initial = false, required = false) {
    return new fields.BooleanField({ initial, required });
  },
  String(initial = "", required = false) {
    return new fields.StringField({ initial, required });
  },
  Number(initial = 0, integer = true, required = false, options = {}) {
    return new fields.NumberField({ initial, integer, required, ...options });
  },
  Array(type = fields.StringField, initial = []) {
    let fieldType;
    if (!type) {
      fieldType = new fields.StringField();
    } else if (typeof type === "object") {
      // Se já for uma instância de campo pronta do Foundry (ex: new fields.ObjectField())
      fieldType = type; 
    } else if (typeof type === "function") {
      const isModel = type.prototype instanceof foundry.abstract.DataModel;
      if (isModel) {
        // CORREÇÃO: Para arrays de sub-modelos customizados, injeta um EmbeddedDataField como tipo do elemento
        fieldType = new fields.EmbeddedDataField(type);
      } else {
        // Se for uma classe de campo primitiva (ex: fields.StringField)
        fieldType = new type();
      }
    }
    return new fields.ArrayField(fieldType, { initial: initial ?? [], required: false });
  },
  Embedded(model, initial = {}) {
    // CORREÇÃO: Cria a instância isolada de um sub-modelo usando o operador 'new'
    return new fields.EmbeddedDataField(model, { initial });
  },
  Rich(initial = "", required = false){
    return new fields.HTMLField({ initial, required });
  },
  Schema(definition) {
    return new fields.SchemaField(definition);
  },
  Object(initial = {}) {
    return new fields.ObjectField({ initial });
  }
};