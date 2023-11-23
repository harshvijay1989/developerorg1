@isTest
public class QuoteToOrderControllerTest {
    @isTest
    static void testConvertQuoteToOrder() {
        
        // Create a test Account
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
        //Creat a Contact 
        Contact testContact = new Contact(LastName = 'TestContact', Email = 'test@test.com',AccountId = testAccount.Id);
        insert testContact;
        
        // Create a test Opportunity
        Id recordId = Schema.SObjectType.Opportunity__c.getRecordTypeInfosByDeveloperName().get('Opportunity').getRecordTypeId();
        //Id recId='0121m000000DsT8AAK', '0121m000000DscMAAS'   '0121m000000DsXpAAK'  '0121m000000Dse8AAC';
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
         System.debug('testQuote 32 ==>'+testQuote);
        // Call the convertQuoteToOrder method
        Test.startTest();
        Id orderId = QuoteToOrderController.convertQuoteToOrder(testQuote.Id);
        Test.stopTest();
        
        // Verify that the Order was created
        System.assertNotEquals(null, orderId);
    }
}