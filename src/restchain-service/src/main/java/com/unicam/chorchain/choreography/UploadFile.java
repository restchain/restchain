package com.unicam.chorchain.choreography;

import lombok.Data;

@Data
public class UploadFile {
    private String data;
    private String svg;
    private String name;
    private String description;
    private String extension;
    private boolean overwrite;

    public String getFilename() {
        return this.name.concat(this.extension);

    }

    public UploadFile(){
        super();
    }
    public UploadFile(String data, String name, String extension) {
        this.data = data;
        this.name = name;
        this.extension = extension;
    }
}

