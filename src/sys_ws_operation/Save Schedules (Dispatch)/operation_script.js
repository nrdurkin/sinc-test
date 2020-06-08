"use strict";

(function process(req) {
  var utils = DispatchScheduleUtils();
  return utils.saveScheduleChanges(req.body.data);
})(request);