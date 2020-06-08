(function() {
  return {
    template: _widgetTemplate,
    scope: true,
    link: function() {},
    controller: function($scope, MobiusRecord, ViewProvider, $filter) {
      var getTranslation = $filter('translate');
      var states = {
        REQUESTED: '100',
        ACCEPTED: '200',
        REJECTED: '300',
      };
      var woClassMap = JSON.parse(Mobius.getProperty('eamWorkOrderViewMap'));

      var startDateTime = new Date(
        $scope.current.event_start.value.replace(' ', 'T')
      );
      var endDateTime = new Date(
        $scope.current.event_end.value.replace(' ', 'T')
      );

      $scope.startTime = startDateTime.toLocaleTimeString();
      $scope.endTime = endDateTime.toLocaleTimeString();
      $scope.date = startDateTime.toLocaleDateString();
      $scope.displayValue = $scope.current.work_order.display_value || '';
      $scope.durationMsg = $scope.startTime + ' - ' + $scope.endTime;

      $scope.navigate = function(event) {
        event.stopPropagation();
        var latitude = $scope.current.latitude.value;
        var longitude = $scope.current.longitude.value;

        var useNativeMaps = Mobius.getProperty('csdUseNativeMaps') == 'true';
        // Uses Apple maps if prop returns false
        if (useNativeMaps && device && device.platform == 'iOS') {
          window.open('maps://?q=' + latitude + ',' + longitude, '_system');
          return;
        }
        // Fallback
        window.open(
          'https://maps.google.com/?q=' + latitude + ',' + longitude,
          '_system'
        );
      };

      $scope.isRequested = function() {
        try {
          return $scope.current.state.value === states.REQUESTED;
        } catch (e) {
          return false;
        }
      };

      $scope.isAccepted = function() {
        try {
          return $scope.current.state.value === states.ACCEPTED;
        } catch (e) {
          console.error(e, $scope.current);
          return false;
        }
      };

      $scope.shouldShowNav = function() {
        var latitude = $scope.current.latitude.value;
        var longitude = $scope.current.longitude.value;
        return $scope.isAccepted() && isValidCoordinate(latitude, longitude);
      };

      function isValidCoordinate(latitude, longitude) {
        if (!latitude || !longitude) {
          return false;
        }

        if (latitude === '' || longitude === '') {
          return false;
        }

        if (latitude === '0.0' && longitude === '0.0') {
          return false;
        }

        return true;
      }

      $scope.acceptAppt = function() {
        setState(states.ACCEPTED);
      };

      $scope.openWorkOrder = function() {
        var workOrderSysId = $scope.current.work_order.value;
        if (!workOrderSysId) {
          var availabilityViewID = Mobius.getProperty('availabilityViewID');
          $scope.goToRecord(availabilityViewID, $scope.current.sys_id.value);
          return;
        }
        getWorkOrder(workOrderSysId).then(
          function success(woRecord) {
            var woClass = woRecord.getValue('sys_class_name');
            var workOrderViewObj = woClassMap[woClass];
            workOrderViewObj.params = 'sys_id=' + workOrderSysId;
            ViewProvider.openView(workOrderViewObj);
          },
          function failure(err) {
            console.error(err);
          }
        );
      };

      function getWorkOrder(sys_id) {
        return new Promise(function(resolve, reject) {
          var woMR = new MobiusRecord('x_nuvo_eam_work_order');
          woMR.get(sys_id).then(
            function success(record) {
              resolve(record);
            },
            function failure(err) {
              reject(err);
            }
          );
        });
      }

      $scope.rejectAppt = function() {
        try {
          var rejectMsg = getTranslation('CSD_M_REJECT_CONFIRM');
          var shouldDelete = confirm(rejectMsg);
          if (shouldDelete) {
            setState(states.REJECTED);
          }
        } catch (e) {}
      };

      function setState(state) {
        try {
          var apptMR = new MobiusRecord('x_nuvo_csd_appointment');
          apptMR.get($scope.current.sys_id.value).then(
            function success(record) {
              record.setValue('state', state);
              record.update().then(
                function success() {
                  $scope.m_form.scratchpad.refreshList();
                },
                function failure(err) {
                  console.error(err);
                }
              );
            },
            function failure(err) {
              alert('error!');
            }
          );
        } catch (e) {}
      }
    },
  };
})();
