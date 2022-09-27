import React, {Component} from 'react';

import './PropertiesView.css';
import {ElementProperties} from "./ElementProperties";
import {is} from "bpmn-js/lib/util/ModelUtil";

export default class PropertiesView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedElements: [],
            element: null,
            choreography: null
        };
    }

    componentDidMount() {

        const {modeler} = this.props;

        modeler.on('selection.changed', (e) => {
            console.log(" PPPPPPPPPP",)
            this.setState({
                selectedElements: e.newSelection,
                element: e.newSelection[0]
            });
        });


        modeler.on('element.click', (e) => {
            const {element} = e;

            const {element: currentElement} = this.state;

            //permits to select only the choreography
            if (is(element, "bpmn:Choreography")) {
                // if (this.state.choreography) {
                //     this.setState({choreography: null})
                //     return;
                // }
                this.setState({
                    choreography: element
                });
            }

            //handle the other elements flow

            if (!currentElement) {
                return;
            }

            // update panel, if currently selected element changed
            if (element.id === currentElement.id) {
                this.setState({
                    element, choreography: null
                });
            }
        });


    }

    render() {

        console.log("PV STATE", this.state)
        const {modeler} = this.props;

        const {selectedElements, element, choreography} = this.state;


        return (
            <div style={{margin:'20px 20px 20px 20px'}}>

                {
                    selectedElements.length === 1
                    && <ElementProperties modeler={modeler} element={element}/>
                }

                {
                    choreography
                    && <ElementProperties modeler={modeler} element={choreography}/>
                }

                {
                    selectedElements.length === 0 && !choreography
                    && <span >Please select an element.</span>
                }

                {
                    selectedElements.length > 1
                    && <span>Please select a single element.</span>
                }
            </div>
        );
    }

}


