import {getBusinessObject, is} from "bpmn-js/lib/util/ModelUtil";
import React, {useEffect, useState} from "react";
import {Modal, Button, Input, Tabs, Spin} from "antd";
import {createMessageFlowSemantics, createMessageShape, linkMessageFlowSemantics} from "chor-js/lib/util/MessageUtil"
import extensionElements from "bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements";
import cmdHelper from "bpmn-js-properties-panel/lib/helper/CmdHelper";
import {getExtensionElements} from "bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper";
import ChoreographyProps from "./ChoreographyProps";
import elementHelper from "bpmn-js-properties-panel/lib/helper/ElementHelper";
import formHelper from "bpmn-js-properties-panel/lib/helper/FormHelper";
import SignatureMethodDefinition, {getPreviewSignature} from "./SignatureMethodDefinition";
// import {IPFS} from '../../../ipfs';
import {ipfsMini} from '../../../ipfs';

const {TabPane} = Tabs;

//https://forum.bpmn.io/t/best-practice-for-creating-process-programmatically/2897/2
function addFunctionToMessageName(element, lastFunctionName) {
    //update the message name with all selected function names
    let myBo = getBusinessObject(element);
    let myFormData = getExtensionElements(myBo, 'camunda:FormData')[0];
    let fieldNames = myFormData.fields.map((f) => f.id);
    fieldNames[fieldNames.length - 1] = lastFunctionName;
    myBo.name = fieldNames.join("_");
    cmdHelper.updateBusinessObject(element, myBo);
}


function removeFunctionFromMessageName(element, functioName) {
    let myBo = getBusinessObject(element);
    if (myBo.name !== 'undefined') {
        //console.log(" myBo.name", myBo.name)
        myBo.name = myBo.name.replace("_" + functioName, "");
        myBo.name = myBo.name.replace(functioName + "_", "");
        myBo.name = myBo.name.replace(functioName, "");
        cmdHelper.updateBusinessObject(element, myBo);
    }

}

