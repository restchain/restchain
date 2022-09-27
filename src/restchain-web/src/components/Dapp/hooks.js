import {useCallback, useEffect, useState} from "react";
import * as _ from "lodash";
import axios from "axios";
import {message, notification} from "antd";
import {ipfsMini} from "../../ipfs";


/***
 * Listen to events (stateChanged,callRESTMethod)
 *
 *
 * @returns {{eventSign: undefined, invokeRest: undefined}}
 */
export function useListenEvents(contract) {
    const [eventSignature, setEventSign] = useState();
    const [event, setEvent] = useState();
    const [restMethod, setRestMethod] = useState();
    useEffect(() => {
        contract && contract.events.allEvents({
            fromBlock: 'latest',
        }, function (error, event) {


            if (error)
                alert("error while subscribing to event")
            if (event) {
                console.debug("[Event] - ", event.event ,  event.returnValues)
                if (event.event === "stateChanged") {
                    setEventSign(event.signature);
                    setEvent(event);
                }
                if (event.event === "callRESTMethod") {
                    setEventSign(event.signature);
                    setEvent(event);
                    setRestMethod(event.returnValues);
                }
            }
        })
    },[contract]);


    return {eventSignature, restMethod,event}
}


/***
 * handle the rest calls from the e request to the response
 *
 *
 * @param accounts
 * @param contract
 * @param restInfo
 * @returns {{restReturnValue: unknown, callbackReturnValue: unknown}}
 */


