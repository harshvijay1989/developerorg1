public class CalculateDistancePolicyController {
    @AuraEnabled(cacheable=true)
    public static Account getAddressDetails(string recordId) {
        System.debug('jhbjsdvj'+recordId);
        list<Account> accLst = [select Id, Distance_Calculated__c from Account where Id =: recordId];
        system.debug('accLst'+accLst);
        return [select Id, Distance_Calculated__c from Account where Id =: recordId ];
        
	    }
    @AuraEnabled
    public static String calculateDistance(String leadId){
        String message = '';
        try{
            Map<Id,Account> distanceUpdateLeadMap = new Map<Id,Account>();
            List<Account> ldLstResult = [select id,OwnerId,Distance_Policy_Approval_Required__c,BillingPostalCode,BillingLatitude,BillingLongitude,ShippingPostalCode ,ShippingLatitude, ShippingLongitude  from Account where id = : leadId];
            System.debug('OwnerId: '+ldLstResult[0].OwnerId);
            System.debug('ldLstResult[0].PostalCode'+ldLstResult[0].BillingPostalCode);
            if(String.isNotBlank(ldLstResult[0].BillingPostalCode)){
                Map<String,List<Account>> pincodeLeadMap = new Map<String,List<Account>>();
                System.debug('ldLstResult[0].Latitude'+ldLstResult[0].BillingLatitude);
                System.debug('ldLstResult[0].Longitude'+ldLstResult[0].BillingLongitude);
                if(ldLstResult[0].BillingLatitude == null || ldLstResult[0].BillingLongitude == null){
                   return 'Please populate the valid address';
                }
                Location loc1 = Location.newInstance(ldLstResult[0].BillingLatitude,ldLstResult[0].BillingLongitude);
                
                for(Account ld : [select id,Name,BillingLatitude, BillingLongitude,BillingPostalCode,Distance_Policy_Approval_Required__c from Account where BillingPostalCode = : ldLstResult[0].BillingPostalCode and id !=: leadId]){
                    if(String.isNotBlank(ld.BillingPostalCode) && ld.BillingLatitude != null && ld.BillingLongitude != null){
                        Location loc2 = Location.newInstance(ld.BillingLatitude,ld.BillingLongitude);
                        Double dist = Location.getDistance(loc1, loc2, 'km');
                        system.debug('dist'+dist);
                        if(dist <= 3){
                            System.debug('1.7.1###' + dist );
                            //if(ldLstResult[0].HMC_Distance_Policy_Approval_Required__c == false){
                            Account ldupdate = new Account(Id = leadId,Distance_Policy_Approval_Required__c = true,Distance_Policy_Approval_Status__c='Required',Distance_Calculated__c=true);
                            if(distanceUpdateLeadMap.containsKey(leadId)){
                                ldupdate.Distance_approval_reason__c = 'Dealer lead present with in 3 KM -' + ld.Name + '\n';
                            }
                            distanceUpdateLeadMap.put(leadId,ldupdate);
                            //}
                        }
                    }                }
                for(Account accRec : [select id,Name,ShippingLatitude, ShippingLongitude,ShippingPostalCode  from Account where (BillingPostalCode = : ldLstResult[0].BillingPostalCode OR ShippingPostalCode = :ldLstResult[0].ShippingPostalCode) AND  id !=: leadId]){
                    if(String.isNotBlank(accrec.ShippingPostalCode) && accrec.ShippingLatitude != null && accrec.ShippingLongitude != null){
                        Location loc2 = Location.newInstance(accrec.ShippingLatitude,accrec.ShippingLongitude);
                        Double dist = Location.getDistance(loc1, loc2, 'km');
                        if(dist <= 3){
                            System.debug('1.7.1###' + dist );
                            //if(ldLstResult[0].HMC_Distance_Policy_Approval_Required__c == false){
                            Account ldupdate = new Account(Id = leadId,Distance_Policy_Approval_Required__c = true,Distance_Policy_Approval_Status__c='Required',Distance_Calculated__c=true);
                            if(distanceUpdateLeadMap.containsKey(leadId)){
                                ldupdate.Distance_approval_reason__c = 'Dealer account present with in 3 KM -' + accrec.Name + '\n';
                            }
                            distanceUpdateLeadMap.put(leadId,ldupdate);
                            //}
                        }else{
                            loc2 = Location.newInstance(accrec.ShippingLatitude,accrec.ShippingLongitude);
                            system.debug('loc2'+loc2);
                            system.debug('loc1'+loc1);
                            dist = Location.getDistance(loc1, loc2, 'km');
                            system.debug('dist'+dist);
                            if(dist <= 3){
                                System.debug('1.7.1###' + dist );
                                //if(ldLstResult[0].HMC_Distance_Policy_Approval_Required__c == false){
                                Account ldupdate = new Account(Id = leadId,Distance_Policy_Approval_Required__c = true,Distance_Policy_Approval_Status__c='Required',Distance_Calculated__c=true);
                                if(distanceUpdateLeadMap.containsKey(leadId)){
                                    ldupdate.Distance_approval_reason__c = 'Dealer account present with in 3 KM -' + accRec.Name + '\n';
                                }
                                distanceUpdateLeadMap.put(leadId,ldupdate);
                                //}
                            }
                        }
                    }
                }
                System.debug('1.8###' + distanceUpdateLeadMap);
                
                if(!distanceUpdateLeadMap.isEmpty()){
                   // HMC_LeadTriggerHandler.skipLeadTrigger= true;
                    update distanceUpdateLeadMap.values();
                    message = 'Not valid distance Approvel Required';
                }else{
                    Account ldupdate = new Account(Id = leadId,Distance_Calculated__c=true,Distance_Policy_Approval_Status__c='Not Required',Path_Status__c = 'Qualified');
                    UPDATE ldupdate;
                    message = 'Success';
                }

            }
        }catch(Exception e){
            message = e.getMessage()+e.getLineNumber();
            system.debug('message error 99 '+message);
        }
        System.debug('message=>'+message);
        return message;        
    }
}