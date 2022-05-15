class BaseMessage {
  static fromString(str) {
    return new this(JSON.parse(str));
  }

  constructor (data) {
    if (this.constructor.name === 'BaseMessage') {
      throw new Error(`${this.constructor.name}: can not create instance of abstract class`);
    }

    if (data.symbol == null) {
      throw new Error(`Can not create instance of ${this.constructor.name}: symbol field is required`);
    }

    Object.assign(this, data);

    if (!this.type) {
      this.type = this.constructor.MESSAGE_TYPE;
    }
  }

  toJSON () {
    return {
      type: this.type,
      symbol: this.symbol,
    };
  }
}

BaseMessage.MESSAGE_TYPE = 'message';
module.exports = BaseMessage