export class LunarError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LunarError';
  }
}

export class InvalidLunarDateError extends LunarError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidLunarDateError';
  }
}

export class InvalidGregorianDateError extends LunarError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidGregorianDateError';
  }
}

export class NotImplementedError extends LunarError {
  constructor(feature: string) {
    super(`${feature} 尚未实现`);
    this.name = 'NotImplementedError';
  }
}
