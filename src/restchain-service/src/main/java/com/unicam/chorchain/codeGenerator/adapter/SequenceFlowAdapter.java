package com.unicam.chorchain.codeGenerator.adapter;

import com.unicam.chorchain.codeGenerator.Factories;
import com.unicam.chorchain.codeGenerator.Visitor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.model.bpmn.instance.EndEvent;
import org.camunda.bpm.model.bpmn.instance.FlowElement;
import org.camunda.bpm.model.bpmn.instance.Gateway;
import org.camunda.bpm.model.xml.ModelInstance;
import org.camunda.bpm.model.xml.instance.DomElement;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class SequenceFlowAdapter implements BpmnModelAdapter {

    private final FlowElement value;
    @Getter
    private String sourceId;
    @Getter
    private String targetRefId;
    @Getter
    private boolean isTargetGatewayOrNot;

    public SequenceFlowAdapter(FlowElement value) {

        log.debug(" FlowElement {} ", value);
        log.debug(" Me {} ", value.getClass().getSimpleName());
        this.value = value;
        this.sourceId = value.getAttributeValue("sourceRef");
        this.targetRefId = value.getAttributeValue("targetRef");
        ModelElementInstance e = value.getModelInstance()
                .getModelElementById(value.getAttributeValue("targetRef"));
        this.isTargetGatewayOrNot = e instanceof Gateway || e instanceof EndEvent;
        log.debug(" Next {} ", e.getClass().getSimpleName());
    }

    @Override
    public String getId() {
        return value.getId();
    }

    @Override
    public String getOrigId() {
        return value.getId();
    }

    @Override
    public String getName() {
        return value.getAttributeValue("name");
//        return value.getName() != null ? value.getName().replace("\n", " ") : "";
    }

    @Override
    public DomElement getDomElement() {
        return value.getDomElement();
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
        ArrayList<BpmnModelAdapter> bpmnModelAdapters = new ArrayList<>();
//        FlowElement a = value.getModelInstance().getModelElementById(sourceId);
        bpmnModelAdapters.add((Factories.bpmnModelFactory.create(value.getModelInstance()
                .getModelElementById(sourceId))));
        return bpmnModelAdapters;
    }

    @Override
    public List<BpmnModelAdapter> getOutgoing() {
        ArrayList<BpmnModelAdapter> bpmnModelAdapters = new ArrayList<>();
        ModelElementInstance mei = value.getModelInstance().getModelElementById(targetRefId);
        BpmnModelAdapter mi = Factories.bpmnModelFactory.create(mei);
//        FlowElement a = value.getModelInstance().getModelElementById(targetRefId);
        bpmnModelAdapters.add(mi);
        return bpmnModelAdapters;
    }

    @Override
    public void accept(Visitor visitor) {
    }
}

