package com.unicam.chorchain.smartContract;

public class SmartContractDeployException extends RuntimeException {

    public SmartContractDeployException(String message) {
        super(message);
    }

    public SmartContractDeployException(String message, Throwable cause) {
        super(message, cause);
    }
}