public class HMC_ChecklistManagerController {
    @AuraEnabled
    public static string submitDealer(String recordId){
        String returnVal = '';
        system.debug('recIds'+recordId);
        try {
            Account acc = [SELECT Id,BillingPostalCode,ownerId,HMC_BU_Type__c,HMC_Stage__c From Account where Id=: Id.valueOf(recordId)];
                   system.debug('acc22'+acc);

            //String roleName = 'RSM '+acc.HMC_BU_Type__c;
            //system.debug('roleName'+roleName);
            //UserRole role = [SELECT Id from UserRole where Name=:roleName];
            //System.debug('role.id'+role.id);
            //Profile profileId = [SELECT Id from Profile where Name='System Administrator'];
            //##c Profile profileId = [SELECT Id from Profile where Name='NSM'];
            //System.debug('profileId'+profileId.Id);
           // User usr = [SELECT Id,UserRoleId,ProfileId from User where  UserRoleId =: role.Id AND ProfileId =: profileId.Id limit 1];
            User usr = [SELECT Id,UserRoleId,ProfileId,ManagerId from User where id =: acc.ownerId];
            
            System.debug('usr==================='+usr);
            /* HTTPResponse response = HMC_AXCreateDealerHandler.createDealer(Id.valueOf(recordId));
String jsonbody = response.getbody();
reponse  res = new reponse();
res = (reponse)json.deserialize(jsonbody,reponse.class);
Account acc = new Account();
acc.Id = Id.valueOf(recordId);
acc.HMC_Dealer_Code__c = res.dealerCode;
update acc; */
            List<Task> tasklst = new List<Task>();
            Task tsk = new Task();
            tsk.OwnerId = usr.ManagerId;
            tsk.WhatId = Id.valueOf(recordId);
            tsk.Status = 'Open';
            tsk.Subject = 'Dealer Onboarding Approval';
            tsk.ActivityDate = system.today().addDays(2);
            tasklst.add(tsk);
            Insert tasklst;
            acc.HMC_Stage__c = 'Sales Head Approval';
            acc.HMC_Legal_Proceeding__c = 'No';
            acc.HMC_KYC_Document__c = 'Yes';
            acc.HMC_Market_Reputation__c = 'Posetive';    
            update acc;
            returnVal = 'Success';
        } catch (Exception e) {
            returnVal = 'Error';
            throw new AuraHandledException(e.getMessage());
        }
        return returnVal;
    }
    
    public class reponse{
        public Integer StatusCode;  //200
        public String Status;   //SUCCESS
        public String Description;  //
        public string dealerCode;
        public String sourceId;
    }
    
