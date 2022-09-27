package com.unicam.chorchain.codeGenerator.solidity.element;

import lombok.Builder;
import lombok.Singular;

import java.util.List;
import java.util.stream.Collectors;


/*
  enum State {DISABLED, ENABLED, DONE} State s;
 * */
@Builder
public class Constructor {
    @Singular
    private List<String> bodyElements;
    @Singular
    private List<String> params;

    public String toString() {
        StringBuffer out = new StringBuffer();
        out.append("\tconstructor ");
        out.append("(");
        if (params != null) {
            out.append(params.stream().collect(Collectors.joining(",")));
        }
        out.append(")");
        out.append(" public ");
        out.append("{\n\n");
        if (bodyElements != null) {
            bodyElements.forEach(
                    (var) -> out.append("\t").append(var).append(";\n"));
        }
        out.append("\t}\n");
        return out.toString();
    }
}
