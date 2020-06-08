"use strict";

if (current.getValue('asset') === '' || current.getValue('asset') == null) {
  gs.addErrorMessage('Asset is required to create a work order.');
} else {
  var woTypes = {
    x_nuvo_eam_clinical_devices: 'x_nuvo_eam_clinical_work_orders',
    x_nuvo_eam_clinical_parts: 'x_nuvo_eam_clinical_work_orders',
    x_nuvo_eam_facilities_devices: 'x_nuvo_eam_facilities_work_orders',
    x_nuvo_eam_facilities_parts: 'x_nuvo_eam_facilities_work_orders',
    x_nuvo_eam_lab_devices: 'x_nuvo_eam_lab_work_orders',
    x_nuvo_eam_lab_parts: 'x_nuvo_eam_work_order'
  };
  var newWO = '';
  var assetGr = new GlideRecord('x_nuvo_eam_assets');

  if (assetGr.get(current.getValue('asset'))) {
    var assetTable = assetGr.getValue('sys_class_name');
    var woGr = new GlideRecord(woTypes[assetTable]);
    woGr.newRecord();
    woGr.setValue('asset', current.getValue('asset'));
    var contactGR = current.contact.getRefRecord();
    woGr.setValue('service_provider', contactGR.getValue('company'));
    woGr.setValue('x_nuvo_csd_call', current.getValue('sys_id'));
    woGr.setValue('short_description', current.getValue('short_description'));
    woGr.setValue('description', current.getValue('description'));
    woGr.setValue('state', 1);
    woGr.setValue('priority', current.getValue('priority'));
    newWO = woGr.insert();
  }

  if (newWO !== '') {
    current.setValue('state', '5');
    current.setValue('escalated', true);
    current.setValue('work_order', newWO);
    current.update();
    var currentURL = gs.getUrlOnStack();
    action.setRedirectURL(currentURL);
  } else {
    gs.addErrorMessage('Error while attempting to create work order');
  }
}