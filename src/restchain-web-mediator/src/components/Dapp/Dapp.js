import React, {useEffect, useState} from "react";
import {Spin} from "antd";
import {connect} from 'react-refetch'
import ContractList from "./ContractList";



const Dapp = (props) => {

    const {modelFetch, refreshModel} = props



    if (modelFetch.pending) {
        return <Spin/>
    } else if (modelFetch.rejected) {
        return <div>{modelFetch.reason}</div>
    } else if (modelFetch.fulfilled) {
        return (
            <div>
                {/*<UserPage {...state}/>*/}
                <Description/>
                <ContractList dataSource={modelFetch.value} refreshModel={refreshModel}/>
            </div>)
    }
}


const Description = (accounts) => {
    return (
        <div>
            <h1>SmartContract list</h1>
            <p>Explanation here</p>
        </div>
    )
}



export default connect(props => {
    const url = "/api2/contract/listImpl"
    return {
    modelFetch: url,
        refreshModel: () => ({
            modelFetch: {
                url,
                force: true,
                refreshing: true
            }
        }),
    }
})(Dapp)


