import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

import {getBusinessObject, is} from 'bpmn-js/lib/util/ModelUtil';
import descriptor from '../descriptors/functions'
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import ImplementationTypeHelper from 'bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper';
import formHelper from 'bpmn-js-properties-panel/lib/helper/FormHelper';
import elementHelper from 'bpmn-js-properties-panel/lib/helper/ElementHelper';


// var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    // getExtensionElements = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper').getExtensionElements,
    // removeEntry = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper').removeEntry,
    // extensionElements = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements'),
    // properties = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/Properties'),
    // entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory'),
    // elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper'),
    // cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper'),
    // formHelper = require('bpmn-js-properties-panel/lib/helper/FormHelper'),
    // utils = require('bpmn-js-properties-panel/lib/Utils'),
    // is = require('bpmn-js/lib/util/ModelUtil').is,
    // find = require('lodash/find'),
    // each = require('lodash/forEach');


function getImplementationType(element) {
    return ImplementationTypeHelper.getImplementationType(element);
}

export default function (group, element) {

    // Only return an entry, if the currently selected
    // element is a start event.


    // TODO generate an object width fields {id:, descr: ...} instead of using arrays
    const modifierList = ['createAuction', 'otherFunc', 'funcToDoSomeThing']
    const modifierDescriptionList = ['Creats all the auction....',
        'bla bla',
        'blo blo'];


    //console.log(" BPMN Props ", element);

    if (is(element, 'bpmn:Message')) {
        descriptor.forEach((e, i) => {
                group.entries.push(// [FormData] form field constraints table
                    group.entries.push(entryFactory.table({
                        id: 'constraints-list',
                        modelProperties: ['name', 'config'],
                        labels: ['Name', 'Config'],
                        addLabel: 'Add Constraint',
                        getElements: function (element, node) {
                            // var formField = getSelectedFormField(element, node);
                            return element

                        },
                        // addElement: function (element, node) {
                        //
                        //     var commands = [],
                        //         formField = getSelectedFormField(element, node),
                        //         validation = formField.validation;
                        //
                        //     if (!validation) {
                        //         // create validation business object and add it to form data, if it doesn't exist
                        //         validation = elementHelper.createElement('camunda:Validation', {}, getBusinessObject(element), bpmnFactory);
                        //
                        //         commands.push(cmdHelper.updateBusinessObject(element, formField, {'validation': validation}));
                        //     }
                        //
                        //     var newConstraint = elementHelper.createElement(
                        //         'camunda:Constraint',
                        //         {name: undefined, config: undefined},
                        //         validation,
                        //         bpmnFactory
                        //     );
                        //
                        //     commands.push(cmdHelper.addElementsTolist(element, validation, 'constraints', [newConstraint]));
                        //
                        //     return commands;
                        // },
                        // updateElement: function (element, value, node, idx) {
                        //     var formField = getSelectedFormField(element, node),
                        //         constraint = formHelper.getConstraints(formField)[idx];
                        //
                        //     value.name = value.name || undefined;
                        //     value.config = value.config || undefined;
                        //
                        //     return cmdHelper.updateBusinessObject(element, constraint, value);
                        // },
                        // removeElement: function (element, node, idx) {
                        //     var commands = [],
                        //         formField = getSelectedFormField(element, node),
                        //         constraints = formHelper.getConstraints(formField),
                        //         currentConstraint = constraints[idx];
                        //
                        //     commands.push(cmdHelper.removeElementsFromList(
                        //         element,
                        //         formField.validation,
                        //         'constraints',
                        //         null,
                        //         [currentConstraint]
                        //     ));
                        //
                        //     if (constraints.length === 1) {
                        //         // remove camunda:validation if the last existing constraint has been removed
                        //         commands.push(cmdHelper.updateBusinessObject(element, formField, {validation: undefined}));
                        //     }
                        //
                        //     return commands;
                        // },
                        // show: function (element, node) {
                        //     return !!getSelectedFormField(element, node);
                        // }
                    })))
            }
        )
    }
}