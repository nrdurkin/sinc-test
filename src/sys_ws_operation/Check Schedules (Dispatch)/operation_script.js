"use strict";

(function process(req) {
  // implement resource here
  return DispatchScheduleChecker().checkSchedules(req.body.data);
})(request);