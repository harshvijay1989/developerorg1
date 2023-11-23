public class quoteSyncToOpportunity {
    @AuraEnabled
    public static String syncOpportunity(String quoteId) {
        System.debug('quoteId==> ' + quoteId);
        
        Quote__c quoteRecord = [SELECT Id, Name,Opportunity__c FROM Quote__c WHERE Id = :quoteId LIMIT 1];
        
        System.debug('quoteRecord==> ' + quoteRecord);
        
        list<Quote__c> QuoteLineItem = [select id,Name,QuoteId__c,ListPrice__c, UnitPrice__c,
                                        Quantity__c, QuoteLineDiscount__c,Total_Price__c, 
                                        LineItemDescription__c, Product__c,Product__r.Name,
                                        TotalPrice__c  from Quote__c WHERE QuoteId__c !=null and QuoteId__c =:quoteRecord.Id];
                
        System.debug('QuoteLineItem15==> ' + QuoteLineItem);
        
        List<Opportunity__c> opportunityLineItems = [select Id,List_Price__c,Discount__c, 
                                                     Product__r.Name,Sales_Price__c, Quantity__c, 
                                                     Sub_Total__c,Total_Price__c,Line_Description__c  from Opportunity__c
                                                     Where Opportunity__c !=null and Opportunity__c =:quoteRecord.Opportunity__c ];
        
        System.debug('QuoteLineItem22==> ' + opportunityLineItems);
        if(opportunityLineItems!= null){
            delete opportunityLineItems;
        }
            
        id recId=[select id,name from RecordType where name='Opportunity Product'].Id;
            List<Opportunity__c> oppLineItemToInsertList = new List<Opportunity__c>();
                for(Quote__c quoteObj:QuoteLineItem){
                    Opportunity__c oppLineItemToInsert = new Opportunity__c(
                        Name = quoteObj.Product__r.Name,
                        List_Price__c = quoteObj.ListPrice__c,
                        Discount__c = quoteObj.QuoteLineDiscount__c,
                        Product__c = quoteObj.Product__c,
                        Sales_Price__c = quoteObj.UnitPrice__c,
                        Quantity__c = quoteObj.Quantity__c,
                        Line_Description__c = quoteObj.LineItemDescription__c,
                        Opportunity__c = quoteRecord.Opportunity__c,
                        RecordTypeId = recId
                    );
                    oppLineItemToInsertList.add(oppLineItemToInsert);
                }
                System.debug('opportunityLineItems42==> ' + oppLineItemToInsertList);
                if(oppLineItemToInsertList != null){
                    insert oppLineItemToInsertList;
                }
            
        
        
        return 'null';
    }
}