Documentation on Custom Database Structure. How this links to Asset and Display not sure.

Table Name = u_dell_warranty
Table Fields =  u_itemnumber
				u_serialnumber (Dell Serial Number)
				u_entitlementtype
				u_serviceprovider
				u_servicelevelcode
				u_serviceleveldescription
				u_servicelevelgroup
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




*** Script: response body is[{
	"id":2112900776,
	"serviceTag":"22MH224",
	"orderBuid":202,
	"shipDate":"2024-03-27T00:00:00Z",
	"productCode":">/209",
	"localChannel":"ENTP",
	"productId":null,
	"productLineDescription":"LATITUDE 7340",
	"productFamily":null,
	"systemDescription":null,
	"productLobDescription":"Latitude",
	"countryCode":"GB",
	"duplicated":false,
	"invalid":false,
Onsite Service After Remote Diagnosis (Consumer Customer)/ Next Business Day Onsite After Remote Diagnosis (for business Customer)
	"entitlements":[
		{
			"itemNumber":"439-18919",u_
			"startDate":"2024-03-27T00:00:00Z",
			"endDate":"2024-10-23T22:59:59.000001Z",
			"entitlementType":"INITIAL",
			"serviceLevelCode":"PJ",
			"serviceLevelDescription":"ProDeploy Basic",
			"serviceLevelGroup":8
		},
		{
			"itemNumber":"709-BDIM",
			"startDate":"2024-03-27T00:00:00Z",
			"endDate":"2027-03-27T23:59:59.000001Z",
			"entitlementType":"INITIAL",
			"serviceLevelCode":"ND",
			"serviceLevelDescription":"Onsite Service After Remote Diagnosis (Consumer Customer)/ Next Business Day Onsite After Remote Diagnosis (for business Customer)",
			"serviceLevelGroup":5
		},
		{
			"itemNumber":"199-BIUS",
			"startDate":"2027-03-28T00:00:00Z",
			"endDate":"2027-04-27T22:59:59.000001Z",
			"entitlementType":"EXTENDED",
			"serviceLevelCode":"ND",
			"serviceLevelDescription":"Onsite Service After Remote Diagnosis (Consumer Customer)/ Next Business Day Onsite After Remote Diagnosis (for business Customer)",
			"serviceLevelGroup":5
		}
	]}
]

*** Script: httpStatus is200