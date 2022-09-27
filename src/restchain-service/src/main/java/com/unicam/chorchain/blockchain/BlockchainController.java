package com.unicam.chorchain.blockchain;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unicam.chorchain.smartContract.SmartContractImplDTO;
import com.unicam.chorchain.smartContract.SmartContractService;
import io.ipfs.api.IPFS;
import io.ipfs.api.MerkleNode;
import io.ipfs.api.NamedStreamable;
import io.ipfs.multihash.Multihash;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@RequiredArgsConstructor
@Slf4j
@RequestMapping("/blockchain")
@RestController
public class BlockchainController {
    private final BlockchainService service;
    private final SmartContractService instanceService;


    @PostMapping("/transaction")
    public ResponseEntity<?> execute(@RequestBody BlockchainTransaction transaction) throws IOException {
        BlockchainTransaction blockchainTransaction = service.process(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(blockchainTransaction);

    }


    @PostMapping("/transaction-with-ipfs")
    public ResponseEntity<?> executeWithIpfs(
            @RequestBody BlockchainTransactionWithIpfs transaction) throws IOException, ExecutionException, InterruptedException {
        IPFS ipfs = new IPFS("/dnsaddr/ipfs.infura.io/tcp/5001/https");
//        ipfs.refs.local();
        ObjectMapper objectMapper = new ObjectMapper();
        String ipfsCallString = objectMapper.writeValueAsString(transaction.getIpfsCall());
        log.info("ipfscall {}", ipfsCallString);

        // Creating an ipfs resource of an ipfsCall object
        NamedStreamable.ByteArrayWrapper file = new NamedStreamable.ByteArrayWrapper(ipfsCallString.getBytes());
        MerkleNode addResult = ipfs.add(file).get(0);


        if (addResult.name.isPresent()) {
            log.info("Added ipfs id: {}", addResult.name.get());
            Multihash filePointer = Multihash.fromBase58(addResult.name.get());
            byte[] fileContents = ipfs.cat(filePointer);
            log.info("Added ipfs data : {}", new String(fileContents));
            // Add to the transaction obj the ipfsId value calculated over the ipfsCall
            transaction.setIpfsId(addResult.name.get());
        }

        Optional<SmartContractImplDTO> matchingObject;
        matchingObject = instanceService.getMySmartContractImpls().stream().
                filter(c -> c.getId().equals(Long.toString(transaction.getInstanceId()))).
                findFirst();

        log.info("{}", objectMapper.writeValueAsString(instanceService.getMySmartContractImpls()));

        transaction.setContractAddress(matchingObject.get().getAddress());

        BlockchainTransaction blockchainTransaction = service.processFunction(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(blockchainTransaction);

    }

}
