import { SafetyRequest } from '../../../common/types/Request.ts';
import { Theme } from './Theme.ts';

export type SetThemeReq = SafetyRequest<'SET_THEME', Theme>;
