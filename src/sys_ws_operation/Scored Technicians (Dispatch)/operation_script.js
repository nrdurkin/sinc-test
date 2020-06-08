"use strict";

(function process(req, resp) {
  var pathParams = req.pathParams;
  var task_id = pathParams.task_id,
      _pathParams$mandatory = pathParams.mandatory_only,
      mandatory_only = _pathParams$mandatory === void 0 ? true : _pathParams$mandatory;
  resp.setBody(DispatchAPIUtils.getRoutedTechs(task_id, mandatory_only));
})(request, response);