import {Button} from "antd";
import {CurrentStateView} from "./CurrentStateView";
import React from "react";

export function CurrentStateViewer(props){
    return(
        <div style={{marginRight: '20px'}}>
            <Button style={{marginBottom: '10px'}} type={'primary'}
                    onClick={props.reload}>Reload</Button>
            <CurrentStateView {...props}  />
        </div>
    )
}