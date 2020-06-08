"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var CallFlowHandler =
/*#__PURE__*/
function () {
  function CallFlowHandler() {
    _classCallCheck(this, CallFlowHandler);
  }

  _createClass(CallFlowHandler, null, [{
    key: "onWorkOrderClose",
    value: function onWorkOrderClose(workOrderId) {
      var woGR = new GlideRecord('x_nuvo_eam_work_order');
      woGR.get(workOrderId);

      if (woGR.getValue('x_nuvo_csd_call') === null) {
        return;
      }

      var callGR = woGR.x_nuvo_csd_call.getRefRecord();
      callGR.setValue('state', '30');
      callGR.update();

      if (callGR.getValue('appointment') === null) {
        return;
      }

      var apptGR = callGR.appointment.getRefRecord();
      apptGR.setValue('state', '400');
      apptGR.update();
    }
  }]);

  return CallFlowHandler;
}();