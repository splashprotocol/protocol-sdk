import { Api } from '../../core/api/Api.ts';

export class ApiWrapper {
  constructor(
    private api: Api,
    private includeMetadata?: boolean,
  ) {}
}
