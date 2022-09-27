import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

import {is} from 'bpmn-js/lib/util/ModelUtil';

export default function (group, element) {

    // Only return an entry, if the currently selected
    // element is a start event.


    // TODO generate an object width fields {id:, descr: ...} instead of using arrays
    const modifierList = ['notifyAuctionInvitation', 'notifySubscribeToAuction', 'notifyAuctionStarted']
    const modifierDescriptionList = ['......',
        'bla bla',
        'blo blo'];


    // console.log(" BPMN Props ", element)
    if (is(element, 'bpmn:Message')) {
        modifierList.forEach((e, i) =>
            group.entries.push(entryFactory.checkbox({
                id: ` event${i}`,
                description: modifierDescriptionList[i],
                label: ` ${e}`,
                modelProperty: ` event${i}`,
            }))
        )
    }
}