package com.unicam.chorchain.codeGenerator.solidity;


import com.unicam.chorchain.codeGenerator.solidity.element.Function;
import com.unicam.chorchain.codeGenerator.solidity.Types;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.model.bpmn.Query;
import org.camunda.bpm.model.bpmn.instance.ExtensionElements;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaFormData;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaFormField;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaProperties;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/***
 *
 * class that has the purpose of defining an additional solidity function allowing its construction. From the signature to the body.
 */

@Getter
//@Setter
@Slf4j
public class AdditionalFunction {


    private final ModelElementInstance message;
    private ExtensionElements extensionElements;
    private Collection<CamundaFormField> camundaFormFields;
    private List<String> functions = new ArrayList<String>(0);
    private List<String> functionCalls = new ArrayList<String>(0);
    private List<String> parameters = new ArrayList<String>(0);

    public AdditionalFunction(ModelElementInstance message) {
        this.message = message;

        this.extensionElements =  message.getChildElementsByType(ExtensionElements.class).stream().findFirst().orElse(null);
        init();
    }

    public void init() {
        if (extensionElements != null) {
            Query<CamundaFormData> camundaFormData = extensionElements.getElementsQuery()
                    .filterByType(CamundaFormData.class);
            if (camundaFormData.count() > 0) {
                camundaFormFields = camundaFormData.singleResult()
                        .getCamundaFormFields();

//                List<CamundaProperties> pp =  camundaFormData.singleResult().getCamundaFormFields()

                functions = camundaFormFields.stream()
                        .map(cff -> Function.builder()
                                .name(cff.getCamundaId())
                                .internal(true)
                                .bodyString(cff.getAttributeValue("body"))
                                .visibility(Types.visibility.PRIVATE)
                                .parameters(createParameters(cff.getCamundaProperties(), cff.getCamundaId()))
                                .build().toString()
                        ).collect(Collectors.toList());
            }
        }
    }

    private Collection<? extends String> createParameters(CamundaProperties camundaProperties,
                                                          String functionName) {

        List<String> params;
        params = camundaProperties.getCamundaProperties()
                .stream()
                .map(p -> p.getAttributeValue("type") + " " + p.getCamundaName())
                .collect(Collectors.toList());
        parameters.addAll(params);
        functionCalls.add(functionName + "(" + camundaProperties.getCamundaProperties()
                .stream()
                .map(p -> p.getAttributeValue("defaultValue") != null &&
                        !p.getAttributeValue("defaultValue")
                                .equals("") ? p.getAttributeValue("defaultValue") : p.getCamundaName())
                .collect(Collectors.joining(",")) + ")");
        return params;
    }


}
