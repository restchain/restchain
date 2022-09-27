package com.unicam.chorchain.smartContract;

public class SmartContractConnectExceptionException extends RuntimeException {

    public SmartContractConnectExceptionException(String message) {
        super(message);
    }

    public SmartContractConnectExceptionException(String message, Throwable cause) {
        super(message, cause);
    }
}