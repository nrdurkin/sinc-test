function _dispatchCall() {
  try {
    window.parent.openDispatch(g_sysId);
  } catch (err) {
    window.open(
      'x_nuvo_csd_dispatch_application.do#/assignment/' + g_sysId,
      '_blank'
    );
  }
}
