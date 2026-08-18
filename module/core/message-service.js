export const MessageService = {
  async createEffectAppliedMessage(actor, item) {
    const effectType = item.system?.effectType === "debuff" ? "debuff" : "buff";
    const durationText = item.system?.permanent ? "" : ` por ${item.system?.duration || 0} turno(s)`;
    const message = `${actor.name} recebeu o ${effectType} ${item.name}${durationText}`;

    return ChatMessage.create({
      user: CONST.BROADCAST_USER_ID,
      speaker: { alias: "Sistema" },
      content: message,
      style: CONST.CHAT_MESSAGE_STYLES.OOC
    });
  },

  async createEffectRemovedMessage(actor, effectName) {
    const message = `${effectName} removido do ${actor.name}`;

    return ChatMessage.create({
      user: CONST.BROADCAST_USER_ID,
      speaker: { alias: "Sistema" },
      content: message,
      style: CONST.CHAT_MESSAGE_STYLES.OOC
    });
  },

  renewEffect(effectName, turns) {
    return `Status [${effectName}] renovado para ${turns} turnos.`;
  },

  equipSuccess(itemName, slot) {
    return `${itemName} equipado em ${slot}.`;
  },

  slotOccupied(itemName, slotLabel) {
    return `Desequipe ${itemName} do slot ${slotLabel} antes de equipar.`;
  },

  cannotRemoveEquipped() {
    return "Desequipe o item antes de remover.";
  },

  invalidSlot(itemName) {
    return `${itemName} não possui um slot válido.`;
  },

  jobReplaced(newJobName) {
    return `Job substituído por ${newJobName}.`;
  },

  raceReplaced(newRaceName) {
    return `Raça substituída por ${newRaceName}.`;
  },

  async _confirmacaoPopup(msg) {
  return new Promise((resolve) => {
    new Dialog({
      title: "",
      content: msg,
      buttons: {
        sim: {
          icon: '<i class="fas fa-check"></i>',
          label: "Sim",
          callback: () => resolve(true) // Retorna true se clicar em Sim
        },
        nao: {
          icon: '<i class="fas fa-times"></i>',
          label: "Não",
          callback: () => resolve(false) // Retorna false se clicar em Não
        }
      },
      default: "sim",
      close: () => resolve(false) // Se fechar no "X", cancela por segurança
    }).render(true);
  });
},
 showError(title, content, label = "Entendido") {
  // Usa o novo DialogV2 do Foundry VTT
  foundry.applications.api.DialogV2.prompt({
    window: { title: title },
    content: `<p>${content}</p>`,
    ok: {
      label: label,
      callback: () => {
        // Código opcional ao fechar
      }
    }
  });
}


};
