package com.unicam.chorchain.codeGenerator.solidity.element;

import lombok.Builder;

@Builder
public class Mapping {
    private String key;
    private String value;
    private String name;

    public String toString() {
        StringBuffer out = new StringBuffer();
        out.append("mapping(").append(key).append(" => ").append(value).append(") ");
        out.append(name).append(" ;");
        return out.toString();
    }
}
