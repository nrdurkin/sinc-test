function onClick(g_form) {
  if (g_form.getValue('asset') == '' || g_form.getValue('asset') == null) {
    g_form.showFieldMsg(
      'asset',
      'An asset is required to create a work order.',
      'error'
    );
    return false; //Abort submission
  }
}
