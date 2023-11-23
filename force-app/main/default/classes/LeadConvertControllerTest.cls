@isTest
public class LeadConvertControllerTest {
    
    @isTest
    static void testGetLeadRec() {
        Account acc = new Account(
            Name = 'Test Account',
            
            //ParentId = parentAccount.ID,
            Industry = 'Technology'
            
            
        );
        INSERT acc;
        Lead__c testLead = new Lead__c(
            Name = 'Test Lead'
            
        );
        insert testLead;
        Lead__c testLead2 = new Lead__c(
            Name = 'Test Lead'
            
        );
        insert testLead2;
        
        LeadConvertController.DataWrapper result = LeadConvertController.getLeadRec(testLead.Id);
        
        
        
    }
    
    @isTest
    static void testSaveData() {
        Lead__c testLead = new Lead__c(
            Name = 'Test Lead'
            
        );
        insert testLead;
        
        LeadConvertController.WrapperShowDetails testWrapper1 = new LeadConvertController.WrapperShowDetails();
        LeadConvertController.WrapperShowDetails testWrapper2 = new LeadConvertController.WrapperShowDetails();
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
        Contact con = new Contact(LastName='Test',Email='test@abc.Com');
        insert con;
        list<Contact> conlist =new list<Contact>();
        conlist.add(con);
        list<Account> accList = new list<Account>();
        accList.add(testAccount);
        testWrapper1.accObj=testAccount;
        testWrapper2.accExisting=accList;
        testWrapper2.conExisting= conlist;
        testWrapper2.CreateOppVar=true;
       
        
        // Create and set values for the testWrapper object
        
        String serializedWrapper1 = JSON.serialize(testWrapper1);
        String serializedWrapper2 = JSON.serialize(testWrapper2);
        
        String result = LeadConvertController.saveData(serializedWrapper1, testLead.Id);
        String result2 = LeadConvertController.saveData(serializedWrapper2, testLead.Id);
        System.assertNotEquals(null, result);
        // Add more assertions to validate the result string or other expected behavior
    }
    
    @isTest
    static void testGtAccId() {
        
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

        
        String result = LeadConvertController.gtAccId(testAccount.Id);
        
    }
}