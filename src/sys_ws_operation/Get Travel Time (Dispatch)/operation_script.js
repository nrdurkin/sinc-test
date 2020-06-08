"use strict";

(function process(req) {
  return DispatchScheduleUtils().getTravelTime(req.body.data);
})(request);