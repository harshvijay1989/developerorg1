trigger OpportunityLineItemsToQuoteLineItems on Quote__c (after insert, after update,after delete) {
    if (Trigger.isAfter && (Trigger.isInsert)) {
        if(!OppToQuoteTriggerHandler.runOnce()){
            OppToQuoteTriggerHandler.handleQuoteInsert(Trigger.new);   
        }
    }
    if(Trigger.isDelete && Trigger.isAfter){
        if(!OppToQuoteTriggerHandler.runOnce()){
            OppToQuoteTriggerHandler.haldleDelete(trigger.old);
        }
    }
    if(Trigger.isAfter && Trigger.isUpdate){
        if(!OppToQuoteTriggerHandler.runOnce()){
            OppToQuoteTriggerHandler.handleQuoteUpdate(trigger.new);
        }
    }
}