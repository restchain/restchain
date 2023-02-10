import React from "react";
import {Button, Form, Icon, Input, Select} from "antd";

let id = 0;

class DynamicReturnsSet extends React.Component {
    remove = k => {
        const {form} = this.props;
        // can use data-binding to get
        const rkeys = form.getFieldValue('rkeys');
        // We need at least one passenger
        if (rkeys.length === 1) {
            return;
        }

        // can use data-binding to set
        form.setFieldsValue({
            rkeys: rkeys.filter(key => key !== k),
        });
    };

    add = () => {
        const {form} = this.props;
        // can use data-binding to get
        const rkeys = form.getFieldValue('rkeys');
        const nextKeys = rkeys.concat(id++);
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            rkeys: nextKeys,
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
        getFieldDecorator('rkeys', {initialValue: data.rkeys || []});
        console.log("getFieldsValue ",this.props.form.getFieldsValue())
        const rkeys = getFieldValue('rkeys');
        const formItems = rkeys.map((k, index) => (
            <Form.Item
                label={index === 0 ? 'Returns' : ''}
                required={false}
                key={k}
            >
                {getFieldDecorator(`returns.type[${k}]`, {
                    initialValue: data.returns  && data.returns.type[k] || "uint256",
                    validateTrigger: ['onChange', 'onBlur'],
                    rules: [
                        {
                            required: true,
                            whitespace: true,
                            message: "Insert a type.",
                        },
                    ],
                })
                (<Select defaultValue="uint256" placeholder="Type" style={{width: '45%', marginRight: 8}}>
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

                {getFieldDecorator(`returns.name[${k}]`, {
                    initialValue: data.returns  && data.returns.name[k] ,
                    validateTrigger: ['onChange', 'onBlur'],
                    rules: [
                        {
                            required: true,
                            whitespace: true,
                            message: "Insert a name..",
                        },
                    ],
                })(<Input placeholder="Name" style={{width: '45%', marginRight: 8}}/>)}
                {rkeys.length > 1 ? (
                    <Icon
                        className="dynamic-delete-button"
                        type="minus-circle-o"
                        onClick={() => this.remove(k)}
                    />
                ) : null}

            </Form.Item>
        ));
        return (
            <div>
                {formItems}
                <Form.Item>
                    <Button type="dashed" onClick={this.add} style={{width: '60%'}}>
                        <Icon type="plus"/> Add return
                    </Button>
                </Form.Item>
            </div>
        );
    }
}

const WrappedDynamicReturnsSet = Form.create({name: 'dynamic_form_item'})(DynamicReturnsSet);
export default WrappedDynamicReturnsSet;
