trigger deleteOpportunityWithQuote on Opportunity__c (After delete) {

        Set<Id> oppIds = New Set<Id>();
    for(Opportunity__c opp : Trigger.Old){
        oppIds.add(opp.Id);
    }
    
    List<Opportunity__c> oppLst = [Select Id,(Select Id From Quotes__r),(Select  Id from Opportunity_Products__r) From Opportunity__c Where Id =: oppIds];
   delete oppLst;
}