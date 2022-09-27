import React from "react";
import {useListenEvents, useRest} from "../hooks";
import {Card} from "antd";

export function RESTListner(props) {
    const {eventSignature, restMethod, event} = useListenEvents(props.contract);
    const {restReturnValue, callbackReturnValue} = useRest(props.web3, props.accounts, props.contract, restMethod)



    console.log(" restReturnValue", restReturnValue)
    console.log(" callbackReturnValue", callbackReturnValue)
    return (
        <div style={{paddingLeft: '10%',paddingRight:'10%',marginTop: 20,marginBottom:20}}>
            <Card title="Last REST call">
                <p>
                    <div>
                        <b>Response:</b> {JSON.stringify(restReturnValue)}</div>
                </p>
            </Card>
        </div>
    )
}