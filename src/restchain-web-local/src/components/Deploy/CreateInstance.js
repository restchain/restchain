import React, {useState, useEffect} from "react";
import {useHistory} from "react-router-dom";
import {
    Button,
    Divider,
    Modal,
    notification,
    Transfer
} from "antd";
import axios from 'axios';

export function CreateInstance({model, visible, hide, refreshModel}) {
    console.log("model ", model);

    const [targetKeys, setTargetKeys] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const dataSource = model.participants.map((p, i) => {
        return {key: `${p.id}`, title: `${p.name}`}
    });

    const handleOnClick = () => {
        console.log("go ",)
        const instanceData = {
            modelId: model.id,
            mandatoryParticipants: targetKeys,
            visibleAt: ["null"]
        };
        axios.post(`/api2/instance`, instanceData).then(function (response) {
            console.log("yes", response)
            if (response.status === 201) {
                notification['success']({
                    message: 'Created new instance',
                    description:
                        `A new instance for the model ${model.id}  was successfully created`,
                });
                refreshModel();
                return hide();
            }
        })
            .catch(function (error) {
                console.log(error);
            });
    }

    const handleChange = (nextTargetKeys, direction, moveKeys) => {
        setTargetKeys(nextTargetKeys);
        console.log('nextTargetKeys: ', nextTargetKeys);
        console.log('targetKeys: ', targetKeys);
    }

    const handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
        console.log('sourceSelectedKeys: ', sourceSelectedKeys);
        console.log('targetSelectedKeys: ', targetSelectedKeys);
    }

    console.log("dataSource", dataSource);
    console.log('targetKeys: ', targetKeys);

    return (
        <Modal
            title="Create a new model istance"
            visible={visible}
            onOk={hide}
            onCancel={hide}
            width={800}
        >
            <div style={{padding: 10, border: '1px solid #E9E9E9', marginBottom: 50}}>
                <Divider orientation="center">Participants/Roles</Divider>
                <div style={{margin: 10}}>
                    <p>Define roles for the instance.
                        <ul>
                            <li><strong>Mandatory:</strong> will be a mandatory role with an associate user</li>
                            <li><strong>Optional:</strong> ...</li>
                        </ul>
                    </p>
                </div>
                <Transfer
                    dataSource={dataSource}
                    titles={['Optional', 'Mandatory']}
                    targetKeys={targetKeys}
                    selectedKeys={selectedKeys}
                    onChange={handleChange}
                    onSelectChange={handleSelectChange}
                    render={item => item.title}
                />
            </div>
            <Button disabled={!targetKeys.length>0}
                type='primary' onClick={handleOnClick}>New instance</Button>
        </Modal>
    )
}
