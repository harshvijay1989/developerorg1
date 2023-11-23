public class LeadConvertController {
    @AuraEnabled
    public static DataWrapper getLeadRec (Id LeadId) {
        system.debug('Rec Id '+LeadId);
        DataWrapper DataWrapperObj=new DataWrapper();
        Lead__c leadObj = [select id,Phone__c, Company__c, Name,FirstName__c,LastName__c,CreatedBy.name,CreatedById,Owner.name,OwnerId from Lead__c  where Id =: LeadId];
        system.debug('leadObj===> '+leadObj);
        DataWrapperObj.name=leadObj.Name;
        DataWrapperObj.CompanyName=leadObj.Company__c;
        DataWrapperObj.phon=leadObj.Phone__c;
        DataWrapperObj.CreatedByName=leadObj.CreatedBy.name;
        DataWrapperObj.CreatedId = leadObj.CreatedById;
        DataWrapperObj.OwnrName = leadObj.Owner.Name;
        DataWrapperObj.OwnrName = leadObj.Owner.Name;
        DataWrapperObj.FirstName=leadObj.FirstName__c;
        DataWrapperObj.LastName=leadObj.LastName__c;
        if(string.valueOf(leadObj.OwnerId).startsWith('005')){
            DataWrapperObj.OwnrId = leadObj.Owner.Name;
        }
        if(string.valueOf(leadObj.OwnerId).startsWith('00G')){
            DataWrapperObj.OwnrId = UserInfo.getName();
        }
        // DataWrapperObj.OwnrId = leadObj.OwnerId;
        DataWrapperObj.leadObj=leadObj;
        system.debug('leadlst '+leadObj);
        return DataWrapperObj;
    }
    
    @AuraEnabled
    public static String saveData(String WrapperDetails, Id LeadId) {
        System.debug('LeadId ' + LeadId);
        System.debug('WrapperDetails ' + WrapperDetails);
        
        try {
            WrapperShowDetails obj = (WrapperShowDetails) JSON.deserialize(WrapperDetails, WrapperShowDetails.class);
            String LeadConvertAccId;
            if (obj != null) {
                // Query the Lead__c record
                Lead__c leadRec = [SELECT Id, Name,LastName__c,FirstName__c,Phone__c,Email__c, OwnerId, Company__c,Address__City__s ,Address__PostalCode__s,Address__Street__s, 
                                   Address__StateCode__s, Address__CountryCode__s
                                   FROM Lead__c WHERE Id = :LeadId];
                System.debug('obj========>2 ' + obj);
                // Create an Account record
                Account accountToCreate = new Account();
                if(obj.accExisting!=null){
                    accountToCreate.Id=obj.accExisting[0].Id;
                    accountToCreate.BillingCity = leadRec.Address__City__s;
                    accountToCreate.BillingPostalCode = leadRec.Address__PostalCode__s;
                    accountToCreate.BillingStreet = leadRec.Address__Street__s;
                    accountTocreate.BillingCountry = leadRec.Address__CountryCode__s;
                    accountTocreate.BillingState = leadRec.Address__StateCode__s;
                    update accountToCreate;
                    
                }else{
                    
                    accountToCreate.Name = obj.accObj.Name;
                    accountToCreate.Phone = obj.accObj.Phone;
                    accountToCreate.BillingCity = leadRec.Address__City__s;
                    accountToCreate.BillingPostalCode = leadRec.Address__PostalCode__s;
                    accountToCreate.BillingStreet = leadRec.Address__Street__s;
                    accountTocreate.BillingCountry = leadRec.Address__CountryCode__s;
                    accountTocreate.BillingState = leadRec.Address__StateCode__s;
                    // Set the Account name
                    // Set other fields from the leadRec if needed
                    // Example: accountToCreate.Field__c = leadRec.Field__c;
                    
                    // Insert the Account record
                    insert accountToCreate;
                }
                Contact con = new Contact ();
                if(obj.conExisting!=null){
                    
                   Contact existingContact = [SELECT Id,Phone,FirstName,LastName FROM Contact WHERE Id = :obj.conExisting[0].Id LIMIT 1];
                    con.FirstName=(existingContact.FirstName != null ? existingContact.FirstName:'');
                    con.LastName=existingContact.LastName;
                    con.Email = leadRec.Email__c;
                    con.Phone = existingContact.Phone;
                    con.AccountId = accountToCreate.Id;
                    insert con;
                    
                }else{
                    con.LastName = obj.conObj.FirstName + ' ' + obj.conObj.LastName;
                    con.Email = leadRec.Email__c;
                    con.Phone = obj.accObj.Phone;
                    con.AccountId = accountToCreate.Id;
                    insert con;	
                }
                id recID=[select id,name from RecordType where name='Opportunity'].Id;
                // Create an Opportunity record
                Opportunity__c opportunityToCreate = new Opportunity__c();
                if(!obj.CreateOppVar){
                    
                         system.debug('obj.oppObj.Name else ==> '+obj.oppObj.Name);
                        opportunityToCreate.Name = obj.oppObj.Name;
                        opportunityToCreate.Stage__c = 'Prospecting'; 
                        opportunityToCreate.Close_Date__c = Date.today()+7;
                        opportunityToCreate.Account_Name__c = accountToCreate.Id;
                        opportunityToCreate.RecordTypeId =recID;
                        opportunityToCreate.Primary_contact__c = con.id;
                        insert opportunityToCreate;
                        
                    
                }
                //leadRec.Status__c = 'Converted';
                if(leadRec !=null){
                    Lead__c ld= new Lead__c();
                    ld.Id=LeadId;
                    ld.Status__c='Converted';
                    update ld;
                   
                }

                
                return 'Lead Successfully Converted!!.'+accountToCreate.Id+'.'+leadRec.Name+'.'+con.Id+'.'+opportunityToCreate.Id;
            }
            
        } catch (Exception e) {
            System.debug(e);
            return e.getMessage();
        }
        return 'Conversion failed';
    }
    
    @AuraEnabled
    public static String gtAccId (String accId) {
        System.debug('accId===>>>>'+accId);
        return accId;
        
    }
    
    @AuraEnabled
    public static Map<String, Object> pushLeadToSAP(String recId){
        system.debug('accountId===> '+recId);
        Map<String, Object> validation = validateLead(recId);
        if( validation.containsKey('hasError') && (Boolean)validation.get('hasError')){
            System.debug(validation);
            return validation;            
        }else{
            return null;
        }
      
        

    }

     Public static Map<String, Object> validateLead(String recId){
        Map<String, Object> response = new Map<String, Object>();
        response.put('hasError', false);
        List<Lead__c> LeadList = [select id,Status__c from Lead__c where id=:recId];
        if(!LeadList.isEmpty()){
            if(LeadList[0].Status__c != 'Qualified'){
                response.put('errorMessage', 'can not convert Lead , Status should be Qualified');
                response.put('hasError', true);
            }

        }else{
            response.put('errorMessage', 'No Record Found');
            response.put('hasError', true);
        }        
        return response;
    }    
    // --------------------------------------------------------------------------------//
    public class DataWrapper{
        @AuraEnabled
        public Lead__c leadObj;
        @AuraEnabled
        public string name;
        @AuraEnabled
        public string CompanyName;
        @AuraEnabled
        public String Nin;
        @AuraEnabled
        public String phon;
        @AuraEnabled
        public String CreatedByName;
        @AuraEnabled
        public String CreatedId;
        @AuraEnabled
        public String OwnrName;
        @AuraEnabled
        public String OwnrId;
        @AuraEnabled
        public String FirstName;
        @AuraEnabled
        public String LastName;
    }
    public class WrapperShowDetails{
        public Account accObj;
        public Contact conObj;
        public List<Account> accExisting;
        public List<Contact> conExisting;
        public Opportunity__c oppObj;
        public List<Opportunity__c> oppExisting;
        public User userRec;
        public Boolean CreateOppVar;
        public string RecTypeName;
    } 
}