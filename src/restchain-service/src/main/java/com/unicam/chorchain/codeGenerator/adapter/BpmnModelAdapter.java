package com.unicam.chorchain.codeGenerator.adapter;

import com.unicam.chorchain.codeGenerator.Visitable;
import org.camunda.bpm.model.xml.ModelInstance;
import org.camunda.bpm.model.xml.instance.DomElement;

import java.util.List;

public interface BpmnModelAdapter extends Visitable {

    String getId();

    String getOrigId();

    String getName();
    DomElement getDomElement();

    ModelInstance getModelInstance();

    String getClassSimpleName();

    List<BpmnModelAdapter> getIncoming();

    List<BpmnModelAdapter> getOutgoing();

}
