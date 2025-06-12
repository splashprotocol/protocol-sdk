import { generateRequestId } from '../../utils/generateRequestId/generateRequestId.ts';
import { requestIdValidator } from './requestIdValidator.ts';

const requestId = generateRequestId();

test('it should pass requestId', () => {
  expect(requestIdValidator(requestId)).toBe(true);
});

test('it should throw error for same requestId', () => {
  try {
    requestIdValidator(requestId);
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(Error);
  }
});

test('it should throw error for invalid requestId', () => {
  try {
    requestIdValidator('test');
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(Error);
  }
});
