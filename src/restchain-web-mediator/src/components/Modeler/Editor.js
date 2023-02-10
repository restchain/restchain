import BpmnModeler from 'chor-js/lib/Modeler';

import emptyDiagram from "../../resources/EmptyDiagram.bpmn";
import React, {useEffect, useState} from "react";
import {renderModel} from "./actions";
import {ActionMenu} from "./ActionMenu";
import propertiesPanelModule from 'bpmn-js-properties-panel';
// // //If  is the needed to change the characteristics of the panel it should be created a personal moddle file
// import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import camundaModdleDescriptor from '../../moddle/custom';


import propertiesProviderModule from "../../properties/provider/magic";
import myModdleDescriptor from "../../properties/descriptors/magic"
import {useParams} from "react-router-dom";
import PropertiesView from "./PropertiesPanel/PropertiesView";
import restchainDescriptor from "../../properties/descriptors/restChain.json"


/*

    Check it :
            https://github.com/bpmn-io/bpmn-js-examples/tree/master/custom-meta-model
 */

export function Editor() {
    const [viewer, setViewer] = useState();
    let {id} = useParams();

    useEffect(() => {

        const modeler = new BpmnModeler({
            container: '#canvas',
            // propertiesPanel: {
            //     parent: '#properties'
            // },
            // additionalModules: [
            //     propertiesPanelModule,
            //     propertiesProviderModule
            // ],
            // make camunda prefix known for import, editing and export
            moddleExtensions: {
                restchain:restchainDescriptor,
                camunda: camundaModdleDescriptor,
                my: myModdleDescriptor,
            }
        });

        // used as a ComponentDidMount
        // wait for the div '#canvas' has been rendered and then attach the chor-js editor with an emptyDiagram
        renderModel(modeler, emptyDiagram);
        setViewer(modeler);

        // //if specified the id on the url a new model it is rendered
        if (id) {
            // console.log(" again",)
            fetch(`/api2/model/xml/${id}`)
                .then(function (response) {
                    response.text().then((s) => {
                        renderModel(modeler, s);
                    })
                })
        }
    }, [])

    return (
        <>

            {viewer && <ActionMenu modeler={viewer}/>}
            <div className="modeler" style={{display: "flex",}}>
                <div id="canvas" style={{height: 500, width: '90%', border: '1px solid grey'}}/>
                <div id="properties" style={{height: "100%"}}/>
                {viewer && <div style={{width:500,backgroundColor: '#F8F8F8',color:'rgba(0, 0, 0, 0.65)',border:'2px solid #CCCCCC'}}><PropertiesView modeler={viewer}/></div>}
            </div>
            {/*<PropertiesView modeler={modeler}/>*/}
        </>
    )
}

