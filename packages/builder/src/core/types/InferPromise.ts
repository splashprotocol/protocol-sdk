export type InferPromise<P> = P extends Promise<infer T> ? T : never;
