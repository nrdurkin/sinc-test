"use strict";

(function executeRule(cur) {
  var callGR = new GlideRecord('x_nuvo_csd_call');
  callGR.addQuery('work_order', cur.getValue('sys_id'));
  callGR.query();

  while (callGR.next()) {
    callGR.setValue('priority', cur.getValue('priority'));
    callGR.update();
  }
})(current);