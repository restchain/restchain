import React, {useContext} from "react";
import {BpmnViewerContext} from "../BpmnViewer";
import {find} from "lodash";
import WrappedFunctionForm from "./FunctionForm";

/***
 *
 * @param props
 * @returns {*}
 * @constructor
 */

export const ProcessCurrentState = (props) => {
    const {currentState} = props;
    const {canvas, modeler} = useContext(BpmnViewerContext);
    // console.log("ProcessCurrentState ", props, canvas, currentState)

    const highlightFunction1 = (sid) => {

        // lastId && canvas.removeMarker(lastId, 'highlight1')
        canvas.removeMarker(sid, 'highlight2')
        canvas.removeMarker(sid, 'highlight0')
        canvas.addMarker(sid, 'highlight1');
        canvas.removeMarker(sid, 'highlight-2')
        canvas.removeMarker(sid, 'highlight-0')
        canvas.addMarker(sid, 'highlight-1');

        // if (sid === 'sid-e385b492-6b2b-475b-a8dd-8fc09513393b' )

        // canvas.addMarker('sid-e385b492-6b2b-475b-a8dd-8fc09513393b', 'highlight');
    }


    const highlightFunction2 = (sid) => {

        // lastId && canvas.removeMarker(lastId, 'highlight1')
        canvas.removeMarker(sid, 'highlight1')
        canvas.removeMarker(sid, 'highlight0')
        canvas.addMarker(sid, 'highlight2');
        canvas.removeMarker(sid, 'highlight-1')
        canvas.removeMarker(sid, 'highlight-0')
        canvas.addMarker(sid, 'highlight-2');


        // if (sid === 'sid-e385b492-6b2b-475b-a8dd-8fc09513393b' )

        // canvas.addMarker('sid-e385b492-6b2b-475b-a8dd-8fc09513393b', 'highlight');
    }

    const highlightFunction0 = (sid) => {


        // lastId && canvas.removeMarker(lastId, 'highlight1')
        canvas.removeMarker(sid, 'highlight2')
        canvas.removeMarker(sid, 'highlight1')
        canvas.addMarker(sid, 'highlight0');
        canvas.removeMarker(sid, 'highlight-2')
        canvas.removeMarker(sid, 'highlight-1')
        canvas.addMarker(sid, 'highlight-0');

        // if (sid === 'sid-e385b492-6b2b-475b-a8dd-8fc09513393b' )

        // canvas.addMarker('sid-e385b492-6b2b-475b-a8dd-8fc09513393b', 'highlight');
    }


    const removeHighlightFunction = (sid) => {

        // lastId && canvas.removeMarker(lastId, 'highlight1')
        canvas.removeMarker(sid, 'highlight');

        // if (sid === 'sid-e385b492-6b2b-475b-a8dd-8fc09513393b' )

        // canvas.addMarker('sid-e385b492-6b2b-475b-a8dd-8fc09513393b', 'highlight');
    }

    if (currentState) {

        let elementsEnabled = currentState[0].filter(f => f.status === "1");
        let elementsDisabled = currentState[0].filter(f => f.status === "0");
        let elementsDone = currentState[0].filter(f => f.status === "2");

        elementsEnabled.map(d => highlightFunction1(d.ID.toString().replace("_resp", "")))
        elementsDisabled.map(d => highlightFunction0(d.ID.toString().replace("_resp", "")))
        elementsDone.map(d => highlightFunction2(d.ID.toString().replace("_resp", "")))

        // console.log("enabled ", enabled)
        return elementsEnabled.map((f, i) => {
                const normalizedId = f.ID.replace(/-/g, '_');
                const current = find(props.contract._jsonInterface, {'name': normalizedId});
                // console.log(" currentcurrent", current)
                return (
                    <WrappedFunctionForm
                        key={i} sid={f.ID}
                        contract={props.contract}
                        web3={props.web3}
                        account={props.accounts[0]}
                        callBack={props.callBack}
                        canvas={canvas}
                        viewer={modeler}
                    />
                )
            }
        );
    }

    return <div>Not element founds</div>

}
