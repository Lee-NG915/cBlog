export default class Bem {
  constructor(block, status) {
    this.block = block || '';
    this.status = status || '';
  }

  toString() {
    return `${this.block}${this.status || ''}`;
  }

  elm(element) {
    return new Bem(
      this.block
        .split(' ')
        .map((b) => `${b}__${element}`)
        .join(' '),
      this.status
    );
  }

  mod(modifier) {
    if (modifier) {
      return new Bem(
        this.block
          .split(' ')
          .map((b) => `${b} ${b}--${modifier}`)
          .join(' '),
        this.status
      );
    }
    return new Bem(this.block, this.status);
  }

  mix(mixer) {
    return new Bem(`${this.block}${mixer ? ` ${mixer}` : ''}`, this.status);
  }

  state(status, condition) {
    return new Bem(this.block, `${this.status}${condition ? ` ${status}` : ''}`);
  }
}
