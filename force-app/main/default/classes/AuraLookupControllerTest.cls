@isTest
public class AuraLookupControllerTest {
    @isTest
    static void testSearch() {
        // Create a test Account
        Account testAccount = new Account(Name = 'Test Account', AccountNumber = '123456');
        insert testAccount;

        // Create a test Contact
        Contact testContact = new Contact(LastName = 'Test Contact', AccountId = testAccount.Id, Email='test@gmail.com');
        insert testContact;

        Test.startTest();
        //List<AuraLookupController.LookupSearchResult> result = AuraLookupController.search('Account' , 'Name', 'AccountNumber', 'R', new List<String>{}, '');
        List<AuraLookupController.LookupSearchResult> result = AuraLookupController.search('Account', 'Name', 'AccountNumber', 'T', new List<String>{}, '');
        Test.stopTest();
    }
    public class LookupSearchResult {
        @AuraEnabled public Id id{get;set;}
        @AuraEnabled public String title{get;set;}
        @AuraEnabled public String subtitle{get;set;}
        @AuraEnabled public String icon{get;set;}
        @AuraEnabled public String sObjectType{get;set;} 
    }
}