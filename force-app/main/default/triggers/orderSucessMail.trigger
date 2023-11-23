trigger orderSucessMail on Order__c (after insert) {
    if(Trigger.isAfter && Trigger.isInsert){
        orderSucessMailHandler.handleInsert(Trigger.new);
    }

}