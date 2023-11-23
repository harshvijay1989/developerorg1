@isTest
public class AddProductControllerTest {

    @isTest
    static void testFindProducts() {
        Id recId = Schema.SObjectType.opportunity__c.getRecordTypeInfosByName().get('Product').getRecordTypeId();
        Opportunity__c opportunity = new Opportunity__c(Name = 'Test Opportunity', RecordTypeId = recId);
        insert opportunity;

        String result = AddProductController.findProducts(opportunity.Id, '', '', new List<String>{}, 10);

       
    }

    @isTest
    static void testGetProductFamily() {
        List<AddProductController.PicklistValue> productFamilyList = AddProductController.getproductfamily();

        
    }

    @isTest
    static void testSaveProducts() {
        Id recId = Schema.SObjectType.opportunity__c.getRecordTypeInfosByName().get('Opportunity Product').getRecordTypeId();
        Opportunity__c opportunity = new Opportunity__c(Name = 'Test Opportunity', RecordTypeId = recId);
        insert opportunity;
        Opportunity__c product1 = new Opportunity__c(Name = 'Product1', RecordTypeId = recId, Opportunity__r = new Opportunity__c(Id = opportunity.Id));
        Opportunity__c product2 = new Opportunity__c(Name = 'Product2', RecordTypeId = recId, Opportunity__r = new Opportunity__c(Id = opportunity.Id));
        insert new List<Opportunity__c>{product1, product2};
            
            String recordData = '[{"Name": "' + product1.Name + '", "Quantity": 5, "PDate": 10.0, "LineDescription": "Description1", "Id": "' + product1.Id + '"}, {"Name": "' + product2.Name + '", "Quantity": 3, "PDate": 5.0, "LineDescription": "Description2", "Id": "' + product2.Id + '"}]';
        
        String result = AddProductController.saveProducts(recordData, opportunity.Id);

    }

    @isTest
    static void testDoCheck() {
        
 Id recId = Schema.SObjectType.opportunity__c.getRecordTypeInfosByName().get('Opportunity Product').getRecordTypeId();
        Opportunity__c opportunity = new Opportunity__c(Name = 'Test Opportunity', RecordTypeId = recId);        insert opportunity;

        List<Opportunity__c> opportunityList = AddProductController.doCheck(opportunity.Id);

    }

}