import React, {useEffect, useState} from "react";
import {BpmnViewer} from "../BpmnViewer";
import {useListenEvents, useRest} from "../hooks";
import {ProcessCurrentState} from "./ProcessCurrentState";
import {CurrentStateViewer} from "./CurrentStateViewer";

/***
 *
 * @param props
 * @returns {*}
 * @constructor
 */
export const BPMNModelProcessor = (props) => {

    const {eventSignature, restMethod, event} = useListenEvents(props.contract);
    const [state, setState] = useState({currentState: null});
    console.log("[ContractView] (EVENT)", event)
    // console.log("[ContractView] (restMethod)", state)
    // console.log("[ContractView] (state)", state)

    useEffect(
        () => {
            runCurrentState();
        }
        , [props.currentState, event]
    )

    const runCurrentState = async () => {

        if (props.contract) {
            //Calls the currentState method from the smart contract and the set the result as state
            props.contract.methods.getCurrentState().call()
                .then((result) => {
                    setState({
                        currentState: result
                    });
                }).catch(function (err) {
                //console.log('err...\n' + err);
            });

            // props.contract.events.allEvents({
            //     fromBlock: '0',
            // }, function (error, event) {
            //     if (error)
            //         alert("error while subscribing to event")
            //     console.log("LOOOOGEEEVEVNT", event)
            //     console.log("event", event.event)
            // })
        }

    }
    // useEffect(
    //     () => {
    //         runInvokeRest();
    //     }
    //     , [props.invokeRest]
    // )
    // const runInvokeRest = async () => {
    //     console.log("props.invokeRest ", props.invokeRest)
    //
    //     axios.get(props.invokeRest && props.invokeRest[2])
    //         .then((resp) => {
    //             setValue(resp.data)
    //             console.log("REST API RESULT:", resp.data)
    //         });
    // }
    //
    //
    // useEffect(() => {
    //     console.log("CI SONO ",)
    //     if (value) {
    //         console.log("Ci Provo ",value)
    //         props.contract.methods._callback("dddd", value.results[0]['email']).send({
    //             // contract.methods.sid_00e1b46c_e485_4551_a17b_6f0c3f21ec2c('car').send({
    //             from: props.accounts[0],
    //             gas: 9000000,
    //         }).then((result) => {
    //             console.log("callFunction result ", JSON.stringify(result));
    //
    //         }).catch(function (err, jj) {
    //             console.log("eee ", err, jj)
    //             notification['error']({
    //                 message: 'Transaction error' + jj,
    //                 description: JSON.stringify(err)
    //                 ,
    //             });
    //         })
    //     }
    // }, [value])


    // console.log(" contracVw", props)
    return <div>
        <BpmnViewer xmlId={props.xmlId} readOnly={true}>
            <div style={{display: 'flex', flexWrap: 'nowrap', padding: '20px'}}>
                <CurrentStateViewer {...state} reload={runCurrentState}/>
                <div style={{display: 'flex', justifyContent: 'space-evenly', width: '100%', marginTop: '40px'}}>
                    <ProcessCurrentState {...state} {...props} callBack={runCurrentState}/>
                </div>
            </div>
        </BpmnViewer>
    </div>
}

export default BPMNModelProcessor;