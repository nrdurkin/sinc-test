(function(task_id, user_list) {
	
	var fac_work_order = new GlideRecord("x_nuvo_eam_facilities_work_orders");
	fac_work_order.get(task_id);
	
	var wo_loc = {
		lat: parseFloat(fac_work_order.work_location.floor.building.latitude.toString()),
		lng: parseFloat(fac_work_order.work_location.floor.building.longitude.toString())
	};
	
	
	var accepted_coord_delta = 0.05;
	
	var accepted_lat_min = wo_loc.lat - accepted_coord_delta;
	var accepted_lat_max = wo_loc.lat + accepted_coord_delta;
	var accepted_lng_min = wo_loc.lng - accepted_coord_delta;
	var accepted_lng_max = wo_loc.lng + accepted_coord_delta;
	
	// Should query the latest check in time
	var user_geos = new GlideRecord("sys_user_geo_location");
	user_geos.addQuery("latitude", "<", accepted_lat_max);
	user_geos.addQuery("latitude", ">", accepted_lat_min);
	user_geos.addQuery("longitude", ">", accepted_lng_min);
	user_geos.addQuery("longitude", "<", accepted_lng_max);
	user_geos.query();
	
	var return_users = [];
	
	while (user_geos.next()) {
		return_users.push(user_geos.getValue("sys_user"));
	}
	
	return return_users;
	
	
})(task_id, user_list);