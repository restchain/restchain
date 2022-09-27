package com.unicam.chorchain.smartContract;

import com.unicam.chorchain.model.SmartContract;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class SmartContractShortDTO {
    private String id;
    private String address;
    private LocalDateTime created;
    private String solidity;
    private String name;
    private Set<SmartContractShortDTO> smartContractImpl;
    private Set<String> interfaces;
//    private String password;
}
