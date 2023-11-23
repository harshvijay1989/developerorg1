@isTest
public class leadSucessClassTest {

    @isTest
    static void testGetAccountDetails() {
        // Create a test Account
        Account testAccount = new Account(Name = 'Test Account', Phone = '1234567890');
        insert testAccount;

        // Call the method to be tested
        String result = leadSucessClass.getAccountDetails(testAccount.Id);

        
    }

    @isTest
    static void testGetContactDetails() {
        // Create a test Contact
        Account testAccount = new Account(Name = 'Test Account', Phone = '1234567890');
        insert testAccount;
        Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'Contact',
            Phone = '9876543210',
            Email = 'test@example.com',
            AccountId = testAccount.Id 
        );
        insert testContact;


        String result = leadSucessClass.getContactDetails(testContact.Id);

        
    }

    @isTest
    static void testGetOpportunityDetails() {
        // Create a test Opportunity
        Opportunity__c testOpportunity = new Opportunity__c(
            Name = 'Test Opportunity',
            Close_Date__c = Date.today(),
            Amount__c = 10000         
        );
        insert testOpportunity;

        // Call the method to be tested
        String result = leadSucessClass.getOpportunityDetails(testOpportunity.Id);


    }
}