"use strict";

(function executeRule() {
  var nuvoProps = new x_nuvo_mobile.NuvoloProperties();
  var dispatchType = nuvoProps.getProperty('dispatch_team_type', 'Dispatch');

  if (dispatchType) {
    g_scratchpad.nuvoProps = {
      dispatchType: dispatchType
    };
  }
})();