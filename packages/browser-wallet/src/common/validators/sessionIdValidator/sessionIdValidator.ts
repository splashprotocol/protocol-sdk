import { Session } from '../../models/Session/Session.ts';

const ERROR_MESSAGE = 'INVALID SESSION ID';

export const sessionIdValidator = async (
  id: string,
  session: Session,
): Promise<true> => {
  if (id !== session.id.data || !(await session.verifyId(id))) {
    throw new Error(ERROR_MESSAGE);
  }
  return true;
};
