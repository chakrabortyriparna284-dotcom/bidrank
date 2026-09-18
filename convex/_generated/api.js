function createApiProxy(prefix = "") {
  return new Proxy(
    {},
    {
      get(target, prop) {
        if (typeof prop === "symbol" || prop === "then" || prop === "toJSON") {
          return undefined;
        }
        const path = prefix ? `${prefix}.${String(prop)}` : String(prop);
        return new Proxy(
          { _path: path },
          {
            get(subTarget, subProp) {
              if (typeof subProp === "symbol" || subProp === "then" || subProp === "toJSON") {
                return undefined;
              }
              return `${path}:${String(subProp)}`;
            },
          }
        );
      },
    }
  );
}

export const api = createApiProxy();
export const internal = createApiProxy("internal");
