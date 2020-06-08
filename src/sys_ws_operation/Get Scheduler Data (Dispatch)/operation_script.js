"use strict";

(function process(req, resp) {
  var body = DispatchAPIUtils.getSchedulerData(req, resp);
  resp.setBody(body);
})(request, response);