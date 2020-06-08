"use strict";

var originalCallId = current.getUniqueValue();
current.setValue('short_description', "".concat(gs.getMessage('Reopened'), ": ").concat(current.getValue('short_description')));
current.setValue('state', 1);
current.setValue('work_order', '');
current.setValue('number', '');
current.setValue('parent', '');
current.setValue('appointment', '');
var reopenedCall = current.insert();
var originalCall = new GlideRecord('x_nuvo_csd_call');

if (reopenedCall && originalCall.get(originalCallId)) {
  originalCall.setValue('parent', reopenedCall);
  originalCall.setValue('actions', '');
  originalCall.update();
}

var currentUrl = gs.getUrlOnStack();
gs.setRedirect(currentUrl);