package com.unicam.chorchain.blockchain;

import lombok.Data;

@Data
public class ExternalInteractionRequest {
    private Long instanceId;
    private String privateKey;
    private Long modelId;
}
