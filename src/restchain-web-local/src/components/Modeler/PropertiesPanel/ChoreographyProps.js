import React, {useEffect, useState} from "react";
import {getBusinessObject, is} from "bpmn-js/lib/util/ModelUtil";
import {Button, Cascader, Form, Input, Select, Table} from 'antd';
import * as _ from 'lodash'

const {TextArea} = Input;
const {Option} = Select;

const functions = [
    {
        value: 'constructor',
        label: 'Constructor',
        children: [
            {
                value: 'englishAuction',
                label: 'English Auction',
                name: 'englishAuction',
                returnType: 'uint',
                description: 'Initial settings for the english auction',
                body: '//body for demo;  name= demo; emit testDemo(name);'

                // children: [
                //     {
                //         value: 'xihu',
                //         label: 'West Lake',
                //     },
                // ],
            },
            {
                value: 'customAuction',
                label: 'Custom Auction',
                name: 'customAuction',
                returnType: 'uint',
                description: 'Initial settings for the custom auction',
                body: '//custom auction body for demo;  '

                // children: [
                //     {
                //         value: 'xihu',
                //         label: 'West Lake',
                //     },
                // ],
            },
        ],
    },
    {
        value: 'function',
        label: 'Function',
        children: [
            {
                value: 'englishAuction',
                label: 'English Auction',
                children: [
                    {
                        value: 'addParticipant',
                        label: 'Add participant',
                        name: 'addParticipant',
                        returnType: 'uint',
                        description: 'Add participant funciton',
                        body: 'add a new participant;'
                    },
                ],
            },
        ],
    },
    {
        value: 'new',
        label: 'Define new behavior'
    }
];


export default function ChoreographyProps({modeler, element}) {

    const [fields, setFields] = useState([]);
    const [selected, setSelected] = useState();
    const [reload, setReload] = useState(false);



    function loadItems(){
        console.log("LOAD ITEMS ",fields)
        // do something with value in parent component, like save to state
        let extensionElements = getBusinessObject(element).get('extensionElements')
        if (extensionElements) {
            console.log("found extElem ",)
            var elements = extensionElements.get('values').filter(function (value) {
                return is(value, 'camunda:FormData');
            });
            console.log(" ret Elements", elements)
            if (elements && elements.length) {
                console.log("ChoreographyProps elements.length ", elements)
                console.log("Fields", elements[0].fields,elements[0])
                let newArray = elements[0].fields;

                setFields(newArray);
            }
        }
    }



    function reLoad(){
        setReload(true);
    }

    useEffect(() => {
        setReload(false);
        let extensionElements = getBusinessObject(element).get('extensionElements')
        loadItems(extensionElements);
    }, [reload])


    const handleDelete = (e) => {
        e.stopPropagation();
    }

    const columns = [
        {
            title: 'Name',
            dataIndex: 'id',
            key: 'id',

        }, {
            title: 'Action',
            dataIndex: '',
            key: 'x',
            render: () => <a onClick={handleDelete}>Delete</a>,
        },
    ];

    console.log(" Element", element)
    console.log(" data", fields)


    return (
        <div>
            <Table dataSource={fields} columns={columns} size="small"
                   rowKey={record => record.id}
                   onRow={(record, rowIndex) => {
                       return {
                           onClick: event => {
                               setSelected(record)
                               console.log("Selected", record)
                           }, // click row
                           onDoubleClick: event => {
                           }, // double click row
                           onContextMenu: event => {
                           }, // right button click row
                           onMouseEnter: event => {
                           }, // mouse enter row
                           onMouseLeave: event => {
                           }, // mouse leave row
                       };
                   }}
            />
            <WrappedChoreographyPropsForm modeler={modeler} element={element} selected={selected} reload={reLoad}/>
        </div>
    )
}


function updateFormField(element, modeler,values) {

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

    if (!form) {
        form = moddle.create('camunda:FormData');
    }

    let toReplaceForm = form;


    var formField = moddle.create('camunda:FormField', {
        'defaultValue': 'false',
        'id': values.name,
        'name': values.name,
        'description': values.description,
        'returnType': values.returnType,
        'body': values.body,
    });

    var existingFieldsWithID = form.get('fields').filter(function (elem) {
        return elem.id === formField.id;
    });

    console.log("existingFieldsWithID ",existingFieldsWithID)

    for (var i = 0; i < existingFieldsWithID.length; i++) {
        form.get('fields').splice(form.get('fields').indexOf(existingFieldsWithID[i]));
    }
    form.get('fields').push(formField);
    console.log("FormField ", formField)
    console.log("form ", form)

    for( var i = 0; i < extensionElements.get('values').length; i++){
        if ( extensionElements.get('values')[i] === toReplaceForm) {
            extensionElements.get('values').splice(i, 1);
        }
    }
    extensionElements.get('values').push(form);

    console.log("eEle ", extensionElements)
    const modeling = modeler.get('modeling');
    console.log("ahaha ", element, extensionElements)
    modeling.updateProperties(element, {extensionElements: extensionElements});
}


