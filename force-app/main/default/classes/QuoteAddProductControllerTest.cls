@isTest
public class QuoteAddProductControllerTest {
    @isTest
    static void testFindProducts() {
        Id recId = Schema.SObjectType.opportunity__c.getRecordTypeInfosByName().get('Product').getRecordTypeId();
        Opportunity__c testOpportunity = new Opportunity__c(Name = 'Test Opportunity', RecordTypeId = recId);
        insert testOpportunity;

        Test.startTest();
        String result = QuoteAddProductController.findProducts(testOpportunity.Id, '', '', new List<String>{}, 5);
        Test.stopTest();
        
    }
    
    @isTest
    static void testGetProductFamily() {
        Test.startTest();
        List<QuoteAddProductController.PicklistValue> result = QuoteAddProductController.getproductfamily();
        Test.stopTest();
        
        System.assertNotEquals(null, result);
    }
    
    @isTest
    static void testSaveProducts() {
        // Create a test Account
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
        
        Contact testContact = new Contact(LastName = 'TestContact', Email = 'test@test.com',AccountId = testAccount.Id);
        insert testContact;

        // Create a test Opportunity
        Id opportunityRecordTypeId = Schema.SObjectType.Opportunity__c.getRecordTypeInfosByDeveloperName().get('Opportunity').getRecordTypeId();
        Opportunity__c testOpportunity = new Opportunity__c(
            Name = 'Test Opportunity',
            Account_Name__c = testAccount.Id,
            RecordTypeId = opportunityRecordTypeId,
            Close_Date__c = Date.today(),
            Primary_contact__c = testContact.Id
        );
        insert testOpportunity;

        // Create a test Quote
        Id quoteRecordTypeId = Schema.SObjectType.Quote__c.getRecordTypeInfosByName().get('Quote Item').getRecordTypeId();
        Quote__c testQuoteItem = new Quote__c(
            Name = 'Test Quote Item',
            Status__c = 'Accepted',
            Account_Name__c = testAccount.Id,
            Opportunity__c = testOpportunity.Id,
            ExpirationDate__c = System.today().addDays(10),
            RecordTypeId = quoteRecordTypeId
        );
        insert testQuoteItem;

        // Create a test Opportunity Product
        Id opportunityProductRecordTypeId = Schema.SObjectType.Opportunity__c.getRecordTypeInfosByName().get('Opportunity Product').getRecordTypeId();
        Opportunity__c opportunityProduct = new Opportunity__c(
            Name = 'Test Opportunity Product',
            RecordTypeId = opportunityProductRecordTypeId
        );
        insert opportunityProduct;

        // Create test Products
        Opportunity__c product1 = new Opportunity__c(Name = 'Product1', RecordTypeId = opportunityProductRecordTypeId, Opportunity__r = new Opportunity__c(Id = opportunityProduct.Id));
        Opportunity__c product2 = new Opportunity__c(Name = 'Product2', RecordTypeId = opportunityProductRecordTypeId, Opportunity__r = new Opportunity__c(Id = opportunityProduct.Id));
        insert new List<Opportunity__c>{product1, product2};

        String recordData = '[{"Name": "' + product1.Name + '", "Quantity": 5, "PDate": 10.0, "LineDescription": "Description1", "Id": "' + product1.Id + '"}, {"Name": "' + product2.Name + '", "Quantity": 3, "PDate": 5.0, "LineDescription": "Description2", "Id": "' + product2.Id + '"}]';

        Test.startTest();
        String result = (String)QuoteAddProductController.saveProducts(recordData, testQuoteItem.Id);
        Test.stopTest();

        // Add assertions as needed
       // System.assertNotEquals('error', result);
    }
        /*Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
        
        Opportunity__c testOpportunity = new Opportunity__c(
            Name = 'Test Opportunity',
            Account_Name__c = testAccount.Id
        );
        insert testOpportunity;
        
        Quote__c testQuote = new Quote__c(
            Name = 'Test Quote',
            Status__c = 'Accepted',
            Account_Name__c = testAccount.Id,
            ExpirationDate__c = Date.today(),
            Opportunity__c = testOpportunity.Id
        );
        insert testQuote;
        
        QuoteAddProductController.wrapperClass wrapper = new QuoteAddProductController.wrapperClass();
        QuoteAddProductController.ProductWrapper productWrapper = new QuoteAddProductController.ProductWrapper();
        productWrapper.Name = 'Product1';
        productWrapper.Id = '1';
        productWrapper.Quantity = 5;
        productWrapper.Price = 100.00;
        productWrapper.LineDescription = 'Test Product';
        wrapper.productList = new List<QuoteAddProductController.ProductWrapper>{ productWrapper };
        
    }*/

    @isTest
    static void testDoCheck() {
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
        
        Opportunity__c testOpportunity = new Opportunity__c(
            Name = 'Test Opportunity',
            Account_Name__c = testAccount.Id
        );
        insert testOpportunity;
        
        Quote__c testQuote = new Quote__c(
            Name = 'Test Quote',
            Status__c = 'Accepted',
            Account_Name__c = testAccount.Id,
            ExpirationDate__c = system.today().addDays(10),
            Opportunity__c = testOpportunity.Id
        );
        insert testQuote;
        
        Id quoteRecordTypeId = Schema.SObjectType.Quote__c.getRecordTypeInfosByName().get('Quote').getRecordTypeId();
        Quote__c testQuoteItem = new Quote__c(
            Name = 'Test Quote Item',
            Status__c = 'Accepted',
            Account_Name__c = testAccount.Id,
            Opportunity__c = testOpportunity.Id,
            ExpirationDate__c = system.today().addDays(10),
            RecordTypeId = quoteRecordTypeId
        );
        insert testQuoteItem;
        
        Id quoteRecordTypeId2 = Schema.SObjectType.Quote__c.getRecordTypeInfosByName().get('Quote Item').getRecordTypeId();
        Quote__c testQuoteItem2 = new Quote__c(
            Name = 'Test Quote Item',
            Status__c = 'Accepted',
            Account_Name__c = testAccount.Id,
            Opportunity__c = testOpportunity.Id,
            ExpirationDate__c = system.today().addDays(10),
            RecordTypeId = quoteRecordTypeId2
        );
        insert testQuoteItem2;
        
        Test.startTest();
        List<Quote__c> result = QuoteAddProductController.doCheck(testQuoteItem.Id);
        QuoteAddProductController.updateAmount(testQuoteItem2.Id);
        Test.stopTest();
        
        System.assertNotEquals(null, result);
    }
}