export function ElementProperties(props) {


    const [showAddInterfaceMethod, setShowAddInterfaceMethod] = useState(false);
    const [showAddIpfs, setShowAddIpfs] = useState(false);

    let {
        element,
        modeler
    } = props;


    useEffect(() => {
        if (element.labelTarget) {
            element = element.labelTarget;
        }
        setName(element.businessObject.name);
    }, [])

    const [name, setName] = useState();

    if (element.labelTarget) {
        element = element.labelTarget;
    }


    /**
     * Update element name
     * @param name
     */
    function updateName(name) {
        const modeling = modeler.get('modeling');
        modeling.updateLabel(element, name);
    }


    function updateTopic(topic) {
        const modeling = modeler.get('modeling');

        modeling.updateProperties(element, {
            'custom:topic': topic
        });
    }

    function makeMessageEvent() {
        const bpmnReplace = modeler.get('bpmnReplace');

        bpmnReplace.replaceElement(element, {
            type: element.businessObject.$type,
            eventDefinitionType: 'bpmn:MessageEventDefinition'
        });
    }

    function makeServiceTask(name) {
        const bpmnReplace = modeler.get('bpmnReplace');

        bpmnReplace.replaceElement(element, {
            type: 'bpmn:ServiceTask'
        });
    }

    function addModifier(element) {
        const modeling = modeler.get('modeling');
        modeling.updateProperties(element, {
            'modifier:all': 'pippo,semprionio'
        });
    }


    function addProperties(element) {
        const modeling = modeler.get('modeling');
        modeling.updateProperties(element, {
            'restchain:paramsType': 'uint256,string'
        });
        modeling.updateProperties(element, {
            'restchain:paramsName': 'amount,name'
        });
    }

    function addBehaviour2(element) {
        let extensionElements;
        console.log(" madaiiii", extensionElements)
        var bo = getBusinessObject(element), commands = [];

        if (!extensionElements) {
            console.log("!!!!createElement ExtensionElements", bo)
            extensionElements = elementHelper.createElement('bpmn:ExtensionElements', {values: []}, bo, modeler._moddle);
            commands.push(cmdHelper.updateProperties(element, {extensionElements: extensionElements}));
        }

        var formData = formHelper.getFormData(element);
        console.log(" 1", element, formData)

        if (!formData) {
            console.log(" 2",)

            formData = elementHelper.createElement('camunda:FormData', {fields: []}, extensionElements, modeler._moddle);
            commands.push(cmdHelper.addAndRemoveElementsFromList(
                element,
                extensionElements,
                'values',
                'extensionElements',
                [formData],
                []
            ));
        }
        console.log(" 3", formData)

        var field = elementHelper.createElement('camunda:FormField', {id: 'aa'}, formData, modeler._moddle);

        if (typeof formData.fields !== 'undefined') {
            //console.log("not update ")
            //console.log(" 4",)

            commands.push(cmdHelper.addElementsTolist(element, formData, 'fields', [field]));
        } else {
            //console.log(" 5",)

            //console.log("update ", field)
            commands.push(cmdHelper.updateBusinessObject(element, formData, {
                fields: [field]
            }));
        }

        console.log(" commands", commands)
        return commands;
    }

    function addBehaviour3(element) {
        updateFormField(element, modeler)
    }

    function addBehaviour(element) {

        //Added Extension elements
        const camundaNs = "http://camunda.org/schema/1.0/bpmn";

        var param1 = modeler._moddle.createAny('camunda:properties', camundaNs, {
            name: 'duration',
            type: 'uint'
        });
        var param2 = modeler._moddle.createAny('camunda:properties', camundaNs, {
            name: 'pippo',
            type: 'bytes'
        });

        var params = modeler._moddle.createAny('camunda:properties', camundaNs, {
            $children: [
                param1, param2
            ]
        });

        var formField = modeler._moddle.createAny('camunda:FormField', camundaNs, {
            id: "createAuction",
            type: "uint",
            body: "state.auction.lots=_itemsList; //domains list&#10;state.auction.endTime=0; //not yet started , default endTime&#10;state.auction.startBlock=block.number;&#10;state.auction.maxBidValue=100;&#10;state.auction.maxLots=2;&#10;state.auction.id =state.auction.id+1;&#10;for(uint i = 0; i &#60;_itemsList.length; i++){&#10;bytes32 _item = _itemsList[i]&#10;createLotAuction(_item,state.auction.bidding);}",
            $children: [params]
        });

        // var inputOutput = modeler._moddle.createAny('camunda:FormData', {id:'1'});
        var formData = modeler._moddle.createAny('camunda:FormData', camundaNs, {
            $parent: extensionElementsMoodle,
            $children: [
                formField
            ]
        });
        var extensionElementsMoodle = modeler._moddle.create('bpmn:ExtensionElements');
        // var ccFormData = modeler._moddle.create('camunda:FormData');


        extensionElementsMoodle.get('values').push(formData);
        // console.log("vvv ",ccFormData.get('fields').push(formField))
        // ccFormData.$parent= extensionEslementsMoodle;
        // var inputOutputMoodle = modeler._moddle.createAny('camunda:inputOutput', 'http://activiti.org/bpmn');

        console.log(" formData", formData)
        // inputOutput.get('camunda:FormData').push(behaviourParameter);
        element.businessObject['extensionElements'] = extensionElementsMoodle;
        console.log("ee ", element.businessObject['extensionElements'])
        const modeling = modeler.get('modeling');

    }

    function addMethodInt(element) {

        //Added Extension elements
        const camundaNs = "http://restchain.com/schema/bpmn";
        // const camundaNs = "http://camunda.org/schema/1.0/bpmn";

        var param1 = modeler._moddle.createAny('custom:signature', camundaNs, {
            paramsType: 'aaa,bbb',
            paramsName: 'aaa,bbb'
        });


        var params = modeler._moddle.createAny('camunda:signature', camundaNs, {
            $children: [
                param1
            ]
        });

        var extensionElementsMoodle = modeler._moddle.create('bpmn:ExtensionElements');
        // var ccFormData = modeler._moddle.create('camunda:FormData');


        extensionElementsMoodle.get('values').push(params);
        // console.log("vvv ",ccFormData.get('fields').push(formField))
        // ccFormData.$parent= extensionEslementsMoodle;
        // var inputOutputMoodle = modeler._moddle.createAny('camunda:inputOutput', 'http://activiti.org/bpmn');

        // inputOutput.get('camunda:FormData').push(behaviourParameter);
        element.businessObject['extensionElements'] = extensionElementsMoodle;
        console.log("ee ", element.businessObject['extensionElements'])
        const modeling = modeler.get('modeling');

        // modeling.updateProperties(element, extensionElementsMoodle)

    }


    function addType(element) {


        const modeling = modeler.get('modeling');
        modeling.createShape({type: 'bpmn:Task'});


        const position = {
            x: element.x + element.width,
            y: element.y + element.height
        };

        modeling.createShape({type: 'bpmn:Message'})


    }

    function addMessage(task, participant) {
        console.log("PART ", participant)
        const modeling = modeler.get('modeling');
        console.log(" pp", participant, participant.width)
        const position = {
            x: participant.x + (2 * participant.width),
            y: participant.y + (2 * participant.height)
        };

        console.log(" pos", task)


        var messageFlow = createMessageFlowSemantics(modeler, task, participant);
        console.log("messageFlow ", messageFlow)
        console.log("ccdcd ", linkMessageFlowSemantics(modeler, task, messageFlow));
        console.log(" mm", modeler)

        var definitions = modeler.get('canvas').getRootElement().businessObject.$parent;

        console.log(" choreo", definitions)
        let message = task.messageRef;
        if (!message) {
            message = modeler._moddle.create('bpmn:Message');
            message.id = modeler._moddle.ids.nextPrefixed('Message_', message);
            definitions.rootElements.unshift(message);
            task.messageRef = message;
            console.log("task ", task.messageRef)
        }

        element = createMessageShape(modeler, participant, task);
        modeler.get('canvas').addShape(element, participant);
        // const definitions = choreo.$parent;
        // let message = semantic.messageRef;
        // if (!message) {
        //     message = this._moddle.create('bpmn:Message');
        //     message.id = this._moddle.ids.nextPrefixed('Message_', message);
        //     definitions.rootElements.unshift(message);
        //     semantic.messageRef = message;
        // }
        // var shape = modeling.createShape({type:'bpmn:Message'},position,e, {attach: false})

        // return autoPlace.append(e, shape);

    }


    function attachTimeout() {
        const modeling = modeler.get('modeling');
        const autoPlace = modeler.get('autoPlace');
        const selection = modeler.get('selection');

        const attrs = {
            type: 'bpmn:BoundaryEvent',
            eventDefinitionType: 'bpmn:TimerEventDefinition'
        };

        const position = {
            x: element.x + element.width,
            y: element.y + element.height
        };

        const boundaryEvent = modeling.createShape(attrs, position, element, {attach: true});

        const taskShape = append(boundaryEvent, {
            type: 'bpmn:Task'
        });

        selection.select(taskShape);
    }

    function isTimeoutConfigured(element) {
        const attachers = element.attachers || [];

        return attachers.some(e => hasDefinition(e, 'bpmn:TimerEventDefinition'));
    }

    function append(element, attrs) {

        const autoPlace = modeler.get('autoPlace');
        const elementFactory = modeler.get('elementFactory');

        var shape = elementFactory.createShape(attrs);

        return autoPlace.append(element, shape);
    };


    const handleOnSubmitOk = (values, element) => {
        setShowAddInterfaceMethod(false);
        console.log("yeah ", values)
        const modeling = modeler.get('modeling');


        let updateObject = {};
        updateObject['name'] = values.name;
        // updateObject['interfaceMethod'] = values.interfaceMethod;

        if (values.pkeys.length > 0) {
            // updateObject['restchain:paramsType'] = values.params.type.join(',');
            // updateObject['restchain:paramsName'] = values.params.name.join(',');
            updateObject['paramsType'] = values.params.type.filter(Boolean).join(',');
            updateObject['paramsName'] = values.params.name.filter(Boolean).join(',');
        }
        if (values.rkeys.length > 0) {
            // updateObject['restchain:returnsType'] = values.returns.type.join(',');
            // updateObject['restchain:returnsName'] = values.returns.name.join(',');
            updateObject['returnsType'] = values.returns.type.filter(Boolean).join(',');
            updateObject['returnsName'] = values.returns.name.filter(Boolean).join(',');
        }

        updateObject['interfaceMethod'] = values.interfaceMethod;
        updateObject['interfaceName'] = values.interfaceName;

        console.log(" updObj", JSON.stringify(updateObject))
        console.log(" values", values)
        modeling.updateProperties(element, {'name': values.name});
        modeling.updateProperties(element, {'name': getPreviewSignature(values)});


        /** dos **/
            //Added Extension elements
        const restchainNs = "http://restchain.com/schema/bpmn/cc";

        var signatureValues = modeler._moddle.createAny('cc:signature', restchainNs, updateObject);


        // var signature = modeler._moddle.createAny('camunda:signature', restchainNs, {
        //     $children: [
        //         signatureValues
        //     ]
        // });

        var extensionElementsMoodle = modeler._moddle.create('bpmn:ExtensionElements');

        extensionElementsMoodle.get('values').push(signatureValues);
        element.businessObject['extensionElements'] = extensionElementsMoodle;
        element.businessObject['extensionElements'] = extensionElementsMoodle;
        // modeling.updateProperties(element, extensionElementsMoodle)


    }

    return (
        <div className="element-properties" key={element.id}>
            <h3>{element.id}</h3>
            <Tabs defaultActiveKey="1">
                <TabPane tab="General" key="1">
                    {/*<Form.Item label='Id'>*/}
                    {/*    <Input defaultValue={element.id} disabled={true}/>*/}
                    {/*</Form.Item>*/}


                    {
                        !is(element, 'bpmn:Choreography') &&
                        <fieldset>
                            <label>name</label>
                            <Input placeholder="Basic usage" value={name}
                                   onChange={(e) => {
                                       setName(e.target.value);
                                       updateName(e.target.value)
                                       console.log("Name editing ",name)
                                   }}
                            />
                        </fieldset>
                    }

                    {
                        is(element, 'custom:TopicHolder') &&
                        <fieldset>
                            <label>topic (custom)</label>
                            <input value={element.businessObject.get('custom:topic')} onChange={(event) => {
                                updateTopic(event.target.value)
                            }}/>
                        </fieldset>
                    }
                    {
                        is(element, 'bpmn:Choreography') &&
                        <fieldset>
                            <label>topic (custom)</label>
                            <input value={element.businessObject.get('custom:topic')} onChange={(event) => {
                                updateTopic(event.target.value)
                            }}/>
                        </fieldset>
                    }

                    <fieldset>
                        <label>actions</label><br/>

                        {
                            is(element, 'bpmn:ChoreographyTask') &&
                            <div>
                                <Button onClick={makeServiceTask}>Add Task </Button>
                                {console.log("CHIRE ", element)}

                                {/*{element.children.map((e, i) => {*/}
                                {/*    console.log(" aaa", e)*/}
                                {/*    return <Button id={'rr' + i} onClick={() => addMessage(element.businessObject, e)}>Add*/}
                                {/*        x {e.businessObject.name}</Button>*/}
                                {/*})}*/}

                            </div>
                        }

                        {
                            is(element, 'bpmn:Message') &&
                            <div>
                                {!showAddInterfaceMethod && <div>
                                    {/*<Button onClick={() => addProperties(element)}>Add Prop</Button>*/}
                                    {/*<Button onClick={() => addBehaviour(element)}>Add behaviour</Button>*/}
                                    {/*<Button onClick={() => addBehaviour2(element)}>Add behaviour2</Button>*/}
                                    {/*<Button onClick={() => addBehaviour3(element)}>Add behaviour3</Button>*/}
                                    {/*<Button onClick={() => addModifier(element)}>Add modifier</Button>*/}
                                    {/*<Button onClick={() => addMethodInt(element)}>Add methoIht</Button>*/}
                                    {/*<Button onClick={() => setShowAddInterfaceMethod(true)}>Add interface*/}
                                    {/*    method</Button>*/}
                                    {/*<Button onClick={() => setShowAddIpfs(true)}>Add IPFS</Button>*/}


                                    <Button onClick={() => handleOnSubmitOk({
                                        interfaceMethod: false,
                                        name: name,
                                        params: {
                                            name: [name+"_rcid"],   //rcid : Remote Call Id
                                            type: ["string memory"],
                                        },
                                        pkeys: [0],
                                        rkeys: [],
                                    }, element)
                                    }>Add Remote Call</Button>

                                    <Button onClick={() => handleOnSubmitOk({
                                        interfaceMethod: false,
                                        name: name,
                                        params: {
                                            name: [name+"_rcbkid"],   //rcbkid : Remote CallBacK Id
                                            type: ["string memory"],
                                        },
                                        pkeys: [0],
                                        rkeys: [],
                                    }, element)
                                    }>Add Remote Callback</Button>
                                </div>}
                                {
                                    showAddInterfaceMethod &&
                                    <SignatureMethodDefinition
                                        data={element.businessObject}
                                        onSubmitOk={(values) => handleOnSubmitOk(values, element)}
                                    />
                                }
                            </div>
                        }

                        {
                            <IpfsModal
                                visible={showAddIpfs}
                                onOk={(values) => {
                                    handleOnSubmitOk(values, element);
                                    setShowAddIpfs(false)
                                }}
                                onCancel={() => setShowAddIpfs(false)}
                            />


                        }


                        {
                            is(element, 'bpmn:Event') && !hasDefinition(element, 'bpmn:MessageEventDefinition') &&
                            <button onClick={makeMessageEvent}>Make Message Event</button>
                        }

                        {
                            is(element, 'bpmn:Task') && !isTimeoutConfigured(element) &&
                            <button onClick={attachTimeout}>Attach Timeout</button>
                        }

                    </fieldset>
                </TabPane>
                <TabPane tab="Type" key="2">
                    <fieldset>
                        <label>id</label>
                        <span>{element.id}</span>
                    </fieldset>
                    {
                        is(element, 'bpmn:Choreography') && !hasDefinition(element, 'camunda:TypeStructs') &&
                        <button onClick={() => addType(element)}>Add type</button>
                    }
                </TabPane>
                <TabPane tab="Behaviour" key="3">
                    <fieldset style={{marginBottom: 20}}>
                        <label>Id</label>
                        <span>{element.id}</span>
                    </fieldset>
                    {
                        is(element, 'bpmn:Choreography') &&
                        <ChoreographyProps modeler={modeler} element={element}/>
                    }
                </TabPane>
            </Tabs>


        </div>
    );
}


