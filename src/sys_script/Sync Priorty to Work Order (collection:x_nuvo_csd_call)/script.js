"use strict";

(function executeRule(cur) {
  var woGR = new GlideRecord('x_nuvo_eam_work_order');

  if (woGR.get(cur.getValue('work_order'))) {
    woGR.setValue('priority', cur.getValue('priority'));
    woGR.update();
  }
})(current);