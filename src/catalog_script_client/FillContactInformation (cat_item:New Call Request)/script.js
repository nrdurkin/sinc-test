function onLoad() {
  var ga = new GlideAjax('GetContactInformation');
  ga.addParam('sysparm_name', 'getContact');
  ga.getXML(FillContactData);
}

function FillContactData(response) {
  var result = response.responseXML.getElementsByTagName('result');
  var contact = JSON.parse(result[0].getAttribute('contact'));
  g_form.setValue('first_name', contact.first_name || '');
  g_form.setValue('last_name', contact.last_name || '');
  g_form.setValue('email', contact.email || '');
  g_form.setValue('phone', contact.phone_number || '');
  g_form.setValue('company', contact.company || '');

  if (contact.isContactFound) {
    if (contact.first_name) {
      g_form.setReadOnly('first_name', true);
    }
    if (contact.last_name) {
      g_form.setReadOnly('last_name', true);
    }
    if (contact.email) {
      g_form.setReadOnly('email', true);
    }
    if (typeof g_service_catalog === 'undefined') {
      toggleVariableContainer(contact.containerId);
    }
    if (contact.company) {
      g_form.setReadOnly('company', true);
    }
  }
}