// helpers ///////////////////

function hasDefinition(event, definitionType) {

    const definitions = event.businessObject.eventDefinitions || [];

    return definitions.some(d => is(d, definitionType));
}


function updateFormField(element, modeler) {
    console.log("aaaaaaaaaoooooh ", element)
    let moddle = modeler._moddle;
    var extensionElements = element.businessObject.get('extensionElements');

    console.log("extensionElements ", extensionElements)
    if (!extensionElements) {
        extensionElements = moddle.create('bpmn:ExtensionElements');
    }

    var form = extensionElements.get('values').filter(function (elem) {
            return elem.$type === 'camunda:FormData'
        }
    )[0];

    console.log("form ", form)

    if (!form) {
        form = moddle.create('camunda:FormData');
    }

    let removeForm = form

    var formField = moddle.create('camunda:FormField', {
        'defaultValue': 'false',
        'id': 'FormField_Test',
        'label': 'Confirm?',
        'type': 'boolean'
    });
    var existingFieldsWithID = form.get('fields').filter(function (elem) {
        return elem.id === formField.id;
    });

    for (var i = 0; i < existingFieldsWithID.length; i++) {
        form.get('fields').splice(form.get('fields').indexOf(existingFieldsWithID[i]));
    }
    form.get('fields').push(formField);
    console.log("FormField ", formField)

    for (var i = 0; i < extensionElements.get('values').length; i++) {
        if (extensionElements.get('values')[i] === removeForm) {
            extensionElements.get('values').splice(i, 1);
        }
    }
    extensionElements.get('values').push(form);
    console.log("eEle ", extensionElements)
    const modeling = modeler.get('modeling');
    console.log("ahaha ", element, extensionElements)
    modeling.updateProperties(element, {extensionElements: extensionElements});
}


