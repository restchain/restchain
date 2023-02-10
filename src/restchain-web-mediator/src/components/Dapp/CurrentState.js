import React, {useEffect, useState} from "react";

function CurrentState(props) {
    const [state, setState] = useState({response: null,event:null});
    console.log("CurrentState props ",props)
    useEffect(() => {

        const runExample = async () => {
            if (props.contract) {
                props.contract.methods.getCurrentState().call()
                    .then((result) => {
                        setState({response: result});
                    }).catch(function (err) {
                    console.log('err...\n' + err);
                });

                props.contract.events.allEvents({
                    fromBlock: '0',
                }, function (error, event) {
                    if (error)
                        alert("error while subscribing to event")
                    console.log("LOOOOGEEEVEVNT",event)
                    console.log("event",event.event)
                })
            }
        }



        runExample()

    }, [props.contract]);
    return <span>{JSON.stringify(state.response)}</span>
}
export default CurrentState;