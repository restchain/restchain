import WrappedDynamicFieldDomainSet from "./DynamicFieldDomainSet";
import {Button, Input, InputNumber, Select, Spin, Switch} from "antd";
import React, {useState} from "react";
import {isEmpty} from "lodash";
import {ipfsMini} from "../../../ipfs";
const {TextArea} = Input;



export function IPFSForm({onOk}) {
    const [paramsValue, setParamsValue] = useState({});
    const [dataValue, setDataValue] = useState({});
    const [urlValue, setUrlValue] = useState();
    const [methodValue, setMethodValue] = useState();
    const [loading, setLoading] = useState(false);
    const [cid, setCid] = useState(false);
    const [res, setRes] = useState(false);


    // const handleAdd = async () => {
    //     setLoading(true)
    //     const cid = await IPFS.add(value);
    //     console.log("IPFS cid:", cid);
    //     setCid(cid.path);
    //     setLoading(false);
    //     // load(cid.path).then((v)=>{
    //     //     console.log("arilog v",v)
    //     //     setRes(v)
    //     // });
    // };
    //
    const handleAdd = async () => {
        //console.log("method ", methodValue)
        setLoading(true)
        const value = {
            url: urlValue,
            method: methodValue,
            params: !isEmpty(paramsValue)?JSON.parse(paramsValue): {},
            // data: dataValue ? JSON.parse(dataValue) : undefined,
        }
        ipfsMini.add(Buffer.from(JSON.stringify(value))).then((response) => {
            setCid(response);
            ipfsMini.cat(response).then((lr) => setRes(lr))
            setLoading(false);
            onOk(response);
        });
    };

    const handleCancel = () => {
        setParamsValue(undefined);
        setDataValue(undefined);
        setMethodValue(undefined);
        setUrlValue(undefined);
        setLoading(false);
        setCid(undefined);
        setRes(undefined);
        // onCancel();
    }


    return <div>
        {
            !loading && !cid &&
            <><h3>Content</h3>
                <div><strong>Url:</strong></div>
                <Input
                    placeholder={'http://resturi.api'}
                    onChange={(e) => setUrlValue(e.target.value)}
                />
                <div><strong>Method:</strong></div>
                <Select onChange={(v) => setMethodValue(v)}>
                    <Select.Option value={'get'}>GET</Select.Option>
                    <Select.Option value={'post'}>POST</Select.Option>
                    <Select.Option value={'put'}>PUT</Select.Option>
                    <Select.Option value={'delete'}>DELETE</Select.Option>
                </Select>
                <div><strong>Params:</strong></div>
                <TextArea
                    rows={5}
                    placeholder={'{ "para1": "string_value", "para2" : number_value, "para3": { "p1" : "string_value" }'}
                    onChange={(e) => setParamsValue(e.target.value)}
                />
                { (methodValue === 'post' || methodValue === 'put') &&
                <>
                    <div><strong>Data (POST, PUT):</strong></div>
                    <TextArea
                        rows={5}
                        placeholder={'{ "para1": "string_value", "para2" : number_value, "para3": { "p1" : "string_value" }'}
                        onChange={(e) => setDataValue(e.target.value)}
                    />
                </>
                }
                <div style={{marginTop: '5px', textAlign: "center"}}>
                    <Button onClick={() => handleAdd()} type={"primary"}>Create IPFS</Button>
                </div>
            </>
        }

        {
            cid && <div>
                <strong>cid:</strong>{cid}
                <div>{res}</div>
            </div>
        }
        {
            loading && <Spin>Creating IPFS......</Spin>
        }
    </div>
}