const {TextArea} = Input;

function IpfsModal({visible, onOk, onCancel}) {
    const [paramsValue, setParamsValue] = useState();
    const [urlValue, setUrlValue] = useState();
    const [loading, setLoading] = useState(false);
    const [cid, setCid] = useState(false);
    const [res, setRes] = useState(false);


    // const handleAdd = async () => {
    //     setLoading(true)
    //     const cid = await IPFS.add(value);
    //     console.log("IPFS cid:", cid);
    //     setCid(cid.path);
    //     setLoading(false);
    //     // load(cid.path).then((v)=>{
    //     //     console.log("arilog v",v)
    //     //     setRes(v)
    //     // });
    // };
    //
    const handleAdd = async () => {
        setLoading(true)
        const value = {url: urlValue, params: {paramsValue}}
        ipfsMini.add(JSON.stringify(value)).then((response) => {
            setCid(response);
            ipfsMini.cat(response).then((lr) => setRes(lr))
            setLoading(false);
        });
    };

    const handleCancel = () => {
        setParamsValue(undefined);
        setUrlValue(undefined);
        setLoading(false);
        setCid(undefined);
        setRes(undefined);
        onCancel();
    }

    const handleOk = () => {
        {
        }
    }

    return <Modal
        title={<h2>IPFS Entry</h2>}
        visible={visible}
        onOk={() => onOk({})}
        okText="Add IPFS"
        okButtonProps={{
            disabled: !cid
        }}
        onCancel={handleCancel}
    >
        {!loading && !cid &&
        <><h3>Content</h3>
            <div><strong>Url:</strong></div>
            <Input
                placeholder={'http://resturi.api'}
                onChange={(e) => setUrlValue(e.target.value)}
            />
            <div><strong>Params:</strong></div>
            <TextArea
                rows={10}
                placeholder={'paramname1:paramvalue1,paramname1:paramvalue1,paramname1:{pp1:pp1value}'}
                onChange={(e) => setParamsValue(e.target.value)}
            />
            <div style={{marginTop: '5px', textAlign: "center"}}>
                <Button onClick={() => handleAdd()} type={"primary"}>Create IPFS</Button>
            </div>
        </>
        }

        {cid && <div><strong>cid:</strong>{cid}
            <div>{res}</div>
        </div>}
        {loading && <Spin>Creating IPFS......</Spin>}
    </Modal>
}