    @AuraEnabled
    public static string createDeviationTask(String recordId,List<String> tasklist, String KYC, String marketreputation,String legalProceeding  ){
        String returnstr = '';
        try {
            Account acc = [SELECT Id,BillingPostalCode,HMC_BU_Type__c,ownerId From Account where Id=: Id.valueOf(recordId)];
            System.debug('AccName'+acc.OwnerId);
            //##C String roleName = 'NSM '+acc.HMC_BU_Type__c;
           // String roleName = 'RSM '+acc.HMC_BU_Type__c;
          //  System.debug('roleName'+roleName);
           // UserRole role = [SELECT Id,Name from UserRole where Name='RSM East 1 Firefox'];
           // Profile profileId = [SELECT Id from Profile where Name='System Administrator'];
            //##C Profile profileId = [SELECT Id from Profile where Name='NSM'];
            User usr =  [SELECT Id,UserRoleId,ProfileId,ManagerId from User where  Id =: acc.ownerId];//UserRoleId =: role.Id and ProfileId =: profileId.Id limit 1];
          //  User usr =  [SELECT Id,UserRoleId,ProfileId,ManagerId from User where  Id =: '0055h000008ubm3AAA'];
            system.debug('userCheck'+usr);
            if(acc.BillingPostalCode != ''){
                /*List<HMC_Negative_Zone__mdt> negativeZones = [SELECT Id,DeveloperName,HMC_BU_Type__c,HMC_Pin_Codes__c from HMC_Negative_Zone__mdt where HMC_BU_Type__c = 'Firefox'];
                if(!negativeZones.isEmpty() && negativeZones[0].HMC_Pin_Codes__c.contains(acc.BillingPostalCode)){
                    tasklist.add('Negative Zone');
                }*/
            }
            system.debug('managerIds'+usr.ManagerId);
            List<Task> tasklst = new List<Task>();
            Task tsk = new Task();
            tsk.OwnerId = usr.ManagerId;
            tsk.WhatId = Id.valueOf(recordId);
            tsk.Status = 'Open';
            tsk.Subject = 'Dealer Onboarding Approval';
            for(String name : tasklist){
                tsk.Description =tsk.Description + ',';
            }
            system.debug('tsk.Description'+tsk.Description);
            tsk.Description = tsk.Description.removeEnd(',');
            tsk.ActivityDate = system.today().addDays(2);
            tasklst.add(tsk);
            Insert tasklst;
            
            List<Task> deviations = new List<Task>();
            for(String task : tasklist){
                //HMC_Deviations__c deviation = new HMC_Deviations__c();
                Task deviation = new Task();
                deviation.Name__c = task +' '+ 'Deviation';
                deviation.Deviation_Type__c = task;
                deviation.Deviation_Status__c = 'Waiting for Approval';
                deviation.Account__c = Id.valueOf(recordId);
                deviations.add(deviation);
            }
            Insert deviations;
            
            acc.HMC_Stage__c = 'Sales Head Approval';
            update acc;
            returnstr = 'Success';
        } catch (Exception e) {
            returnstr = 'Error';
            throw new AuraHandledException(e.getMessage());
        }
        return returnstr;
    }
    
    @AuraEnabled
    public static string genarateDealerCode(String recordId){
        String returnVal = '';
        try {
            HTTPResponse response = HMC_AXCreateDealerHandler.createDealer(Id.valueOf(recordId));
            String jsonbody = response.getbody();
            reponse  res = new reponse();
            res = (reponse)json.deserialize(jsonbody,reponse.class);
            if(res.dealerCode !=''){
                Account acc = new Account();
                acc.Id = Id.valueOf(recordId);
                acc.HMC_Dealer_Code__c = res.dealerCode;
                //acc.RecordTypeId =  Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('Dealer_Confirm').getRecordTypeId();
                acc.HMC_Checklist_Completed__c = true;
                acc.Path_Status__c = 'Dealer Onboarded';
                update acc;
                Account accCust = [SELECT Id,HMC_Contact_Email__c,CreatedById,Name,ownerId FROM Account WHERE Id =: Id.valueOf(recordId)];
                system.debug('ownerId'+accCust.OwnerId);
                CustomNotificationType notificationType = 
                    [SELECT Id, DeveloperName FROM CustomNotificationType WHERE DeveloperName='Dealer_Onboarding'];
                
                Messaging.CustomNotification notification = new Messaging.CustomNotification();
                notification.setTitle('The finance person has approved this account  '+accCust.Name);
                notification.setBody('The finance person has approved this account' +accCust.Name );
                notification.setNotificationTypeId(notificationType.Id);
                notification.setTargetId(accCust.Id);
                notification.send(new set<String>{accCust.ownerId});
                
                List<Task> tasklist = [SELECT Id,Subject,Status FROM Task where Subject ='Document Verification' AND WhatId=: Id.valueOf(recordId)];
                if(!tasklist.isEmpty()){
                    tasklist[0].Status = 'Completed';
                }
                Update tasklist[0];
                returnVal = 'Success';
            }else{
                returnVal = res.Description;
            }
            
        } catch (Exception e) {
            returnVal = 'Error';
            throw new AuraHandledException(e.getMessage());
        }
        return returnVal;
    }
    
