package com.unicam.chorchain.codeGenerator.adapter;

import com.unicam.chorchain.codeGenerator.Factories;
import com.unicam.chorchain.codeGenerator.Visitor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.model.bpmn.instance.MessageFlow;
import org.camunda.bpm.model.bpmn.instance.Participant;
import org.camunda.bpm.model.bpmn.instance.SequenceFlow;
import org.camunda.bpm.model.bpmn.instance.StartEvent;
import org.camunda.bpm.model.xml.ModelInstance;
import org.camunda.bpm.model.xml.instance.DomElement;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static com.unicam.chorchain.codeGenerator.adapter.ChoreographyTaskAdapter.TaskType.ONEWAY;
import static com.unicam.chorchain.codeGenerator.adapter.ChoreographyTaskAdapter.TaskType.TWOWAY;

@Slf4j
public class SubChoreographyTaskAdapter implements BpmnModelAdapter {

    private final ModelElementInstance value;

    private ArrayList<SequenceFlow> incoming, outgoing;
    private Participant participantRef;
    private MessageFlow messageFlow;
    @Getter
    private MessageFlow requestMessage, responseMessage;
    private Participant initialParticipant;
    private String id, name;
    @Getter
    private ChoreographyTaskAdapter.TaskType type;
    private ModelInstance modelInstance;
    @Getter
    private SequenceFlow startEvent;
    @Getter
    private SequenceFlow endEvent;

    public enum TaskType {
        ONEWAY, TWOWAY
    }

    public SubChoreographyTaskAdapter(ModelElementInstance value) {
        log.debug(value.getClass().getSimpleName() + " - SubChoreographyTask");
        this.value = value;
        this.modelInstance = value.getModelInstance();
        this.incoming = new ArrayList<>();
        this.outgoing = new ArrayList<>();
        this.initialParticipant = value.getModelInstance()
                .getModelElementById(value.getAttributeValue("initiatingParticipantRef"));
        this.id = value.getAttributeValue("id");
        this.name = value.getAttributeValue("name");
        init();
    }

    private void init() {

        for (DomElement childElement : value.getDomElement().getChildElements()) {
            String type = childElement.getLocalName();
            switch (type) {
                case "incoming":

                    incoming.add(value.getModelInstance()
                            .getModelElementById(childElement.getTextContent()));
                    break;

                case "outgoing": {
                    SequenceFlow mi = value.getModelInstance()
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

                    MessageFlow messageFlow = value.getModelInstance()
                            .getModelElementById(childElement.getTextContent());
                    this.messageFlow = messageFlow;

                    if (messageFlow.getSource().getId().equals(initialParticipant.getId())) {
                        this.requestMessage = (messageFlow);
                    } else {
                        this.responseMessage = (messageFlow);
                    }

                    break;
                case "startEvent":

                    SequenceFlow start = value.getModelInstance()
                            .getModelElementById(childElement.getTextContent());



                    this.startEvent = start;

                case "endEvent":

                    SequenceFlow end = value.getModelInstance()
                            .getModelElementById(childElement.getTextContent());
                    this.endEvent = end;

                    break;
                case "extensionElements":
                    break;
//                default:
//                    throw new IllegalArgumentException("Invalid element in the xml: " + type);

            }
        }


        if (responseMessage != null) {
            type = TWOWAY;
        } else {

            type = ONEWAY;
        }
    }

    @Override
    public String getId() {
        return this.id;
    }

    @Override
    public String getOrigId() {
        return this.id;
    }

    @Override
    public String getName() {
        return this.name.replace("\n", " ");
    }

    @Override
    public DomElement getDomElement() {
        return value.getDomElement();
    }

    public Participant getParticipantRef() {
        return this.participantRef;
    }

    public Participant getInitialParticipant() {
        return this.initialParticipant;
    }

    @Override
    public ModelInstance getModelInstance() {
        return this.value.getModelInstance();
    }

    @Override
    public String getClassSimpleName() {
        return value.getClass().getSimpleName();
    }

    @Override
    public List<BpmnModelAdapter> getIncoming() {
        return this.incoming.stream()
                .map(n -> Factories.bpmnModelFactory.create(n)).collect(Collectors.toList());
    }

    @Override
    public List<BpmnModelAdapter> getOutgoing() {
        return this.outgoing.stream()
                .map(n -> Factories.bpmnModelFactory.create(n)).collect(Collectors.toList());
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visitSubChoreographyTask(this);
    }

}
