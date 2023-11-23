trigger UpdateTotalAmountOPP on Opportunity__c (after insert, after update, after delete) {
        Set<Id> opportunityIds = new Set<Id>();

    // Collect the Opportunity IDs from the affected Opportunities
    if (Trigger.isInsert || Trigger.isUpdate) {
        for (Opportunity__c opp : Trigger.new) {
            opportunityIds.add(opp.Opportunity__c);
        }
    } else if (Trigger.isDelete) {
        for (Opportunity__c opp : Trigger.old) {
            opportunityIds.add(opp.Opportunity__c);
        }
    }

    // Query the related Opportunity records
    Map<Id, Decimal> opportunityAmountMap = new Map<Id, Decimal>();
    for (Opportunity__c opp : [SELECT Id, Amount__c, (SELECT Id, Total_Price__c FROM Opportunities__r) FROM Opportunity__c WHERE Id IN :opportunityIds]) {
        Decimal totalAmount = 0;
        for (Opportunity__c relatedOpp : opp.Opportunities__r) {
            totalAmount += relatedOpp.Total_Price__c;
        }
        opportunityAmountMap.put(opp.Id, totalAmount);
    }

    // Update the lookup field on related Opportunities
    List<Opportunity__c> opportunitiesToUpdate = new List<Opportunity__c>();
    for (Id oppId : opportunityAmountMap.keySet()) {
        Opportunity__c opp = new Opportunity__c(Id = oppId);
        opp.Amount__c=opportunityAmountMap.get(oppId);
        opportunitiesToUpdate.add(opp);
    }
     system.debug('All relted list is '+opportunitiesToUpdate);
    // Perform the update
    if (!opportunitiesToUpdate.isEmpty()) {
        update opportunitiesToUpdate;
    }

}