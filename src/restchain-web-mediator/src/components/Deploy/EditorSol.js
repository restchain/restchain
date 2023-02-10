import React from 'react';
import Editor from 'react-simple-code-editor';
    import {highlight, languages} from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import axios from "axios";
import {Button, Input, Modal, notification} from "antd";

const code = `function add(a, b) {
  return a + b;
}
`;

export default class EditorSol extends React.Component {
    constructor(props) {
        super(props);
        // Non chiamre this.setState() qui!
        this.state = {
            code: this.props.code,
            visible: false,
            name: ""
        };
    }

    handleOnClick = () => {
        this.showModal()
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = e => {
        console.log(this.state);
        this.setState({
            visible: false,
        });
        const request = {name: this.state.name, smartContractId: this.props.contractId, data: this.state.code};
        console.log(" rew", request)
        axios.post("/api2/contract/createSCImplementation", request)
            .then((resp) => {
                const textToDisplay =<div>A new instance implementation   <strong>{this.state.name}</strong> was successfully created.</div>;
                notification['success']({
                    message: 'Created new instance implementation',
                    description:
                        textToDisplay,
                });

                console.log(" resp", resp);

            })
            .catch((e) => {

                const textToDisplay =
                    <div>The creation of the instance implementation named <strong>{this.state.name}</strong> is failed!  <br/>Cause:<br/> {`${e}`}</div>;
                notification['error']({
                    message: 'Error creating a new implementation',
                    description: textToDisplay
                    ,
                });

                console.log("eeee ", e);

            });
    };

    handleCancel = e => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };

    render() {
        return (
            <div>
                <Button onClick={this.handleOnClick}>Save</Button>
                <Editor
                    value={this.state.code}
                    onValueChange={code => this.setState({code})}
                    highlight={code => highlight(code, languages.js)}
                    padding={10}
                    style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 12,
                    }}
                />
                <Button onClick={this.handleOnClick}>Save</Button>
                <Modal
                    title="Basic Modal"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <Input placeholder="Implementation name" onChange={(v) => this.setState({name: v.target.value})}/>
                </Modal>
            </div>
        );
    }
}