export function useRest(web3,accounts, contract, restInfo) {
    const [restReturnValue, setRestReturnValue] = useState(null);
    const [callbackReturnValue, setCallbackReturnValue] = useState(null);
    const [{cid, loading, content : ipfsContent}, doCat, doAdd] = useIpfsCmd();
    console.log("WEB3 ",web3)




    const handleRestInfo = async () => {
        // console.log("props.invokeRest ", restInfo)
        // console.log("_.keys(restInfo) ", _.keys(restInfo))
        // console.log("_.keys(restInfo).filter((k) => k.includes(\"endpoint\"))", _.keys(restInfo).filter((k) => k.includes("endpoint")))

        // DA CAMBIARE QUANDO SI MODIFICHERA LA VOCE endpoint con qualcosa relativo a ipfs
        let restEndpointKey = _.keys(restInfo).filter((k) => k.includes("endpoint"))[0];
        // console.log("restEndpoint ", restEndpointKey);
        restEndpointKey = restInfo && restInfo['restApiUri'];
        // console.log("restEndpoint ", restEndpointKey);


        // Se restApiUri allora leggi il contenuto dell'IPFS
        if (restEndpointKey) {

            console.log("this.restEndpointKey ", restEndpointKey)
            doCat(restEndpointKey); // permette all'hook ipfs di leggere il contenuto del IPFS
        }

    }
// axios.get(restInfo && restInfo['restApiUri'])
//     .then((resp) => {
//         setRestReturnValue(resp.data)
//         console.log("REST API RESULT:", resp.data)
//         console.log("LOG this  ", restReturnValue)
//         if (resp.data && restInfo.fnType === 'oneway') {
//             callContractCallbackOneway(restInfo, resp.data)
//         } else if (resp.data && restInfo.fnType === 'twoway') {
//             callContractCallbackTwoway(restInfo, resp.data)
//         }
//
//     });


    //Invoke a Rest call
    useEffect(
        () => {
            console.log("REST REST REST",)
            handleRestInfo();
        }
        , [restInfo]
    )

    const callRest = async () => {
        const restDetail = JSON.parse(ipfsContent);
        axios.get(restDetail.url)
            .then((resp) => {
                setRestReturnValue(resp.data)
                // console.log("REST API RESULT:", resp.data)
                // console.log("LOG this  ", restReturnValue)
                message.success('Endpoint '+restDetail.url+ ' successfully called ');
                if (resp.data && restInfo.fnType === 'oneway') {
                    callContractCallbackOneway(restInfo, resp.data)
                } else if (resp.data && restInfo.fnType === 'twoway') {
                    callContractCallbackTwoway(restInfo, resp.data)
                }
            });
    }

    const clear = () => {
        setRestReturnValue();
        setCallbackReturnValue();
    }

    const callRestWithMethod = async () => {
        const restDetail = JSON.parse(ipfsContent);
        console.log(" restDetail",restDetail);
        const callDefinition = {
            method: restDetail.method,
            url: restDetail.url,
            params:  restDetail.params,
            data: restDetail.data,
        }
        axios(callDefinition)
            .then((resp) => {
                clear();
                setRestReturnValue(resp.data)
                console.log("[callRestWithMethod] REST API RESULT:", resp.data)
                console.log("[callRestWithMethod] LOG this  ", restReturnValue)
                console.log("[callRestWithMethod] restInfo  ", restInfo)
                message.success('Endpoint '+restDetail.url+ ' successfully called ',10);
                if (resp.data && restInfo.fnType === 'oneway') {
                    callContractCallbackOneway(restInfo, resp.data)
                } else if (resp.data && restInfo.fnType === 'twoway') {
                    // controlla che l'account designato per il rientro in blockchain sia corretto
                    if(accounts[0] === restInfo.id){
                        callContractCallbackTwoway(restInfo, resp.data)
                    } else {
                        console.log(" ** Drop REST CALL because account not allowed ** - account:",accounts[0])
                    }
                }
            });
    }


    //Invoke a Rest call
    useEffect(
        () => {
            // Se cè contenuto IPFS allora invoca il REST dopo aver aperto il contenuto
            if (ipfsContent) {
                console.log("ipfsContent ",ipfsContent)
                callRestWithMethod();
            }
        }
        , [ipfsContent]
    )

    const callContractCallbackOneway = async (rest, apiResult) => {

        console.log("REST CALL [OneWay]", rest, apiResult)
        if (apiResult && rest && rest['callbackFn']) {
            const method = `${rest['callbackFn']}`
            contract.methods[`${method}`]().send({
                // contract.methods.sid_00e1b46c_e485_4551_a17b_6f0c3f21ec2c('car').send({
                from:accounts[0],
                gas: 9000000,
            }).then((result) => {
                setCallbackReturnValue(result);
            }).catch(function (err, jj) {
                notification['error']({
                    message: 'Transaction error' + jj,
                    description: JSON.stringify(err)
                    ,
                });
            })
        }
    }

    const callContractCallbackTwoway = async (rest, apiResult) => {
        console.log("REST CALL [TwoWay]", rest, apiResult)
        if (apiResult && rest && rest['callbackFn']) {
            const method = `${rest['callbackFn']}`
            ipfsMini.add(JSON.stringify(apiResult)).then((resp) => {
                contract.methods[`${method}`](resp).send({
                    // contract.methods.sid_00e1b46c_e485_4551_a17b_6f0c3f21ec2c('car').send({
                    from: accounts[0],
                    gas: 9000000,
                }).then((result) => {
                    setCallbackReturnValue(result);
                }).catch(function (err, jj) {
                    notification['error']({
                        message: 'Transaction error' + jj,
                        description: JSON.stringify(err)
                        ,
                    })
                })
            })
        }
    }
//
// //Invoke a Contract callback
// useEffect(() => {
//         console.log("LOG this  ", restReturnValue)
//         if (restReturnValue && restInfo.fnType === 'oneway') {
//             callContractCallbackOneway(restInfo, restReturnValue)
//         } else if (restReturnValue && restInfo.fnType === 'twoway') {
//             callContractCallbackTwoway(restInfo, restReturnValue)
//         }
//     },
//     [restReturnValue]
// )

    return {restReturnValue, callbackReturnValue, clear}
}


export function useIpfsCall(id) {
    const [res, setRes] = useState();
    useEffect(() => {
        id && ipfsMini.cat(id).then((resp) => setRes(resp))
    }, [id])
    return res;
}


export function useIpfsAdd(obj) {
    const [res, setRes] = useState();
    const [loading, setLoading] = useState();
    useEffect(() => {
        if (obj) {
            loading(true)
            ipfsMini.add(JSON.stringify(obj)).then((resp) => {
                    setRes(resp);
                    loading(false);
                }
            )

        }
    }, [obj])
    return res;
}

/***
 * Hook per creare o aprire un pacchetto IPFS
 * @returns {({loading: boolean, content: undefined, cid: undefined}|((value: (((prevState: undefined) => undefined) | undefined)) => void))[]}
 */
export function useIpfsCmd() {
    const [cid, setCid] = useState();
    const [data, setData] = useState();
    const [content, setContent] = useState();
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (data) {
            setLoading(true);
            ipfsMini.add(JSON.stringify(data)).then((resp) => {
                    setCid(resp);
                    setLoading(false);
                }
            )
        }
    }, [data])


    useEffect(() => {
        if (cid) {
            setLoading(true)
            ipfsMini.cat(cid).then((resp) => {
                    setContent(resp);
                    setLoading(false);
                }
            )
        }
    }, [cid]);

    return [{cid, loading, content}, setCid, setData]
}