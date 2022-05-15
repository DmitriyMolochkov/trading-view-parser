const BaseMessage = require('./base');

class UpdateSymbolPriceMessage extends BaseMessage {

  constructor(data = {}, price) {
    super(data);
    if (price == null)
      throw new Error(`Can not create instance of ${this.constructor.name}: price field is required`);

    this.price = price;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      price: this.price
    };
  }
}

UpdateSymbolPriceMessage.MESSAGE_TYPE = 'update-symbol-price';
module.exports = UpdateSymbolPriceMessage;