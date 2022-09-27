import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';


import {getBusinessObject, is} from 'bpmn-js/lib/util/ModelUtil';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';

export default function (group, element) {

    // Only return an entry, if the currently selected
    // element is a start event.


    // TODO generate an object width fields {id:, descr: ...} instead of using arrays
    const modifierList = ['isOwner', 'isRegistrar', 'isFava']
    const modifierDescriptionList = ['Check that participant is owner',
        'Check that participant is Registered',
        'Check that the participant isFava'];


    //console.log(" BPMN Props ", element)
    if (is(element, 'bpmn:Message')) {
        modifierList.forEach((e, i) =>
            group.entries.push(entryFactory.checkbox({
                id: `id${i}`,
                description: modifierDescriptionList[i],
                label: ` ${e}`,
                modelProperty: `id${i}`,
                get: function (element, node) {
                    var bo = getBusinessObject(element);
                    return {
                        [`id${i}`]: bo[`id${i}`] || false, 'all': bo['all']
                    }
                },
                set: function (element, values, node) {
                    let bo = getBusinessObject(element);
                    //console.log("bbb ", bo)
                    let testname = values[`id${i}`];
                    //console.log("ttt ", testname)

                    let singleMod = values[`id${i}`];
                    let modifiers = bo[`all`] && bo[`all`].split(",") || [];
                    let cleneadMods = modifiers;

                    modifiers.forEach((m)=>bo[m] && delete cleneadMods[m])


                    if (singleMod) {
                        cleneadMods.push(`id${i}`)
                    }

                    //console.log(" mmm", cleneadMods)

                    return cmdHelper.updateBusinessObject(element, bo, {
                        [`id${i}`]: testname,
                        'all': cleneadMods && cleneadMods.join(",") || undefined
                    });
                },
            }))
        )
    }
}