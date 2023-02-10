import React from "react";
import {IpfsPopover} from "./IpfsPopOver";
import {Tag} from "antd";

/***
 *
 * @param props
 * @returns {*}
 * @constructor
 */

export function CurrentStateView(props) {
    console.log("STATE STATUS => ", props)
    // const inputs = props.currentCall.inputs.map(a => a.name);
    // const outputs = props.currentCall.outputs.map(a => a.name);

    if (props.currentState) {

        const keys = Object.keys(props.currentState[1]).sort();
        // console.log("kkk ", keys)
        return (<div style={{border: '1px solid black', padding: 20, width: 300, wordWrap: 'break-word'}}>
            <h2>Current State</h2>
            {<div> {keys.map((value, i) => {
                const toRender = props.currentState[1][value].toString();

                if (i >= (keys.length / 2)) {

                    return (
                        <div key={i}>
                            {toRender ? value.includes("_rcid") ? <Tag style={{fontSize: 8}} color={'green'}>Req</Tag> :
                                <Tag style={{fontSize: 8}} color={'orange'}>Resp</Tag> : ''}
                            <strong>{value}</strong>:{IpfsPopover(toRender)}
                        </div>
                    )
                }
            })}</div>}

        </div>)
    }

    return <div>no Vars</div>
}








