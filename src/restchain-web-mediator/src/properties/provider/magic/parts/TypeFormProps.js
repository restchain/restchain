import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

import {getBusinessObject, is} from 'bpmn-js/lib/util/ModelUtil';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import elementHelper from 'bpmn-js-properties-panel/lib/helper/ElementHelper';

import extensionElements from 'bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements';
import * as _ from 'lodash';
import {getExtensionElements, removeEntry} from 'bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper';
import properties from 'bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/Properties';
import descriptor from '../descriptors/structs'


function addFunctionToMessageName(element, lastFunctionName) {
    //update the message name with all selected function names
    let myBo = getBusinessObject(element);
    let myFormData = getExtensionElements(myBo, 'camunda:TypeStruct')[0];
    let fieldNames = myFormData.fields.map((f) => f.id);
    fieldNames[fieldNames.length - 1] = lastFunctionName;
    myBo.name = fieldNames.join("_");
    cmdHelper.updateBusinessObject(element, myBo);
}

function getFormType(element) {
    var bo = getBusinessObject(element);

    var formData = getExtensionElements(bo, 'camunda:TypeStruct');
    //console.log("fff ",formData)
    if (typeof formData !== 'undefined') {
        return formData[0];
    }
}

function getFormField (element, idx) {

    var formFields = getFormFields(element);

    return formFields[idx];
};

function getFormFields(element) {
    var formData = getFormType(element);

    if (typeof formData === 'undefined') {
        return [];
    }

    return formData.fields || [];
}

function removeFunctionFromMessageName(element, functioName) {
    let myBo = getBusinessObject(element);
    if (myBo.name !== 'undefined') {
        //console.log(" myBo.name",myBo.name)
        myBo.name = myBo.name.replace("_" + functioName, "");
        myBo.name = myBo.name.replace(functioName + "_", "");
        myBo.name = myBo.name.replace(functioName, "");
        cmdHelper.updateBusinessObject(element, myBo);
    }
}



function formFieldTextBoxField(options, getSelectedFormField) {

    var id = options.id,
        label = options.label,
        modelProperty = options.modelProperty,
        validate = options.validate,
        description = options.description;

    return entryFactory.textBox({
        id: id,
        label: label,
        modelProperty: modelProperty,
        get: function (element, node) {
            var selectedFormField = getSelectedFormField(element, node) || {},
                values = {};

            values[modelProperty] = selectedFormField[modelProperty];
            //console.log("values ", modelProperty)
            return values;
        },

        set: function (element, values, node) {
            var commands = [];


            if (typeof options.set === 'function') {
                var cmd = options.set(element, values, node);

                //console.log("cmd ", cmd)
                if (cmd) {
                    commands.push(cmd);
                }
            }

            var formField = getSelectedFormField(element, node),
                properties = {};
            //console.log("formField ", formField)

            properties[modelProperty] = values[modelProperty] || undefined;

            commands.push(cmdHelper.updateBusinessObject(element, formField, properties));

            return commands;
        },
        show: function (element, node) {
            return !!getSelectedFormField(element, node);
        },
        validate: validate
    });
}

function ensureFormKeyAndDataSupported(element) {
    return (is(element, 'bpmn:Choreography'))
}


