package com.unicam.chorchain.error;

import com.unicam.chorchain.smartContract.SmartContractAlreadyExistsException;
import com.unicam.chorchain.smartContract.SmartContractCompilationException;
import com.unicam.chorchain.smartContract.SmartContractConnectExceptionException;
import com.unicam.chorchain.smartContract.SmartContractDeployException;
import com.unicam.chorchain.storage.StorageFileAlreadyExistsException;
import com.unicam.chorchain.storage.StorageFileNotFoundException;
import javassist.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;

@ControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityExistsException.class)
    public ResponseEntity entityExistsException(EntityExistsException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity notFoundException(EntityNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }


    @ExceptionHandler(SmartContractCompilationException.class)
    public ResponseEntity<?> smartContractCompilationException(SmartContractCompilationException exc) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(exc.getMessage());
    }

    @ExceptionHandler(SmartContractDeployException.class)
    public ResponseEntity<?> smartContractDeployException(SmartContractCompilationException exc) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(exc.getMessage());
    }

    @ExceptionHandler(SmartContractAlreadyExistsException.class)
    public ResponseEntity<?> smartContractAlreadyExistsException(SmartContractCompilationException exc) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(exc.getMessage());
    }

    @ExceptionHandler(SmartContractConnectExceptionException.class)
    public ResponseEntity<?> smartContractConnectedException(SmartContractConnectExceptionException exc) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(exc.getMessage());
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<?> handleStorageFileNotFound(NotFoundException exc) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(exc.getMessage());
    }

    @ExceptionHandler(StorageFileNotFoundException.class)
    public ResponseEntity<?> handleStorageFileNotFound(StorageFileNotFoundException exc) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(exc.getMessage());
    }

    @ExceptionHandler(StorageFileAlreadyExistsException.class)
    public ResponseEntity<?> handleStorageFileAlreadyExists(StorageFileAlreadyExistsException exc) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(exc.getMessage());
    }
}
