@isTest
public class SendMailTest {

    @isTest
    static void testSendEmailWithPDF() {
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

        Opportunity__c testOpportunity = new Opportunity__c(
            Name = 'Test Opportunity',
            Close_Date__c = Date.today(),
            Amount__c = 10000,
            Account_Name__c = testAccount.Id,
            Primary_contact__c = testContact.Id
        );
        insert testOpportunity;

        Id quoteRecordTypeId = Schema.SObjectType.Quote__c.getRecordTypeInfosByDeveloperName().get('Quote').getRecordTypeId();

        Quote__c testQuote = new Quote__c(
            Name = 'Test Quote',
            Status__c = 'Accepted',
            Account_Name__c = testAccount.Id,
            Opportunity__c = testOpportunity.Id,
            ExpirationDate__c = Date.today(),
            RecordTypeId = quoteRecordTypeId
        );
        insert testQuote;

       

        String result = SendMail.sendEmailWithPDF(testQuote.Id);
        Test.stopTest();
        


    }

    @isTest
    static void testSendInvoicesWithPDF() {
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

        Opportunity__c testOpportunity = new Opportunity__c(
            Name = 'Test Opportunity',
            Close_Date__c = Date.today(),
            Amount__c = 10000,
            Account_Name__c = testAccount.Id,
            Primary_contact__c = testContact.Id
        );
        insert testOpportunity;

        Id quoteRecordTypeId = Schema.SObjectType.Quote__c.getRecordTypeInfosByDeveloperName().get('Quote').getRecordTypeId();

        Quote__c testQuote = new Quote__c(
            Name = 'Test Quote',
            Status__c = 'Accepted',
            Account_Name__c = testAccount.Id,
            Opportunity__c = testOpportunity.Id,
            ExpirationDate__c = Date.today(),
            RecordTypeId = quoteRecordTypeId
        );
        insert testQuote;

        Id orderRecordTypeId = Schema.SObjectType.Order__c.getRecordTypeInfosByName().get('Order').getRecordTypeId();

        Order__c testOrder = new Order__c(
            Name = 'Test Order',
            EffectiveDate__c = System.today(),
            AccountId__c = testAccount.Id,
            RecordTypeId = orderRecordTypeId,
            ServiceDate__c = System.today(),
            PrimaryQuote__c = testQuote.Id
        );
        insert testOrder;

        // Add a test case for a successful email sending
        Test.startTest();
        String successResult = SendMail.sendInvoicesWithPdf(testOrder.Id);
        Test.stopTest();


        // Add a test case for a scenario where Invoice_Generated__c is already true
        testOrder.Invoice_Generated__c = true;
        update testOrder;
        Test.startTest();
        String alreadyGeneratedResult = SendMail.sendInvoicesWithPdf(testOrder.Id);
        Test.stopTest();


        // Add a test case for a scenario where Primary_contact__r.Email is null
        testOrder.PrimaryQuote__r.Opportunity__r.Primary_contact__r.Email = null;
        update testOrder.PrimaryQuote__r.Opportunity__r.Primary_contact__r;
        Test.startTest();
        String nullEmailResult = SendMail.sendInvoicesWithPdf(testOrder.Id);
        Test.stopTest();
        // Add a test case for a scenario where the order is not found
        testOrder.PrimaryQuote__r.Opportunity__r.Primary_contact__r.Email = 'test@example.com';
        update testOrder.PrimaryQuote__r.Opportunity__r.Primary_contact__r;
        testOrder.Id = 'invalidOrderId';
        Test.startTest();
        String orderNotFoundResult = SendMail.sendInvoicesWithPdf(testOrder.Id);
        Test.stopTest();
        
    }

    @isTest
    static void testSendInvoicesWithPDF_InvalidInput() {
        // Add a test case for an invalid input (null Order Id)
        Test.startTest();
        String invalidInputResult = SendMail.sendInvoicesWithPdf(null);
        Test.stopTest();
       
    }
    
    
    
    

}