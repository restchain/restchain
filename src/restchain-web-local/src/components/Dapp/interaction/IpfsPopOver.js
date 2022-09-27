import {useIpfsCall} from "../hooks";
import {Icon, Popover, Tag} from "antd";
import React from "react";
import JSONPretty from "react-json-pretty";

export function IpfsPopover(id) {
    const ipfsContent = useIpfsCall(id);
    return (
        <Popover
            content={Content(ipfsContent)}
            title={<><Icon type={'interaction'}/>{`  IPFS #${id}`}</>}
            trigger="hover">
            {id && <Tag color={'cyan'}>Ipfs</Tag>}
        </Popover>
    )
}


function isIpfs(str) {
    return str.includes("_rcid") || str.includes("_rcbkid")
}


const Content = (ipfsContent) => (
    <div style={{width: '400px', wordWrap: "break-word"}}>
        <JSONPretty id="json-pretty" data={ipfsContent}/>
    </div>
)