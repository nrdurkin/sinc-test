"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CallStateActionMap =
/*#__PURE__*/
function () {
  function CallStateActionMap(call_id) {
    _classCallCheck(this, CallStateActionMap);

    _defineProperty(this, "call_id", void 0);

    _defineProperty(this, "actions_map", void 0);

    this.call_id = call_id; //maps the state to the correct ui action sys_id

    this.actions_map = {
      1: '8125bcf0db00c01036e88c6a6896199f',
      '-5': '8125bcf0db00c01036e88c6a6896199f',
      2: '8125bcf0db00c01036e88c6a6896199f',
      5: '8a276f2e1ba94890bf9a542d1e4bcba4',
      30: '',
      3: '2dd5d3eb1b65401030761f4ead4bcb91'
    };
  }

  _createClass(CallStateActionMap, [{
    key: "setAction",
    value: function setAction() {
      var call_gr = new GlideRecord('x_nuvo_csd_call');
      call_gr.addQuery('sys_id', this.call_id);
      call_gr.query();
      var valid_call = call_gr.next();

      if (!valid_call) {
        return;
      }

      var current_state = call_gr.getValue('state');

      if (!current_state) {
        call_gr.setValue('actions', '');
        return;
      }

      var asset = call_gr.getValue('asset');

      if (asset === null) {
        call_gr.setValue('actions', '');
        return;
      }

      call_gr.setValue('actions', this.actions_map[current_state]);
      call_gr.update();
    }
  }, {
    key: "showCreateWorkOrder",
    value: function showCreateWorkOrder() {
      var call_gr = new GlideRecord('x_nuvo_csd_call');
      var valid_call = call_gr.get(this.call_id);

      if (!valid_call) {
        return false;
      }

      var current_state = call_gr.getValue('state');
      var has_no_asset = call_gr.getValue('asset') === null;

      if (!current_state || has_no_asset) {
        return false;
      }

      var valid_state = current_state == '1' || current_state == '-5' || current_state == '2';

      if (valid_state) {
        return true;
      }

      return false;
    }
  }, {
    key: "showDispatch",
    value: function showDispatch() {
      var call_gr = new GlideRecord('x_nuvo_csd_call');
      var valid_call = call_gr.get(this.call_id);

      if (!valid_call) {
        return false;
      }

      var current_state = call_gr.getValue('state');
      var action_id = '8a276f2e1ba94890bf9a542d1e4bcba4';

      if (!current_state || call_gr.getValue('work_order') == null) {
        return false;
      }

      if (this.actions_map[current_state] === action_id) {
        return true;
      }

      return false;
    }
  }, {
    key: "showReopen",
    value: function showReopen() {
      var call_gr = new GlideRecord('x_nuvo_csd_call');
      var valid_call = call_gr.get(this.call_id);

      if (!valid_call) {
        return false;
      }

      var current_state = call_gr.getValue('state');
      var action_id = '2dd5d3eb1b65401030761f4ead4bcb91';

      if (!current_state || call_gr.getValue('work_order') == null) {
        return false;
      }

      if (this.actions_map[current_state] === action_id) {
        return true;
      }

      return false;
    }
  }]);

  return CallStateActionMap;
}();