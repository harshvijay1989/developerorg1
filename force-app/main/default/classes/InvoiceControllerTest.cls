@isTest
public class InvoiceControllerTest {
     @isTest
    static void testInvoiceController() {
              Account testAccount = new Account(
            Name = 'Test Account',
            BillingStreet = '123 Billing St',
            BillingCity = 'Billing City',
            BillingState = 'Billing State',
            BillingPostalCode = '12345',
            ShippingStreet = '123 Shipping St',
            ShippingCity = 'Shipping City',
            ShippingState = 'Shipping State',
            ShippingPostalCode = '54321'
        );
        insert testAccount;
        
          Id oppRecordTypeId = Schema.SObjectType.Order__c.getRecordTypeInfosByName().get('Order').getRecordTypeId();
        Order__c testOrder = new Order__c(
            AccountId__c = testAccount.Id,
            RecordTypeId=oppRecordTypeId,
            ServiceDate__c=system.today()
            
        );
        insert testOrder;
                Id prodRecordTypeId = Schema.SObjectType.Opportunity__c.getRecordTypeInfosByName().get('Product').getRecordTypeId();
        
         Opportunity__c testProd = new Opportunity__c(
            Name = 'Prod 1',
            Prod_Prod_Code__c = 'prod12',
            List_Price__c = 10000,
           RecordTypeId=prodRecordTypeId      
        );
        insert testProd;        
         Id orderItemRecordTypeId = Schema.SObjectType.Order__c.getRecordTypeInfosByName().get('Order Line Item').getRecordTypeId();
        Order__c testOrderLineItem = new Order__c(
            OrderId__c = testOrder.Id,
            Product2Id__c = testProd.Id,
            Quantity__c = 2,
            RecordTypeId=orderItemRecordTypeId
            // Add other required fields here
        );
        insert testOrderLineItem;

        
        
        Test.startTest();
        // Instantiate the InvoiceController and test its constructor
        PageReference pageRef = Page.CustomInvoicePDF; // Replace with your actual Visualforce page name
        pageRef.getParameters().put('id', testOrder.Id);
        Test.setCurrentPage(pageRef);

        InvoiceController controller = new InvoiceController();

        

        Test.stopTest();


        
    }

}