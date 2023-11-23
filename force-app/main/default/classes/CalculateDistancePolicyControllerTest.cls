@isTest
public class CalculateDistancePolicyControllerTest {
    
    @isTest
    static void testGetAddressDetails() {
        Account testAccount = new Account(
            Name = 'Test Account 1',
            BillingPostalCode = '12345',
            BillingLatitude = 0.0,
            BillingLongitude = 0.0
        );
        insert testAccount;
        
        Account result = CalculateDistancePolicyController.getAddressDetails(testAccount.Id);
        System.assertNotEquals(null, result);
    }
    
    @isTest
    static void testCalculateDistanceWithValidAddress() {
        // Test calculateDistance method with valid address
        Account testAccount = new Account(
            Name = 'Test Account',
            BillingPostalCode = '12345',
            BillingLatitude = 0.0,
            BillingLongitude = 0.0
        );
        insert testAccount;
        
        String result = CalculateDistancePolicyController.calculateDistance(testAccount.Id);
        System.assertEquals('Success', result);
        
        // Verify the updated account fields
        Account updatedAccount = [SELECT Id, Distance_Policy_Approval_Required__c, 
                                  Distance_Policy_Approval_Status__c, Distance_Calculated__c
                                  FROM Account WHERE Id = :testAccount.Id];
        System.assertEquals(true, updatedAccount.Distance_Policy_Approval_Required__c);
        System.assertEquals('Required', updatedAccount.Distance_Policy_Approval_Status__c);
        System.assertEquals(true, updatedAccount.Distance_Calculated__c);
    }
    
    @isTest
    static void testCalculateDistanceWithValidAddressWithin3Km() {
        // Test calculateDistance method with valid address within 3 km
        Account testAccount1 = new Account(
            Name = 'Test Account 1',
            BillingPostalCode = '12345',
            BillingLatitude = 0.0,
            BillingLongitude = 0.0
        );
        Account testAccount2 = new Account(
            Name = 'Test Account 2',
            BillingPostalCode = '12345',
            BillingLatitude = 0.01,
            BillingLongitude = 0.01
        );
        insert new List<Account>{testAccount1, testAccount2};
            
            String result = CalculateDistancePolicyController.calculateDistance(testAccount2.Id);
        System.assertEquals('Success', result);
        
        // Verify the updated account fields
        Account updatedAccount = [SELECT Id, Distance_Policy_Approval_Required__c, 
                                  Distance_Policy_Approval_Status__c, Distance_Calculated__c
                                  FROM Account WHERE Id = :testAccount1.Id];
    }
    
    @isTest
    static void testCalculateDistanceWithInvalidAddress() {
        // Test calculateDistance method with invalid address
        Account testAccount = new Account(
            Name = 'Test Account',
            BillingPostalCode = '12345',
            BillingLatitude = null,
            BillingLongitude = null
        );
        insert testAccount;
        
        String result = CalculateDistancePolicyController.calculateDistance(testAccount.Id);

    }
    
@isTest
static void testCalculateDistanceWithDuplicateAddresses() {
    // Test calculateDistance method with duplicate addresses
    Account testAccount1 = new Account(
        Name = 'Test Account 1',
        BillingPostalCode = '12345',
        BillingLatitude = 0.0,
        BillingLongitude = 0.0
    );
    Account testAccount2 = new Account(
        Name = 'Test Account 2',
        BillingPostalCode = '12345',
        BillingLatitude = 0.0,
        BillingLongitude = 0.0,
        ShippingPostalCode = '12345', // Ensure ShippingPostalCode is not blank
        ShippingLatitude = 1.0,       // Set valid Shipping Latitude
        ShippingLongitude = 1.0       // Set valid Shipping Longitude
    );
    insert new List<Account>{testAccount1, testAccount2};
    
    // Call your main class method
    String result = CalculateDistancePolicyController.calculateDistance(testAccount2.Id);
    System.assertEquals('Success', result, 'Distance calculation should return success');
    
    // Verify the updated account fields for testAccount1 (since testAccount2 is being updated)
    Account updatedAccount = [SELECT Id, Distance_Policy_Approval_Required__c, 
                              Distance_Policy_Approval_Status__c, Distance_Calculated__c,
                              Distance_approval_reason__c
                              FROM Account WHERE Id = :testAccount1.Id];
    

}


}