package com.unicam.chorchain.instance;

import lombok.Data;

@Data
public class InstanceSubscribeRequest {
    private String address;
    private Long instanceParticipantUserId;
}
