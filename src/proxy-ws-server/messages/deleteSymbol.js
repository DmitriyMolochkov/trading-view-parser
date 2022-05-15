const BaseMessage = require('./base');

class DeleteSymbolMessage extends BaseMessage {

  constructor(data = {}) {
    super(data);
  }

  toJSON() {
    return {
      ...super.toJSON(),
    };
  }
}

DeleteSymbolMessage.MESSAGE_TYPE = 'delete-symbol';
module.exports = DeleteSymbolMessage;