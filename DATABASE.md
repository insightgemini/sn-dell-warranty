Documentation on Custom Database Structure. How this links to Asset and Display not sure.

Table Name = u_dell_warranty
Table Fields =  u_itemnumber
				u_serialnumber (Dell Serial Number)
				u_entitlementtype
				u_serviceprovider
				u_servicelevelgroup
				u_itemnumber
				u_serviceleveldescription
				u_servicelevelcode
				u_startdate	   (Date Warrenty Starts)
				u_enddate	   (Date Warrenty Ends)
				u_active
				sys_updated_on (Last time checked)



Table Name = cmdb_ci_computer
Table Fields =  manufacturer
				serial_number


Setup of REST API to 'Dell Warranty Sandbox'
https://thesnowball.co/how-to-create-a-rest-message-with-restmessagev2-api/#:~:text=To%20send%20a%20REST%20message%20in%20ServiceNow%2C%20you,API%20to%20send%20a%20REST%20message%20in%20ServiceNow%3A
https://www.hull1.com/scriptit/2020/08/28/dell-api-warranty-lookup.html

https://api.dell.com or key: https://api.dell.com/support/v2/assetinfo/warranty
