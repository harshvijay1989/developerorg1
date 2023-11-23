// QuoteToOrderController.cls
public with sharing class QuoteToOrderController {
    @AuraEnabled
    public static String convertQuoteToOrder(Id quoteId) {
        try {
            System.debug('quoteId==> ' + quoteId);
            
            Quote__c quoteRecord = [SELECT Id, Name, Primary__c, Status__c,GrandTotal__c,ContractId__c,Opportunity__c,Opportunity__r.Primary_contact__c,Account_Name__c,Account_Name__r.Name FROM Quote__c WHERE Id = :quoteId LIMIT 1];
            System.debug('quoteRecord==> ' + quoteRecord);
            if(quoteRecord.Status__c == 'Accepted'){
            Account acc=[select id,BillingStreet,BillingCity,BillingState,BillingPostalCode,BillingCountry,ShippingStreet,ShippingCity,ShippingState,ShippingPostalCode,ShippingCountry from Account where id=:quoteRecord.Account_Name__c];
            system.debug('Account 11 ========>'+acc);
            
            //Creating Contract
          /*  Contract Contra = new Contract(
                AccountId = quoteRecord.Account_Name__c,
                Status = 'Draft', 
                StartDate = Date.today(),
                ContractTerm=8,
                CustomerSignedId = quoteRecord.Opportunity__r.Primary_contact__c
            );
            insert Contra;*/
            
            //Creating Order
            id resIdOrder=[select Id from RecordType  where DeveloperName='Order' limit 1].Id;
            Order__c newOrder = new Order__c(
                
                AccountId__c = quoteRecord.Account_Name__c, 
                EffectiveDate__c = Date.today(), 
               // ContractId__c = Contra.Id,
                Name = quoteRecord.Name,
                Status__c = 'Order Confirmation',
                TotalAmount__c = quoteRecord.GrandTotal__c,
                ShippingAddress__City__s=acc.ShippingCity,
                ShippingAddress__Street__s=acc.ShippingStreet,
                ShippingAddress__PostalCode__s=acc.ShippingPostalCode,
                BillingAddress__City__s=acc.BillingCity,
                BillingAddress__PostalCode__s=acc.BillingPostalCode,
                BillingAddress__Street__s=acc.BillingStreet,
                PrimaryQuote__c = quoteId,
                ServiceDate__c=System.today(),
                 RecordTypeId = resIdOrder 
            );
            if(newOrder != null ){
                insert newOrder;
            }
            
            //Create orderlineItem
           List<Opportunity__c> opportunityLineItems = [select  Name,Id,List_Price__c,Discount__c, Product__r.Name,
                                                        Sales_Price__c, Quantity__c, Sub_Total__c,Total_Price__c,Line_Description__c
                                                        from Opportunity__c Where Opportunity__c !=null 
                                                        and Opportunity__c = :quoteRecord.Opportunity__c];
            
           
           
            id recIdOrderItem=[select Id,DeveloperName from RecordType  where DeveloperName='Order_Line_Item' limit 1].Id;
            List<Order__c> orderLineItemsToInsert = new List<Order__c>();
            
            for (Opportunity__c opportunityLineItem : opportunityLineItems) {
                system.debug('line 21'+opportunityLineItem);
                Order__c OrderItem = new Order__c(
                    Name=opportunityLineItem.Product__r.Name,
                    Product2Id__c = opportunityLineItem.Product__c,
                    Quantity__c = opportunityLineItem.Quantity__c,
                    ListPrice__c = opportunityLineItem.List_Price__c,
                    UnitPrice__c = opportunityLineItem.Sales_Price__c,
                    TotalPrice__c = opportunityLineItem.Total_Price__c,
                    OrderId__c = newOrder.Id,
                    RecordTypeId = recIdOrderItem
                    
                );
                orderLineItemsToInsert.add(OrderItem);
                system.debug('line 28'+orderLineItemsToInsert);
            }
            
            if(orderLineItemsToInsert != null){
                system.debug('line 28'+orderLineItemsToInsert);
                try{
                    insert orderLineItemsToInsert;
                }
                catch (Exception e) {
                    System.debug('Error converting quote to order: ' + e.getMessage());
                    throw e;
                }
            }
          
            //return the newly created Order Id
            return newOrder.Id;
                }
            else{
                return 'Null'; 
            }
        } catch (Exception e) {
            System.debug('Error converting quote to order: ' + e.getMessage());
            throw e;
        }
    }  
}