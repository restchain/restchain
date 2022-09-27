package com.unicam.chorchain.smartContract;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class SmartContractFullDTO {
    private String id;
    private String address;
    private String abi;
    private String bin;
    private LocalDateTime created;
    private String name;
    private Set<String> functionSignatures;
    private String solidity;
    private Long xmlId;

//    private String password;
}
