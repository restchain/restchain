import {Collapse} from "antd";
import {SolHigh} from "../../Deploy/ModelDetail";
import React from "react";

export function SmartContractCodeViewer(props) {
    if (props.solidity) {
        return <Collapse>
            <Collapse.Panel header="View solidity code" key="1">
                <SolHigh codeString={props.solidity}/>
            </Collapse.Panel>
        </Collapse>
    }
}