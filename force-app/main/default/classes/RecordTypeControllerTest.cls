@isTest
public class RecordTypeControllerTest {



    @isTest
    static void testGetRecordsByRecordType() {
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        Contact testContact = new Contact(LastName = 'Test Contact', Email = 'test@test.com', AccountId = testAccount.Id);
        insert testContact;

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
        Test.startTest();
        List<SObject> result = RecordTypeController.getRecordsByRecordType('Opportunity__c', 'Opportunity', 'Id,Name');
        Test.stopTest();


    }

}