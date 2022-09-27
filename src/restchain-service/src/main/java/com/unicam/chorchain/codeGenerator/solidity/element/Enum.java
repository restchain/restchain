package com.unicam.chorchain.codeGenerator.solidity.element;

import lombok.Builder;
import lombok.Singular;

import java.util.List;


/*
  enum State {DISABLED, ENABLED, DONE} State s;
 * */
@Builder
public class Enum {
    private String name;
    private String variableName;
    @Singular
    private List<String> elements;

    public String toString() {
        StringBuffer out = new StringBuffer();
        out.append("enum ").append(name).append("{");
        if (elements != null) {
            elements.forEach((var) -> out.append("\t").append(var.trim()).append(",\n"));
        }
        out.append("} \t");
        out.append(name).append(" ").append(variableName).append(";\n");
        return out.toString();
    }
}