    @AuraEnabled
    public static string sendEmailToDealer(String recordId){
        String returnstr ='';
        try {
            List<OrgWideEmailAddress> lstEmailAddress=[select Id from OrgWideEmailAddress where DisplayName Like '%Firefox%'];
            Account acc = [SELECT Id,HMC_Contact_Email__c,CreatedById FROM Account WHERE Id =: Id.valueOf(recordId)];
            EmailTemplate emailTemplate =[Select Id,Subject,Description,HtmlValue,DeveloperName,Body from EmailTemplate WHERE Name ='Firefox Dealer Confirmation Email'];
            Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
            message.setOrgWideEmailAddressId(lstEmailAddress[0].Id); 
            message.setTargetObjectId(acc.CreatedById);
            message.setBccSender(false);
            message.setSaveAsActivity(false);
            message.setTemplateID(emailTemplate.Id);
            message.setWhatId(Id.valueOf(recordId)); 
            //This is important for the merge fields in template to work
            message.toAddresses = new String[] { acc.HMC_Contact_Email__c};
                
                Messaging.SingleEmailMessage[] messages = new   
                List<Messaging.SingleEmailMessage> {message};
                    
                    Messaging.SendEmailResult[] results =  Messaging.sendEmail(messages);
            returnstr = 'Success';
        } catch (Exception e) {
            returnstr = 'Error';
            throw new AuraHandledException(e.getMessage());
        }
        return returnstr;
    }
    
