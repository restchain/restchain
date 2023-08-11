# Use case example
Description of the data exchange for simulating the interaction between Customer, Retailer and Supplier through REST API.
## Order
Used by Customer to make an order.

**Endpoint**  

- name: *newOrder*        
- method: POST  
- url: [https://run.mocky.io/v3/8e24eab2-8ef5-469e-9c6e-00cc8bea986f](https://run.mocky.io/v3/8e24eab2-8ef5-469e-9c6e-00cc8bea986f)

**URL**
```
https://run.mocky.io/v3/8e24eab2-8ef5-469e-9c6e-00cc8bea986f
```

**Data**

```
{
   "productId" : "tU9pu89f9x",
   "quantity"  : 200
}
```

**Response**

```
{
   "oderId": "0d50f2ca-b615-4d3a-be84-dbc0d3d46ddf",
   "productId" : "tU9pu89f9x",
   "quantity"  : 200
}
```

## Delivery
Used by Retailer to set the shipment details.

**Endpoint**  

- name: *delivery*
- method: POST
- url: [https://run.mocky.io/v3/c9ef98d9-4bf3-459b-bc0c-71198915a35f](https://run.mocky.io/v3/c9ef98d9-4bf3-459b-bc0c-71198915a35f)

**URL**
```
https://run.mocky.io/v3/c9ef98d9-4bf3-459b-bc0c-71198915a35f
```
**Data**

```
{
	"productId" : "tU9pu89f9x",
	"weight"  : 500,
	"quantity"  : 200,
	"name": "Ervin Howell",
	"email": "ehowell@melissa.tv",
	"address": {
		"street": "Victor Plains",
		"suite": "Suite 879",
		"city": "Wisokyburgh",
		"zipcode": "90566-7771",
	},
	"phone": "010-692-6593 x09125"	
}
```

**Response**

```
{
	"deliveryId": "d89c0797-fa13-4ec3-af7c-d0e922e8dc2f"
	"date"  : 2021-10-10,
	"price"  : 200
}
```

## Delivery plan notification
Used by Retailer to summarise delivery details to the Customer by email.

**Endpoint**  

- name: *deliveryPlan*
- method: GET
- url: [https://run.mocky.io/v3/3abc90e3-9da6-45ff-ac63-d8e38db83716](https://run.mocky.io/v3/3abc90e3-9da6-45ff-ac63-d8e38db83716)

**URL**
```
https://run.mocky.io/v3/3abc90e3-9da6-45ff-ac63-d8e38db83716
```
**Params**

```
{
	"deliveryId": "d89c0797-fa13-4ec3-af7c-d0e922e8dc2f"
}
```

## Delivery acceptance
Used by Customer to give the final acceptance on the plan previously received.

**Endpoint**  

- name: * deliveryAcceptance*
- method: GET
- url: [https://run.mocky.io/v3/17768921-df48-485b-a827-2da9c57e8192](https://run.mocky.io/v3/17768921-df48-485b-a827-2da9c57e8192)

**URL**
```
https://run.mocky.io/v3/17768921-df48-485b-a827-2da9c57e8192
```
**Data**

```
{
	"deliveryId": "d89c0797-fa13-4ec3-af7c-d0e922e8dc2f"
}
```

**Response** 

```
{
	"deliveryId": "d89c0797-fa13-4ec3-af7c-d0e922e8dc2f",
	"status": "confirmed"
}
```

## Payment
Used by Customer to notify the payment.

**Endpoint**  

- name: *paymentNotification*
- method: POST
- url: [https://run.mocky.io/v3/93a7bbdd-7d0f-4b6d-86cc-4ae4ad25a3c5](https://run.mocky.io/v3/93a7bbdd-7d0f-4b6d-86cc-4ae4ad25a3c5)

**URL**
```
https://run.mocky.io/v3/93a7bbdd-7d0f-4b6d-86cc-4ae4ad25a3c5
```

**Data**

```
{
	"billId": "ebe4890a-fc75-4b78-9e34-5fb2c733a1db",
	"from": "user-55112",
	"to": "customer-45532",
	"date" : "2021-10-8 11:25:23"
}
```

**Response**

```
{
	"billId": "ebe4890a-fc75-4b78-9e34-5fb2c733a1db"
}
```

## Delivery schedule
Used by Retailer to notify scheduled delivery.

**Endpoint**  

- name: *deliverySchedule*
- method: POST
- url: [https://run.mocky.io/v3/2cf82128-f204-455b-9040-8e59c204fc13](https://run.mocky.io/v3/2cf82128-f204-455b-9040-8e59c204fc13)

**URL**
```
https://run.mocky.io/v3/2cf82128-f204-455b-9040-8e59c204fc13
```
**Data**

```
{
	"deliveryId": "d89c0797-fa13-4ec3-af7c-d0e922e8dc2f",
	"deliveryAddress": {	
			"name": "Ervin Howell",
			"email": "ehowell@melissa.tv",
			"address": {
				"street": "Victor Plains",
				"suite": "Suite 879",
				"city": "Wisokyburgh",
				"zipcode": "90566-7771"
			},
			"phone": "010-692-6593 x09125",
	},
	"deliveryDetail": {
		"weight": 500,
		"pallets": 1,
		"date"  : 2021-10-10,
		"time"  : 09:30	
	}
}
```


## Order bill
Used to notify the order bill.

**Endpoint**  

- name: *orderBill*
- method: POST
- url: [https://run.mocky.io/v3/d9d53e4a-8996-4e8e-a14f-1f523d99e37d](https://run.mocky.io/v3/d9d53e4a-8996-4e8e-a14f-1f523d99e37d)

**URL**
```
https://run.mocky.io/v3/d9d53e4a-8996-4e8e-a14f-1f523d99e37d
```
**Data**

```
{
   "oderId": "0d50f2ca-b615-4d3a-be84-dbc0d3d46ddf",
   	"billId": "ebe4890a-fc75-4b78-9e34-5fb2c733a1db",
	"payment" : "confirmed",
	"from": "user-55112",
	"to": "customer-45532",
	"date" : "2021-10-8 11:25:23"
}
```

## Order completed
Used by Customer to confirm delivery.

**Endpoint**  

- name: *orderCompleted*
- method: POST
- url: [https://run.mocky.io/v3/93a7bbdd-7d0f-4b6d-86cc-4ae4ad25a3c5](https://run.mocky.io/v3/93a7bbdd-7d0f-4b6d-86cc-4ae4ad25a3c5)

**URL**
```
https://run.mocky.io/v3/93a7bbdd-7d0f-4b6d-86cc-4ae4ad25a3c5
```
**Data**

```
{
	"oderId": "0d50f2ca-b615-4d3a-be84-dbc0d3d46ddf",
	"deliveryId": "d89c0797-fa13-4ec3-af7c-d0e922e8dc2f",
	"status": "RECEIVED"
	"feedback": "All right",
	"from": "customer-45532",
	"date" : "2021-10-8 11:25:23"
}
```

**Response**

```
{
	"message": "Order completed!"
}
```
