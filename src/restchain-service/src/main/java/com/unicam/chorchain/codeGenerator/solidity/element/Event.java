package com.unicam.chorchain.codeGenerator.solidity.element;

import lombok.Builder;
import lombok.Singular;

import java.util.Map;

@Builder
public class Event {
    private String name;
    @Singular
    private Map<String, String> parameters;

    public String toString() {
        StringBuffer out = new StringBuffer();
        out.append("event ").append(name).append("(");
        if (parameters != null) {
            parameters.forEach((type, name) -> out.append(type).append(" ").append(name).append(","));
        }
        out.deleteCharAt(out.length() - 1); //remove last comma
        out.append(");\n");
        return out.toString();
    }

}
