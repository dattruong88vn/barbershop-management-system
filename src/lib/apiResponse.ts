export function hasResponseData<TKey extends string, TValue>(
  response: Partial<Record<TKey, TValue>>,
  key: TKey,
): response is Record<TKey, TValue> {
  return typeof response[key] === "object" && response[key] !== null;
}
