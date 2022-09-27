package com.unicam.chorchain.codeGenerator.solidity.element;

import lombok.Builder;
import lombok.Singular;
import lombok.extern.slf4j.Slf4j;

import javax.validation.constraints.NotEmpty;
import java.util.Collection;
import java.util.stream.Collectors;

@Builder
@Slf4j
public class Contract {
    @NotEmpty
    private String pragmaVersion;
    @NotEmpty
    private String fileName;
    @NotEmpty
    private String constructor;
    //    @NotEmpty
//    private String constructor;
    @Singular
    private Collection<String> bodyStrings;
//    @Singular
//    private Collection<String> customTextStrings;

    private @Singular
    Collection<String> structs;
    private @Singular
    Collection<String> variables;
    private @Singular
    Collection<String> modifiers;
    private @Singular
    Collection<String> mappings;
    private @Singular
    Collection<String> enumElements;
    private @Singular
    Collection<String> events;
    private  @Singular
    Collection<String> functions;
    private @Singular
    Collection<String> customs;

//    public void addStruct(Struct s1) {
//        structs.add(s1);
//    }

    public String toString() {
        StringBuffer out = new StringBuffer();

        out.append("\n");
        out.append("pragma solidity ").append(pragmaVersion).append(";\n");
        out.append("pragma experimental ABIEncoderV2;\n");
        out.append("\n");

        out.append("contract ").append(fileName).append("{\n");
        out.append("\n\n");

        if (constructor != null){
            out.append("\t/* constructor */ \n");
            out.append(constructor);
        }

        if (bodyStrings != null) {
            out.append("\t").append(String.join("\n", bodyStrings));
        }
//
//        if (customTextStrings != null) {
//            out.append("\t/* Custom part */\n");
//            customTextStrings.forEach((s) -> out.append("\t").append(s).append("\n"));
//            out.append("\n");
//        }

        if (mappings != null) {
            out.append("\n\t/* Mappings */\n");
            mappings.forEach((s) -> out.append("\t").append(s).append("\n"));
            out.append("\n");
        }

        if (structs != null) {
            out.append("\t/* Structs */\n");
            structs.forEach((s) -> out.append("\t").append(s).append("\n"));
            out.append("\n");
        }

        if (enumElements != null) {
            out.append("\t/* Enums */\n");
            enumElements.forEach((s) -> out.append("\t").append(s).append("\n"));
        }

        if (variables != null) {
            out.append("\t/* Variables */\n");
            variables.forEach((s) -> out.append("\t").append(s).append("\n"));
        }

        if (events != null) {
            out.append("\t/* Events */ \n");
            events.forEach((s) -> out.append("\t").append(s).append("\n"));
        }

        if (modifiers != null) {
            out.append("\t/* Modifiers */ \n");
            modifiers.forEach((s) -> out.append("\t").append(s).append("\n"));
        }

        if (functions != null) {
            out.append("\t/* Functions */\n\n");
            functions.forEach((s) -> out.append("\t").append(s).append("\n"));
        }

        if (customs != null) {
            out.append("\t/* Custom */\n");
            customs.forEach((s) -> out.append("\t").append(s).append("\n"));
        }

        out.append("\n\n");
        out.append("}");
        out.append("//Contract end\n");
        out.append("\n");

        return out.toString();
    }

}
