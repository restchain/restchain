package com.unicam.chorchain.codeGenerator.solidity.element;

import lombok.Builder;
import lombok.Singular;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Builder
public class Function {
    private final String functionComment;
    private final String name;
    private final String visibility;  // ci va o un enum o una classe
    private final String sourceId;
    private final String target;
    private final String modifier;
    @Singular
    private final List<String> bodyStrings;
    private final boolean payable;
    private final boolean transferTo;
    @Singular
    private final List<String> enables;
    @Singular
    private final List<String> calls;
    private final String disable;
    @Singular
    private final List<String> parameters;
    @Singular
    private final List<String> varAssignments;
    @Singular
    private final List<IfConstruct> ifConstructs;
    @Singular
    private final Map<String, Boolean> enableAndActiveTasks;
    private final String globalVariabilePrefix;
    private final boolean internal;

    public String toString() {
        StringBuffer out = new StringBuffer();

        // Add a comment
        if (functionComment != null) {
            out.append("\t//").append(functionComment).append("\n");
        }
        out.append("\tfunction ").append(name);
        out.append("(");
        if (parameters != null) {
//            out.append(parameters.stream()
            out.append(parameters.stream().filter((p -> !p.contains("address msg.sender")))
                    .map(String::trim).collect(Collectors.joining(", ")));
        }
        out.append(") ").append(visibility);
        if (payable) {
            out.append(" payable ");
        }
        if (modifier != null) {
            out.append(modifier);
        }
        out.append(" {\n");
        if (!internal) {
            out.append("\t\trequire(elements[position[\"").append(sourceId).append("\"]].status == State.ENABLED);\n");
            out.append("\t\tdone(\"").append(sourceId).append("\");\n");
        }
        if (ifConstructs != null) {
            ifConstructs.forEach(d -> out.append("\t").append(d).append("\n"));
        }

        if (transferTo) {
            out.append("\t\t").append("to.transfer(msg.value);\n");
        } else {
            if (varAssignments != null) {

                varAssignments.stream()
                        .filter(p -> !p.contains("address msg.sender"))
                        .forEach(d -> out.append("\t\t")
                                .append(globalVariabilePrefix)
                                .append(".")
                                .append(d.substring(d.lastIndexOf(' '), d.length()).trim())
                                .append(" = ")
                                .append(d.substring(d.lastIndexOf(' '), d.length()).trim())
                                .append(";\n"));
            }
        }
        if (bodyStrings != null) {
            bodyStrings.forEach(d -> out.append("\t\t").append(d == null ? "//empty" : d).append("\n"));
        }
        if (disable != null) {
            out.append("\t\tdisable(\"").append(disable).append("\");\n");
        }
        if (enables != null) {
            enables.forEach(d -> out.append("\t\tenable(\"").append(d).append("\");\n"));
        }

        if (calls != null) {
            calls.forEach(d -> out.append("\t\t").append(d.replace("-", "_")).append("\n"));
        }

        // spiegazione !!!!!  K -> prossimo elementID , V
        if (enableAndActiveTasks != null) {
            enableAndActiveTasks.forEach(
                    (k, v) -> {
                        out.append("\t\tenable(\"").append(k).append("\");\n");
                        if (v) {
                            out.append("\t\t").append(k.replace("-", "_")).append("();").append("\n");
                        }
                    }
            );


        }
        out.append("\t}\n\n");
        return out.toString();
    }

}


