"use strict";

(function process(req, resp) {
  var dataUtil = new DispatchDataHelper();
  var utils = DispatchScheduleUtils();
  var queryParams = req.queryParams;

  var _dataUtil$getUnrouted = dataUtil.getUnroutedTechs(queryParams),
      participants = _dataUtil$getUnrouted.participants,
      techs = _dataUtil$getUnrouted.techs;

  var range_start = queryParams.range_start,
      range_end = queryParams.range_end;
  var reqObj = {
    participants: participants,
    rangeStart: range_start,
    rangeEnd: range_end
  };
  var appointments = utils.getSchedules(reqObj);
  var results = {
    routed: false,
    appointments: appointments,
    techs: techs
  };
  resp.setBody(results);
})(request, response);