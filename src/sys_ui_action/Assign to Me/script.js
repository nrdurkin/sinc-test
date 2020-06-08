current.setValue("assigned_to", gs.getUserID());

if (current.getValue("state") == "1") {
  current.setValue("state", "2");
}

current.update();
