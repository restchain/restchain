package com.unicam.chorchain.smartContract;

import com.unicam.chorchain.instance.InstanceDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RequestMapping("/contract")
@RestController
@Slf4j
@RequiredArgsConstructor
public class SmartContractController {

    private final SmartContractService service;

    @PostMapping({"/createSCImplementation"})
    public SmartContractFullDTO create(@RequestBody InstanceImplRequest instanceImplRequest) {
        return service.createCompileDeployImpl(instanceImplRequest);
    }

    @GetMapping({"/list"})
    public Set<SmartContractDTO> listAllSmartContract(Pageable pageable) {
        return service.getMySmartContracts();
    }

    @GetMapping({"/listImpl"})
    public Set<SmartContractImplDTO> listAllSmartContractImpl(Pageable pageable) {
        return service.getMySmartContractImpls();
    }

    @GetMapping({"/listImpl/{id}"})
    public Set<SmartContractDTO> listAllSmartContractImplBySmartContractId(@PathVariable("id") Long id,Pageable pageable) {
        return service.getMySmartContractImplsBySmartContractId(id);
    }


    @GetMapping("/i")
    public Set<InstanceDTO> listAllInstancesWithSmartContract(Pageable pageable) {
        return service.getInstancesWithSmartContract();
    }

    @GetMapping("{id}")
    public SmartContractFullDTO read(@PathVariable("id") Long id) {
        return service.read(id);
    }






//
//    @ExceptionHandler(SmartContractCompilationException.class)
//    public ResponseEntity<?> smartContractCompilationException(SmartContractCompilationException exc) {
//        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(exc.getMessage());
//    }
//
//
//    private final SmartContractService service;

}