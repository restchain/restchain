import {Button, Form, Icon, Input} from 'antd';
import React from 'react';

let id = 0;

class DynamicFieldDomainSet extends React.Component {

    remove = k => {
        const {form} = this.props;
        // can use data-binding to get
        const _keys = form.getFieldValue('_keys');
        // We need at least one passenger
        if (_keys.length === 1) {
            return;
        }

        // can use data-binding to set
        form.setFieldsValue({
            _keys: _keys.filter(key => key !== k),
        });
    };

    add = () => {
        const {form} = this.props;
        // can use data-binding to get
        const _keys = form.getFieldValue('_keys');
        const nextKeys = _keys.concat(id++);
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            _keys: nextKeys,
        });
    };

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {_keys, names} = values;
                console.log('Received values of form: ', values);
                console.log('Merged values:',);
                this.props.onSubmit(_keys.map(key => names[key]));
            }
        });
    };

    render() {
        console.log(" props",this.props)
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
        getFieldDecorator('_keys', {initialValue:  []});
        const _keys = getFieldValue('_keys');
        const formItems = _keys.map((k, index) => (
            <Form.Item
                {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                label={index === 0 ? 'Value ' : ''}
                required={false}
                key={k}
            >
                {console.log("k ", k)}
                {getFieldDecorator(`${this.props.current.name}[${k}]`, {
                    // initialValue: this.props.initial[k],
                    validateTrigger: ['onChange', 'onBlur'],
                    rules: [
                        {
                            required: true,
                            whitespace: true,
                            message: "Insert a value",
                        },
                    ],
                })(<Input placeholder="value" style={{width: '60%', marginRight: 8}}/>)}
                {_keys.length > 1 ? (
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
                <Form.Item {...formItemLayoutWithOutLabel}>
                    <Button type="dashed" onClick={this.add} style={{width: '60%'}}>
                        <Icon type="plus"/> Add
                    </Button>
                </Form.Item>
                {/*<Form.Item {...formItemLayoutWithOutLabel}>*/}
                {/*    <Button type="primary" htmlType="submit" disabled={id === 0}>*/}
                {/*        Submit*/}
                {/*    </Button>*/}
                {/*</Form.Item>*/}
            </div>
        );
    }
}

const WrappedDynamicFieldDomainSet = Form.create({name: 'dynamic_form_item'})(DynamicFieldDomainSet);
export default WrappedDynamicFieldDomainSet;