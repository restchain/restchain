import BpmnModeler from 'chor-js/lib/Modeler';

import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";

import BpmnPalletteModule from 'bpmn-js/lib/features/palette';

export const BpmnViewerContext = React.createContext();

export function BpmnViewer({xmlId,children}) {

    const [canvas, setCanvas] = useState();
    const [modeler, setModeler] = useState();
    const myId = xmlId;
    const viewer = new BpmnModeler({
        keyboard: { bindTo: document },
        BpmnPalletteModule});

    useEffect(() => {
        if (xmlId) {
            // console.log(" again",)
            fetch(`/api2/model/xml/${myId}`)
                .then(function (response) {
                    response.text().then((s) => {
                        viewer.importXML(s, function (err) {
                            if (err) {
                                console.log('error rendering', err);
                            } else {
                                // console.log('rendered');
                                viewer.get('canvas').zoom('fit-viewport');
                                setCanvas(viewer.get('canvas'));
                                setModeler(viewer);
                            }
                        });
                        viewer.attachTo('#canvas')
                    })
                })
        }
        // returned function will be called on component unmount

    }, [xmlId])

    useEffect(()=>{
        return () => {
            viewer.detach();
        }
    },[])

    return (
        <div>
        <div id="canvas" style={{height: 500, width: '90%', border: '1px solid grey'}}/>
            <BpmnViewerContext.Provider value={{canvas,modeler}}>
                {children}
            </BpmnViewerContext.Provider>
            {hideModellerElements()}
        </div>)
}

function hideModellerElements(){
    const classNameToHide = ['djs-palette','djs-palette-entries','djs-context-pad','djs-palette-toggle','djs-select-wrapper']

    classNameToHide.forEach((c)=>{
        {Array.prototype.forEach.call(document.getElementsByClassName(c), function (el) {
            // Do something amazing below
            el.style.display = 'none';
        })}
    })
}


