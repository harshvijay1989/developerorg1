@isTest
public class Demo1Test {
	@isTest
    static void testGetQuoteItem() {
        // Create a test Account
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
        //Creat a Contact 
        Contact testContact = new Contact(LastName = 'TestContact', Email = 'test@test.com',AccountId = testAccount.Id);
        insert testContact;
        
        // Create a test Opportunity
        Id recordId = Schema.SObjectType.Opportunity__c.getRecordTypeInfosByDeveloperName().get('Opportunity').getRecordTypeId();
        
        Opportunity__c testOpportunity = new Opportunity__c(
            Name = 'Test Opportunity',
            Stage__c = 'Closed Won',
            Close_Date__c = Date.today(),
            Account_Name__c = testAccount.Id,
            Primary_contact__c = testContact.Id,
            RecordTypeId=recordId
        );
        insert testOpportunity;
        
        Id prodctRecId = Schema.SObjectType.Opportunity__c.getRecordTypeInfosByDeveloperName().get('Product').getRecordTypeId();
        Opportunity__c Product = new Opportunity__c(Name = 'test Procuct',RecordTypeId = prodctRecId); 
        insert Product;
        
        Id quoteLineItemRecId = Schema.SObjectType.Opportunity__c.getRecordTypeInfosByDeveloperName().get('Opportunity_Product').getRecordTypeId();
        Opportunity__c QuotelineItem= new Opportunity__c(Product__c=Product.Id,Name='testProduct',RecordTypeId = quoteLineItemRecId,Opportunity__c=testOpportunity.Id,Sales_Price__c=100.00,Quantity__c=10,Line_Description__c='myline');
        insert QuotelineItem;
        
        // Create a test Quote
        Id quoteRecId = Schema.SObjectType.Quote__c.getRecordTypeInfosByDeveloperName().get('Quote').getRecordTypeId();
        Quote__c testQuote = new Quote__c(
            Name = 'Test Quote',
            Status__c = 'Accepted',
            Account_Name__c = testAccount.Id,
            Opportunity__c = testOpportunity.Id,
            ExpirationDate__c=Date.today(),
            RecordTypeId=quoteRecId
           
       );
        insert testQuote;
        
            Account testAccount1 = new Account(
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
        insert testAccount1;
        
          Id oppRecordTypeId = Schema.SObjectType.Order__c.getRecordTypeInfosByName().get('Order').getRecordTypeId();
        Order__c testOrder = new Order__c(
            AccountId__c = testAccount.Id,
            RecordTypeId=oppRecordTypeId,
            ServiceDate__c=system.today()
            
        );
        insert testOrder;
        Test.startTest();
        String result = Demo1.getQuoteItem(testQuote.Id);
        String res=Demo1.getOrderItem(testOrder.Id);
        Test.stopTest();

        System.assertNotEquals(null, result);
        System.assert(result.contains(testQuote.Name));
    }

    @isTest
    static void testGetOrderItem() {
        // Create a test Order
        Order__c testOrder = new Order__c(
            Name = 'Test Order',
            EffectiveDate__c = Date.today(),
            Status__c = 'Draft'
        );
        insert testOrder;

        Test.startTest();
        String result = Demo1.getOrderItem(testOrder.Id);
        Test.stopTest();
    }

    @isTest
    static void testSaveProduct() {
        // Prepare data for saving a product
        Map<String, Object> productData = new Map<String, Object>{
            'PName' => 'Test Product',
            'ProductCode' => 'ABC123',
            'productdes' => 'Description of the product',
            'ProductType' => 'Type A',
            'isActive' => true,
            'unitPrice' => 100.00
        };
        String productDataJson = JSON.serialize(productData);

        Test.startTest();
        String result = Demo1.saveProduct(productDataJson);
        Test.stopTest();

    }
}