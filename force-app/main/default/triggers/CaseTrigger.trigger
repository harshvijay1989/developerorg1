trigger CaseTrigger on Case (before insert,after insert) {
    if(trigger.isInsert && trigger.isAfter){
        List<Lead__c> newLeadList = new List<Lead__c>();
        for(case cas : trigger.new){
            String name = cas.SuppliedName;        
            String firstName = '';
            String lastName = '';
            List<String> parts = name.split(' ');          
            if (parts.size() >= 2) {            
                firstName = parts[0];
                lastName = parts[1];                
            } else {               
                firstName = parts[0];               
            }
            Lead__c leadObj = new Lead__c();
            leadObj.Email__c =cas.SuppliedEmail;
            leadObj.LeadSource__c ='Email';
            leadObj.Name =cas.SuppliedName;   
            leadObj.FirstName__c =firstName;         
            leadObj.LastName__c =lastName;  
            leadObj.Description__c = cas.Description;
            newLeadList.add(leadObj);
        }
        if(!newLeadList.isEmpty()){
            insert newLeadList;
        }
        /*for(Task tk :[SELECT Id,WhatId from Task WHERE WhatId = :trigger.new]){
            tk.WhatId = newLeadList[0].Id;
            UPDATE tk;
        }*/
    }   
}