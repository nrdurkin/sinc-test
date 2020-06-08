var GetContactInformation = Class.create();
GetContactInformation.prototype = Object.extendsObject(
  global.AbstractAjaxProcessor,
  {
    getContact: function() {
      var result = this.newItem('result');

      var contactsRecord = new GlideRecord('x_nuvo_eam_call_contacts');
      contactsRecord.addQuery('email', gs.getUser().getEmail());
      contactsRecord.query();

      var isContactFound = contactsRecord.next();
      var data = {};

      if (isContactFound) {
        data = {
          first_name: contactsRecord.getValue('first_name'),
          last_name: contactsRecord.getValue('last_name'),
          email: contactsRecord.getValue('email'),
          phone_number: contactsRecord.getValue('phone_number'),
          company: contactsRecord.company.getRefRecord().getUniqueValue(),
        };
      } else {
        var usersRecord = new GlideRecord('sys_user');
        usersRecord.addQuery('sys_id', gs.getUser().getID());
        usersRecord.query();
        if (usersRecord.next()) {
          data = {
            first_name: usersRecord.getValue('first_name'),
            last_name: usersRecord.getValue('last_name'),
            email: usersRecord.getValue('email'),
            phone_number: usersRecord.getValue('mobile_phone'),
            company: '',
          };
        }
      }

      data.isContactFound = isContactFound;
      data.containerId = new x_nuvo_mobile.NuvoloProperties().getProperty(
        'call_contact_container',
        'Core EAM Config'
      );

      result.setAttribute('contact', new global.JSON().encode(data));
    },
    type: 'GetContactInformation',
  }
);
