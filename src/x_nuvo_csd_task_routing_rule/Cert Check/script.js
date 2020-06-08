(function(task_id, user_list) {
  /*
	For mandatory/excludes rules, function must return an array of valid user sys_ids
	
	For includes rules, function must return an object map of format:
	{
		user_sys_id_1: score1,
		user_sys_id_2: score2
	}
	
	A user's score is an arbitrary number that is aggregated into a total. The higher the number, the more weight the user is given by the routing engine.
	*/

  return [];
})(task_id, user_list);
