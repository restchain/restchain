import React from "react";
import ModelList from "./ModelList";
import {Spin} from "antd";
import {connect} from 'react-refetch'

const Deploy = (props) => {

    const {modelFetch, refreshModel} = props

    if (modelFetch.pending) {
        return <Spin/>
    } else if (modelFetch.rejected) {
        return <div>{modelFetch.reason}</div>
    } else if (modelFetch.fulfilled) {
        return (
            <div>
                <Description/>
                <ModelList dataSource={modelFetch.value} refreshModel={refreshModel}/>
            </div>)
    }
}


const Description = () => {
    return (
        <div>
            <h1>Model list</h1>
            <p>Explanation here</p>
        </div>
    )
}


export default connect(props => {
    const url = "/api2/model"
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
})(Deploy)


