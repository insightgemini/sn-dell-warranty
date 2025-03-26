/* ##########################################################################
## This script will query the cmdb_ci_computer table for all computers that 
## have a serial number and a manufacturer name that contains Dell. It will
## then query the Dell warranty API with each serial number, parse the response
## to determine if there is a valid warranty for the given serial number and
## if so, insert or update the u_dell_warranty table with the warranty info. 
## 
   ########################################################################## */
/* ##########################################################################
## update-dell-warranty.js
   ########################################################################## */

/* #####################        VERSION CONTROL        ######################
##  Version			Date 		Description
##		0.01		2025-01-14	Initial version under version control (re-dated)
##		0.0x
*/

var CompanySysIds = ['2649dcf31b8d5a901f76db5fe54bcb70',  // Dell Corporation Limited (ONT)
					 'd34910371b8d5a901f76db5fe54bcb7b']; // Dell Marketing L.P. (US)
//var excludedModels = ['Dell Corporation Limited Optiplex', 'Dell Corporation Limited Latitude']; // Replace with desired excluded models

function Main() {


    var record = new GlideRecord('cmdb_ci_computer');
    record.addQuery('manufacturer', 'IN', CompanySysIds);
//    record.addQuery('model_id', 'NOT IN', excludedModels);
    record.addNotNullQuery('serial_number');
//    record.addNotNullQuery('22MH224');
    record.query();

    var counter = 0;
    var apiLimit = 10000;
	//gs.log('There are '+record.getRowCount()+' records to check for Dell Warranty status',"update-dell-warranty");
    while (record.next()) {
        if (counter < apiLimit) {
            // #########################################################################################################################
        	gs.print('The following CI is being checked: '+ record.serial_number);
            if (CheckNeedsUpdate(record.serial_number) === true) {
                // #########################################################################################################################
				gs.print('The following CI requires update : '+record.serial_number);

                var request = new RESTMessage('Dell Warranty Sandbox', 'AssetSummary GET');

                // #########################################################################################################################
//				gs.log('Querying Dell Warranty API:'+' Serial Number: '+record.serial_number+' Manufacturer: '+record.manufacturer,"update-dell-warranty");
				gs.print('Querying Dell Warranty API:'+' Serial Number: '+record.serial_number+' Manufacturer: '+record.manufacturer);
				var requestBody = {"servicetags":record.serial_number};
//                request.setStringParameter('servicetags', record.serial_number);
                request.setRequestBody(JSON.stringify(requestBody));
                // Send Request to Server
                var response = request.execute();

                // #########################################################################################################################
//				gs.log('Dell Warranty API Response: '+response.getBody(),"update-dell-warranty");
//				gs.print('Dell Warranty API Response: '+ response.status + ' Response body '+ response.getBody());

                // Parse the response body using JSON.parse
		        try {

	                // #########################################################################################################################
//					gs.log('Attempting to Parse the response.',"update-dell-warranty");
					gs.print('Attempting to Parse the response.');
		            var parsed = JSON.parse(response.getBody());
					gs.print('Parsed Contents: '+ parsed);

		            var gotResult = parsed.GetAssetWarrantyResponse.GetAssetWarrantyResult.Response;

					gs.print('Dell Warranty Response:'+' Serial Number: '+record.serial_number+' Manufacturer: '+record.manufacturer);
		            if (gotResult !== null) {
		                var warranty = parsed.GetAssetWarrantyResponse.GetAssetWarrantyResult.Response.DellAsset.Warranties.Warranty;
						//gs.log('Dell Warranty: '+warranty,"update-dell-warranty");
		                if (warranty !== undefined && warranty !== null) {
		                    for (var i = 0; warranty[i]; i++) {
		                        var existingWarranty = CheckExistingWarranty(record.serial_number, warranty[i]);
		                        if (existingWarranty == true) {
		                            UpdateWarranty(record.serial_number, warranty[i]);
		                        } else {
		                            InsertWarranty(record.serial_number, warranty[i]);
		                        }
		                    }
		                } else {
							//gs.log('Dell Warranty response did not define a warranty for '+record.serial_number,"update-dell-warranty");
		                }
		            }
		        } catch (e) {
		            // Handle JSON parsing errors
//		            gs.log('Error parsing JSON response: ' + e.message, "update-dell-warranty");
		            gs.print('Error parsing JSON response: ' + e.message);
		        }
            } else {
				gs.print('The following CI does not require updating : '+record.serial_number);
            }
            counter++;
        }
    }
}

// Check if the Warranty EndDate is > Now (Warranty is Active)
function CheckActive(a_end_date) {
	gs.print('Entering CheckActive function');
	var nowDateTime = gs.nowDateTime();
	if (a_end_date > nowDateTime) {
		//gs.log('CheckActive() - Now: '+nowDateTime+' WarrantyEnd: '+a_end_date+' Active: true',"update-dell-warranty");
		return true;
	} else {
		//gs.log('CheckActive() - Now: '+nowDateTime+' WarrantyEnd: '+a_end_date+' Active: false',"update-dell-warranty");
		return false;
	}
}

