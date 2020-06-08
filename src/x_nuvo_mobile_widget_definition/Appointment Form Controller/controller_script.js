(function() {
  $scope.m_form.setValue('participant_table', 'sys_user');
  $scope.m_form.setValue('participant', $m.getUser().details.id);
  $scope.m_form.setValue('state', '200');
  $scope.m_form.setValue('fixed', true);
  $scope.m_form.setMandatory('event_start', true);
  $scope.m_form.setMandatory('event_end', true);
})();
