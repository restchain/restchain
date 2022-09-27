package com.unicam.chorchain.user;

import lombok.Data;

import javax.validation.constraints.NotEmpty;

@Data
public class UserRequest {
    @NotEmpty
    private String address;
    @NotEmpty
    private String password;
}