// Check if an update is due per the Dell API access guidelines
function CheckNeedsUpdate(a_serial_number) {
	gs.print('Entering CheckNeedsUpdate function');
	var gr = new GlideRecord('u_dell_warranty');
	gr.addQuery('u_serialnumber', a_serial_number);
	gr.query();
	while(gr.next()) {
		var timeSinceUpdated = gs.dateDiff(gr.sys_updated_on, now(), true);
		var timeUntilExpiration = gs.dateDiff(gr.u_enddate, now(), true);
		
/*
		24hrs = 86400
		7 days = 604800
		15 days = 1296000
		30 days = 2592000
		45 days = 3888000
		60 days = 5184000
		90 days = 7776000
		1 year = 31536000 
*/
		if (timeUntilExpiration > 31536000 && timeSinceUpdated > 5184000) {
			//gs.log("[Dell Warranty] Expiration > 1 year away and Updated > 60 days ago","update-dell-warranty");
			return true;
		} else if (timeUntilExpiration < 31536000 && timeSinceUpdated > 2592000) {
			//gs.log("[Dell Warranty] Expiration < 1 year away and Updated > 30 days ago","update-dell-warranty");
			return true;
		} else if (timeUntilExpiration < 7776000 && timeUntilExpiration > 3888000 && timeSinceUpdated > 1296000) {
			//gs.log("[Dell Warranty] Expiration between 45 and 90 days away and Updated > 15 days ago","update-dell-warranty");
			return true;
		} else if (timeUntilExpiration < 3888000 && timeUntilExpiration > 2592000 && timeSinceUpdated > 604800) {
			//gs.log("[Dell Warranty] Expiration between 30 and 45 days away and Updated > 7 days ago","update-dell-warranty");
			return true;
		} else if (timeUntilExpiration > -864000 && timeUntilExpiration < 2592000 && timeSinceUpdated > 86400) {
			//gs.log("[Dell Warranty] Expiration between -10 and 30 days away and Updated > 24 hours ago","update-dell-warranty");
			return true;
		} else if (timeUntilExpiration > -5184000 && timeUntilExpiration < -864000 && timeSinceUpdated > 2592000) {
			//gs.log("[Dell Warranty] Expired between -10 and -60 days ago and Updated > 30 hours ago","update-dell-warranty");
			return true;
		} else if (timeUntilExpiration < -5184000) {
			//gs.log("[Dell Warranty] Expired > 60 days ago","update-dell-warranty");
			return false;
		} else {
			//gs.log("[Dell Warranty] Catch All Else","update-dell-warranty");
			return false;
		}
	}
	//gs.log("[Dell Warranty] No existing record of serial number, perform the API call/update","update-dell-warranty");
	gs.print("[Dell Warranty] No existing record of serial number, perform the API call/update");
	return true;
}

// Check if there is already a warranty record for this serial number
function CheckExistingWarranty(a_serial_number, a_warranty) {
	gs.print('Entering CheckExisting Warranty function');
	var gr = new GlideRecord('u_dell_warranty');
	gr.addQuery('u_serialnumber', a_serial_number);
	gr.addQuery('u_itemnumber', a_warranty.ItemNumber);
	gr.query();
	var count = gr.getRowCount();
	if (count > 0) {
		// Matching warranty found, update instead of insert.
		//gs.log('Check for existing warranty found a match, updating entry.',"update-dell-warranty");
		return true;
	} else {
		// No matching warranty found, insert the new data.
		//gs.log('Check for existing warranty found no match, inserting entry.',"update-dell-warranty");
		return false;
	}
}

function InsertWarranty(a_serial_number, a_warranty) {
	gs.print('Entering InsertWarranty function');
	try {
		var gr = new GlideRecord('u_dell_warranty');
		gr.initialize();
		gr.u_serialnumber = a_serial_number;
		gr.u_entitlementtype = a_warranty.EntitlementType;
		if (JSUtil.type_of(a_warranty.ServiceProvider) == 'object') {
				gr.u_serviceprovider = 'NULL';
		} else {
			gr.u_serviceprovider = a_warranty.ServiceProvider;
		}
		gr.u_servicelevelgroup = a_warranty.ServiceLevelGroup;
		gr.u_itemnumber = a_warranty.ItemNumber;
		gr.u_serviceleveldescription = a_warranty.ServiceLevelDescription;
		gr.u_servicelevelcode = a_warranty.ServiceLevelCode;
		gr.u_startdate = a_warranty.StartDate;
		gr.u_enddate = a_warranty.EndDate;
		gr.u_active = CheckActive(a_warranty.EndDate);
		gr.insert();
	} catch (e) {
//		gs.log('Error while Inserting Dell Warranty: '+e);
		gs.print('Error while Inserting Dell Warranty: '+e);
	}
}

function UpdateWarranty(a_serial_number, a_warranty) {
	gs.print('Entering UpdateWarranty function');
	try {
		var gr = new GlideRecord('u_dell_warranty');
		gr.addQuery('u_serialnumber', a_serial_number);
		gr.addQuery('u_itemnumber', a_warranty.ItemNumber);
		gr.query();
		while(gr.next()) {
			gr.u_serialnumber = a_serial_number;
			gr.u_entitlementtype = a_warranty.EntitlementType;
			if (JSUtil.type_of(a_warranty.ServiceProvider) == 'object') {
					gr.u_serviceprovider = 'NULL';
			} else {
				gr.u_serviceprovider = a_warranty.ServiceProvider;
			}	
			gr.u_servicelevelgroup = a_warranty.ServiceLevelGroup;
			gr.u_itemnumber = a_warranty.ItemNumber;
			gr.u_serviceleveldescription = a_warranty.ServiceLevelDescription;
			gr.u_servicelevelcode = a_warranty.ServiceLevelCode;
			gr.u_startdate = a_warranty.StartDate;
			gr.u_enddate = a_warranty.EndDate;
			gr.u_active = CheckActive(a_warranty.EndDate);
			gr.sys_updated_on = gs.now();
			gr.update();	
		}
	} catch(e) {
		gs.log('Error while Updating Dell Warranty: '+e);
	}
}

Main();
