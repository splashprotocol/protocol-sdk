import { getDeviceId } from '../../utils/getDeviceId/getDeviceId.ts';
import { deviceIdValidator } from './deviceIdValidator.ts';

test('it should pass source check', async () => {
  expect(deviceIdValidator(await getDeviceId(), await getDeviceId())).toBe(
    true,
  );
});

test('it should throws error', async () => {
  try {
    deviceIdValidator(await getDeviceId(), 'test');
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(Error);
  }
});
