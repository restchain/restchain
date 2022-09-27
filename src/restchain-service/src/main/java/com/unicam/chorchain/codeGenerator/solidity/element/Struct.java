package com.unicam.chorchain.codeGenerator.solidity.element;

import lombok.Builder;
import lombok.Singular;

import javax.validation.constraints.NotEmpty;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Builder
public class Struct {
    @NotEmpty
    String name;
    @NotEmpty
    @Singular
    Map<String, String> variableMaps;
    @Singular
    List<String> variables;

    public String toString() {
        StringBuffer out = new StringBuffer();
        out.append("struct ").append(name).append(" {\n");
        if (variableMaps != null) {
            variableMaps.forEach((type, name) -> out.append("\t\t").append(type).append(" ").append(name).append(";\n"));
        }
        if (variables != null) {
            //put only one spece if there are more
            variables.stream()
                    .filter(s->s.trim().length()>0)
                    .filter(s->!s.contains("address msg.sender"))
                    .forEach((var) ->out.append("\t\t").append(var.replaceAll("\\s+", " ").replace("memory","").trim()).append(";\n"));
        }
        out.append("\t}\n");
        return out.toString();
    }
}
