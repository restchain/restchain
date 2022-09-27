package com.unicam.chorchain.storage;

public class StorageFileAlreadyExistsException extends StorageException {

    public StorageFileAlreadyExistsException(String message) {
        super(message);
    }

}