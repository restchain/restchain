package com.unicam.chorchain.codeGenerator.solidity.element;

import lombok.Builder;
import lombok.Singular;

import java.util.Set;

@Builder
public class Stub {
    private String name;
    private String interfaceName;
    @Singular
    private Set<String> functions;
    public String toString() {
        StringBuffer out = new StringBuffer();
        out.append("/*InterfaceImpl generation, provides function stubs*/\n");
        out.append("contract ").append(name).append(" is ").append(interfaceName).append("{\n\n");
        if (functions != null) {
            functions.forEach((s) ->
                    out.append("\tfunction ").append(s).append("{\n")
                    .append("\n\t\t//stub generated -- insert here your code \n\n")
                    .append("\t}\n\n")
            );
        }
        out.deleteCharAt(out.length() - 1); //remove last comma
        out.append("\n}//InterfaceImplementation End\n\n");
        return out.toString();
    }

}