    @AuraEnabled
    public static string sendNotification(String recordId){
        String returnstr ='';
        try {
            Account acc = [SELECT Id,HMC_Contact_Email__c,CreatedById,Name,ownerId FROM Account WHERE Id =: Id.valueOf(recordId)];
            acc.HMC_Current_Step__c = 3;
            Update acc;
            CustomNotificationType notificationType = 
                [SELECT Id, DeveloperName FROM CustomNotificationType WHERE DeveloperName='Dealer_Onboarding'];
            
            Messaging.CustomNotification notification = new Messaging.CustomNotification();
            notification.setTitle('Finance person needed additional details of  '+acc.Name);
            notification.setBody('Saleshead required additional details to approve KYC related documents');
            notification.setNotificationTypeId(notificationType.Id);
            notification.setTargetId(acc.Id);
            notification.send(new set<String>{acc.ownerId});
            
            List<Task> tasklist = [SELECT Id,Subject,Status FROM Task where Subject ='Document Verification' AND WhatId=: Id.valueOf(recordId)];
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
    
    @AuraEnabled
    public static string createFinancetask(String recordId){
        String returnstr ='';
        Account acc = [Select id , name , ownerId from Account where id =: recordId ];
        try {
            User usr = [select Id,username,userrole.Developername , ManagerId from user where Id =: acc.OwnerId  ];//userrole.Developername = 'RSM_East_1_Firefox' limit 1];
            List<Task> tasklst = new List<Task>();
            Task tsk = new Task();
            tsk.OwnerId = usr.ManagerId;
            tsk.WhatId = Id.valueOf(recordId);
            tsk.Status = 'Open';
            tsk.Subject = 'Document Verification';
            tsk.ActivityDate = system.today().addDays(2);
            tasklst.add(tsk);
            Insert tasklst;
            returnstr = 'Success';
        } catch (Exception e) {
            returnstr = 'Error';
            throw new AuraHandledException(e.getMessage());
        }
        return returnstr;
    }
    
    @AuraEnabled
    public static String updateROIData(String recordId,String roi,String manpowervar, String Rentvar, String Electricityvar, String Transportvar, String overheadvar, String MonthlyAnnualVar, String BankIntrestvar, String discountvar, String MonthlyEarningsVar){
        //String returnstr ='';
        System.debug('%%%%%%%%%%'+roi);
        System.debug('%%%%%%%%%%'+manpowervar);
        System.debug('%%%%%%%%%%'+Rentvar);
        System.debug('%%%%%%%%%%'+Electricityvar); System.debug('%%%%%%%%%%'+Transportvar);
        System.debug('%%%%%%%%%%'+overheadvar);
        System.debug('%%%%%%%%%%'+MonthlyAnnualVar);
        System.debug('%%%%%%%%%%'+BankIntrestvar);
        System.debug('%%%%%%%%%%'+discountvar);
        System.debug('%%%%%%%%%%'+MonthlyEarningsVar);
        Decimal toRound = Decimal.valueOf(roi);
        /**************** After error Handling when record not save *******************/
        List<Account> accUpdate=new List<Account>();
        Account acc=new Account(); 
        
        acc.Id=Id.valueOf(recordId);
        acc.HMC_ROI_Calculation_Done__c = true;        
        acc.HMC_ROI_Score1__c = toRound.setScale(2); 
        acc.HMC_Current_Step__c = 2;
        acc.HMC_Man_Power__c = (String.isNotBlank(manpowervar) ? Decimal.valueOf(manpowervar) : 0);
        acc.HMC_Rent__c = (String.isNotBlank(Rentvar) ? Decimal.valueOf(Rentvar) : 0);
        acc.HMC_Electricity__c = (String.isNotBlank(manpowervar) ? Decimal.valueOf(Electricityvar) : 0);
        acc.HMC_Transportations__c = (String.isNotBlank(Transportvar) ? Decimal.valueOf(Transportvar) : 0);
        acc.HMC_Other_Overheads__c = (String.isNotBlank(overheadvar) ? Decimal.valueOf(overheadvar) : 0);
        acc.HMC_Annual__c = (String.isNotBlank(MonthlyAnnualVar) ? Decimal.valueOf(MonthlyAnnualVar) : 0);
        acc.HMC_Bank_Intrest__c = (String.isNotBlank(BankIntrestvar) ? Decimal.valueOf(BankIntrestvar) : 0);
        acc.HMC_Discount__c = (String.isNotBlank(discountvar) ? Decimal.valueOf(discountvar) : 0);
        acc.HMC_Monthly_Earnings__c = (String.isNotBlank(MonthlyEarningsVar) ? Decimal.valueOf(MonthlyEarningsVar) : 0);
        accUpdate.add(acc);
        if(!accUpdate.isEmpty()){
            System.debug('I am in update');
            update accUpdate;
            return 'updateDone'; 
        }
        else{
            System.debug('I am in update else');
            return 'updateNotDone';
        }
        
        
        /* ***********************OLd Code **********************************/
        
        /*try{
Account accUpdate = new Account(
Id=Id.valueOf(recordId) , 
HMC_ROI_Calculation_Done__c = true , 

HMC_ROI_Score1__c = toRound.setScale(2), 
HMC_Current_Step__c = 2,
HMC_Man_Power__c = (String.isNotBlank(manpowervar) ? Decimal.valueOf(manpowervar) : 0),
HMC_Rent__c = (String.isNotBlank(Rentvar) ? Decimal.valueOf(Rentvar) : 0),
HMC_Electricity__c = (String.isNotBlank(manpowervar) ? Decimal.valueOf(Electricityvar) : 0),
HMC_Transportations__c = (String.isNotBlank(Transportvar) ? Decimal.valueOf(Transportvar) : 0),
HMC_Other_Overheads__c = (String.isNotBlank(overheadvar) ? Decimal.valueOf(overheadvar) : 0),
HMC_Annual__c = (String.isNotBlank(MonthlyAnnualVar) ? Decimal.valueOf(MonthlyAnnualVar) : 0),
HMC_Bank_Intrest__c = (String.isNotBlank(BankIntrestvar) ? Decimal.valueOf(BankIntrestvar) : 0),
HMC_Discount__c = (String.isNotBlank(discountvar) ? Decimal.valueOf(discountvar) : 0),
HMC_Monthly_Earnings__c = (String.isNotBlank(MonthlyEarningsVar) ? Decimal.valueOf(MonthlyEarningsVar) : 0) 
);
if(accUpdate!=null){
Update accUpdate;
return 'updateDone'; 
}
else{
return 'updateNotDone';        
}

}catch(Exception oEx){

}*/
        //  return 'updateNotDone';
    }
    
    @AuraEnabled(cacheable = true)
    public static List<Task> getTasklist(String recordId){
        List<Task> tsklist = new List<Task>();
        try {
            tsklist = [SELECT Id,Subject,Status FROM Task where Subject ='Dealer Onboarding Approval' AND WhatId=: Id.valueOf(recordId) AND Status !='Completed'];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return tsklist;
    }
    
    @AuraEnabled
    public static Account getAccount(String recordId){
        return[SELECT Id,HMC_Legal_Proceeding__c,HMC_Pan_Card_Number__c,HMC_GST_Number__c,HMC_KYC_Document__c,HMC_Market_Reputation__c, HMC_ROI_Score1__c,HMC_Payment_Status__c,HMC_Comments__c, HMC_Verification_Status__c,Area__c,Customer_Group__c From Account where Id=: Id.valueOf(recordId)];
    }
    @AuraEnabled
    public static String savePaymentStatus(String recordId,String paymentStatus ){
        Account acc = new Account();
        acc.Id = recordId;
        if(paymentStatus == 'Paid in Full'){
            acc.HMC_Payment_Status__c = paymentStatus;
            acc.HMC_Current_Step__c = 4;
            createFinancetask(recordId);
        }else{
            acc.HMC_Payment_Status__c = paymentStatus;
        }
        update acc;
        return 'Success';
    }
    @AuraEnabled (cacheable = true)
    public static Account getRoiData(String recordId){
        
        return[Select Id, HMC_Man_Power__c, HMC_Rent__c, HMC_Electricity__c, HMC_Transportations__c, HMC_Other_Overheads__c, HMC_Annual__c, HMC_Bank_Intrest__c, HMC_Discount__c,HMC_Monthly_Earnings__c,HMC_ROI_Score1__c from Account where Id = : recordId];
    }
    
    
    @AuraEnabled
    public static String saveVerificationStatus(String recordId,String status, String Comments ){
        system.debug('recordId verfication'+recordId);
        system.debug('recordId status'+status);

        Account acc = new Account();
        acc.Id = recordId;
        if(status == 'Approved'){
            genarateDealerCode(recordId);
            acc.HMC_Verification_Status__c = 'Approved';
            acc.HMC_Comments__c = Comments;
            acc.HMC_Checklist_Completed__c = true;
        }else if(status == 'Rejected'){
            acc.HMC_Stage__c = 'Closed Dropped';
            acc.HMC_Comments__c = Comments;
            acc.HMC_Verification_Status__c = 'Rejected';
            return 'Success';
        }else if(status == 'Need Additional Details'){
            sendNotification(recordId);
            acc.HMC_Comments__c = Comments;
            acc.HMC_Verification_Status__c = 'Need Additional Details';
        }
        update acc;
        return '';
    }
    @AuraEnabled
    public static String saveApproval(String recordId,String Area,String Customer_Group,String KYC, String marketreputation,String legalProceeding , String gstNumber , String panCardNumber){
        system.debug('test HMC_GST_Number__c-->'+gstNumber);
        system.debug('test HMC_Pan_Card_Number__c-->'+panCardNumber);
        Account acc = new Account();
        acc.Id = recordId;
        acc.Area__c = Area;
        acc.Customer_Group__c = Customer_Group;
        acc.HMC_Legal_Proceeding__c = legalProceeding;
        acc.HMC_KYC_Document__c = KYC;
        acc.HMC_Market_Reputation__c = marketreputation;
        acc.HMC_Pan_Card_Number__c = panCardNumber;
        acc.HMC_GST_Number__c = gstNumber;
        update acc;
        system.debug('test saveApproval-->'+acc);
        return 'Success';
    }
    @AuraEnabled
    public static String submitApproval(String recordId){
        submitDealer(recordId);
        return 'Success';
    }
    @AuraEnabled
    public static String updateAbort(String recordId,String reason){
        Account acc = new Account();
        acc.Id = recordId;
        acc.HMC_Rejection_Reason__c = reason;
        acc.HMC_Stage__c = 'Closed Dropped';
        update acc;
        return 'Success';
    }
    @AuraEnabled(cacheable = true)
    public static Boolean enableSaveBtnForDocumentTab(String recordId){
        system.debug('enableSave'+recordId);
        List<Task> taskList = [SELECT Id from Task WHERE Status = 'Open' AND Subject = 'Document Verification' AND OwnerId = :UserInfo.getUserId() AND WhatId =: recordId];//OR OwnerId = '005C30000005YInIAM'
        Boolean retValue = true; 
        if(taskList.size() > 0){
            retValue = false;
        }
        return retValue;
    }
          
}