function ChoreographyPropsForm(props) {


    const [showField, setShowField] = useState();
    const [current, setCurrent] = useState(props.selected);

    React.useEffect(() => {
        setCurrent(props.selected);
        if (props.selected) {
            setShowField(props.selected.id)
        }

    }, [props.selected])

    console.log("ccccccc ", current, props.selected)
    const handleSubmit = e => {
        e.preventDefault();
        props.form.validateFieldsAndScroll((err, values) => {
            console.log("SUBMITEED ",)

            if (!err) {
                console.log('Received values of form: ', values);
                const {modeler, element} = props;
                updateFormField(element, modeler,values);
                props.reload();
                setShowField(undefined);
            }
        });
    };


    const {getFieldDecorator} = props.form;

    const formItemLayout = {
        labelCol: {
            xs: {span: 24},
            sm: {span: 8},
        },
        wrapperCol: {
            xs: {span: 24},
            sm: {span: 16},
        },
    };
    const tailFormItemLayout = {
        wrapperCol: {
            xs: {
                span: 24,
                offset: 0,
            },
            sm: {
                span: 16,
                offset: 8,
            },
        },
    };


    const readOnly = showField && showField[showField.length - 1] !== 'new';
    console.log("this.state.showField  ", showField)

    console.log(" ", _.findKey(functions, {values: 'addParticipant'}))


    const getCurrentField = (fields) => {
        let res = functions
        console.log("init ", res)
        fields.forEach(f => {
            console.log("k ", f, res, _.find(res, {'value': f}))
            let temp = _.find(res, {'value': f})
            if (_.has(temp, 'children')) {
                console.log("yeah ", temp, _.clone(temp.children))
                res = _.clone(temp.children);
            } else {
                res = temp
            }
        })
        console.log("OnChange selection", res)
        return res;
    }

    const handleOnChange = (value) => {
        setShowField(value);
        setCurrent(getCurrentField(value));
    }

    console.log(" current", current, current && current['name']);


    return (
        <div>
            <Form.Item label="Behaviour">
                {getFieldDecorator('fields', {
                    rules: [
                        {type: 'array', required: false, message: 'Please select your habitual residence!'},
                    ],
                })(<Cascader style={{width: '100%'}} onChange={handleOnChange} options={functions}

                />)}
            </Form.Item>


            {showField &&

            <Form {...formItemLayout} onSubmit={handleSubmit}>

                <Form.Item label="Name">
                    {getFieldDecorator('name', {
                        initialValue: current['name'] || current['id'],
                        rules: [
                            {
                                required: true,
                                message: 'Please insert a function name!',
                            },

                        ]
                    })(<Input disabled={readOnly}/>)}
                </Form.Item>

                <Form.Item label="Description">
                    {getFieldDecorator('description', {
                        initialValue: current['description'],
                    })(<TextArea rows={4} disabled={readOnly}/>)}
                </Form.Item>

                <Form.Item label="Return type">
                    {getFieldDecorator('returnType', {
                        initialValue: current['returnType'],
                        rules: [{required: false, message: 'Please select the return type!'}],
                    })(
                        <Select
                            disabled={readOnly}
                            placeholder="Select a option and change input text above"
                            // onChange={this.handleSelectChange}
                        >
                            <Option value="uint">uint</Option>
                            <Option value="byte">byte</Option>
                            <Option value="bytes32array">bytes32[]</Option>
                            <Option value="bytes32">bytes32</Option>
                            <Option value="straing">string</Option>
                        </Select>,
                    )}
                </Form.Item>

                <Form.Item label="Body">
                    {getFieldDecorator('body', {
                        initialValue: current['body'],
                        rules: [{required: true, message: 'Please input the behaviour body!'}],
                    })(<TextArea rows={6} disabled={readOnly}/>)}
                </Form.Item>


                <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit"
                            disabled={current && props.selected && current.id === props.selected.id}>
                        Add
                    </Button>
                </Form.Item>
            </Form>}
        </div>
    );


}


const WrappedChoreographyPropsForm = Form.create({name: 'dynamic_form_item'})(ChoreographyPropsForm);
