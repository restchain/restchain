package com.unicam.chorchain.codeGenerator.solidity;


import com.unicam.chorchain.codeGenerator.solidity.element.Mapping;
import com.unicam.chorchain.codeGenerator.solidity.element.Struct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.model.bpmn.instance.ExtensionElements;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaFormField;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaProperties;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Getter
//@Setter
@Slf4j
public class AdditionalType {


    private final ModelElementInstance message;
    private ExtensionElements extensionElements;
    private Collection<CamundaFormField> camundaFormFields;
    private List<String> structs = new ArrayList<String>(0);
    private List<String> globals = new ArrayList<String>(0);
    private List<String> mappings = new ArrayList<String>(0);
    private List<String> functionCalls = new ArrayList<String>(0);
    private List<String> parameters = new ArrayList<String>(0);

    public AdditionalType(ModelElementInstance message) {
        this.message = message;
        this.extensionElements = message.getChildElementsByType(ExtensionElements.class)
                .stream()
                .findFirst()
                .orElse(null);
        init();
    }

    public void init() {
        if (extensionElements != null) {
            ModelElementInstance typeStructs = extensionElements.getElements()
                    .stream()
                    .filter(a -> a.getElementType().getTypeName().equals("typeStruct"))
                    .findFirst()
                    .orElse(null);


            if (typeStructs != null) {
                camundaFormFields = typeStructs.getChildElementsByType(CamundaFormField.class);

                camundaFormFields.forEach(a -> log.debug("ff-> {} , {}",
                        a.getCamundaId(),
                        a.getCamundaProperties()
                                .getCamundaProperties()
                                .stream()
                                .map(s -> s.getAttributeValue("name").concat(" ").concat(s.getAttributeValue("type")))
                                .collect(Collectors.joining())));

                structs = loadStructs();
                mappings = loadMappings();
                globals = loadGlobals();
            }
        }
    }

    private List<String> loadGlobals() {
        return camundaFormFields.stream().filter(f -> f.getCamundaType().equals("global")).map(
                ff -> getSingleAttributeValue(ff.getCamundaProperties(), "type").concat(" ")
                        .concat(getSingleAttributeValue(ff.getCamundaProperties(), "name").concat(";\n"))
        ).collect(Collectors.toList());
    }

    private Collection<? extends String> createVariables(CamundaProperties camundaProperties) {
        return camundaProperties.getCamundaProperties()
                .stream()
                .map(s -> s.getAttributeValue("type").concat(" ").concat(s.getAttributeValue("name")))
                .collect(Collectors.toList());
    }


    private String getSingleAttributeValue(CamundaProperties camundaProperties, String attribute) {
        if (camundaProperties.getCamundaProperties().stream().findFirst().isPresent()) {
            return camundaProperties.getCamundaProperties().stream().findFirst().get().getAttributeValue(attribute);
        } else return "";
    }


    private List<String> loadStructs() {
        return camundaFormFields.stream().filter(f -> f.getCamundaType().equals("struct")).map(
                ff -> Struct.builder()
                        .name(ff.getCamundaId())
                        .variables(createVariables(ff.getCamundaProperties()))
                        .build()
                        .toString()
        ).collect(Collectors.toList());
    }

    private List<String> loadMappings() {
        return camundaFormFields.stream().filter(f -> f.getCamundaType().equals("mappings")).map(
                ff -> Mapping.builder()
                        .name(ff.getCamundaId())
                        .key(getSingleAttributeValue(ff.getCamundaProperties(), "name"))
                        .value(getSingleAttributeValue(ff.getCamundaProperties(), "type"))
                        .build()
                        .toString()
        ).collect(Collectors.toList());

    }

}
