"use strict";

function onLoad() {
  var dispatchType = g_scratchpad.nuvoProps.dispatchType;
  var dispatchScope = "x_nuvo_csd";
  /**
   * This is a hack to replace the scope of an element.
   * It should not be replicated unless totally necessary
   *
   */

  var replaceScope = function replaceScope(field, scope) {
    var element = g_form.getGlideUIElement(field);
    var oldScope = "".concat(element.getScope());
    element.scope = scope;
    return function() {
      element.scope = oldScope;
    };
  };

  var fieldsToModify = ["type", "name", "manager"];
  var fixes = fieldsToModify.map(function(field) {
    return replaceScope(field, dispatchScope);
  });
  g_form.setValue("type", dispatchType);
  g_form.setMandatory("name", true);
  g_form.setMandatory("manager", true);
  g_form.setReadOnly("type", true);
  fixes.forEach(function(fix) {
    fix();
  });
}
