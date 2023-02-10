import React, {useEffect} from "react";
import {Button, Form, Input, Switch} from "antd";
import WrappedDynamicParamsSet from "./WrappedDynamicParamsSet";
import WrappedDynamicReturnsSet from "./WrappedDynamicReturnsSet";
import find from "lodash/find"

function SignatureMethodDefinition({onSubmitOk, data}) {
    console.log("data ", data);
    console.log("datares ", parseData(data));
    return <div><h3>Interface Method Definition</h3>
        <WrappedSignatureMethodFrom onOk={onSubmitOk} data={parseData(data)} bo={data}/>
    </div>
}

export default SignatureMethodDefinition;


function parseData(data) {

    let res = {};

    if (data['paramsType'] !== undefined) {
        res['params'] = {
            'type': data.paramsType.split(','),
            'name': data.paramsName.split(',')
        };
        res['pkeys'] = [data.paramsType.split(',').map((k, i) => i)]
    }

    if (data['returnsType'] !== undefined) {
        res['returns'] = {
            'type': data.returnsType.split(','),
            'name': data.returnsName.split(',')
        };
        res['rkeys'] = [data.returnsType.split(',').map((k, i) => i)]

    }

    res['name'] = data.name;

    return res
}


function SignatureMethodForm({form, onOk, data,bo}) {
    console.log("all ", form.getFieldsValue());
    console.log("fData ", data);
    console.log("bo ", bo);
    console.log("bo1 ", bo.$parent.rootElements);
    // if(element.element.parent.type === 'bpmn:Participant') {
    //     const bo =
    //         console.log(" PP",element.element.parent.businessObject);
    // }


    function  getOppositeParticipant(bo){
        const chor = find(bo.$parent.rootElements,{ "$type" : "bpmn:Choreography"});
        const oppositeMessageFlow =find(chor.messageFlows, (obj)=> obj.id !== bo.id);
        return oppositeMessageFlow.targetRef;
    }


    const handleSubmit = e => {
        e.preventDefault();
        form.validateFields((err, values) => {
            if (!err) {
                const {pkeys, params} = values;

                console.log('Received values of form: ', values);
                onOk(values);
            }
        });
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Item label='Signature preview:' style={{color: 'blu'}}>
                {getPreviewSignature(form.getFieldsValue())}
            </Form.Item>
            <Form.Item label='name'>
                {form.getFieldDecorator('name', {
                    initialValue: data.name,
                    rules: [{required: true, message: 'Required field!'}],
                })(<Input
                    placeholder={`Method name`}/>)
                }
            </Form.Item>
            <WrappedDynamicParamsSet form={form} data={data}/>
            <WrappedDynamicReturnsSet form={form} data={data}/>
            <Form.Item label='interface Method:'>
                {form.getFieldDecorator('interfaceMethod', {
                    initialValue: true,
                    valuePropName: 'checked'
                })(<Switch/>)
                }
            </Form.Item>
            {
                form.getFieldValue("interfaceMethod") === true &&
                <Form.Item label='interface name'>
                    {form.getFieldDecorator('interfaceName', {
                        initialValue: data.interfaceName || "I"+getOppositeParticipant(bo).name.replace(" ",""),
                        rules: [{required: true, message: 'Required field!'}],
                    })(<Input
                        placeholder={`Interface name`}/>)
                    }
                </Form.Item>
            }
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    )
}

const WrappedSignatureMethodFrom = Form.create({name: 'signatureMethod_form'})(SignatureMethodForm);

export function getPreviewSignature(values) {
    console.log("values ", values)
    let result = '';


    if (values.name === undefined && !values.pkeys) {
        return;
    }

    if (values.name !== undefined) {
        result = `${values.name}`;
    }

    if (values.pkeys && values.pkeys.length > 0) {
        result = `${result} (${values.pkeys.map((k, i) => values.params && values.params['type'][k] && values.params['name'][k] && (values.params['type'][k] + ' ' + values.params['name'][k]))})`;
    } else {
        result = result + '()'
    }

    if (values.rkeys && values.rkeys.length > 0) {
        result = `${result} returns (${values.rkeys.map((k) => values.returns && values.returns['type'][k] && values.returns['name'][k] && (values.returns['type'][k] + ' ' + values.returns['name'][k]))})`;
    }

    return result;
}