"use strict";

(function process(req) {
  var utils = DispatchScheduleUtils();
  return utils.getSchedules(req.body.data);
})(request);