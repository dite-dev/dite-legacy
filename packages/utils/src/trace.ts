export async function trace<T>(fn: () => Promise<T>) {
  return await fn();
}
