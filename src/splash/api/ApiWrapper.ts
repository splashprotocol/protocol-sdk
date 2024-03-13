import { Api } from '../../core/api/Api.ts';

export class ApiWrapper {
  constructor(
    // @ts-ignore
    private api: Api,
    // @ts-ignore
    private includeMetadata?: boolean,
  ) {}
}
