(function executeRule(current, previous /*null when async*/) {
  var action = new CallStateActionMap(current.getUniqueValue());
  action.setAction();
})(current, previous);
