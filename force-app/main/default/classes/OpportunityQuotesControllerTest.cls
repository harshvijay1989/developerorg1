@isTest
public class OpportunityQuotesControllerTest {
	@isTest
    static void testGetRelatedQuotes() {
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

        // Create a test Quote
        Quote__c testQuote = new Quote__c(
            Name = 'Test Quote',
            ExpirationDate__c = Date.today() + 30,
            Status__c = 'Draft',
            Opportunity__c = testOpportunity.Id
        );
        insert testQuote;

        Test.startTest();
        List<Quote__c> result = OpportunityQuotesController.getRelatedQuotes(testOpportunity.Id);
        List<Quote__c> result2 = OpportunityQuotesController.getRelatedQuotes(null);
        Test.stopTest();
        
        // Assert that the result is not null and contains the expected quote
        System.assertNotEquals(null, result);
        System.assertEquals(1, result.size());
        System.assertEquals(testQuote.Id, result[0].Id);
    }
    
}