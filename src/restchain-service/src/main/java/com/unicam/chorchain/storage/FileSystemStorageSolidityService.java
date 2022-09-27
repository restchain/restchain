package com.unicam.chorchain.storage;

import lombok.AccessLevel;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class FileSystemStorageSolidityService extends FileSystemStorageServiceAbstract {

    @Getter(AccessLevel.PROTECTED)
    @Value("${solidity.dir}")
    private String dir;

}
