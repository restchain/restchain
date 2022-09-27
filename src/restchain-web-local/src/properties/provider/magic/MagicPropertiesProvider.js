import inherits from 'inherits';

import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';
// Require all properties you need from existing providers.
// In this case all available bpmn relevant properties without camunda extensions.
import processProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/ProcessProps';
// import formProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/FormProps';
import eventProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/EventProps';
import linkProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/LinkProps';
import documentationProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps';
import idProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/IdProps';
import nameProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps';
// Require your custom property entries.
import spellProps from './parts/SpellProps';
import listModifierProps from './parts/ListModifierProps';
import listEventProps from './parts/ListEventProps';
import listFunctionProps from './parts/ListFunctionProps';
import listFunction2Props from './parts/ListFunction2Props';
import functionFormProps from './parts/FunctionFormProps';
import typeFormProps from './parts/TypeFormProps';
import properties from 'bpmn-js-properties-panel/lib/provider/camunda/parts/PropertiesProps';


// The general tab contains all bpmn relevant properties.
// The properties are organized in groups.
function createGeneralTabGroups(element, bpmnFactory, canvas, elementRegistry, translate) {

    var generalGroup = {
        id: 'general',
        label: 'General',
        entries: []
    };
    idProps(generalGroup, element, translate);
    nameProps(generalGroup, element, bpmnFactory, canvas, translate);
    processProps(generalGroup, element, translate);

    var detailsGroup = {
        id: 'details',
        label: 'Details',
        entries: []
    };
    linkProps(detailsGroup, element, translate);
    eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);

    var documentationGroup = {
        id: 'documentation',
        label: 'Documentation',
        entries: []
    };

    documentationProps(documentationGroup, element, bpmnFactory, translate);

    return [
        generalGroup,
        detailsGroup,
        documentationGroup
    ];
}

// Create the custom magic tab
function createMagicTabGroups(element) {

    // Create a group called "Black Magic".
    var blackMagicGroup = {
        id: 'black-magic',
        label: 'Black Magic',
        entries: []
    };

    // Add the spell props to the black magic group.
    spellProps(blackMagicGroup, element);

    return [
        blackMagicGroup
    ];
}


// Create the custom Modifier tab
function createModifiersTabGroups(element) {

    // Create a group called "Black Magic".
    var modifiersGroup = {
        id: 'modifier',
        label: 'Modifier',
        entries: []
    };


    listModifierProps(modifiersGroup, element)

    return [
        modifiersGroup
    ];
}

// Create the custom Modifier tab
function createEventsTabGroups(element) {

    // Create a group called "Black Magic".
    var eventsGroup = {
        id: 'event',
        label: 'Event',
        entries: []
    };

    listEventProps(eventsGroup, element)

    return [
        eventsGroup
    ];
}

function createFunctionsFormTabGroups(element, bpmnFactory, elementRegistry, translate) {
    var formGroup = {
        id : 'forms',
        label : 'Behavior',
        entries: []
    };

    functionFormProps(formGroup, element, bpmnFactory, translate);

    return [
        formGroup
    ];
}

function createTypeDefinitionFormTabGroups(element, bpmnFactory, elementRegistry, translate) {
    var formGroup = {
        id : 'dataDef',
        label : 'Type definition',
        entries: []
    };

    typeFormProps(formGroup, element, bpmnFactory, translate);

    return [
        formGroup
    ];
}

function createExtensionElementsGroups(element, bpmnFactory, elementRegistry, translate) {

    var propertiesGroup = {
        id : 'extensionElements-properties',
        label: translate('Properties'),
        entries: []
    };
    properties(propertiesGroup, element, bpmnFactory, translate);

    return [
        propertiesGroup
    ];
}

// Create the custom Modifier tab
function createFunctionsTabGroups(element) {

    // Create a group called "Black Magic".
    var functionsGroup = {
        id: 'function',
        label: 'function',
        entries: []
    };


    listFunctionProps(functionsGroup, element)

    return [
        functionsGroup
    ];
}

function createFunctions2TabGroups(element) {

    // Create a group called "Black Magic".
    var functions2Group = {
        id: 'function2',
        label: 'function2',
        entries: []
    };


    listFunction2Props(functions2Group, element)

    return [
        functions2Group
    ];
}

export default function MagicPropertiesProvider(
    eventBus, bpmnFactory, canvas,
    elementRegistry, translate) {

    PropertiesActivator.call(this, eventBus);

    this.getTabs = function (element) {

        var generalTab = {
            id: 'general',
            label: 'General',
            groups: createGeneralTabGroups(element, bpmnFactory, canvas, elementRegistry, translate)
        };

        // The "magic" tab
        var magicTab = {
            id: 'magic',
            label: 'Magic',
            groups: createMagicTabGroups(element)
        };

        // The modifier tab
        var modifierTab = {
            id: 'modifier',
            label: 'Modifier',
            groups: createModifiersTabGroups(element)
        };

        // The function tab
        var functionTab = {
            id: 'function',
            label: 'Function',
            groups: createFunctionsTabGroups(element)
        };

        // // The function tab
        // var function2Tab = {
        //     id: 'function2',
        //     label: 'Function2',
        //     groups: createFunctions2TabGroups(element)
        // };


        // The function tab
        var eventTab = {
            id: 'event',
            label: 'Event',
            groups: createEventsTabGroups(element)
        };

        var FunctionformTab = {
            id: 'forms',
            label: 'Behavior',
            groups: createFunctionsFormTabGroups(element, bpmnFactory, elementRegistry, translate)
        };
        var typeFormTab = {
            id: 'dataDef',
            label: 'Type',
            groups: createTypeDefinitionFormTabGroups(element, bpmnFactory, elementRegistry, translate)
        };

        var extensionsTab = {
            id: 'extensionElements',
            label: translate('Extensions'),
            groups: createExtensionElementsGroups(element, bpmnFactory, elementRegistry, translate)
        };

        // Show general + "magic" tab
        return [
            generalTab,
            // magicTab,
            modifierTab,
            typeFormTab,
            // eventTab,
            FunctionformTab,
            // extensionsTab
            // function2Tab
        ];
    };
}


inherits(MagicPropertiesProvider, PropertiesActivator);