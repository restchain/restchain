package com.unicam.chorchain.smartContract;

import com.unicam.chorchain.model.SmartContract;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SmartContractImplDTO {
    private String id;
    private String address;
    private LocalDateTime created;
    private String instanceName;
    private String name;
    private Long xmlId;
//    private String password;
}
