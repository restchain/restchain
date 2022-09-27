import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

import {is,getBusinessObject} from 'bpmn-js/lib/util/ModelUtil';
import descriptor from '../descriptors/functions'
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import elementHelper from 'bpmn-js-properties-panel/lib/helper/ElementHelper';
import formHelper from 'bpmn-js-properties-panel/lib/helper/FormHelper';

import extensionElements from 'bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements';
import ImplementationTypeHelper from 'bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper';
import {getExtensionElements} from 'bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper';
import {removeEntry} from 'bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper';



function getImplementationType(element) {
    return ImplementationTypeHelper.getImplementationType(element);
}
export default function (group, element,bpmnFactory) {

    // Only return an entry, if the currently selected
    // element is a start event.


    // TODO generate an object width fields {id:, descr: ...} instead of using arrays
    const modifierList = ['createAuction', 'otherFunc', 'funcToDoSomeThing']
    const modifierDescriptionList = ['Creats all the auction....',
        'bla bla',
        'blo blo'];


    // [FormData] form field select box
    var formFieldsEntry = extensionElements(element, bpmnFactory, {
        id: 'form-fields',
        label: 'Selected functions',
        modelProperty: 'id',
        prefix: 'FormField',
        createExtensionElement: function (element, extensionElements, value) {
            var bo = getBusinessObject(element), commands = [];

            //console.log(" Lets create",bo)

            if (!extensionElements) {
                extensionElements = elementHelper.createElement('bpmn:ExtensionElements', {values: []}, bo, bpmnFactory);
                commands.push(cmdHelper.updateProperties(element, {extensionElements: extensionElements}));
            }

            var formData = formHelper.getFormData(element);

            if (!formData) {
                formData = elementHelper.createElement('camunda:FormData', {fields: []}, extensionElements, bpmnFactory);
                commands.push(cmdHelper.addAndRemoveElementsFromList(
                    element,
                    extensionElements,
                    'values',
                    'extensionElements',
                    [formData],
                    []
                ));
            }

            var field = elementHelper.createElement('camunda:FormField', {id: value}, formData, bpmnFactory);
            if (typeof formData.fields !== 'undefined') {
                //console.log("not update ")

                commands.push(cmdHelper.addElementsTolist(element, formData, 'fields', [field]));
            } else {
                //console.log("update ",field)
                commands.push(cmdHelper.updateBusinessObject(element, formData, {
                    fields: [field]
                }));
            }
            return commands;
        },
        removeExtensionElement: function (element, extensionElements, value, idx) {
            var formData = getExtensionElements(getBusinessObject(element), 'camunda:FormData')[0],
                entry = formData.fields[idx],
                commands = [];

            if (formData.fields.length < 2) {
                commands.push(removeEntry(getBusinessObject(element), element, formData));
            } else {
                commands.push(cmdHelper.removeElementsFromList(element, formData, 'fields', null, [entry]));

                if (entry.id === formData.get('businessKey')) {
                    commands.push(cmdHelper.updateBusinessObject(element, formData, {'businessKey': undefined}));
                }
            }

            return commands;
        },
        getExtensionElements: function (element) {
            return formHelper.getFormFields(element);
        },
        hideExtensionElements: function (element, node) {
            return false;
        }
    });
    group.entries.push(formFieldsEntry);

    function getSelectedFormField(element, node) {
        var selected = formFieldsEntry.getSelected(element, node.parentNode);

        if (selected.idx === -1) {
            return;
        }

        // console.log("selected ",selected)
        // console.log("element ",element)

        return formHelper.getFormField(element, selected.idx);
    }

    // [FormData] form field type combo box
    group.entries.push(entryFactory.comboBox({
        id: 'form-field-id',
        label: 'Function',
        selectOptions: [
            {name: 'uint', value: 'uint'},
            {name: 'long', value: 'long'},
            {name: 'boolean', value: 'boolean'},
            {name: 'date', value: 'date'},
            {name: 'enum', value: 'enum'}
        ],
        modelProperty: 'id',
        emptyParameter: true,

        get: function (element, node) {
            var selectedFormField = getSelectedFormField(element, node);

            if (selectedFormField) {
                return {id: selectedFormField.id};
            } else {
                return {};
            }
        },
        set: function (element, values, node) {
            var selectedFormField = getSelectedFormField(element, node),
                formData = getExtensionElements(getBusinessObject(element), 'camunda:FormData')[0],
                commands = [];

            // if (selectedFormField.type === 'enum' && values.type !== 'enum') {
            //     // delete camunda:value objects from formField.values when switching from type enum
            //     commands.push(cmdHelper.updateBusinessObject(element, selectedFormField, {values: undefined}));
            // }
            // if (values.id === 'boolean' && selectedFormField.get('id') === formData.get('businessKey')) {
            //     commands.push(cmdHelper.updateBusinessObject(element, formData, {'businessKey': undefined}));
            // }
            commands.push(cmdHelper.updateBusinessObject(element, selectedFormField, values));

            return commands;
        },
        hidden: function (element, node) {
            return !getSelectedFormField(element, node);
        }
    }));


    // console.log(" BPMN Props ", element);
    //
    // if (is(element, 'bpmn:Message')) {
    //     descriptor.forEach((e, i) => {
    //         console.log(" e",e,getBusinessObject(e))
    //             group.entries.push(entryFactory.checkbox({
    //                 id: `${e.name}`,
    //                 description: e.description,
    //                 label: ` ${e.name}`,
    //                 modelProperty: `${e.name}`,
    //
    //                 get: function(element, node) {
    //                     var result = {businessKey: ''};
    //                     var bo = getBusinessObject(element);
    //
    //                     console.log("booo ",bo,e.name)
    //                     //
    //                     // let test = e.name;
    //                     // return {
    //                     //     [test] : bo.$attrs[test] || false
    //                     // }
    //
    //                     var formDataExtension = getExtensionElements(bo, 'camunda:FormData');
    //                     if (formDataExtension) {
    //                         var formData = formDataExtension[0];
    //                         var storedValue = formData.get('businessKey');
    //
    //                         console.log("storedValue ",storedValue)
    //
    //                         result = {businessKey: storedValue};
    //                     }
    //                     return result;
    //                 },
    //
    //                 set: function (element, values, node) {
    //                     let bo = getBusinessObject(element);
    //                     let test = e.name;
    //                     console.log("test ",test)
    //                     console.log("val",values)
    //                     let testname = values[test]
    //
    //                     // return cmdHelper.updateBusinessObject(element, bo, {[test]: testname});
    //                     var formData = getExtensionElements(getBusinessObject(element), 'camunda:FormData')[0];
    //                     return cmdHelper.updateBusinessObject(element, formData, {'businessKey': values.businessKey || undefined});
    //                 },
    //
    //
    //             }));
    //
    //
    //             // group.entries.push(entryFactory.textBox({
    //             //     id: `${e.name}Body`,
    //             //     label: `Body`,
    //             //     modelProperty: `func-${e.name}Body`,
    //             //
    //             //     // get: function (element, node,options) {
    //             //     //     console.log("opt ",options)
    //             //     //     var bo = getBusinessObject(element);
    //             //     //     var boShape = getBusinessObject(bo.di);
    //             //     //     var type = getImplementationType(element);
    //             //     //     // var attr = getAttribute(type);
    //             //     //
    //             //     //     // console.log("aaa ",attr);
    //             //     //
    //             //     //     return {
    //             //     //         formKey: bo.get('camunda:formKey')
    //             //     //     };
    //             //     // },
    //             //     set: function (element, values, node) {
    //             //         console.log("aadsfsfs ",values)
    //             //         var bo = getBusinessObject(element),
    //             //             formKey = values.formKey || undefined;
    //             //
    //             //         return cmdHelper.updateBusinessObject(element, bo, {'camunda:formKey': formKey});
    //             //     }
    //             // }));
    //         }
    //     )
    // }
}