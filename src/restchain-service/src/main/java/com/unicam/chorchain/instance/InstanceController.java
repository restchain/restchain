package com.unicam.chorchain.instance;

import com.unicam.chorchain.model.Instance;
import com.unicam.chorchain.model.SmartContract;
import com.unicam.chorchain.smartContract.SmartContractAlreadyExistsException;
import com.unicam.chorchain.smartContract.SmartContractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.web.bind.annotation.RequestMethod.DELETE;

@RequiredArgsConstructor
@Slf4j
@RequestMapping("/instance")
@RestController
public class InstanceController {

    private final InstanceService service;
    private final SmartContractService smartContractService;
    private final InstanceRepository repo;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody InstanceRequest instanceRequest) {
        log.debug("Create instance {}", instanceRequest);
        service.create(instanceRequest);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

//    @GetMapping("{id}")
//    public ResponseEntity<?> listAllInstanceByModel(@PathVariable("id") Long id) {
//        log.debug("Model id - {}", id);
//        return ResponseEntity.status(HttpStatus.OK).body(service.findAllByModelId(id));
//    }

    @GetMapping("{id}")
    public ResponseEntity<?> instancesByModel(@PathVariable("id") Long modelId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAllByModelId(modelId));
    }

    @RequestMapping(value = "{id}", method = DELETE)
    public String delete(@PathVariable("id") Long id) {
//        InstanceDTO instanceDTO = service.read(id);
        log.debug("Instance to delete id - {}", id);
        return service.delete(id);
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> instanceSubscription(@RequestBody InstanceSubscribeRequest instanceSubscribeRequest) {
        service.instanceSubscription(instanceSubscribeRequest);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/selfSubscribe")
    public ResponseEntity<?> instanceSelfSubscription(@RequestBody InstanceSubscribeRequest instanceSubscribeRequest) {
        service.selfSubscription(instanceSubscribeRequest);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/deploy")
    public ResponseEntity<?> instanceDeploy(
            @RequestBody InstanceDeployRequest instanceDeployRequest) {
        Instance instance = service.findInstanceById(instanceDeployRequest.getId());
        if (instance.getSmartContract() != null) {
            throw new SmartContractAlreadyExistsException("SmartContract already exists for instance: " + instance.getId());
        }
        SmartContract smartContract = smartContractService.createFromBpmn(instance);
        instance.setSmartContract(smartContract);
        repo.save(instance);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }


}
