package com.unicam.chorchain.blockchain;

import lombok.Data;

@Data
public class BlockchainTransaction {

    private String id;
    private String fromId;
    private String toId;
    private Long value;
    private Boolean accepted = false;
}