export default function (group, element, bpmnFactory, translate) {



    if (!ensureFormKeyAndDataSupported(element)) {
        return;
    }


    /**
     * Return the currently selected form field querying the form field select box
     * from the DOM.
     *
     * @param  {djs.model.Base} element
     * @param  {DOMElement} node - DOM element of any form field text input
     *
     * @return {ModdleElement} the currently selected form field
     */
    function getSelectedFormField(element, node) {
        var selected = formFieldsEntry.getSelected(element, node.parentNode);
        //console.log("selected ",selected)
        if (selected.idx === -1) {
            return;
        }
        return getFormField(element, selected.idx);
    }

    // [FormData] form field select box
    var formFieldsEntry = extensionElements(element, bpmnFactory, {
        id: 'form-fields-type',
        label: 'Selected type',
        modelProperty: 'id',
        prefix: 'Type',

        createExtensionElement: function (element, extensionElements, value) {
            var bo = getBusinessObject(element), commands = [];

            if (!extensionElements) {
                //console.log(" createElement ExtensionElements", bo)
                extensionElements = elementHelper.createElement('bpmn:ExtensionElements', {values: []}, bo, bpmnFactory);
                commands.push(cmdHelper.updateProperties(element, {extensionElements: extensionElements}));
            }

            var formData = getFormType(element);

            if (!formData) {
                formData = elementHelper.createElement('camunda:TypeStruct', {fields: []}, extensionElements, bpmnFactory);
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

            //console.log(" field",field)
            //console.log(" formData.fields",formData.field)

            if (typeof formData.fields !== 'undefined') {
                //console.log("not update fields",field)

                commands.push(cmdHelper.addElementsTolist(element, formData, 'fields', [field]));
            } else {
                //console.log("update ", field)
                commands.push(cmdHelper.updateBusinessObject(element, formData, {
                    fields: [field]
                }));
            }
            return commands;
        },

        removeExtensionElement: function (element, extensionElements, value, idx) {
            var formData = getExtensionElements(getBusinessObject(element), 'camunda:TypeStruct')[0],
                entry = formData.fields[idx],
                commands = [];


            removeFunctionFromMessageName(element, entry.id);

            if (formData.fields.length < 2) {
                commands.push(removeEntry(getBusinessObject(element), element, formData));
            } else {
                commands.push(cmdHelper.removeElementsFromList(element, formData, 'fields', null, [entry]));

                if (entry.id === formData.get('businessKey')) {

                    //console.log("eeee ", entry.id)

                    commands.push(cmdHelper.updateBusinessObject(element, formData, {'businessKey': undefined}));
                }
            }

            return commands;
        },

        getExtensionElements: function (element) {
            return getFormFields(element);
        },

        hideExtensionElements: function (element, node) {
            return false;
        }
    });
    group.entries.push(formFieldsEntry);


    group.entries.push(entryFactory.comboBox({
        id: 'form-field-type-id',
        label: 'Type name',
        selectOptions: descriptor,
        modelProperty: 'id',
        emptyParameter: true,

        get: function (element, node) {
            var selectedFormField = getSelectedFormField(element, node);

            if (selectedFormField) {
                //console.log("selected ", selectedFormField.id)
                return {
                    id: selectedFormField.id
                };
            } else {
                return {};
            }
        },
        set: function (element, values, node) {

            let reValue = values;

            //Load on the form Items the defined functions that are present on the function descriptor
            _.forIn(descriptor, function (value, key) {

                //console.log(value.name, values.id);

                if (value.name === values.id) {
                    let params = [];
                    value.params.forEach((p) =>
                        params.push(elementHelper.createElement('camunda:Property', p, element, bpmnFactory)
                        )
                    )

                    var pies = elementHelper.createElement('camunda:Properties', {values: params}, element, bpmnFactory);
                    reValue = {
                        id: value.name,
                        description: value.description,
                        type: value.returnType,
                        properties: pies
                    }

                }
            });

            var selectedFormField = getSelectedFormField(element, node),
                formData = getExtensionElements(getBusinessObject(element), 'camunda:TypeStruct')[0],
                commands = [];

            // if (selectedFormField.type === 'enum' && values.type !== 'enum') {
            //     // delete camunda:value objects from formField.values when switching from type enum
            //     commands.push(cmdHelper.updateBusinessObject(element, selectedFormField, {values: undefined}));
            // }
            // if (values.id === 'boolean' && selectedFormField.get('id') === formData.get('businessKey')) {
            //     commands.push(cmdHelper.updateBusinessObject(element, formData, {'businessKey': undefined}));
            // }

            addFunctionToMessageName(element,reValue.id);


            commands.push(cmdHelper.updateBusinessObject(element, selectedFormField, reValue));

            return commands;
        },
        hidden: function (element, node) {
            return !getSelectedFormField(element, node);
        }
    }));


    // [FormData] form field type combo box
    group.entries.push(entryFactory.comboBox({
        id: 'form-filedType-type',
        label: "Tipology",
        selectOptions: [
            {name: 'struct', value: 'struct'},
            {name: 'global', value: 'global'},
            {name: 'mappings', value: 'mappings'},
        ],
        modelProperty: 'type',
        emptyParameter: true,

        get: function (element, node) {
            var selectedFormField = getSelectedFormField(element, node);

            if (selectedFormField) {
                return {type: selectedFormField.type};
            } else {
                return {};
            }
        },
        set: function (element, values, node) {
            var selectedFormField = getSelectedFormField(element, node),
                formData = getExtensionElements(getBusinessObject(element), 'camunda:TypeStruct')[0],
                commands = [];
            commands.push(cmdHelper.updateBusinessObject(element, selectedFormField, values));

            return commands;
        },
        hidden: function (element, node) {
            return !getSelectedFormField(element, node);
        }
    }));

    /** DEscription **/
    // [FormData] form field label text input field
    group.entries.push(formFieldTextBoxField({
        id: 'form-field-type-label',
        label: 'Description',
        modelProperty: 'description'
    }, getSelectedFormField));


    /**  PROPERTIES **/
    // [FormData] Properties label
    group.entries.push(entryFactory.label({
        id: 'form-type-properties-header',
        labelText: 'Properties',
        divider: true,
        showLabel: function (element, node) {
            return !!getSelectedFormField(element, node);
        }
    }));


    // [FormData] camunda:properties table
    group.entries.push(properties(element, bpmnFactory, {
        id: 'form-field-type-properties',
        modelProperties: ['name', 'type', 'defaultValue'],
        labels: ['Name', 'Type', 'DefaultValue'],
        getParent: function (element, node) {
            return getSelectedFormField(element, node);
        },
        show: function (element, node) {
            return !!getSelectedFormField(element, node);
        }
    }, translate));



    // [FormData] form field enum values label
    group.entries.push(entryFactory.label({
        id: 'form-field-type-values-header',
        labelText: translate('Values'),
        divider: true,
        showLabel: function (element, node) {
            var selectedFormField = getSelectedFormField(element, node);

            return selectedFormField && selectedFormField.type === 'enum';
        }
    }));


};
