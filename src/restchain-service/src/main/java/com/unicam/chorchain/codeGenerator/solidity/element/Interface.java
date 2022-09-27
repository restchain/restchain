package com.unicam.chorchain.codeGenerator.solidity.element;

import lombok.Builder;
import lombok.Singular;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Builder
public class Interface {
    private String name;
    @Singular
    private Set<String> functions;
    public String toString() {
        StringBuffer out = new StringBuffer();
        out.append("/*Interface generation*/\n");
        out.append("contract ").append(name).append("{\n");
        if (functions != null) {
            functions.forEach((s) -> out.append("\tfunction ").append(s).append(";\n"));
        }
        out.deleteCharAt(out.length() - 1); //remove last comma
        out.append("\n}//Interface End\n\n\n");

        return out.toString();
    }

}