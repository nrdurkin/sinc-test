/**
 * Perform checks on a work order. You can add error and warning messages using addWarningMsg and addErrorMsg.
 * You supply a message string and you can give it options to determine how long it is on the screen.
 * @param {GlideRecord} workOrderGR - GlideRecord representing the work order to be checked
 * @param {(message:string, options?:object)=>void} addErrorMsg - adds an error message (for serious issues) both this and addWarningMsg take the same options
 * @param {(message:string, options?:object)=>void} addWarningMsg - adds a warning message
 */
function dispatchCheckWorkOrder(workOrderGR, addErrorMsg, addWarningMsg) {
  /* --- Example Options: Require manual close ---
   * var options = {
   *  //this will prevent the notification from closing automatically
   *  autoClose:false
   * };
   * addWarningMsg('my message', options);
   *
   * --- Example Options: Manually set the duration ---
   * var options = {
   *  //this will set how long the notification stays on screen in milliseconds
   *  duration:3000
   * };
   * addWarningMsg('my message',options);*/
}
