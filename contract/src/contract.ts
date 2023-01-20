import { NearBindgen, call, view, near } from "near-sdk-js";

@NearBindgen({})
export class IndexerRegistry {
   indexer_registry;

  constructor() {
    this.indexer_registry = {};
  }

  @call({})
  register_indexer_function({ name, code }) {
    let account_id = near.signerAccountId();
    near.log(`${account_id} registered an indexer function with name: ${name}`);
    this.indexer_registry[name] = code;
  }

  @view({})
  read_indexer_function({ name }) {
    return this.indexer_registry[name] || null;
  }
  
  @call({})
  remove_indexer_function({ name }) {
    let account_id = near.signerAccountId();
    near.log(`${account_id} removed an indexer function with name: ${name}`);
    this.indexer_registry[name] = null;
  }
}
