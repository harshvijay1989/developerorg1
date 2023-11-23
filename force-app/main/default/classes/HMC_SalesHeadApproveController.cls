public class HMC_SalesHeadApproveController {
    @AuraEnabled(cacheable = true)
    public static List<Task> getDeviations(String recordId){
        List<Task> deviations = new List<Task>();
        try {
            deviations = [SELECT Id,Account__c,Deviation_Status__c,Deviation_Type__c,HMC_Comments__c from Task where Account__c =: Id.valueOf(recordId) AND Deviation_Status__c != 'Approved' AND Deviation_Status__c != 'Rejected'];

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return deviations;
    }

    @AuraEnabled
    public static string updateDeviations(Object data,String recordId){
        String returnstr = '';
        try {
            Account acc = [SELECT Id,BillingPostalCode,ownerId,HMC_BU_Type__c,HMC_Current_Step__c,Name,CreatedById From Account where Id=: Id.valueOf(recordId)];
            Integer count = 0;
            List<Task> updatedeviations = (List<Task>) JSON.deserialize(JSON.serialize(data),List<Task>.class);
            system.debug('updatedeviations'+updatedeviations);
            Update updatedeviations;
            for(Task deviation : updatedeviations){
                if(deviation.Deviation_Status__c == 'Rejected' || deviation.Deviation_Status__c == 'Needed additional Information'){
                    count = count +1;
                }
            }
            

            if(count == 0){
                acc.HMC_Current_Step__c = 3;
                Update acc;

                CustomNotificationType notificationType = 
                [SELECT Id, DeveloperName 
                FROM CustomNotificationType 
                WHERE DeveloperName='Dealer_Onboarding'];
            
                Messaging.CustomNotification notification = new Messaging.CustomNotification();
                notification.setTitle('SalesHead Approved Deviations of  '+acc.Name);
                notification.setBody('SalesHead Approved Deviations of  '+acc.Name);
                notification.setNotificationTypeId(notificationType.Id);
                notification.setTargetId(acc.Id);
                notification.send(new set<String>{acc.ownerId});
            }else{
                acc.HMC_Current_Step__c = 2;
                acc.HMC_Stage__c = 'Onboarding Initiation';
                Update acc;
                CustomNotificationType notificationType = 
                [SELECT Id, DeveloperName 
                FROM CustomNotificationType 
                WHERE DeveloperName='Dealer_Onboarding'];
            
                Messaging.CustomNotification notification = new Messaging.CustomNotification();
                notification.setTitle('SalesHead rejected documents of  '+acc.Name);
                notification.setBody('SalesHead rejected KYC documents of  '+acc.Name);
                notification.setNotificationTypeId(notificationType.Id);
                notification.setTargetId(acc.Id);
                notification.send(new set<String>{acc.ownerId});
            }


            List<Task> tasklist = [SELECT Id,Subject,Status FROM Task where Subject ='Dealer Onboarding Approval' AND WhatId=: Id.valueOf(recordId) AND Status !='Completed'];
            if(!tasklist.isEmpty()){
                tasklist[0].Status = 'Completed';
            }
            Update tasklist[0];
            returnstr = 'Success';
        } catch (Exception e) {
           returnstr = 'Error';
            throw new AuraHandledException(e.getMessage());
        }
        return returnstr;
    }

    @AuraEnabled(cacheable = true)
    public static List<Task> getTasklist(String recordId){
        String userId  = UserInfo.getUserId();
        List<Task> tsklist = new List<Task>();
        try {
            tsklist = [SELECT Id,Subject,Status FROM Task where Subject ='Dealer Onboarding Approval' AND WhatId=: Id.valueOf(recordId) AND Status !='Completed' AND OwnerId =: Id.valueOf(userId)];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return tsklist;
    }

    @AuraEnabled
    public static string closetask(String recordId){
        String returnstr = '';
        try {
            Account acc1 = [SELECT Id,Name,CreatedById,ownerId From Account where Id=: Id.valueOf(recordId)];
            List<Task> tsklist = new List<Task>();
            tsklist = [SELECT Id,Subject,Status FROM Task where Subject ='Dealer Onboarding Approval' AND WhatId=: Id.valueOf(recordId) AND Status !='Completed'];
            tsklist[0].Status = 'Completed';
            Update tsklist;

            Account acc = new Account();
            acc.Id = Id.valueOf(recordId);
            acc.HMC_Current_Step__c = 3;
            acc.HMC_Deviation_Approval_Status__c = 'Approved';
            update acc;

            CustomNotificationType notificationType = 
                [SELECT Id, DeveloperName 
                FROM CustomNotificationType 
                WHERE DeveloperName='Dealer_Onboarding'];
            
                Messaging.CustomNotification notification = new Messaging.CustomNotification();
                notification.setTitle('SalesHead Approved Dealer onboarding process of  '+acc1.Name);
                notification.setBody('SalesHead Approved Dealer onboarding process of    '+acc1.Name);
                notification.setNotificationTypeId(notificationType.Id);
                notification.setTargetId(acc1.Id);
                notification.send(new set<String>{acc1.ownerId});

            returnstr = 'Success';
        } catch (Exception e) {
            returnstr = 'Error';
            throw new AuraHandledException(e.getMessage());
        }
        return returnstr;
    }

    @AuraEnabled
    public static string closetaskReject(String recordId){
        String returnstr = '';
        try {
            List<Task> tsklist = new List<Task>();
            Account acc1 = [SELECT Id,Name,CreatedById,ownerId From Account where Id=: Id.valueOf(recordId)];
            tsklist = [SELECT Id,Subject,Status FROM Task where Subject ='Dealer Onboarding Approval' AND WhatId=: Id.valueOf(recordId) AND Status !='Completed'];
            tsklist[0].Status = 'Completed';
            Update tsklist;

            Account acc = new Account();
            acc.Id = Id.valueOf(recordId);
            acc.HMC_Current_Step__c = 3;
            acc.HMC_Deviation_Approval_Status__c = 'Rejected';
            update acc;

            CustomNotificationType notificationType = 
                [SELECT Id, DeveloperName 
                FROM CustomNotificationType 
                WHERE DeveloperName='Dealer_Onboarding'];
            
                Messaging.CustomNotification notification = new Messaging.CustomNotification();
                notification.setTitle('SalesHead rejected Dealer onboarding process of  '+acc1.Name);
                notification.setBody('SalesHead rejected Dealer onboarding process of    '+acc1.Name);
                notification.setNotificationTypeId(notificationType.Id);
                notification.setTargetId(acc1.Id);
                notification.send(new set<String>{acc1.ownerId});
            returnstr = 'Success';
        } catch (Exception e) {
            returnstr = 'Error';
            throw new AuraHandledException(e.getMessage());
        }
        return returnstr;
    }
    
}