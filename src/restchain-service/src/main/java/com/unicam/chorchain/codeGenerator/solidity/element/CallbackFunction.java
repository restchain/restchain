package com.unicam.chorchain.codeGenerator.solidity.element;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;


@Slf4j
public class CallbackFunction {
    private final String id;
    private final String name;

    public CallbackFunction(String id, String name){
        this.id = id;
        this.name = name;
    }

    public String getName() {
        return "_callback_"+name;
    }

    public String getId() {
        return id+"_resp";
    }
}
