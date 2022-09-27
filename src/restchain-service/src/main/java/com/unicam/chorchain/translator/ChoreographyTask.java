package com.unicam.chorchain.translator;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.model.bpmn.instance.*;
import org.camunda.bpm.model.xml.ModelInstance;
import org.camunda.bpm.model.xml.instance.DomElement;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;
import org.mapstruct.ap.internal.model.common.ModelElement;

import java.util.ArrayList;


@Getter
@Setter
@Slf4j
public class ChoreographyTask {

    private ModelElementInstance task;
    private ArrayList<SequenceFlow> incoming, outgoing;
    private Participant participantRef;
    private MessageFlow messageFlow;
    private MessageFlow requestMessage, responseMessage;
    private Participant initialParticipant;
    private String id, name;
    private TaskType type;
    private ModelInstance modelInstance;
    private NextTaskElement nextTaskElement;


    public enum TaskType {
        ONEWAY, TWOWAY
    }

    public ChoreographyTask(ModelElementInstance task) {
        this.task = task;
        this.modelInstance = task.getModelInstance();
        this.incoming = new ArrayList<>();
        this.outgoing = new ArrayList<>();
        this.initialParticipant = task.getModelInstance()
                .getModelElementById(task.getAttributeValue("initiatingParticipantRef"));
        this.id = task.getAttributeValue("id");
        this.name = task.getAttributeValue("name");
        init();
    }


    private void init() {

        for (DomElement childElement : task.getDomElement().getChildElements()) {
            String type = childElement.getLocalName();
            switch (type) {
                case "incoming":

                    incoming.add(task.getModelInstance()
                            .getModelElementById(childElement.getTextContent()));
                    break;

                case "outgoing": {
                    SequenceFlow mi = task.getModelInstance()
                            .getModelElementById(childElement.getTextContent());
                    log.debug("* * * * * {} {}", mi.getName(), mi.getId());
                    outgoing.add(mi);
                    break;
                }


                case "participantRef":

                    Participant p = modelInstance.getModelElementById(childElement.getTextContent());
                    if (!p.equals(initialParticipant)) {
                        participantRef = p;
                    }
                    break;

                case "messageFlowRef":

                    MessageFlow messageFlow = task.getModelInstance()
                            .getModelElementById(childElement.getTextContent());
                    setMessageFlow(messageFlow);

                    if (messageFlow.getSource().getId().equals(initialParticipant.getId())) {
                        setRequestMessage(messageFlow);
                    } else {
                        setResponseMessage(messageFlow);
                    }

                    break;
                case "extensionElements":
                    break;
                default:
                    throw new IllegalArgumentException("Invalid element in the xml: " + type);

            }
        }



        if (getOutgoing().size()>0){
            SequenceFlow nextSeqFlow = task.getModelInstance().getModelElementById(getOutgoing().get(0).getId());
            NextTaskElement nextElement = new NextTaskElement(nextSeqFlow);

            setNextTaskElement(nextElement);
        }

        if (responseMessage != null) {
            type = TaskType.TWOWAY;
        } else {

            type = TaskType.ONEWAY;
        }
    }


}