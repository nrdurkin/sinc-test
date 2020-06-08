"use strict";

function requestNewContact() {
  var h = screen.availHeight / 2 > 600 ? screen.availHeight / 2 : 600;
  var w = screen.availWidth / 2 > 1000 ? screen.availWidth / 2 : 1000;
  var popup_props = ['location=no', 'menubar=no', 'width=' + w, 'height=' + h];
  var new_contact_url = 'x_nuvo_eam_call_contacts.do?sysparm_view=workspace&sysparm_stack=x_nuvo_csd_dispatch_popup_closer.do';
  var new_contact_window = window.open(new_contact_url, 'New Contact', popup_props.join(','));
  new_contact_window.moveTo(w, 0); // TODO: autofill contact on call form after successful contact creation
}