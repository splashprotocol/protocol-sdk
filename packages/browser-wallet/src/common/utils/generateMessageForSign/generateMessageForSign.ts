export const generateMessageForSign = (
  payload: string | Uint8Array | number | undefined | object,
  timestamp: number,
  deviceId: string,
  requestId: string,
  nonce: string,
) => {
  const encoder = new TextEncoder();
  let normalizedPayload: Uint8Array;

  switch (typeof payload) {
    case 'object':
      normalizedPayload =
        payload instanceof Uint8Array
          ? payload
          : encoder.encode(JSON.stringify(payload));
      break;
    case 'undefined':
      normalizedPayload = encoder.encode('');
      break;
    default:
    case 'string':
    case 'number':
      normalizedPayload = encoder.encode(payload.toString());
      break;
  }

  return Uint8Array.from([
    ...normalizedPayload,
    ...encoder.encode(timestamp.toString()),
    ...encoder.encode(deviceId),
    ...encoder.encode(requestId),
    ...encoder.encode(nonce),
  ]);
};
