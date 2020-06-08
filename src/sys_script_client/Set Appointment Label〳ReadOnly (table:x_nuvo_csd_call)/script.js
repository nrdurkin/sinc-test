function onLoad() {
  // Modify Work Order Fields
  g_form.setLabelOf('work_order.assigned_to', 'Work Order Assigned To');
  g_form.setLabelOf('work_order.state', 'Work Order State');
  g_form.setReadOnly('work_order.assigned_to', true);
  g_form.setReadOnly('work_order.state', true);

  // Modify appointment fields
  g_form.setLabelOf('appointment.participant', 'Routed To');
  g_form.setLabelOf('appointment.state', 'Appointment State');
  g_form.setLabelOf('appointment.event_start', 'Start Time');
  g_form.setLabelOf('appointment.event_end', 'End Time');
  g_form.setReadOnly('appointment.participant', true);
  g_form.setReadOnly('appointment.state', true);
  g_form.setReadOnly('appointment.event_start', true);
  g_form.setReadOnly('appointment.event_end', true);
}
