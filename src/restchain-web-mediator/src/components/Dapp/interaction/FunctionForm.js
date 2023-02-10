import React, {useEffect, useState} from "react";
import {useIpfsCall} from "../hooks";
import {find} from "lodash";
import {Button, Divider, Form, Input, InputNumber, notification, Switch, Tag} from "antd";
import {IPFSForm} from "./IpfsForm";
import WrappedDynamicFieldDomainSet from "./DynamicFieldDomainSet";

/***
 *
 * @param sid
 * @param contract
 * @param web3
 * @param account
 * @param form
 * @param callBack
 * @param canvas
 * @param viewer
 * @returns {*}
 * @constructor
 */

const FunctionForm = ({sid, contract, web3, account, form, callBack, canvas, viewer}) => {

    //console.log("FunctionForm props", sid, contract, web3, canvas, viewer)
    const _sid = sid.toString().replace("_resp", "");

    //console.log("Real Current ", sid)
    //console.log("Fixed Current ", find(solidityFunctions, {'id': _sid}))
    const elements = viewer.get('elementRegistry');
    const element = elements._elements[_sid];
    //console.log("elements ", elements)
    //console.log("element ", element)
    //console.log("parent ", element.element.parent)
    //console.log("parent ", element.element.parent)
    //console.log("incoming ", element.element.incoming)
    //console.log("_jsonInterface ", contract._jsonInterface);


    const [state, setState] =
        useState({response: null});
    const [lastId, setLastId] = useState();
    const [ipfsId, setIpfsId] = useState();
    const ipfsContent = useIpfsCall(ipfsId);

    // const current = find(solidityFunctions, {'id': ID});
    const normalizedId = _sid.replace(/-/g, '_');
    // console.log("OOOOPS ", contract._jsonInterface, normalizedId)
    const currentElement = find(contract._jsonInterface, {'name': normalizedId});
    // console.log("FunctionForm currentElement", currentElement);
    // const dictionary = find(functionsDictionary, {'id': _sid});
    // const _current = find(contract._jsonInterface,{''})
    const amount = 11;
    // console.log("ID ", _sid)
    // const inputs

    const callFunction = async (_props) => {
        // console.log("callFunction ", _props);
        const inputs = []
        const sortedProps = Object.keys(_props).sort().forEach(key => inputs.push(_props[key]))
        const startTime = new Date();
        console.log("** [TIME REQ ("+normalizedId+")]:", startTime);
        //console.log("callFunction  Object.values(_props)", inputs, account);
        contract.methods[`${normalizedId}`].apply(this, inputs).send({
            // contract.methods._sid_00e1b46c_e485_4551_a17b_6f0c3f21ec2c('car').send({
            from: account,
            gas: 9000000,
        }).then((result) => {
            // console.log("callFunction result ", JSON.stringify(result));         ù
            const endTime = new Date();
            console.log("** [TIME REQ  ("+normalizedId+")]:", endTime);
            console.log("** [TIME REQ  ("+normalizedId+")] - ElapsedTime: ",endTime-startTime);
            setState({
                response: result
            });
            // console.log("callFunction senT ",)
            callBack();

        }).catch(function (err, jj) {
            notification['error']({
                message: 'Transaction error' + jj,
                description: JSON.stringify(err)
                ,
            });
        })
    }

    const callPayableFunction = async (_props) => {
        var newAmount = web3.utils.toWei(11, 'ether');
        const startTime = new Date();
        console.log("** [TIME REQ  ("+normalizedId+")]:", startTime);
        contract.methods[`${normalizedId}`].apply(this, Object.values(_props)).send({
            // contract.methods.sid_00e1b46c_e485_4551_a17b_6f0c3f21ec2c('car').send({
            from: account,
            value: newAmount,
            gas: 200000,
        }).then((result) => {
            const endTime = new Date();
            console.log("** [TIME REQ  ("+normalizedId+")]:", endTime);
            console.log("** [TIME REQ  ("+normalizedId+")] - Elapsed Time :",endTime-startTime);
            //console.log("result ", JSON.stringify(result));
            setState({
                response: result
            });
            //console.log("senT ",)
            callBack();

        }).catch(function (err) {
            notification['error']({
                message: 'Transaction error',
                description: JSON.stringify(err)
                ,
            });
        })
    }

    const handleSubmit = e => {
        e.preventDefault();
        //console.log("Sumbmitt! ",)
        form.validateFields((err, values) => {
            if (!err) {
                //console.log('Received values of form: ', values);
                //console.log('Received values of form: ', Object.values(values));
                if (currentElement.payble) {
                    callPayableFunction(values);
                } else {
                    const fixedValues = values;
                    delete fixedValues['_keys'];

                    //console.log(" fixedValues", fixedValues)
                    callFunction(values);
                }

            }
        });
        setIpfsId(undefined);
    };

    useEffect(() => {
        // highlightFunction(sid)
    }, [sid]);

    const highlightFunction = (sid) => {

        // console.log(" sid", sid);
        // console.log("canvas ", canvas)
        // lastId && canvas.removeMarker(lastId, 'highlight')
        // lastId && canvas.removeMarker(lastId, 'highlight1')
        canvas.addMarker(sid, 'highlight');
        canvas.addMarker(sid, 'highlight1');
        setLastId(sid);

        // if (sid === 'sid-e385b492-6b2b-475b-a8dd-8fc09513393b' )

        // canvas.addMarker('sid-e385b492-6b2b-475b-a8dd-8fc09513393b', 'highlight');
    }


    function getFunctionParticipant() {
        if (element.element.parent.type === 'bpmn:Participant') {
            const bo = element.element.parent.businessObject;
            return bo;
        } else {
            return null
        }
    }

    function getFunctionName() {
        // console.log("into getFunctionName ",)
        if (element.element.businessObject && element.element.businessObject && element.element.businessObject.extensionElements.values) {
            if (element.element.businessObject.extensionElements.values.length > 0) {
                return element.element.businessObject.extensionElements.values[0].name;
            }
        } else {
            return ""
        }
    }


    function isParticipantAllowed() {
        const {id} = getFunctionParticipant();
        // console.log("Pname ", id)
        // console.log("Acca ", account)
        return account[0] === id;
    }

    const {name: Pname} = getFunctionParticipant();


    return <div style={{border: '1px solid black', padding: '20px 40px 20px 40px'}}>
        <h2>{getFunctionName()}</h2>
        {/*{highlightFunction(ID)}*/}
        {/*<Form.Item label='Sid'>{sid}</Form.Item>*/}
        {/*<Form.Item label='Participant'><Tag color="blue">{Pname}</Tag></Form.Item>*/}
        <div><strong>SID:</strong> {_sid}</div>
        <div><strong>Participant:</strong> <Tag color="blue">{Pname}</Tag></div>
        {/*{getFunctionName() &&*/}
        {/*<div><strong>Function:</strong><Tag color="#87d068">{getFunctionName()}</Tag></div>*/}
        {/*}*/}
        <Form onSubmit={handleSubmit}>
            {currentElement && currentElement.inputs && currentElement.inputs.length > 0 &&
            <div style={{marginTop: '10px', border: '1px dashed black', padding: '10px'}}>
                {

                    currentElement.inputs.map(
                        (currentBpmnElement, index) => {
                            //TODO controllare il tipo e nel caso metter un controllo nel booolean
                            // console.log("FunctionForm currentBpmnElement", currentBpmnElement, index)
                            // Se l'elemento è del tipo _rcid o _rcbkid allora gestisci logica per le chiamate REST
                            if (currentBpmnElement.name.includes('_rcid') || currentBpmnElement.name.includes('_rcbkid')) {
                                // Se già è stato creato IPFS,
                                if (ipfsId) {
                                    return (
                                        <div key={index}>
                                            <Form.Item label={currentBpmnElement.name}>
                                                {form.getFieldDecorator(currentElement.name, {
                                                    initialValue: ipfsId,
                                                    rules: [{
                                                        required: true,
                                                        message: 'Please fill the field ' + currentElement.name
                                                    }],
                                                })(<Input disabled
                                                          placeholder={`${currentElement.type} ${currentElement.name}`}/>)}
                                                {ipfsContent}
                                            </Form.Item>
                                        </div>
                                    )
                                }
                                // Se non esiste IpfsID mostra Form di craezione IPFS
                                return (
                                    <div key={index}>
                                        <IPFSForm onOk={(value) => setIpfsId(value)}/>
                                    </div>
                                )
                            }

                            return (
                                <Form.Item
                                    key={index}
                                    label={currentBpmnElement.name}>
                                    {inputSelector(form, currentBpmnElement)}
                                </Form.Item>
                            )
                        }
                    )
                    }
                    </div>
                }
                {/*<Form.Item>*/}
                {/*<Button htmlType="submit" type='primary' disabled={!isParticipantAllowed()}>Send</Button>*/}
                <Divider/>
                <div style={{textAlign: 'center'}}><Button htmlType="submit" type='primary'>Send</Button></div>
                {/*</Form.Item>*/}
            </Form>
                </div>
                }

                const WrappedFunctionForm = Form.create({name: 'function_form'})(FunctionForm);
                export default WrappedFunctionForm;


                /***
                *
                * @param form
                * @param current
                * @returns {React.ReactNode|*}
                */

                function inputSelector(form, current) {
                //console.log("inputSelector Type ", current)
                switch (current.type) {
                case "uint256":
                return <InputUint256 current={current} form={form}/>
                case "bool":
                return <InputBool current={current} form={form}/>
                case "string":
                return <InputString current={current} form={form}/>
                case "bytes32[]":
                return <WrappedDynamicFieldDomainSet current={current} form={form}/>
                default:
                return form.getFieldDecorator(current.name, {
                rules: [{required: true, message: 'Required field!'}],
            })(<Input
                placeholder={`${current.type} ${current.name}`}/>)

            }
            }

                function InputUint256({form, current}) {
                return form.getFieldDecorator(current.name, {
                rules: [{required: true, message: 'Please fill the field ' + current.name}],
            })(<InputNumber
                placeholder={`${current.type} ${current.name}`}/>)
            }

                function InputBool({form, current}) {
                // console.log("ohhh ", form)
                return form.getFieldDecorator(current.name, {
                valuePropName: 'checked'
            })(<Switch>Checkbox Text</Switch>)
            }


                function InputString({form, current}) {
                return form.getFieldDecorator(current.name, {
                rules: [{required: true, message: 'Please fill the field ' + current.name}],

            })(<Input
                placeholder={`${current.type} ${current.name}`}/>)
            }
