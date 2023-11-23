public class leadSucessClass {

    @AuraEnabled(cacheable=true)
    public static String getAccountDetails(String accountId ) {
        Account acc = [SELECT Id, Name, Phone, Path_Status__c, Area__c, Owner.Name
                  FROM Account
                  WHERE Id = :accountId
                  LIMIT 1];
        
        String accountJson = JSON.serialize(acc);
        return accountJson;
    }

    @AuraEnabled(cacheable=true)
    public static String getContactDetails(string contactId) {
        system.debug('contactId'+contactId);
        Contact contacts = [SELECT Id,Name,Phone, Email,Account.Name 
                                  FROM Contact
                                  WHERE Id = :contactId 
                                  LIMIT 1];
        String contactJson = JSON.serialize(contacts);
        return contactJson;
    }

    @AuraEnabled(cacheable=true)
    public static String getOpportunityDetails(String oppId) {
        if(oppId!= null){
        Opportunity__c opportunities = [SELECT Id, Name,Close_Date__c, Amount__c, Owner.Name, Primary_contact__r.Name,Account_Name__r.Name
                                            FROM Opportunity__c 
                                            WHERE Id = :oppId 
                                        LIMIT 1];
            
        if(opportunities != null){
        String opportunityJson = JSON.serialize(opportunities);
            return opportunityJson;
        }
        else {
            return 'Null';
        }
       // if(opportunityJson != null){
        }
        return 'Null';
        
        
            
        }
    }