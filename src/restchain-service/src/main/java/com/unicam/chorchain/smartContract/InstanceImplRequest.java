package com.unicam.chorchain.smartContract;

import lombok.Data;

import javax.validation.constraints.NotEmpty;

@Data
public class InstanceImplRequest {
    @NotEmpty
    private String name;
    private String description;
    private Long smartContractId;
    private String data;
}
