import React, {useState} from "react";
import {Button, Input, notification, Select} from "antd";

function SubscribeAsOptional(props) {
    console.log(" SubscribeAsOptional props", props)
    const [state, setState] =
        useState({value: 'Participant 1'});
    const {sid, contract, web3, accounts} = props;



    const callFunction = async (_props) => {
        console.log("callFunction ", state);
        contract.methods[`subscribe_as_participant`].apply(this, Object.values(state)).send({
            // contract.methods.sid_00e1b46c_e485_4551_a17b_6f0c3f21ec2c('car').send({
            from: accounts[0],
            gas: 9000000,
        }).then((result) => {
            console.log("result ", JSON.stringify(result));
            setState({
                response: result
            });
            console.log("senT ",)


        }).catch(function (err, jj) {
            notification['error']({
                message: 'Transaction error' + jj,
                description: JSON.stringify(err)
                ,
            });
        })
    }
    const selectBefore = (
        <Select defaultValue="Participant1" style={{width: 130}} onChange={(value)=>setState({value})}>
            <Select.Option value="Participant 1">Participant 1</Select.Option>
            <Select.Option value="Participant 2">Participant 2</Select.Option>
        </Select>
    );

    const handleOnClick = () =>{
        callFunction()
    }

    if (accounts) {

        return (
            <div>

                <strong>Role: </strong>
                <Input addonBefore={selectBefore} defaultValue={accounts[0]} style={{width: '600px'}}/>
                <Button type={'primary'} onClick={handleOnClick}>Subscribe as</Button>

            </div>
        )
    }
    else {
        return  <div/>
    }

    }

    export default SubscribeAsOptional;


