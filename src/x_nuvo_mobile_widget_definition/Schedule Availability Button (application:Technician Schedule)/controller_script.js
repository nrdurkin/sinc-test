(function() {
  return {
    restrict: 'E',
    template: _widgetTemplate,
    controller: function($scope, ConnectionStatusProvider) {
      var availabilityViewID = Mobius.getProperty('availabilityViewID');
      $scope.isOnline = ConnectionStatusProvider.isOnlineNow();
      $scope.openForm = function() {
        $scope.goToRecord(availabilityViewID, '-1');
      };
    },
  };
})();
