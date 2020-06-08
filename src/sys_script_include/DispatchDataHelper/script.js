"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DispatchDataHelper =
/*#__PURE__*/
function () {
  function DispatchDataHelper() {
    _classCallCheck(this, DispatchDataHelper);

    _defineProperty(this, "APPOINTMENT_TABLE", 'x_nuvo_csd_appointment');

    _defineProperty(this, "USER_TABLE", 'sys_user');

    _defineProperty(this, "DISPATCH_CTX", 'Dispatch');

    _defineProperty(this, "dateUtils", new x_nuvo_eam.DateUtils());

    _defineProperty(this, "dayjs", x_nuvo_eam.dayjs);
  }

  _createClass(DispatchDataHelper, [{
    key: "getData",
    value: function getData(workOrderGR, opts) {
      var workOrderID = workOrderGR.getValue('sys_id');
      var apptGR = this.retrieveAppointment(workOrderID);
      var proposedAppt;
      var dateRange = this.determineDateRange(apptGR, opts);

      var getScheduleOpts = _objectSpread({
        participants: opts.participants
      }, dateRange);

      var appointments = DispatchScheduleUtils().getSchedules(getScheduleOpts);

      if (apptGR) {
        proposedAppt = DispatchDataHelper.genApptFromGR(apptGR, appointments);
        appointments = this.removeAppt(apptGR.getValue('sys_id'), apptGR.getValue('participant'), appointments);
      } else {
        proposedAppt = this.genApptFromScratch(workOrderGR, appointments);
      }

      return {
        proposed_appt: proposedAppt,
        appointments: appointments,
        dateRange: dateRange
      };
    }
  }, {
    key: "determineDateRange",
    value: function determineDateRange(retrieved, opts) {
      if (opts.range_start && opts.range_end) {
        return {
          rangeStart: opts.range_start,
          rangeEnd: opts.range_end
        };
      }

      if (retrieved) {
        var _centerDate = x_nuvo_eam.DateUtils.SNDateTimeToUTC(retrieved.getValue('event_start'));

        return this.generateRangeAroundDate(_centerDate);
      }

      var centerServiceNow = new GlideDateTime().getDisplayValue();
      var centerDate = x_nuvo_eam.DateUtils.SNDateTimeToUTC(centerServiceNow);
      return this.generateRangeAroundDate(centerDate);
    }
  }, {
    key: "generateRangeAroundDate",
    value: function generateRangeAroundDate(centerDateTime) {
      var dateDevation = 3;
      var sanitizedCenter = x_nuvo_eam.DateUtils.sanitizeUTCForDayJS(centerDateTime);
      var centerDJ = this.dayjs.utc(sanitizedCenter);
      var rangeStart = this.dayjs(centerDJ).startOf('day').subtract(dateDevation, 'day').format();
      var rangeEnd = this.dayjs(centerDJ).startOf('day').add(dateDevation, 'day').format();
      return {
        rangeStart: rangeStart,
        rangeEnd: rangeEnd,
        center: centerDateTime
      };
    }
  }, {
    key: "getUnroutedTechs",
    value: function getUnroutedTechs(queryParams) {
      if (!queryParams) {
        return {
          techs: [],
          participants: []
        };
      }

      var techs = [];
      var participants = [];
      var _queryParams$sysparm_ = queryParams.sysparm_query,
          sysparm_query = _queryParams$sysparm_ === void 0 ? '' : _queryParams$sysparm_;
      var table = this.USER_TABLE;
      var recordGR = new GlideRecordSecure(table);
      recordGR.addEncodedQuery(sysparm_query);
      recordGR.query();

      while (recordGR.next()) {
        var sysId = recordGR.getValue('sys_id');
        var obj = DispatchDataHelper.parseTech(recordGR);
        techs.push(obj);
        participants.push({
          sys_id: sysId,
          table: table
        });
      }

      return {
        techs: techs,
        participants: participants
      };
    }
  }, {
    key: "removeAppt",
    value: function removeAppt(apptID, userID, scheduleMap) {
      var newScheduleMap = DispatchDataHelper.removeFromApptMap('sys_user', userID, apptID, scheduleMap); // check for child appointments

      var apptGR = new GlideRecord(this.APPOINTMENT_TABLE);
      apptGR.addQuery('parent', apptID);
      apptGR.query();

      while (apptGR.next()) {
        var table = apptGR.getValue('participant_table');
        var sysId = apptGR.getValue('participant');
        newScheduleMap = DispatchDataHelper.removeFromApptMap(table, sysId, apptGR.getValue('sys_id'), newScheduleMap);
      }

      return newScheduleMap;
    }
  }, {
    key: "retrieveAppointment",
    value: function retrieveAppointment(workOrderID) {
      var apptGR = new GlideRecord(this.APPOINTMENT_TABLE);
      apptGR.addQuery('work_order', workOrderID);
      apptGR.addQuery('participant_table', 'sys_user');
      apptGR.query();

      if (apptGR.next()) {
        return apptGR;
      }

      return false;
    }
  }, {
    key: "genApptFromScratch",
    value: function genApptFromScratch(workOrderGR, scheduleMap) {
      var MINUTES_TO_MS = 60 * 1000;
      var startGDT = workOrderGR.planned_start ? new GlideDateTime(workOrderGR.getValue('planned_start')) : new GlideDateTime();
      var startSNTimestamp = startGDT.getValue();
      var startDJS = this.dayjs.utc(startSNTimestamp);
      var startMS = startDJS.valueOf();
      var nuvoProps = new x_nuvo_mobile.NuvoloProperties();
      var interval = parseInt(nuvoProps.getProperty('proposal_resolution', 'Dispatch') || '1', 10) * MINUTES_TO_MS;
      var roundedMS = DispatchDataHelper.roundToNearest(interval, startMS);
      var adjustedStartDJS = this.dayjs(roundedMS);
      var durationMS = this.genAppointmentDuration(workOrderGR);
      var endDJS = adjustedStartDJS.clone().add(durationMS, 'millisecond');
      var workOrderID = workOrderGR.getValue('sys_id');
      var startSNDT = x_nuvo_eam.DateUtils.UTCToSNDateTime(adjustedStartDJS.utc().format());
      var startDateGDT = new GlideDateTime(startSNDT);
      var start_date = startDateGDT.getDisplayValue();
      var endSNDT = x_nuvo_eam.DateUtils.UTCToSNDateTime(endDJS.utc().format());
      var endDateGDT = new GlideDateTime(endSNDT);
      var end_date = endDateGDT.getDisplayValue();
      var location = DispatchScheduleUtils().getLocationFromWorkOrder(workOrderID);

      var _DispatchScheduleUtil = DispatchScheduleUtils().checkForWarnings(location),
          warning = _DispatchScheduleUtil.warning,
          warningLabels = _DispatchScheduleUtil.labels;

      var nuvoProp = new x_nuvo_mobile.NuvoloProperties();
      var primaryLabel = workOrderGR.getElement(nuvoProp.getProperty('appointment_primary_display_field', 'Dispatch') || 'short_description').getDisplayValue();
      var secondaryLabel = workOrderGR.getElement(nuvoProp.getProperty('appointment_secondary_display_field', 'Dispatch') || 'priority').getDisplayValue();
      return {
        start_date: start_date,
        end_date: end_date,
        section_id: DispatchDataHelper.genSectionID(scheduleMap),
        location: location,
        workOrder: workOrderID,
        warning: warning,
        warningLabels: warningLabels,
        primaryLabel: primaryLabel,
        secondaryLabel: secondaryLabel
      };
    }
  }, {
    key: "genAppointmentDuration",
    value: function genAppointmentDuration(workOrderGR) {
      var DURATION_PROP = 'default_appointment_duration';
      var workOrderDuration = workOrderGR.estimated_effort.dateNumericValue();
      var nuvoProps = new x_nuvo_mobile.NuvoloProperties();
      var propsDuration = parseInt(nuvoProps.getProperty(DURATION_PROP, this.DISPATCH_CTX) || '1', 10) * 1000;
      return workOrderDuration || propsDuration || 3600;
    }
  }], [{
    key: "removeFromApptMap",
    value: function removeFromApptMap(table, sysId, apptID, map) {
      var newScheduleMap = _objectSpread({}, map);

      if (!(table in map)) return map;
      if (!(sysId in map[table])) return map;
      var participantSchedule = newScheduleMap[table][sysId];
      var eventList = participantSchedule.events || [];
      participantSchedule.events = eventList.filter(function (curEvent) {
        return curEvent.sys_id !== apptID;
      });
      return newScheduleMap;
    }
  }, {
    key: "genApptFromGR",
    value: function genApptFromGR(apptGR, scheduleMap) {
      var woGR = apptGR.work_order.getRefRecord();
      var workOrderID = apptGR.getValue('work_order');
      var location = DispatchScheduleUtils().getLocationFromWorkOrder(workOrderID);

      var _DispatchScheduleUtil2 = DispatchScheduleUtils().checkForWarnings(location),
          warning = _DispatchScheduleUtil2.warning,
          warningLabels = _DispatchScheduleUtil2.labels;

      var nuvoProp = new x_nuvo_mobile.NuvoloProperties();
      var primaryLabel = woGR.getElement(nuvoProp.getProperty('appointment_primary_display_field', 'Dispatch') || 'short_description').getDisplayValue();
      var secondaryLabel = woGR.getElement(nuvoProp.getProperty('appointment_secondary_display_field', 'Dispatch') || 'priority').getDisplayValue();
      return {
        start_date: DispatchDataHelper.fieldToDateTimeString('event_start', apptGR),
        end_date: DispatchDataHelper.fieldToDateTimeString('event_end', apptGR),
        section_id: apptGR.getValue('participant') || DispatchDataHelper.genSectionID(scheduleMap),
        location: location,
        workOrder: workOrderID,
        sys_id: apptGR.getValue('sys_id'),
        warning: warning,
        warningLabels: warningLabels,
        primaryLabel: primaryLabel,
        secondaryLabel: secondaryLabel
      };
    }
  }, {
    key: "fieldToDateTimeString",
    value: function fieldToDateTimeString(field, gr) {
      var GDT = new GlideDateTime(gr.getValue(field));
      return GDT.getDisplayValue();
    }
  }, {
    key: "roundToNearest",
    value: function roundToNearest(interval, num) {
      return Math.round(num / interval) * interval;
    }
  }, {
    key: "genSectionID",
    value: function genSectionID(scheduleMap) {
      var sectionID = '1';

      if ('sys_user' in scheduleMap && Object.keys(scheduleMap.sys_user).length > 0) {
        return Object.keys(scheduleMap.sys_user)[0];
      }

      return sectionID;
    }
  }, {
    key: "parseTech",
    value: function parseTech(userGR) {
      var fields = ['sys_id', 'name'];
      var tech = {};
      var parsed = fields.reduce(function (techObj, field) {
        var newTech = _objectSpread({}, techObj);

        newTech[field] = userGR.getValue(field);
        return newTech;
      }, tech);
      var _parsed$name = parsed.name,
          name = _parsed$name === void 0 ? '' : _parsed$name,
          _parsed$sys_id = parsed.sys_id,
          sys_id = _parsed$sys_id === void 0 ? '' : _parsed$sys_id;
      return {
        name: name,
        sys_id: sys_id,
        user: sys_id
      };
    }
  }]);

  return DispatchDataHelper;
}();