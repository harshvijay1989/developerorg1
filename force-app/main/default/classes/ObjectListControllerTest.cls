@istest
public class ObjectListControllerTest {
    @isTest
    static void testGetObjectList() {
        
        Account acc = new Account(Name = 'Test Account');
        insert acc;

        Test.startTest();
        ObjectListController.getObjectList();
        Test.stopTest();

       
    }
    
     @isTest
    static void testGetObjectRecords() {
       
        Account acc = new Account(Name = 'Test Account',Phone = '1234567890');
        insert acc;

        Test.startTest();
        ObjectListController.getObjectRecords('Account');
        ObjectListController.getEmailTemplates();
        //ObjectListController.getTemplate('test');
        Test.stopTest();

        
    }
     @isTest
    static void testSearchEmailTemplates() {
       EmailTemplate validEmailTemplate = new EmailTemplate();
        validEmailTemplate.isActive = true;
        validEmailTemplate.Name = 'name';
        validEmailTemplate.DeveloperName = 'unique_name_addSomethingSpecialHere';
        validEmailTemplate.TemplateType = 'text';
        validEmailTemplate.FolderId = UserInfo.getUserId();

		insert validEmailTemplate;
        string ids = validEmailTemplate.ID;

        Test.startTest();
        ObjectListController.searchEmailTemplates('Test');
		//ObjectListController.getTemplate(ids);
        Test.stopTest();

       
    }
    
     @isTest
    static void testGetEmailFields() {
        Test.startTest();
         ObjectListController.getEmailFields('Account'); // Pass the API name of an object with Email fields
        Test.stopTest();

       
    }
     @isTest
    static void testFetchDataFromApex() {
        
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        // Define the fields to be selected
        List<String> selectedFields = new List<String>{'Id', 'Name'};

        Test.startTest();
        ObjectListController.fetchDataFromApex(selectedFields, 'Account');
        Test.stopTest();

       
    }
    
     @isTest
    static void testSendEmailTemplate() {
        // Define test data
        List<String> toAddress = new List<String>{'test@example.com'};
        String subject = 'Test Subject';
        String body = 'Test Body';

        Test.startTest();
        // Call the method
        ObjectListController.sendEmailTemplate(toAddress, subject, body);
        Test.stopTest();

        
    }
    @istest
    static void testfetchEmails(){
        /* EmailTemplate validEmailTemplate = new EmailTemplate();
        validEmailTemplate.isActive = true;
        validEmailTemplate.Name = 'name';
        validEmailTemplate.DeveloperName = 'unique_name_addSomethingSpecialHere';
        validEmailTemplate.TemplateType = 'text';
        validEmailTemplate.FolderId = UserInfo.getUserId();

		insert validEmailTemplate;
        string templateId = validEmailTemplate.ID;*/
        List<String> selectedEmails = new List<String>{'test1@example.com', 'test2@example.com'};
        
         Test.startTest();
        // Call the method
        ObjectListController.fetchEmails(selectedEmails, NULL);
        Test.stopTest();
    }

}