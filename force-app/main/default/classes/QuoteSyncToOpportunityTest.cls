@isTest
public class QuoteSyncToOpportunityTest {
     @isTest
    static void testSyncOpportunity() {

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
            Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'Contact',
            Phone = '9876543210',
            Email = 'test@example.com',
            AccountId = testAccount.Id 
        );
        insert testContact;
                Id oppRecordTypeId = Schema.SObjectType.Opportunity__c.getRecordTypeInfosByName().get('Opportunity').getRecordTypeId();

           Opportunity__c testOpportunity = new Opportunity__c(
            Name = 'Test Opportunity',
            Close_Date__c = Date.today(),
            Amount__c = 10000,
            Account_Name__c=testAccount.id,
            RecordTypeId=oppRecordTypeId,
            Primary_contact__c=testContact.Id
               
        );
        insert testOpportunity;
        Id QuoteRecordTypeId = Schema.SObjectType.Quote__c.getRecordTypeInfosByName().get('Quote').getRecordTypeId();
        Quote__c testQuote = new Quote__c(
            Name = 'Test Quote',
            Opportunity__c = testOpportunity.Id,
            ExpirationDate__c=system.today(),
            Status__c='Draft',
            Account_Name__c=testAccount.id,
            RecordTypeId=QuoteRecordTypeId   
        );
        insert testQuote;
        Id prodRecordTypeId = Schema.SObjectType.Opportunity__c.getRecordTypeInfosByName().get('Product').getRecordTypeId();
        
         Opportunity__c testProd = new Opportunity__c(
            Name = 'Prod 1',
            Prod_Prod_Code__c = 'prod12',
            List_Price__c = 10000,
           RecordTypeId=prodRecordTypeId      
        );
        insert testProd;        

        // Create a test Quote Line Item
        Id QuoteItemRecordTypeId = Schema.SObjectType.Quote__c.getRecordTypeInfosByName().get('Quote Item').getRecordTypeId();
        Quote__c testQuoteLineItem = new Quote__c(
            Name = 'Test',
            QuoteId__c = testQuote.Id,
            ListPrice__c = 100.0,
            UnitPrice__c = 90.0,
            Quantity__c = 2,
            QuoteLineDiscount__c = 0.1,
            LineItemDescription__c = 'Test Description',
            Product__c = testProd.Id,
            RecordTypeId=QuoteItemRecordTypeId   
            
        );
        insert testQuoteLineItem;

        Test.startTest();
        // Call the method to be tested
        String result = quoteSyncToOpportunity.syncOpportunity(testQuote.Id);
        Test.stopTest();


    }
}