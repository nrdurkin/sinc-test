"use strict";

(function executeRule(cur) {
  // Add your code here
  var location = DispatchScheduleUtils().getLocationFromWorkOrder(
    cur.getValue("work_order")
  );
  cur.setValue("latitude", location.latitude || 0);
  cur.setValue("longitude", location.longitude || 0);
})(current);
