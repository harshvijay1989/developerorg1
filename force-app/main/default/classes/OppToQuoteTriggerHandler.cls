public class OppToQuoteTriggerHandler {
    private static Boolean hasRun = false;
    
    public static Boolean runOnce() {
        if (!hasRun) {
            hasRun = true;
            return false;
        } else {
            return true;
        }
    }
    
    public static void handleQuoteInsert(List<Quote__c> newList) {
        if (newList[0].Opportunity__c != null) {
            System.debug('Handling Quote Insert');
            Id recdId = [SELECT Id FROM RecordType WHERE DeveloperName = 'Quote_Item' LIMIT 1].Id;
            List<Quote__c> quoteLineItemsToInsert = new List<Quote__c>();
            Set<Id> oppIds = new Set<Id>();
            List<Id> quoteIds = new List<Id>();
            
            for (Quote__c quote : newList) {
                if (quote.Opportunity__c != null) {
                    oppIds.add(quote.Opportunity__c);
                    quoteIds.add(quote.Id);
                }
            }
            
            List<Opportunity__c> accountList = [SELECT Id, Amount__c, Account_name__c, Account_name__r.BillingAddress,
                                                Account_name__r.ShippingAddress, Account_Name__r.Name FROM Opportunity__c WHERE Id IN :oppIds];
            
            Account acc = [SELECT Id, BillingStreet, BillingCity, BillingState, BillingPostalCode,
                           BillingCountry, ShippingStreet, ShippingCity, ShippingState, ShippingPostalCode, ShippingCountry
                           FROM Account WHERE Id = :accountList[0].Account_name__c];
            
            if (!oppIds.isEmpty()) {
                List<Opportunity__c> opportunityLineItems = [SELECT Name, Id, List_Price__c, Discount__c,
                                                             Product__r.Name, Sales_Price__c, Quantity__c, Sub_Total__c, Total_Price__c, Line_Description__c
                                                             FROM Opportunity__c WHERE Opportunity__c != null AND Opportunity__c = :oppIds];
                if(!opportunityLineItems.isEmpty()){
                    for (Opportunity__c opportunityLineItem : opportunityLineItems) {
                        Quote__c quoteLineItem = new Quote__c(
                            Name = opportunityLineItem.Name,
                            Product__c = opportunityLineItem.Product__c,
                            Quantity__c = opportunityLineItem.Quantity__c,
                            ListPrice__c = opportunityLineItem.List_Price__c,
                            UnitPrice__c = opportunityLineItem.Sales_Price__c,
                            Subtotal__c = opportunityLineItem.Sub_Total__c,
                            QuoteLineDiscount__c = opportunityLineItem.Discount__c,
                            LineItemDescription__c = opportunityLineItem.Line_Description__c,
                            QuoteId__c = quoteIds[0],
                            
                            RecordTypeId = recdId
                        );
                        
                        quoteLineItemsToInsert.add(quoteLineItem);
                    }
                    
                    insert quoteLineItemsToInsert;
                    
                    Quote__c quoToUpdate = new Quote__c(
                        Id = quoteIds[0],
                        Account_Name__c = accountList[0].Account_Name__c,
                        Subtotal__c = accountList[0].Amount__c,
                        Bill_To_Name__c = accountList[0].Account_name__r.Name,
                        ShippingName__c = accountList[0].Account_name__r.Name,
                        ShippingAddress__City__s = acc.ShippingCity,
                        ShippingAddress__PostalCode__s = acc.ShippingPostalCode,
                        Bill_To__City__s = acc.BillingCity,
                        Bill_To__PostalCode__s = acc.BillingPostalCode,
                        ShippingAddress__Street__s = acc.ShippingStreet,
                        Bill_To__Street__s = acc.BillingStreet,
                        Discount__c=0.0,
                        ShippingHandling__c=0.0
                    );
                    
                    update quoToUpdate;
                }
            }
        } /*else{
system.debug('start');
id quoteId=newList[0].QuoteId__c;
double amount=0.00;
list<Quote__c> Quoteamount =[select id,TotalPrice__c,QuoteId__c from Quote__c where QuoteId__c =:quoteId];
system.debug('before update' +amount);
for(Quote__c qu:Quoteamount){
if(qu.TotalPrice__c!=null){
amount+=qu.TotalPrice__c;
}
}
system.debug('after update' +amount);
Quote__c  quoToUpdate=new  Quote__c();
quoToUpdate.Id=quoteId;
quoToUpdate.Subtotal__c=amount;
system.debug('amount jjshjsh'+quoToUpdate);
if(quoToUpdate!=null){
update quoToUpdate;
}
}
*/        
    }
    
    
    public static void handleQuoteUpdate(List<Quote__c> newList) {
        id quoteId=newList[0].QuoteId__c; 
        system.debug('newList'+newList);
        list<Quote__c> quoToUpdateList = new list<Quote__c>();
        if (newList[0].RecordTypeId!='0121m000000DseDAAS') {
            System.debug('Handling Quote Update');
            for(Quote__c qu:newList){
                if(qu.Id!=null){
                    Quote__c quoToUpdate = new Quote__c();
                    quoToUpdate.id=qu.id;
                    quoToUpdate.name = qu.Name;
                    quoToUpdate.Discount__c=qu.Discount__c;
                    quoToUpdate.Subtotal__c = qu.Subtotal__c;
                    quoToUpdate.ExpirationDate__c=qu.ExpirationDate__c;
                    quoToUpdateList.add(quoToUpdate);
                }
            }
            
            if(quoToUpdateList!=null){
                update quoToUpdateList;
            }            
            
        }/*else {
id quoteIds=newList[0].QuoteId__c;
list<Quote__c>  quoteamountlist =[select id,TotalPrice__c,QuoteId__c from Quote__c where QuoteId__c =:quoteIds];
double amount =0.0;
for(Quote__c qu:quoteamountlist){
if(qu.TotalPrice__c!=null){
amount+=qu.TotalPrice__c;
}
}
Quote__c  quoToUpdate=new  Quote__c();
quoToUpdate.Id=quoteId;
quoToUpdate.Subtotal__c=amount;
system.debug('amount jjshjsh tri'+quoToUpdate);
if(quoToUpdate!=null){
update quoToUpdate;
}

System.debug('QuoteId is null in the new list.');

}*/
    }
    
    public static void haldleDelete(List<Quote__C> old) {
        
        id quoteId=old[0].QuoteId__c;
        if(quoteId!=null){
            
            
            double amount=0.00;
            list<Quote__c>  quoteamountlist =[select id,TotalPrice__c,QuoteId__c from Quote__c where QuoteId__c =:quoteId];
            
            if(quoteamountlist!=null){
                system.debug('amount before delete tri'+amount);
                for(Quote__c qu:quoteamountlist){
                    if(qu.TotalPrice__c!=null){
                        amount+=qu.TotalPrice__c;
                    }
                }
                system.debug('lineno16 tri'+amount);
            }
            Quote__c  quoToUpdate=new  Quote__c();
            quoToUpdate.Id=quoteId;
            quoToUpdate.Subtotal__c=amount;
            system.debug('amount jjshjsh tri'+quoToUpdate);
            if(quoToUpdate!=null){
                update quoToUpdate;
            }
            
            
        }
    }
    
    
}