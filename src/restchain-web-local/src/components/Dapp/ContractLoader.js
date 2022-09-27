import React, {useEffect, useState} from "react";
import {connect} from "react-refetch";
import {Spin} from "antd";
import getWeb3 from "@drizzle-utils/get-web3";
import UserView from "./UserView";
import SubscribeAsOptional from "./SubscribsAsOptional";
import BPMNModelProcessor from "./interaction/BPMNModelProcessor";
import {ContractInfo} from "./interaction/ContractInfo";
import {SmartContractCodeViewer} from "./interaction/SmartContractCodeViewer";
import {RESTListner} from "./interaction/RESTListner";

const ContractLoader = (props) => {
    const [state, setState] = useState({web3: null, accounts: null, contract: null, currentState: null});
    const {modelFetch, refreshModel} = props

    useEffect(() => {
        const init = async () => {
            if (modelFetch.fulfilled) try {
                const web3 = await getWeb3();
                console.log('[ContractLoader] gasLimit: ' + web3.eth.getBlock('latest').gasLimit);
                console.log("[ContractLoader] modelFetch.value.address ", modelFetch.value.address)
                const accounts = await web3.eth.getAccounts();
                const contract = new web3.eth.Contract(
                    JSON.parse(modelFetch.value.abi),
                    modelFetch.value.address
                    // accounts[0]
                );
                setState({web3, accounts, contract});
                console.log("A ",)
            } catch (error) {
                alert(
                    `Failed to load web3, accounts, or contract.
          Check console for details.`,
                )
                console.error(error);
            }
        }
        init();

    }, [modelFetch.fulfilled]);


    if (modelFetch.pending) {
        return <Spin/>
    } else if (modelFetch.rejected) {
        return <div>{modelFetch.reason}</div>
    } else if (modelFetch.fulfilled) {
        return (
            <div>
                <UserView accounts={state.accounts}/>
                <SubscribeAsOptional {...state}/>
                <ContractInfo {...modelFetch.value}/>
                <BPMNModelProcessor {...modelFetch.value} {...state}/>
                <RESTListner {...modelFetch.value} {...state}/>
                <SmartContractCodeViewer {...modelFetch.value} />
            </div>)
    }
}


export default connect(props => {
    const url = "/api2/contract/" + props.match.params.id
    return {
        modelFetch: url,
        refreshModel: () => ({
            modelFetch: {
                url,
                force: true,
                refreshing: true
            }
        })
    }
})(ContractLoader)





