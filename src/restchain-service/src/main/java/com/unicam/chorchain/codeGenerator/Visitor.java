package com.unicam.chorchain.codeGenerator;

import com.unicam.chorchain.codeGenerator.adapter.*;
import org.camunda.bpm.model.bpmn.instance.*;

public interface Visitor {
    void visit(BpmnModelAdapter node);
    void visitStartEvent(StartEventAdapter node);
    void visitEndEvent(EndEventAdapter node);
    void visitParallelGateway(ParallelGatewayAdapter node);
    void visitExclusiveGateway(ExclusiveGatewayAdapter node);
    void visitEventBasedGateway(EventBasedGatewayAdapter node);
    void visitChoreographyTask(ChoreographyTaskAdapter node);
    void visitSubChoreographyTask(SubChoreographyTaskAdapter subChoreographyTaskAdapter);
}
