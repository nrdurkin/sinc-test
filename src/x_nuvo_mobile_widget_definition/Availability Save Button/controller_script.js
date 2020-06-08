(function() {
  return {
    template: _widgetTemplate,
    controller: function($scope) {
      $scope.saveForm = function() {
        $scope.m_form.save().then(
          function() {
            $scope.goToRecord(Mobius.getProperty('appointmentsViewId'));
          },
          function saveFailed() {
            // Do not redirect
          }
        );
      };
    },
  };
})();
