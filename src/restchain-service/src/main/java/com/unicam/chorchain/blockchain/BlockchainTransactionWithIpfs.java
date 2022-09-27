package com.unicam.chorchain.blockchain;

import lombok.Data;

@Data
public class BlockchainTransactionWithIpfs extends BlockchainTransaction {
    private String functionName;    // BlockChain Function name to invoke
    private IpfsCall ipfsCall;      // Contains all the ipfsCall definitions to invoke a REST method
    private String ipfsId;          // Contains the ipfs id value calculated over the above defined ipfsCall
    private Long instanceId;        // It is the instance related to the involved SmartContractImpl used to retrieve the Smart Contract address
    private String contractAddress; // SmartContract address
    private String privateKey;      //
}


/***
 * Minimal requirements
 *
 *
 * functionName
 * ipfsCall
 * instanceId
 * privateKey
 *
 */
