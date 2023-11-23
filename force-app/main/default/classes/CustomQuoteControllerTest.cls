@isTest
public class CustomQuoteControllerTest {


    @isTest
    static void testCustomQuoteController() {
        // Create test data for Quote__c and Product__c
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        Opportunity__c testOpportunity = new Opportunity__c(
            Name = 'Test Opportunity',
            Close_Date__c = Date.today(),
            Account_Name__c = testAccount.Id
        );
        insert testOpportunity;
        Id orderRecordTypeId = Schema.SObjectType.Quote__c.getRecordTypeInfosByName().get('Quote').getRecordTypeId();
        Quote__c testQuote = new Quote__c(
            Name = 'Test Quote',
            Account_Name__c = testAccount.Id,
            Opportunity__c = testOpportunity.Id,
            Subtotal__c = 100.0,
            ExpirationDate__c=system.today(),
            
            RecordTypeId=orderRecordTypeId
        );
        insert testQuote;

        Product__c testProduct = new Product__c(
            Name = 'Test Product'
            // Add other required fields as needed
        );
        insert testProduct;

       

        // Instantiate the controller and set the current page parameter
        PageReference pageRef = Page.CustomQuotePDF; // Replace with your actual VF page name
        pageRef.getParameters().put('id', testQuote.Id);

        Test.setCurrentPage(pageRef);

        customQuoteController controller = new customQuoteController();


    }

}