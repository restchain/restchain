package com.unicam.chorchain;

import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.bpmn.instance.*;
import org.camunda.bpm.model.bpmn.instance.Process;

import java.io.File;

public class ProcessGen {

    public File genSimpleProcess() {

        // create an empty model
        BpmnModelInstance modelInstance = Bpmn.createEmptyModel();
        Definitions definitions = modelInstance.newInstance(Definitions.class);
        definitions.setTargetNamespace("http://camunda.org/examples");
        modelInstance.setDefinitions(definitions);

        // create the process
        Process process = createElement(modelInstance, definitions,
                "generated-process", Process.class);

        // create start event, user task and end event
        StartEvent startEvent = createElement(modelInstance, process, "start",
                StartEvent.class);
        UserTask task1 = createElement(modelInstance, process, "task1",
                UserTask.class);
        task1.setName("User Task");

        EndEvent endEvent = createElement(modelInstance, process, "end",
                EndEvent.class);

        // create the connections between the elements
        createSequenceFlow(modelInstance, process, startEvent, task1);
        createSequenceFlow(modelInstance, process, task1, endEvent);

        // validate and write model to file
        Bpmn.validateModel(modelInstance);
        File file;
        file = new File("generated-process.bpmn");
        Bpmn.writeModelToFile(file, modelInstance);
        return file;
    }

    protected <T extends BpmnModelElementInstance> T createElement(
            BpmnModelInstance modelInstance,
            BpmnModelElementInstance parentElement, String id,
            Class<T> elementClass) {
        T element = modelInstance.newInstance(elementClass);
        element.setAttributeValue("id", id, true);
        parentElement.addChildElement(element);
        return element;
    }

    protected SequenceFlow createSequenceFlow(BpmnModelInstance modelInstance,
                                              Process process, FlowNode from, FlowNode to) {
        String identifier = from.getId() + "-" + to.getId();
        SequenceFlow sequenceFlow = createElement(modelInstance, process,
                identifier, SequenceFlow.class);
        process.addChildElement(sequenceFlow);
        sequenceFlow.setSource(from);
        from.getOutgoing().add(sequenceFlow);
        sequenceFlow.setTarget(to);
        to.getIncoming().add(sequenceFlow);
        return sequenceFlow;
    }

}