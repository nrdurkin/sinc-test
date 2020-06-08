"use strict";

function DispatchScheduleChecker() {
  var getTravelTime = function getTravelTime(opts) {
    var mapboxClient = new MapboxClient();
    var routes = [];

    for (var i = 0; i < opts.eventsLocations.length; i += 1) {
      var _opts$eventsLocations = opts.eventsLocations[i],
          source = _opts$eventsLocations.source,
          destination = _opts$eventsLocations.destination;
      var route = {
        source: "".concat(source.longitude, ",").concat(source.latitude),
        dest: "".concat(destination.longitude, ",").concat(destination.latitude)
      };
      routes.push(route);
    }

    var durationMatrix = mapboxClient.getDriveTimes(routes);
    var durations = [];

    if (durationMatrix != null) {
      for (var _i = 0; _i < routes.length; _i += 1) {
        var durationKey = "dur".concat(routes[_i].source, ">").concat(routes[_i].dest);
        durations.push(durationMatrix[durationKey]);
      }
    }

    return durations;
  };

  var checkSchedules = function checkSchedules(scheduleMap) {
    return x_nuvo_eam.ScheduleChecker.checkSchedules(scheduleMap);
  };

  return {
    getTravelTime: getTravelTime,
    checkSchedules: checkSchedules
  };
}