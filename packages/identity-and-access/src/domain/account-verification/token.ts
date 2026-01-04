import { v4 } from "uuid";

class Token {
  value: string;

  constructor(value: string) {
    this.value = value;
  }

  static create() {
    return new Token(v4());
  }
}

export { Token };
