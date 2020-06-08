"use strict";

(function process(req) {
  var taskId = req.pathParams.taskId;
  var body = DispatchAPIUtils.getAssignmentDataInitialLoad(taskId);
  return body;
})(request);