"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TaskRoutingRuleUtils =
/*#__PURE__*/
function () {
  function TaskRoutingRuleUtils() {
    _classCallCheck(this, TaskRoutingRuleUtils);

    _defineProperty(this, "dataLookupId", '');

    var lookupGr = new GlideRecord('x_nuvo_mobile_data_lookup_type');
    lookupGr.addQuery('key', 'csd_data_lookup_type');
    lookupGr.query();

    if (lookupGr.next()) {
      this.dataLookupId = lookupGr.getUniqueValue();
    }
  }

  _createClass(TaskRoutingRuleUtils, [{
    key: "getRoutedTechs",
    value: function getRoutedTechs(taskId) {
      var mandatory = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var qualifiedTechs = this.getQualifiedTechs(taskId, mandatory);
      var scoredTechs = this.scoreTechs(taskId, qualifiedTechs);
      return scoredTechs;
    }
  }, {
    key: "getQualifiedTechs",
    value: function getQualifiedTechs(taskId, mandatory) {
      var eligibleUsers = [];
      var taskGr = new GlideRecord('task');

      if (!taskGr.get(taskId)) {
        return [];
      }

      var ruleTypes = mandatory ? ['mandatory'] : ['mandatory', 'excludes'];
      var ruleGr = this.getRoutingRules(taskGr, ruleTypes);

      while (ruleGr.next()) {
        var subtaskGr = new GlideRecord(ruleGr.getValue('table'));
        subtaskGr.get(taskId);
        var matches = GlideFilter.checkRecord(subtaskGr, ruleGr.getValue('condition') || '');

        if (matches) {
          if (ruleGr.getValue('advanced') === '1') {
            var targetUsers = TaskRoutingRuleUtils.getUsersAdvanced(taskId, ruleGr);
            eligibleUsers.push(targetUsers);
          } else {
            var _targetUsers = TaskRoutingRuleUtils.getUsers(ruleGr);

            eligibleUsers.push(_targetUsers);
          }
        }
      }

      return TaskRoutingRuleUtils.filterQualifiedTechs(eligibleUsers);
    }
  }, {
    key: "scoreTechs",
    value: function scoreTechs(taskId, users) {
      var userWeightMap = {};
      users.forEach(function (user) {
        userWeightMap[user] = 0;
      });
      var taskGr = new GlideRecord('task');

      if (!taskGr.get(taskId)) {
        return [];
      }

      var ruleGr = this.getRoutingRules(taskGr, ['includes']);

      while (ruleGr.next()) {
        var subtaskGr = new GlideRecord(ruleGr.getValue('table'));
        subtaskGr.get(taskId);
        var matches = GlideFilter.checkRecord(subtaskGr, ruleGr.getValue('condition') || '');

        if (matches) {
          if (ruleGr.getValue('advanced') === '1') {
            userWeightMap = TaskRoutingRuleUtils.aggregateScoresAdvanced(taskId, users, ruleGr, userWeightMap);
          } else {
            userWeightMap = TaskRoutingRuleUtils.aggregateScores(ruleGr, userWeightMap);
          }
        }
      }

      return TaskRoutingRuleUtils.generateScoredUserList(users, userWeightMap);
    } // Takes the list of techs that meet each routing rule criteria.
    // Filters that list down to only techs that meet all rule criteria.

  }, {
    key: "getRoutingRules",
    value: function getRoutingRules(taskGr, ruleTypes) {
      var gth = new GlideTableHierarchy(taskGr.getValue('sys_class_name'));
      var ruleGr = new GlideRecord('x_nuvo_csd_task_routing_rule');
      ruleGr.addQuery('table', taskGr.getValue('sys_class_name')).addOrCondition('inherit', true).addCondition('table', 'IN', gth.getHierarchy());
      ruleGr.addQuery('rule_type', 'IN', ruleTypes.join(','));
      ruleGr.addQuery('active', true);
      ruleGr.addQuery('type', this.dataLookupId);
      ruleGr.query();
      return ruleGr;
    }
  }], [{
    key: "filterQualifiedTechs",
    value: function filterQualifiedTechs(eligibleUsers) {
      var qualifiedUsers = eligibleUsers.sort(function (a, b) {
        return a.length - b.length;
      }).reduce(function (total, val) {
        // for each user in total, check if object is missing from val. If so, remove from total.
        var filtered = total.filter(function (fVal) {
          return val.indexOf(fVal) > -1;
        });
        return filtered;
      }, eligibleUsers.length > 0 ? eligibleUsers[0] : []);
      return qualifiedUsers;
    } // Takes a base set of users and coalesces with a user weight map
    // Then formats into object digestable by frontend
    // Returns list of objects with user score data sorted by highest score

  }, {
    key: "generateScoredUserList",
    value: function generateScoredUserList(users, userWeightMap) {
      var _this = this;

      return users.filter(function (user) {
        var userGr = new GlideRecord('sys_user');

        if (!userGr.get(user)) {
          return false;
        }

        return true;
      }).map(function (user) {
        var userGr = new GlideRecord('sys_user');
        userGr.get(user);
        var name = userGr.getValue('name');
        var weight = userWeightMap[user];

        var homeBase = _this.getHomeBaseLocationFromUser(userGr);

        return {
          user: user,
          weight: weight,
          name: name,
          homeBase: homeBase,
          data_type: 'sys_user'
        };
      }).sort(function (first, second) {
        return second.weight - first.weight;
      });
    }
  }, {
    key: "getHomeBaseLocationFromUser",
    value: function getHomeBaseLocationFromUser(userGR) {
      try {
        var buildingGR = userGR.x_nuvo_eam_primary_location.getRefRecord().site.getRefRecord();
        return {
          latitude: buildingGR.getValue('latitude'),
          longitude: buildingGR.getValue('longitude')
        };
      } catch (e) {
        return {
          latitude: null,
          longitude: null
        };
      }
    }
  }, {
    key: "getUsersAdvanced",
    value: function getUsersAdvanced(taskId, ruleGr) {
      var targetUsers = [];
      var evaluator = new GlideScopedEvaluator();
      evaluator.putVariable('task_id', taskId);
      evaluator.putVariable('user_list', []);
      targetUsers = evaluator.evaluateScript(ruleGr, 'script', {});
      return targetUsers;
    }
  }, {
    key: "getUsers",
    value: function getUsers(ruleGr) {
      var addedUsers = {};
      var targetUsers = [];
      var targetGr = new GlideRecord(ruleGr.getValue('target_table'));
      targetGr.addEncodedQuery(ruleGr.getValue('target_condition'));
      targetGr.query();

      while (targetGr.next()) {
        var currentUser = targetGr.getValue(ruleGr.getValue('target_user_field'));

        if (!addedUsers[currentUser]) {
          targetUsers.push(currentUser);
          addedUsers[currentUser] = true;
        }
      }

      return targetUsers;
    }
  }, {
    key: "aggregateScoresAdvanced",
    value: function aggregateScoresAdvanced(taskId, users, ruleGr, userWeightMap) {
      var localUserWeightMap = _objectSpread({}, userWeightMap);

      var evaluator = new GlideScopedEvaluator();
      evaluator.putVariable('task_id', taskId);
      evaluator.putVariable('user_list', users);
      var scriptWeights = evaluator.evaluateScript(ruleGr, 'script', {});

      for (var user in scriptWeights) {
        if (localUserWeightMap[user] != null) {
          localUserWeightMap[user] += scriptWeights[user];
        }
      }

      return localUserWeightMap;
    }
  }, {
    key: "aggregateScores",
    value: function aggregateScores(ruleGr, userWeightMap) {
      var localUserWeightMap = _objectSpread({}, userWeightMap);

      var targetUserField = ruleGr.getValue('target_user_field');
      var targetGr = new GlideRecord(ruleGr.getValue('target_table'));
      targetGr.addEncodedQuery(ruleGr.getValue('target_condition') || '');
      targetGr.query();

      while (targetGr.next()) {
        if (localUserWeightMap[targetGr.getValue(targetUserField)] != null) {
          localUserWeightMap[targetGr.getValue(targetUserField)] += parseInt(ruleGr.getValue('weight'), 10);
        }
      }

      return localUserWeightMap;
    }
  }]);

  return TaskRoutingRuleUtils;
}();