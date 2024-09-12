export class InterceptorManager {
  handlers: any[] = [];

  use(fulfilled: any, rejected: any) {
    this.handlers.push({
      fulfilled,
      rejected,
    });
  }

  eject(id: number) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  forEach(fn) {
    this.handlers.forEach((handler) => {
      if (handler !== null) {
        fn(handler);
      }
    });
  }
}
