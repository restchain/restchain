package com.unicam.chorchain.codeGenerator.adapter;

import com.unicam.chorchain.codeGenerator.Factories;
import com.unicam.chorchain.codeGenerator.Visitable;
import com.unicam.chorchain.codeGenerator.Visitor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.model.bpmn.instance.EndEvent;
import org.camunda.bpm.model.bpmn.instance.StartEvent;
import org.camunda.bpm.model.xml.ModelInstance;
import org.camunda.bpm.model.xml.instance.DomElement;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
public class EndEventAdapter implements BpmnModelAdapter, Visitable {

    private final EndEvent value;

    public EndEventAdapter(EndEvent value) {
        log.debug(value.getClass().getSimpleName());
        this.value = value;
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
        return value.getName() != null ? value.getName().replace("\n", " ") : "";
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
        return value.getIncoming().stream().map((item) ->
                Factories.bpmnModelFactory.create(item)).collect(Collectors.toList());
    }

    @Override
    public List<BpmnModelAdapter> getOutgoing() {
        return value.getOutgoing().stream().map((item) ->
                Factories.bpmnModelFactory.create(item)).collect(Collectors.toList());
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visitEndEvent(this);
    }
}
