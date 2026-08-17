// MessageService carregado

export const MessageService = {
  // --- MÉTODO INTEGRADO PARA O DROP-HANDLER NO V14 ---
  async createEffectAppliedMessage(actor, item) {
    // Busca o texto da descrição do EffectsItemModel
    const descricao = item.system.descricao || "Nenhuma descrição fornecida.";

    // Monta o HTML do cartão de chat no estilo clássico de RPG
    const chatTemplate = `
      <div class="ffrpg3e-chat-card effect-card">
        <header class="card-header flexrow" style="display: flex; align-items: center; gap: 8px;">
          <img src="${item.img || 'icons/svg/book.svg'}" width="24" height="24" style="border: none; border-radius: 4px;"/>
          <h3 style="margin: 0; font-size: 14px; font-weight: bold; color: #dfd5c6;">Status Aplicado: ${item.name}</h3>
        </header>
        <div class="card-content" style="margin-top: 8px; font-size: 12px; font-style: italic; color: #ccc;">
          ${descricao}
        </div>
        <footer class="card-footer" style="margin-top: 6px; font-size: 11px; text-align: right; color: #888;">
          Alvo: <strong>${actor.name}</strong>
        </footer>
      </div>
    `;

    // Cria fisicamente a mensagem no painel de Chat do Foundry v14
    return ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      content: chatTemplate,
      style: CONST.CHAT_MESSAGE_STYLES.OOC // Padrão estável exigido no v14
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
  }
};
