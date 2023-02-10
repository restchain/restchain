import React from "react";
import {Button, Form, Icon, Input, Select} from "antd";

let id = 0;

class DynamicParamsSet extends React.Component {
    remove = k => {
        const {form} = this.props;
        // can use data-binding to get
        const pkeys = form.getFieldValue('pkeys');
        // We need at least one passenger
        if (pkeys.length === 1) {
            return;
        }

        // can use data-binding to set
        form.setFieldsValue({
            pkeys: pkeys.filter(key => key !== k),
        });
    };

    add = () => {
        const {form} = this.props;
        // can use data-binding to get
        const pkeys = form.getFieldValue('pkeys');
        const nextKeys = pkeys.concat(id++);
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            pkeys: nextKeys,
        });
    };


    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 4},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 20},
            },
        };
        const formItemLayoutWithOutLabel = {
            wrapperCol: {
                xs: {span: 24, offset: 0},
                sm: {span: 20, offset: 4},
            },
        };
        const {data} = this.props;
        getFieldDecorator('pkeys', {initialValue: data.pkeys || []});
        const pkeys = getFieldValue('pkeys');

        function getType(data,k){
            if(data && data.params && data.params.type && data.params.type[k]){
                return data.params.type[k]
            }
            return "uint256";
        }

        const formItems = pkeys.map((k, index) => {

            return <Form.Item
                label={index === 0 ? 'Params' : ''}
                required={false}
                key={k}
            >
                {getFieldDecorator(`params.type[${k}]`, {
                    validateTrigger: ['onChange', 'onBlur'],
                    initialValue: getType(data,k),
                    rules: [
                        {
                            required: true,
                            whitespace: true,
                            message: "Insert a type.",
                        },
                    ],
                })
                (<Select placeholder="Type" style={{width: '45%', marginRight: 8}}>
                    <Select.Option value="uint256">uint256</Select.Option>
                    <Select.Option value="string memory">string memory</Select.Option>
                    <Select.Option value="bool">bool</Select.Option>
                    <Select.Option value="int">int</Select.Option>
                    <Select.Option value="address">address</Select.Option>
                    <Select.Option value="address payable">address</Select.Option>
                    <Select.Option value="bytes32">bytes32</Select.Option>
                    <Select.Option value="bytes32[] memory">bytes[] memory</Select.Option>
                    <Select.Option value="address[] memory">address[] memory</Select.Option>
                    <Select.Option value="uint[] memory">uint[] memory</Select.Option>
                </Select>)}

                {getFieldDecorator(`params.name[${k}]`, {
                    validateTrigger: ['onChange', 'onBlur'],
                    rules: [
                        {
                            required: true,
                            whitespace: true,
                            message: "Insert a name..",
                        },
                    ],
                })(<Input placeholder="Name" style={{width: '45%', marginRight: 8}}/>)}
                {pkeys.length > 1 ? (
                    <Icon
                        className="dynamic-delete-button"
                        type="minus-circle-o"
                        onClick={() => this.remove(k)}
                    />
                ) : null}

            </Form.Item>
        });
        return (
            <div>
                {formItems}
                <Form.Item>
                    <Button type="dashed" onClick={this.add} style={{width: '60%'}}>
                        <Icon type="plus"/> Add field
                    </Button>
                </Form.Item>
            </div>
        );
    }
}

const WrappedDynamicParamsSet = Form.create({name: 'dynamic_form_item'})(DynamicParamsSet);
export default WrappedDynamicParamsSet;