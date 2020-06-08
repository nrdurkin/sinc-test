(function() {
  return {
    template: _widgetTemplate,
    restrict: 'E',
    controller: function(
      $scope,
      MobiusRecord,
      ConnectionStatusProvider,
      $filter
    ) {
      var getTranslation = $filter('translate');
      var pendingMsg = getTranslation('CSD_M_SHOW_PENDING');
      var showAllMsg = getTranslation('CSD_M_SHOW_ALL');
      var states = {
        REQUESTED: '100',
        ACCEPTED: '200',
        REJECTED: '300',
        COMPLETED: '400',
      };
      $scope.buttonMessage = pendingMsg;
      $scope.mode = 'show_all';
      $scope.pendingCount = 0;
      $scope.showBadge = false;
      getPendingCount();

      function getPendingCount() {
        var apptMR = new MobiusRecord('x_nuvo_csd_appointment');
        apptMR.addQuery('state', states.REQUESTED);
        apptMR.query().then(function success(record) {
          $scope.pendingCount = record.getRowCount();
          $scope.showBadge = true;
        });
      }
      $scope.isOnline = ConnectionStatusProvider.isOnlineNow();
      $scope.m_form.scratchpad.refreshPendingCount = getPendingCount;
      $scope.m_form.scratchpad.refreshList = refreshList;
      $scope.shouldShowBadge = function() {
        return $scope.showBadge && $scope.pendingCount > 0;
      };

      function setListQuery() {
        var apptMR = new MobiusRecord('x_nuvo_csd_appointment');
        if ($scope.mode === 'show_pending') {
          apptMR.addQuery('state', states.REQUESTED);
        }
        // NME: Removing date filtering for Hungary release.
        // TOOD: Revisit date based filtering logic (possibly through schema filter instead)
        //apptMR.addEncodedQuery('event_start AFTER $DATE.YESTERDAY$');
        apptMR.addEncodedQuery('state!=' + states.REJECTED);
        apptMR.addEncodedQuery('state!=' + states.COMPLETED);
        apptMR.orderBy('event_start');
        apptMR.query().then(function(record) {
          $scope.m_form.scratchpad.__related_list__x_nuvo_csd_appointment.dataUpdated(
            apptMR
          );
          getPendingCount();
        });
      }

      function refreshList() {
        setListQuery();
      }

      $scope.setFilter = function() {
        toggleMode();
        setListQuery();
      };

      function toggleMode() {
        if ($scope.mode === 'show_all') {
          $scope.mode = 'show_pending';
          $scope.buttonMessage = showAllMsg;
          $scope.showBadge = false;
        } else {
          $scope.mode = 'show_all';
          $scope.buttonMessage = pendingMsg;
          $scope.showBadge = true;
        }
      }
    },
  }; // Component code goes here
})();
