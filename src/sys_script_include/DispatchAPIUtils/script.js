"use strict";

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key)
        );
      });
    }
  }
  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var DispatchAPIUtils =
  /*#__PURE__*/
  (function() {
    function DispatchAPIUtils() {
      _classCallCheck(this, DispatchAPIUtils);
    }

    _createClass(DispatchAPIUtils, null, [
      {
        key: "getSchedulerData",
        value: function getSchedulerData(request, response) {
          /*
           * Initial Variable declaration
           */
          var pathParams = request.pathParams;
          var queryParams = request.queryParams;
          var mandatoryOnly = Object.prototype.hasOwnProperty.call(
            queryParams,
            "mandatory"
          )
            ? queryParams.mandatory[0] === "true"
            : false;
          var callGR = new GlideRecord("x_nuvo_csd_call");

          var isValidCall = function isValidCall() {
            var validCall = callGR.get(pathParams.task_id);

            if (!validCall) {
              response.setError(
                new sn_ws_err.BadRequestError(
                  "Target record must be a valid Call record (x_nuvo_csd_call)"
                )
              );
              return false;
            }

            var callEscalated = callGR.getValue("work_order") != null;

            if (!callEscalated) {
              response.setError(
                new sn_ws_err.NotAcceptableError(
                  "No Work Order (x_nuvo_eam_work_order) associated with selected Call record (x_nuvo_csd_call)"
                )
              );
              return false;
            }

            return true;
          };

          var validCall = isValidCall();
          if (!validCall) return null;
          var woGr = callGR.work_order.getRefRecord();
          var workOrderCheck = DispatchAPIUtils.checkWorkOrder(woGr); // Get list of routed technicians

          var techs = DispatchAPIUtils.getRoutedTechs(woGr, mandatoryOnly); // Get the asset related to the call

          var assets = DispatchAPIUtils.getRelatedAssets(woGr); // Get required data from the proposed appointment

          var participants = DispatchAPIUtils.combineTechsAndAssets(
            techs,
            assets
          );

          var _getData = new DispatchDataHelper().getData(
              woGr,
              _objectSpread({}, request.body.data, {
                participants: participants
              })
            ),
            proposed_appt = _getData.proposed_appt,
            appointments = _getData.appointments,
            dateRange = _getData.dateRange; // Get required data from the work order

          var details = DispatchAPIUtils.getWorkOrderData(woGr); // Package remaining response object

          var task = {
            proposed_appt: proposed_appt,
            details: details
          };
          var routed = !mandatoryOnly;
          var body = {
            task: task,
            techs: techs,
            appointments: appointments,
            assets: assets,
            routed: routed,
            workOrderCheck: workOrderCheck,
            dateRange: dateRange
          };
          return body;
        }
      },
      {
        key: "checkWorkOrder",
        value: function checkWorkOrder(woGr) {
          var workOrderCheck = {
            warnings: [],
            errors: []
          };

          var addToastMessage = function addToastMessage(type, message) {
            var options =
              arguments.length > 2 && arguments[2] !== undefined
                ? arguments[2]
                : {};
            workOrderCheck[type].push(
              _objectSpread({}, options, {
                message: message
              })
            );
          };

          var addErrorMsg = function addErrorMsg(msg, options) {
            addToastMessage("errors", msg, options);
          };

          var addWarningMsg = function addWarningMsg(msg, options) {
            addToastMessage("warnings", msg, options);
          };

          dispatchCheckWorkOrder(woGr, addErrorMsg, addWarningMsg);
          return workOrderCheck;
        }
      },
      {
        key: "combineTechsAndAssets",
        value: function combineTechsAndAssets(techsToFormat, assetsToFormat) {
          var formatTechs = techsToFormat.map(function(cur) {
            return {
              table: "sys_user",
              sys_id: cur.user
            };
          });
          var formatAssets = assetsToFormat.map(function(cur) {
            return {
              table: cur.data_type,
              sys_id: cur.user
            };
          });
          return formatTechs.concat(formatAssets);
        }
      },
      {
        key: "getRoutedTechs",
        value: function getRoutedTechs(woGR, mandatoryOnly) {
          /*
           * Runs mandatory and if applicable excludes rules from the Task Routing Rules.
           * Runs includes rules afterwards and scores technicians
           */
          var routingUtils = new TaskRoutingRuleUtils();
          var scoredUsers = routingUtils.getRoutedTechs(
            woGR.getUniqueValue(),
            mandatoryOnly
          );
          var maxUsers =
            parseInt(
              new x_nuvo_mobile.NuvoloProperties().getProperty(
                "technician_page_size",
                "Dispatch"
              ) || "0",
              10
            ) || 10;
          scoredUsers = scoredUsers.slice(0, maxUsers);
          return scoredUsers;
        }
      },
      {
        key: "getRelatedAssets",
        value: function getRelatedAssets(woGR) {
          var assets = [];
          var validAsset = woGR.getValue("asset") != null;

          if (validAsset) {
            var asset = woGR.asset.getRefRecord();
            var name = asset.getValue("name");
            var description = ""
              .concat(asset.asset_manufacturer.getDisplayValue(), " - ")
              .concat(asset.model_name.getDisplayValue());
            var user = asset.getUniqueValue();
            var data_type = asset.getTableName();
            assets.push({
              user: user,
              description: description,
              name: name,
              data_type: data_type
            });
          }

          return assets;
        }
      },
      {
        key: "getWorkOrderData",
        value: function getWorkOrderData(woGR) {
          var woLocation = DispatchScheduleUtils.getLocationFromWorkOrderGR(
            woGR
          );
          var details = {
            number: woGR.getValue("number"),
            location: woLocation,
            short_description: woGR.getValue("short_description"),
            sys_id: woGR.getValue("sys_id")
          };
          return details;
        }
      }
    ]);

    return DispatchAPIUtils;
  })();
