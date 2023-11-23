@isTest
private class OrderSuccessMailHandlerTest {

    @isTest static void testHandleInsert() {
        Account testAccount = new Account(Name ='Test Account');
        insert testAccount;
        Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'Contact',
            Email = 'abc@gmail.com'
        );
        /* Contect  testContect= new Contact(
         FirstName='Test',
         LastName='Contact',
         Email='abc@gmail.com                
         ) */
        insert testContact;
        Contract testContract = new Contract(
            AccountId = testAccount.Id,
            Status = 'Draft', 
            StartDate = Date.today(),
            ContractTerm=8,
            CustomerSignedId = testContact.Id
        );
        insert testContract;
        Order__c testOrder = new Order__c(
            Name = 'Test Order',
            ContractId__c = testContract.Id,
            AccountId__c = testAccount.Id,
            EffectiveDate__c = System.today(),
            Status__c = 'Draft'
            
        );
        insert testOrder;
        
        List<Order__c> orderList = new List<Order__c>{testOrder};
        Test.startTest();
        orderSucessMailHandler.handleInsert(orderList);
        Test.stopTest();

       
    }
}