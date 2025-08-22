import { deviceIdValidator } from './deviceIdValidator.ts';

test('deviceIdValidator should pass validation with matching device IDs', () => {
  const deviceId = 'test-device-id-123';
  expect(deviceIdValidator(deviceId, deviceId)).toBe(true);
});

test('deviceIdValidator should fail validation with different device IDs', () => {
  expect(() => {
    deviceIdValidator('device-id-1', 'device-id-2');
  }).toThrow('INVALID DEVICE ID');
});

test('deviceIdValidator should fail validation with empty device IDs', () => {
  expect(() => {
    deviceIdValidator('', 'test-device-id');
  }).toThrow('INVALID DEVICE ID');
});

test('deviceIdValidator should fail validation with undefined device IDs', () => {
  expect(() => {
    deviceIdValidator(undefined as any, 'test-device-id');
  }).toThrow('INVALID DEVICE ID');
});
