import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

import {getBusinessObject, is} from 'bpmn-js/lib/util/ModelUtil';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import elementHelper from 'bpmn-js-properties-panel/lib/helper/ElementHelper';
import formHelper from 'bpmn-js-properties-panel/lib/helper/FormHelper';

import extensionElements from 'bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements';
import utils from 'bpmn-js-properties-panel/lib/Utils';
import * as _ from 'lodash';
import {getExtensionElements, removeEntry} from 'bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper';
import properties from 'bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/Properties';
import descriptor from '../descriptors/functions'

function generateValueId() {
    return utils.nextId('Value_');
}

/**
 * Generate a form field specific textField using entryFactory.
 *
 * @param  {string} options.id
 * @param  {string} options.label
 * @param  {string} options.modelProperty
 * @param  {function} options.validate
 *
 * @return {Object} an entryFactory.textField object
 */
function formFieldTextField(options, getSelectedFormField) {


    //console.log("formFieldTextField ",)

    var id = options.id,
        label = options.label,
        modelProperty = options.modelProperty,
        validate = options.validate;

    return entryFactory.textField({
        id: id,
        label: label,
        modelProperty: modelProperty,
        get: function (element, node) {


            var selectedFormField = getSelectedFormField(element, node) || {},
                values = {};


            values[modelProperty] = selectedFormField[modelProperty];
            //console.log("GETTT", modelProperty, values[modelProperty]);

            return values;
        },

        set: function (element, values, node) {

            //console.log("SETTT")

            var commands = [];

            //console.log("values ", values)

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
        show: false,
        // hidden: function (element, node) {
        //     console.log(" IIIIINNNNNFFFFOOO",)
        //     return !getSelectedFormField(element, node);
        // },
        validate: validate
    });
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
        description: description,
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


function addFunctionToMessageName(element, lastFunctionName) {
    //update the message name with all selected function names
    let myBo = getBusinessObject(element);
    let myFormData = getExtensionElements(myBo, 'camunda:FormData')[0];
    let fieldNames = myFormData.fields.map((f) => f.id);
    fieldNames[fieldNames.length - 1] = lastFunctionName;
    myBo.name = fieldNames.join("_");
    cmdHelper.updateBusinessObject(element, myBo);
}


function removeFunctionFromMessageName(element, functioName) {
    let myBo = getBusinessObject(element);
    if (myBo.name !== 'undefined') {
        //console.log(" myBo.name", myBo.name)
        myBo.name = myBo.name.replace("_" + functioName, "");
        myBo.name = myBo.name.replace(functioName + "_", "");
        myBo.name = myBo.name.replace(functioName, "");
        cmdHelper.updateBusinessObject(element, myBo);
    }

}

function ensureFormKeyAndDataSupported(element) {
    return (
        is(element, 'bpmn:Message') || is(element, 'bpmn:Choreography'))
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

        if (selected.idx === -1) {
            return;
        }
        return formHelper.getFormField(element, selected.idx);
    }

    // // [FormKey] form key text input field
    // group.entries.push(entryFactory.textField({
    //     id: 'form-key',
    //     label: 'Function key name',
    //     modelProperty: 'formKey',
    //     get: function (element, node) {
    //         var bo = getBusinessObject(element);
    //
    //         return {
    //             formKey: bo.get('camunda:formKey')
    //         };
    //     },
    //     set: function (element, values, node) {
    //         var bo = getBusinessObject(element),
    //             formKey = values.formKey || undefined;
    //
    //         return cmdHelper.updateBusinessObject(element, bo, {'camunda:formKey': formKey});
    //     }
    // }));

    // [FormData] form field select box
    var formFieldsEntry = extensionElements(element, bpmnFactory, {
        id: 'form-fields',
        label: translate('Selected functions'),
        modelProperty: 'id',
        prefix: 'Function',

        createExtensionElement: function (element, extensionElements, value) {
            console.log(" madaiiii",extensionElements)
            var bo = getBusinessObject(element), commands = [];

            if (!extensionElements) {
                console.log("!!!!createElement ExtensionElements", bo)
                extensionElements = elementHelper.createElement('bpmn:ExtensionElements', {values: []}, bo, bpmnFactory);
                commands.push(cmdHelper.updateProperties(element, {extensionElements: extensionElements}));
            }

            var formData = formHelper.getFormData(element);
            console.log(" 1",element,formData)

            if (!formData) {
                console.log(" 2",)

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
            console.log(" 3",formData)

            var field = elementHelper.createElement('camunda:FormField', {id: value}, formData, bpmnFactory);

            if (typeof formData.fields !== 'undefined') {
                //console.log("not update ")
                //console.log(" 4",)

                commands.push(cmdHelper.addElementsTolist(element, formData, 'fields', [field]));
            } else {
                //console.log(" 5",)

                //console.log("update ", field)
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
            return formHelper.getFormFields(element);
        },

        hideExtensionElements: function (element, node) {
            return false;
        }
    });
    group.entries.push(formFieldsEntry);


    // // [FormData] business key form field select box
    // var formBusinessKeyFormFieldEntry = entryFactory.selectBox({
    //     id: 'form-business-key',
    //     label: 'Business Key',
    //     modelProperty: 'businessKey',
    //     selectOptions: function (element, inputNode) {
    //         var selectOptions = [{name: '', value: ''}];
    //         var formFields = formHelper.getFormFields(element);
    //         each(formFields, function (field) {
    //             if (field.type !== 'boolean') {
    //                 selectOptions.push({name: field.id, value: field.id});
    //             }
    //         });
    //         return selectOptions;
    //     },
    //
    //
    //     get: function (element, node) {
    //         var result = {businessKey: ''};
    //         var bo = getBusinessObject(element);
    //         var formDataExtension = getExtensionElements(bo, 'camunda:FormData');
    //         if (formDataExtension) {
    //             var formData = formDataExtension[0];
    //             var storedValue = formData.get('businessKey');
    //             result = {businessKey: storedValue};
    //         }
    //         return result;
    //     },
    //     set: function (element, values, node) {
    //         var formData = getExtensionElements(getBusinessObject(element), 'camunda:FormData')[0];
    //         return cmdHelper.updateBusinessObject(element, formData, {'businessKey': values.businessKey || undefined});
    //     },
    //     hidden: function (element, node) {
    //         var isStartEvent = is(element, 'bpmn:StartEvent');
    //         return !(isStartEvent && formHelper.getFormFields(element).length > 0);
    //     }
    // });
    // group.entries.push(formBusinessKeyFormFieldEntry);

    // [FormData] Form Field label
    group.entries.push(entryFactory.label({
        id: 'form-field-header',
        labelText: translate('Function declaration'),
        showLabel: function (element, node) {
            return !!getSelectedFormField(element, node);
        }
    }));


    // // [FormData] form field id text input field
    // group.entries.push(entryFactory.validationAwareTextField({
    //     id: 'form-field-id',
    //     label: translate('Name'),
    //     modelProperty: 'id',
    //
    //     getProperty: function (element, node) {
    //         var selectedFormField = getSelectedFormField(element, node) || {};
    //
    //         return selectedFormField.id;
    //     },
    //
    //     setProperty: function (element, properties, node) {
    //         var formField = getSelectedFormField(element, node);
    //
    //         return cmdHelper.updateBusinessObject(element, formField, properties);
    //     },
    //
    //     hidden: function (element, node) {
    //         return !getSelectedFormField(element, node);
    //     },
    //
    //     validate: function (element, values, node) {
    //
    //         var formField = getSelectedFormField(element, node);
    //
    //         if (formField) {
    //
    //             var idValue = values.id;
    //
    //             if (!idValue || idValue.trim() === '') {
    //                 return {id: 'Form field id must not be empty'};
    //             }
    //
    //             var formFields = formHelper.getFormFields(element);
    //
    //             var existingFormField = find(formFields, function (f) {
    //                 return f !== formField && f.id === idValue;
    //             });
    //
    //             if (existingFormField) {
    //                 return {id: 'Form field id already used in form data.'};
    //             }
    //         }
    //     }
    // }));


    group.entries.push(entryFactory.comboBox({
        id: 'form-field-id',
        label: 'Function name',
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
                        body: value.body,
                        type: value.returnType,
                        properties: pies
                    }

                }
            });

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

            addFunctionToMessageName(element, reValue.id);


            commands.push(cmdHelper.updateBusinessObject(element, selectedFormField, reValue));

            return commands;
        },
        hidden: function (element, node) {
            return !getSelectedFormField(element, node);
        }
    }));



    // [FormData] form field type combo box
    group.entries.push(entryFactory.comboBox({
        id: 'form-field-type',
        label: "Return type",
        selectOptions: [
            {name: 'uint', value: 'uint'},
            {name: 'long', value: 'long'},
            {name: 'boolean', value: 'boolean'},
            {name: 'date', value: 'date'},
            {name: 'enum', value: 'enum'}
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
                formData = getExtensionElements(getBusinessObject(element), 'camunda:FormData')[0],
                commands = [];

            if (selectedFormField.type === 'enum' && values.type !== 'enum') {
                // delete camunda:value objects from formField.values when switching from type enum
                commands.push(cmdHelper.updateBusinessObject(element, selectedFormField, {values: undefined}));
            }
            if (values.type === 'boolean' && selectedFormField.get('id') === formData.get('businessKey')) {
                commands.push(cmdHelper.updateBusinessObject(element, formData, {'businessKey': undefined}));
            }
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
        id: 'form-field-label',
        label: 'Description',
        modelProperty: 'description'
    }, getSelectedFormField));

    /**  PROPERTIES **/
    // [FormData] Properties label
    group.entries.push(entryFactory.label({
        id: 'form-field-properties-header',
        labelText: translate('Parameters'),
        divider: true,
        showLabel: function (element, node) {
            return !!getSelectedFormField(element, node);
        }
    }));


    // [FormData] camunda:properties table
    group.entries.push(properties(element, bpmnFactory, {
        id: 'form-field-properties',
        modelProperties: ['name', 'type', 'defaultValue'],
        labels: ['Name', 'Type', 'DefaultValue'],
        getParent: function (element, node) {

            //console.log("EEEEElement ", element)

            return getSelectedFormField(element, node);
        },
        show: function (element, node) {
            return !!getSelectedFormField(element, node);
        }
    }, translate));


    //
    //
    // // [FormData] form field defaultValue text input field
    // group.entries.push(formFieldTextField({
    //     id: 'form-field-defaultValue',
    //     label: translate('Default Value'),
    //     modelProperty: 'defaultValue'
    // }, getSelectedFormField));

    group.entries.push(entryFactory.label({
        id: 'form-field-body-header',
        labelText: 'Function body',
        divider: true,
        showLabel: function (element, node) {
            return !!getSelectedFormField(element, node);
        }
    }));

    /** Body **/
    // [FormData] form field Body text input field
    group.entries.push(formFieldTextBoxField({
        id: 'form-field-body',
        label: 'Body',
        modelProperty: 'body',
        divider: true,
    }, getSelectedFormField));


    // // [FormData] form field enum values label
    // group.entries.push(entryFactory.label({
    //     id: 'form-field-enum-values-header',
    //     labelText: translate('Values'),
    //     divider: true,
    //     showLabel: function (element, node) {
    //         var selectedFormField = getSelectedFormField(element, node);
    //
    //         return selectedFormField && selectedFormField.type === 'enum';
    //     }
    // }));
    //
    // // [FormData] form field enum values table
    // group.entries.push(entryFactory.table({
    //     id: 'form-field-enum-values',
    //     labels: [translate('Id'), translate('Name')],
    //     modelProperties: ['id', 'name'],
    //     show: function (element, node) {
    //         var selectedFormField = getSelectedFormField(element, node);
    //
    //         return selectedFormField && selectedFormField.type === 'enum';
    //     },
    //     getElements: function (element, node) {
    //         var selectedFormField = getSelectedFormField(element, node);
    //
    //         return formHelper.getEnumValues(selectedFormField);
    //     },
    //     addElement: function (element, node) {
    //         var selectedFormField = getSelectedFormField(element, node),
    //             id = generateValueId();
    //
    //         var enumValue = elementHelper.createElement(
    //             'camunda:Value',
    //             {id: id, name: undefined},
    //             getBusinessObject(element),
    //             bpmnFactory
    //         );
    //
    //         return cmdHelper.addElementsTolist(element, selectedFormField, 'values', [enumValue]);
    //     },
    //     removeElement: function (element, node, idx) {
    //         var selectedFormField = getSelectedFormField(element, node),
    //             enumValue = selectedFormField.values[idx];
    //
    //         return cmdHelper.removeElementsFromList(element, selectedFormField, 'values', null, [enumValue]);
    //     },
    //     updateElement: function (element, value, node, idx) {
    //         var selectedFormField = getSelectedFormField(element, node),
    //             enumValue = selectedFormField.values[idx];
    //
    //         value.name = value.name || undefined;
    //         return cmdHelper.updateBusinessObject(element, enumValue, value);
    //     },
    //     validate: function (element, value, node, idx) {
    //
    //         var selectedFormField = getSelectedFormField(element, node),
    //             enumValue = selectedFormField.values[idx];
    //
    //         if (enumValue) {
    //             // check if id is valid
    //             var validationError = utils.isIdValid(enumValue, value.id, translate);
    //
    //             if (validationError) {
    //                 return {id: validationError};
    //             }
    //         }
    //     }
    // }));

    // group.entries.push(entryFactory.label({
    //     id: 'form-field-validation-header',
    //     labelText: translate('Validation'),
    //     divider: true,
    //     showLabel: function (element, node) {
    //         return !!getSelectedFormField(element, node);
    //     }
    // }));

    // // [FormData] form field constraints table
    // group.entries.push(entryFactory.table({
    //     id: 'constraints-list',
    //     modelProperties: ['name', 'config'],
    //     labels: [translate('Name'), translate('Config')],
    //     addLabel: translate('Add Constraint'),
    //     getElements: function (element, node) {
    //         var formField = getSelectedFormField(element, node);
    //
    //         return formHelper.getConstraints(formField);
    //     },
    //     addElement: function (element, node) {
    //
    //         var commands = [],
    //             formField = getSelectedFormField(element, node),
    //             validation = formField.validation;
    //
    //         if (!validation) {
    //             // create validation business object and add it to form data, if it doesn't exist
    //             validation = elementHelper.createElement('camunda:Validation', {}, getBusinessObject(element), bpmnFactory);
    //
    //             commands.push(cmdHelper.updateBusinessObject(element, formField, {'validation': validation}));
    //         }
    //
    //         var newConstraint = elementHelper.createElement(
    //             'camunda:Constraint',
    //             {name: undefined, config: undefined},
    //             validation,
    //             bpmnFactory
    //         );
    //
    //         commands.push(cmdHelper.addElementsTolist(element, validation, 'constraints', [newConstraint]));
    //
    //         return commands;
    //     },
    //     updateElement: function (element, value, node, idx) {
    //         console.log("UPDATE ",)
    //         var formField = getSelectedFormField(element, node),
    //             constraint = formHelper.getConstraints(formField)[idx];
    //
    //         value.name = value.name || undefined;
    //         value.config = value.config || undefined;
    //
    //         return cmdHelper.updateBusinessObject(element, constraint, value);
    //     },
    //     removeElement: function (element, node, idx) {
    //         var commands = [],
    //             formField = getSelectedFormField(element, node),
    //             constraints = formHelper.getConstraints(formField),
    //             currentConstraint = constraints[idx];
    //
    //         commands.push(cmdHelper.removeElementsFromList(
    //             element,
    //             formField.validation,
    //             'constraints',
    //             null,
    //             [currentConstraint]
    //         ));
    //
    //         if (constraints.length === 1) {
    //             // remove camunda:validation if the last existing constraint has been removed
    //             commands.push(cmdHelper.updateBusinessObject(element, formField, {validation: undefined}));
    //         }
    //
    //         return commands;
    //     },
    //     show: function (element, node) {
    //         return !!getSelectedFormField(element, node);
    //     }
    // }));


};
