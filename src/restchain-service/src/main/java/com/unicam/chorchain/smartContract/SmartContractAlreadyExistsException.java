package com.unicam.chorchain.smartContract;

public class SmartContractAlreadyExistsException extends RuntimeException {
    public SmartContractAlreadyExistsException(String message) {
        super(message);
    }
}
