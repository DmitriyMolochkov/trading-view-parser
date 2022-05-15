const BaseMessage = require('./base');

class AddSymbolMessage extends BaseMessage {

  constructor(data = {}) {
    super(data);
  }

  toJSON() {
    return {
      ...super.toJSON(),
    };
  }
}

AddSymbolMessage.MESSAGE_TYPE = 'add-symbol';
module.exports = AddSymbolMessage;