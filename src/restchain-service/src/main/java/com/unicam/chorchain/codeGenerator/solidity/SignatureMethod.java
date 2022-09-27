package com.unicam.chorchain.codeGenerator.solidity;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.model.bpmn.instance.ExtensionElements;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaFormField;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;

import java.util.*;
import java.util.stream.Collectors;

//https://forum.camunda.org/t/how-to-read-custom-elements-in-delegates/975/3

@Slf4j
@Getter
public class SignatureMethod {
    private final ModelElementInstance message;
    private ExtensionElements extensionElements;
    private Collection<CamundaFormField> camundaFormFields;
    private List<String> parameters = new ArrayList<String>(0);
    private List<String> fixedMsgSenderParams = new ArrayList<String>(0); //Parameters with reviewed msg.sender

    private List<String> returns = new ArrayList<String>(0);
    private Boolean interfaceMethod;
    private String interfaceName;
    private String interfaceImplName;
    private String name;
    private final String namespace = "http://restchain.com/schema/bpmn/cc";


    public SignatureMethod(ModelElementInstance message) {
        interfaceMethod = false;
        this.message = message;
        this.extensionElements = message.getChildElementsByType(ExtensionElements.class)
                .stream()
                .findFirst()
                .orElse(null);
        init();
        interfaceImplName = interfaceName + "Impl";
    }

    private void init() {
        if (extensionElements != null) {
            ModelElementInstance attachedSignature =
                    extensionElements
                            .getUniqueChildElementByNameNs(namespace, "signature");

//        List<DomElement> childElements =
//                attachedSignature
//                        .getDomElement()
//                        .getChildElements();
//
//
//        for (DomElement childElement : childElements) {

            if (attachedSignature.getAttributeValue("paramsName") != null) {
                String[] pNames = attachedSignature.getAttributeValue("paramsName").split(",");
                String[] pTypes = attachedSignature.getAttributeValue("paramsType").split(",");
                //Params
                int index = 0;

                Map<String, String> unorderedParams = new HashMap<>();


                for (String t : pTypes) {
//                    parameters.add(t.trim().concat(" ").concat(pNames[index].trim()));
                    unorderedParams.put(pNames[index].trim(), t.trim());
                    index++;
                }

                unorderedParams.entrySet()
                        .stream()
                        .sorted(Map.Entry.comparingByKey())
                        .forEachOrdered(x -> parameters.add(x.getValue().concat(" ").concat(x.getKey())));


            }

            if (attachedSignature.getAttributeValue("returnsName") != null) {
                String[] rNames = attachedSignature.getAttributeValue("returnsName").split(",");
                String[] rTypes = attachedSignature.getAttributeValue("returnsType").split(",");
                Map<String, String> unorderedReturns = new HashMap<>();

                int index = 0;
                for (String t : rTypes) {
//                    returns.add(t.trim().concat(" ").concat(rNames[index].trim()));
                    unorderedReturns.put(rNames[index].trim(), t.trim());
                    index++;
                }

                unorderedReturns.entrySet()
                        .stream()
                        .sorted(Map.Entry.comparingByKey())
                        .forEachOrdered(x -> returns.add(x.getValue().concat(" ").concat(x.getKey())));

            }

            //Returns


            //Interface attributes
            if (attachedSignature.getAttributeValue("interfaceMethod") != null) {
                interfaceMethod = Boolean.valueOf(attachedSignature.getAttributeValue("interfaceMethod"));
                interfaceName = attachedSignature.getAttributeValue("interfaceName");
            }

            if (attachedSignature.getAttributeValue("name") != null) {
                name = attachedSignature.getAttributeValue("name");
            }


        }
        fixedMsgSenderParams = parameters.stream()
                .map(p -> p.replace("msg.sender", name + "MsgSnd"))
                .collect(Collectors.toList());
    }

    /*** Retrives the signature method**/
    public String getSignature() {


        String result = name + "( " + String.join(",", fixedMsgSenderParams) + " ) public ";

        if (returns.size() > 0) {
            result = result + " returns (" + String.join(",", returns) + ")";
        }
        return result;
    }

    public String getCalls(String prefix) {
        StringBuilder sb = new StringBuilder();
        if (returns.size() > 0) {
            sb.append("(")
                    .append(returns.stream().map(s -> prefix + "." + lastWord(s)).collect(Collectors.joining(",")))
                    .append(") = ");
        }

        sb
//                .append(interfaceName.toLowerCase())
                .append(".").append(name).append("(").append(
                parameters.stream().map(this::lastWord).collect(Collectors.joining(","))
        ).append(");");
        return sb.toString();
    }


    public String getRestCall(String id, String callback, String type) {
        StringBuilder sb = new StringBuilder();

        sb.append("emit callRESTMethod(")
                .append(!id.isEmpty() ? "" + id + "," : "")
                .append("\"").append(callback).append("\",")
                .append(parameters.stream().map(this::lastWord).sorted().collect(Collectors.joining(",")))
                .append(",\"").append(type).append("\"")
                .append(");");
        return sb.toString();
    }

    private String lastWord(String s) {
        return s.substring(s.lastIndexOf(' '), s.length()).trim();
    }


}


