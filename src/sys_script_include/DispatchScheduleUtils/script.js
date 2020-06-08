"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function DispatchScheduleUtils() {
  var EVENT_TABLE = 'x_nuvo_csd_appointment';
  var apptStates = {
    REQUESTED: '100',
    ACCEPTED: '200',
    REJECTED: '300',
    COMPLETED: '400'
  };

  var setApptValues = function setApptValues(apptGR, values) {
    Object.keys(values).forEach(function (field) {
      apptGR.setValue(field, values[field]);
    });
  };

  var copyApptValues = function copyApptValues(properties, sourceGR, destGR) {
    properties.forEach(function (property) {
      destGR.setValue(property, sourceGR.getValue(property));
    });
  };

  var getTravelTime = function getTravelTime(opts) {
    return DispatchScheduleChecker().getTravelTime(opts);
  };

  var eventToEventGR = function eventToEventGR(event, participant, eventGR) {
    x_nuvo_eam.ScheduleUtils.eventToEventGR(event, participant, eventGR);
    eventGR.setValue('work_order', event.workOrder);
  };

  var parseLatLong = function parseLatLong() {
    var latlong = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var validLatLongRegExp = /-?\d+\.?\d+/;
    var validLatLong = latlong === null ? [null] : latlong.match(validLatLongRegExp) || ['0'];
    return validLatLong[0];
  };

  var isInvalidLatLong = function isInvalidLatLong(location) {
    var invalidLat = location.latitude === null || location.latitude === '0.0';
    var invalidLong = location.longitude === null || location.longitude === '0.0';

    if (invalidLat || invalidLong) {
      return true;
    }

    return false;
  };

  var checkForInvalidLatLong = function checkForInvalidLatLong(location) {
    var warning = isInvalidLatLong(location);
    var labels = [gs.getMessage('CSD_DISP_WARNING_NO_LATLONG')];
    return {
      warning: warning,
      labels: labels
    };
  };

  var getLocationFromWorkOrderGR = function getLocationFromWorkOrderGR(woGR) {
    try {
      var buildingGR = woGR.work_location.getRefRecord().floor.getRefRecord().building.getRefRecord();
      return {
        latitude: parseLatLong(buildingGR.getValue('latitude')),
        longitude: parseLatLong(buildingGR.getValue('longitude'))
      };
    } catch (e) {
      return {
        latitude: null,
        longitude: null
      };
    }
  };

  var getLocationFromWorkOrder = function getLocationFromWorkOrder(workOrder) {
    var woGR = new GlideRecord('x_nuvo_eam_work_order');
    woGR.get(workOrder);
    return getLocationFromWorkOrderGR(woGR);
  };

  var getLocationFromAppt = function getLocationFromAppt(apptGR) {
    var latitude = parseLatLong(apptGR.getValue('latitude'));
    var longitude = parseLatLong(apptGR.getValue('longitude'));

    if (!latitude || latitude === '') {
      latitude = null;
    }

    if (!longitude || longitude === '') {
      longitude = null;
    }

    return {
      latitude: latitude,
      longitude: longitude
    };
  };

  var createChildAppts = function createChildAppts(parentID) {
    var apptGR = new GlideRecord(EVENT_TABLE);
    var gotten = apptGR.get(parentID);
    if (!gotten) return;
    var woGR = apptGR.work_order.getRefRecord();
    var assetGR = woGR.asset.getRefRecord();
    var values = {
      participant: assetGR.getValue('sys_id'),
      participant_table: assetGR.getValue('sys_class_name'),
      parent: apptGR.getValue('sys_id'),
      fixed: 'true'
    };
    setApptValues(apptGR, values);
    apptGR.insert();
  };

  var checkForWarnings = function checkForWarnings(location) {
    var invalidLatLong = checkForInvalidLatLong(location);
    if (invalidLatLong.warning) return invalidLatLong;
    return {
      warning: false,
      labels: []
    };
  };

  var eventGRToEvent = function eventGRToEvent(eventGR) {
    var eventBase = x_nuvo_eam.ScheduleUtils.eventGRToEvent(eventGR);

    var dispatchEvent = _objectSpread({}, eventBase, {
      workOrder: '',
      location: {
        latitude: null,
        longitude: null
      },
      state: apptStates.ACCEPTED,
      fixed: true,
      warning: false,
      warningLabels: [],
      primaryLabel: '',
      secondaryLabel: ''
    });

    if (eventGR.getValue('sys_class_name') === EVENT_TABLE) {
      var apptGR = new GlideRecord(EVENT_TABLE);
      apptGR.get(eventGR.getValue('sys_id'));
      var primaryLabel = '';
      var secondaryLabel = '';
      var hasWO = !(apptGR.getValue('work_order') === null);

      if (!hasWO) {
        primaryLabel = apptGR.getValue('title');
        secondaryLabel = apptGR.getElement('state').getDisplayValue();
      }

      var location = getLocationFromAppt(apptGR);

      var _checkForWarnings = checkForWarnings(location),
          warning = _checkForWarnings.warning,
          warningLabels = _checkForWarnings.labels;

      var nuvoProp = new x_nuvo_mobile.NuvoloProperties();

      if (hasWO) {
        var woGR = apptGR.work_order.getRefRecord();
        primaryLabel = woGR.getElement(nuvoProp.getProperty('appointment_primary_display_field', 'Dispatch') || 'short_description').getDisplayValue();
        secondaryLabel = woGR.getElement(nuvoProp.getProperty('appointment_secondary_display_field', 'Dispatch') || 'priority').getDisplayValue();
      }

      dispatchEvent = _objectSpread({}, eventBase, {
        workOrder: apptGR.getValue('work_order'),
        location: location,
        state: apptGR.getValue('state'),
        fixed: apptGR.getValue('fixed') === '1',
        warning: warning,
        warningLabels: warningLabels,
        primaryLabel: primaryLabel,
        secondaryLabel: secondaryLabel
      });

      if (apptGR.getValue('parent') && apptGR.getValue('parent') !== '') {
        dispatchEvent.parent = apptGR.getValue('parent');
      }
    }

    return dispatchEvent;
  };

  var getEvents = function getEvents(opts) {
    var participant = opts.participant,
        rangeStart = opts.rangeStart,
        rangeEnd = opts.rangeEnd;
    var events = [];
    var eventGR = new GlideRecord('x_nuvo_eam_scheduled_event');
    eventGR.addQuery('participant_table', participant.table);
    eventGR.addQuery('participant', participant.sys_id);
    var startDateTime = x_nuvo_eam.DateUtils.UTCToSNDateTime(rangeStart);
    var endDateTime = x_nuvo_eam.DateUtils.UTCToSNDateTime(rangeEnd);
    var timeQuery = "event_start>=".concat(startDateTime, "^event_end<=").concat(endDateTime);
    eventGR.addEncodedQuery(timeQuery);
    eventGR.orderBy('event_start');
    eventGR.query();

    while (eventGR.next()) {
      events.push(eventGRToEvent(eventGR));
    }

    return events;
  };

  var getSchedule = function getSchedule(opts) {
    var events = getEvents(opts);
    var schedule = {
      events: events
    };
    return schedule;
  };

  var updateChildAppts = function updateChildAppts(parentID) {
    var childGR = new GlideRecord(EVENT_TABLE);
    var parentGR = new GlideRecord(EVENT_TABLE);
    parentGR.get(parentID);
    childGR.addQuery('parent', parentID);
    childGR.query();
    var propertiesToCopy = ['event_start', 'event_end', 'state'];

    while (childGR.next()) {
      copyApptValues(propertiesToCopy, parentGR, childGR);
      childGR.update();
    }
  };

  var processChanges = function processChanges(scheduleChanges, participant, errors) {
    var eventIDs = Object.keys(scheduleChanges);
    eventIDs.forEach(function (eventID) {
      var apptGR = new GlideRecord(EVENT_TABLE);
      var event = scheduleChanges[eventID];

      if (!event.sys_id) {
        // created a new event
        apptGR.initialize();
        var values = {
          event_end: x_nuvo_eam.DateUtils.UTCToSNDateTime(event.end),
          event_start: x_nuvo_eam.DateUtils.UTCToSNDateTime(event.start),
          title: event.title,
          participant: participant.sys_id,
          participant_table: participant.table,
          work_order: event.workOrder
        };
        setApptValues(apptGR, values);
        var insertSuccess = apptGR.insert();

        if (!insertSuccess) {
          errors.push("".concat(event.title, " failed to save: ").concat(apptGR.getLastErrorMessage()));
        } else {
          var apptID = insertSuccess;
          createChildAppts(apptID);
        }

        return;
      } // lookup record as it is now


      if (apptGR.get(event.sys_id)) {
        // if person changes
        if (participant.sys_id !== apptGR.getValue('participant')) {
          // TODO: create a new appointment and cancel the other one
          var _values = {
            participant: participant.sys_id,
            participant_table: participant.table,
            state: apptStates.REQUESTED
          };
          setApptValues(apptGR, _values);
        }

        var UTCStart = x_nuvo_eam.DateUtils.SNDateTimeToUTC(apptGR.getValue('event_start'));
        var UTCEnd = x_nuvo_eam.DateUtils.SNDateTimeToUTC(apptGR.getValue('event_end')); // if start or end changes

        if (event.start !== UTCStart || event.end !== UTCEnd) {
          // set back to requested
          var _values2 = {
            event_end: x_nuvo_eam.DateUtils.UTCToSNDateTime(event.end),
            event_start: x_nuvo_eam.DateUtils.UTCToSNDateTime(event.start),
            state: apptStates.REQUESTED
          };
          setApptValues(apptGR, _values2);
        }

        var updateResult = apptGR.update();

        if (!updateResult) {
          errors.push("".concat(event.title, " failed to save: ").concat(apptGR.getLastErrorMessage()));
        } else {// this.updateChildAppts(event.sys_id);
        }
      } else {
        errors.push("Couldn't find a record to update for ".concat(event.title));
      }
    });
  };

  var saveScheduleChanges = function saveScheduleChanges(scheduleChangeMap) {
    var errors = [];

    for (var _table in scheduleChangeMap) {
      if (Object.prototype.hasOwnProperty.call(scheduleChangeMap, _table)) {
        var tableMap = scheduleChangeMap[_table];

        for (var _sysId in tableMap) {
          if (Object.prototype.hasOwnProperty.call(tableMap, _sysId)) {
            var scheduleChanges = tableMap[_sysId];
            var participant = {
              sys_id: _sysId,
              table: _table
            };
            processChanges(scheduleChanges, participant, errors);
          }
        }
      }
    }

    return errors;
  };

  var getSchedules = function getSchedules(opts) {
    var participants = opts.participants,
        rangeStart = opts.rangeStart,
        rangeEnd = opts.rangeEnd;
    var scheduleMap = {};

    for (var i = 0; i < participants.length; i += 1) {
      var participant = participants[i];

      if (!scheduleMap[participant.table]) {
        scheduleMap[participant.table] = {};
      }

      scheduleMap[participant.table][participant.sys_id] = getSchedule({
        participant: participant,
        rangeStart: rangeStart,
        rangeEnd: rangeEnd
      });
    }

    return scheduleMap;
  };

  return {
    getSchedule: getSchedule,
    getLocationFromWorkOrder: getLocationFromWorkOrder,
    getLocationFromWorkOrderGR: getLocationFromWorkOrderGR,
    checkForWarnings: checkForWarnings,
    getSchedules: getSchedules,
    getTravelTime: getTravelTime,
    saveScheduleChanges: saveScheduleChanges
  };
}