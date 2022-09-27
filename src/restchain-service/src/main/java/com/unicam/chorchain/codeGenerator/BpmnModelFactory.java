package com.unicam.chorchain.codeGenerator;

import com.unicam.chorchain.codeGenerator.adapter.*;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.model.bpmn.impl.instance.EndEventImpl;
import org.camunda.bpm.model.bpmn.impl.instance.EventBasedGatewayImpl;
import org.camunda.bpm.model.bpmn.impl.instance.ExclusiveGatewayImpl;
import org.camunda.bpm.model.bpmn.impl.instance.ParallelGatewayImpl;
import org.camunda.bpm.model.bpmn.instance.*;
import org.camunda.bpm.model.xml.impl.instance.ModelElementInstanceImpl;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;

//Singleton
@Slf4j
public class BpmnModelFactory {

    public BpmnModelAdapter create(StartEvent value) {
        return new StartEventAdapter(value);
    }

    //ModelElementInstance {Start,End, Task , ..}
    public BpmnModelAdapter create(ModelElementInstance value) {
        /* Add here more instance type if needed */
        if (EndEventImpl.class.equals(value.getClass())) {
            return new EndEventAdapter((EndEvent) value);
        } else if (ParallelGatewayImpl.class.equals(value.getClass())) {
            return new ParallelGatewayAdapter((ParallelGateway) value);
        } else if (EventBasedGatewayImpl.class.equals(value.getClass())) {
            return new EventBasedGatewayAdapter((EventBasedGateway) value);
        } else if (ExclusiveGatewayImpl.class.equals(value.getClass())) {
            return new ExclusiveGatewayAdapter((ExclusiveGateway) value);
        } else {
            if (((ModelElementInstanceImpl) value).getElementType().getTypeName().equals("subChoreography")) {
                return new SubChoreographyTaskAdapter(value);
            }
            return new ChoreographyTaskAdapter(value);
        }
    }

    //SequenceFLow element - used only to build the follow the tree
    public BpmnModelAdapter create(FlowElement value) {
        return new SequenceFlowAdapter(value);
    }


}