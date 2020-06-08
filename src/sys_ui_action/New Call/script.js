function requestNewCall() {
  var ch;

  function getFilterString(filter) {
    filter = filter
      .replace(/\^EQ/g, '')
      .replace(/\^ORDERBY(?:DESC)?[^^]*/g, '')
      .replace(/^GOTO/, '');
    return btoa(filter).replace(/=/g, '-');
  }
  function refreshList(msg) {
    if (msg.data.action != 'entry') return;
    if (ch && ch.unsubscribe) ch.unsubscribe();

    GlideList2.get('x_nuvo_csd_call').refresh();
  }

  var h = screen.availHeight / 2 > 600 ? screen.availHeight / 2 : 600;
  var w = screen.availWidth / 2 > 1000 ? screen.availWidth / 2 : 1000;
  var popup_props = ['location=no', 'menubar=no', 'width=' + w, 'height=' + h];
  var new_call_url =
    'x_nuvo_csd_call.do?sysparm_view=workspace&sysparm_stack=x_nuvo_csd_dispatch_popup_closer.do';
  var new_call_window = window.open(
    new_call_url,
    'New Call',
    popup_props.join(',')
  );
  new_call_window.moveTo(w, 0);

  new_call_window.onload = function() {
    ch = amb
      .getClient()
      .getChannel(
        '/rw/default/x_nuvo_csd_call/' + getFilterString('active=true')
      );
    ch.subscribe(refreshList);
  };
}
