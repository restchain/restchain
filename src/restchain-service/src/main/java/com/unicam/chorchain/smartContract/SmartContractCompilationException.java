package com.unicam.chorchain.smartContract;

public class SmartContractCompilationException extends RuntimeException {

    public SmartContractCompilationException(String message) {
        super(message);
    }

    public SmartContractCompilationException(String message, Throwable cause) {
        super(message, cause);
    }
}