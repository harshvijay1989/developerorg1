// OpportunityQuotesController.cls
public with sharing class OpportunityQuotesController {

    @AuraEnabled(cacheable=true)
    public static List<Quote__c> getRelatedQuotes(Id opportunityId) {
        IF(opportunityId != null){
            system.debug('opportunityId==> '+ opportunityId);
            List<Quote__c> quotes = [SELECT Id, Name, ExpirationDate__c, Status__c,	QuoteNumber__c FROM Quote__c WHERE Opportunity__c = :opportunityId ORDER BY CreatedDate DESC LIMIT 1];
            system.debug('quotes==> '+ quotes);
            return quotes;
        }ELSE{
            return null;
        }
      }
}