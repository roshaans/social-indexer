// Find all our documentation at https://docs.near.org
import { NearBindgen, near, call, view, UnorderedMap } from 'near-sdk-js';

//! This implementation is better in my view but nested collections 
//! in near-sdk-js are a bit of a pain and I was having a few issues so created a simpler implementation

const NEAR_PER_BYTE = 0

@NearBindgen({})
class IndexerRegistry {
  indexer_registry: UnorderedMap<UnorderedMap<Uint8Array>>;

  constructor(){
    this.indexer_registry = new UnorderedMap("r")
  }

  @call({payableFunction: true})
  register_indexer_function(name: string, code: Uint8Array) {
    let signer_id = near.signerAccountId()
    let is_indexer_function_registered = false

    // Check if enough storage is attached
    // let storage_cost = BigInt(code.length * NEAR_PER_BYTE)
    // if (near.attachedDeposit() < storage_cost) {
    //   return `Not enough storage deposited for given indexer function. Attach at least ${storage_cost} `
    // }
    
    // check if indexer_function is already registeried
    if (this.indexer_registry.get(signer_id) && this.indexer_registry.get(signer_id).get(name)) {
      is_indexer_function_registered = true
    }


    const innerMap = this.indexer_registry.get(name, {
      reconstructor: UnorderedMap.reconstruct,
      defaultValue: new UnorderedMap<Uint8Array>("c"),
    })
    
    innerMap.set(name, code);
    this.indexer_registry.set(signer_id, innerMap);
    if (is_indexer_function_registered) {
      near.log(`indexer function is already registered under the name: ${name}. Updating indexing code. `);
    } else {
      near.log(`${signer_id} registered an indexer function with name: ${name}`);

    }
  }

  @view({}) // This method is read-only and can be called for free
  read_indexer_function(accountId: string, name: string): string {
    const innerMap = this.indexer_registry.get(accountId, {
      reconstructor: UnorderedMap.reconstruct,
    });
    if (innerMap === null) {
      return "the accountId provided does not have any indexer functions registered";
    }
    let indexer_code = innerMap.get(name)
    if (indexer_code == null ) {
      return `an indexer function was not found by the provided indexer name: ${name}`;
    }
    return indexer_code.toString()
  }

  @call({})
  remove_indexer_function(name: string) {
    let signer_id = near.signerAccountId()
    const innerMap = this.indexer_registry.get(signer_id, {
      reconstructor: UnorderedMap.reconstruct,
    });
    if (innerMap === null) {
      return "the signer does not have any contracts registered.";
    }
    let indexer_code = innerMap.get(name)
    if (indexer_code == null ) {
      return "an indexer function was not found by the provided indexer name.";
    }
    innerMap.remove(name)
    near.log(`${signer_id} removed an indexer function with the name: ${name}`);
    return "indexer function removed"
  }

}
