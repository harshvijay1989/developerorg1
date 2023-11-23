@isTest
private class OppToQuoteTriggerHandler_Test {

    @isTest
    static void testHandleQuoteInsert() {
        // Create test data
        // Make sure to adjust the data creation based on your specific requirements
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        Contact testContact = new Contact(LastName = 'Test Contact', Email = 'test@test.com', AccountId = testAccount.Id);
        insert testContact;
        //product insert
        Id prodRecordTypeId = Schema.SObjectType.Opportunity__c.getRecordTypeInfosByName().get('Product').getRecordTypeId();
        
            Opportunity__c testProd = new Opportunity__c(
            Name = 'Prod 1',
            Prod_Prod_Code__c = 'prod12',
            List_Price__c = 10000,
           RecordTypeId=prodRecordTypeId      
        );
        insert testProd; 
        //opportunity insert 
        Id oppRecordTypeId = Schema.SObjectType.Opportunity__c.getRecordTypeInfosByName().get('Opportunity').getRecordTypeId();
        Opportunity__c testOpportunity = new Opportunity__c(
            Name = 'Test Opportunity',
            Close_Date__c = Date.today(),
            Account_Name__c = testAccount.Id,
            Primary_contact__c = testContact.Id,
            RecordTypeId=oppRecordTypeId
        );
        insert testOpportunity;
        //Opportuinty products
           Id oppitemRecId = Schema.SObjectType.Opportunity__c.getRecordTypeInfosByName().get('Opportunity Product').getRecordTypeId();
           system.debug('oppitemRecId'+oppitemRecId);
           Opportunity__c testoppItem = new Opportunity__c(
           Name = 'Prod 1',
           Product__c=testProd.Id,
           Opportunity__c=testOpportunity.Id,
           RecordTypeId=oppitemRecId      
        );
        insert testoppItem; 

        Quote__c testQuote = new Quote__c(
            Name = 'Test Quote',
            Status__c = 'Draft',
            Account_Name__c = testAccount.Id,
            Opportunity__c = testOpportunity.Id,
            ExpirationDate__c = Date.today()
        );
        try{
        insert testQuote;
        }catch(Exception e){
            system.debug('Exception e'+e);
        }
        
         



        // Set up the handler and call the method
        Test.startTest();
        OppToQuoteTriggerHandler.handleQuoteInsert(new List<Quote__c>{testQuote});
        OppToQuoteTriggerHandler.handleQuoteUpdate(new List<Quote__c>{testQuote});
       OppToQuoteTriggerHandler.haldleDelete(new List<Quote__c>{testQuote});
     
        Test.stopTest();

    }

    // Similar test methods can be written for handleQuoteUpdate and handleDelete
}