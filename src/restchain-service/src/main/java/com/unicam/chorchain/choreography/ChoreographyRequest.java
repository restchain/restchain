package com.unicam.chorchain.choreography;

import lombok.Data;

import javax.validation.constraints.NotEmpty;

@Data
public class ChoreographyRequest {
    @NotEmpty
    private String name;
    private String description;
    @NotEmpty
    private String userAddress;
}
