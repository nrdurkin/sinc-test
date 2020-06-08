(function executeRule(current, previous /*null when async*/) {
  gs.eventQueue(
    'x_nuvo_mobile.add_to_delete_queue',
    null,
    current.getTableName(),
    current.getUniqueValue()
  );
})(current, previous);
