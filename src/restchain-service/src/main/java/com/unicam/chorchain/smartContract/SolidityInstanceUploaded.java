package com.unicam.chorchain.smartContract;

import com.unicam.chorchain.choreography.UploadFile;
import com.unicam.chorchain.codeGenerator.solidity.SolidityInstance;
import lombok.Data;

@Data
public class SolidityInstanceUploaded {
    UploadFile uploadFile;
    SolidityInstance solidityInstance;

    public SolidityInstanceUploaded(UploadFile uploadFile,
                                    SolidityInstance solidityInstance) {
        this.uploadFile = uploadFile;
        this.solidityInstance = solidityInstance;
    }
}
