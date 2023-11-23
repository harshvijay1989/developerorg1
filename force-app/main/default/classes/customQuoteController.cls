public class customQuoteController {
    public String quoteId { get; set; }
    public Quote__c Quote{get;set;}
    public List<Product__c> prodlist{get;set;}
    public list<Quote__c> quoteLineItem{get;set;}
    public string recordId;
    public  User us{get;set;}
    public Organization orgInfo{get;set;}
    public customQuoteController(){
        
        quoteId = ApexPages.currentPage().getParameters().get('id');
        String userId=UserInfo.getUserId();
        us= [select id,Email from user where id=:userId];
        System.debug('quoteId => '+quoteId);
        String currentUserId = UserInfo.getUserId();
        System.debug('Current User ID: ' + currentUserId);
        orgInfo = [SELECT Id, Name FROM Organization LIMIT 1];
        system.debug(quoteId);
        Quote= [SELECT LastModifiedById, Id, Name, CreatedDate, LastModifiedDate,
                CreatedById, Additional_To__Street__s, Account_Name__c, Additional_To__City__s,
                Additional_To__StateCode__s, Additional_To__PostalCode__s, Additional_To__CountryCode__s,
                Additional_To__Latitude__s, Additional_To__Longitude__s, Additional_To__GeocodeAccuracy__s, Additional_To__c,
                Additional_To_Name__c, Bill_To__Street__s, Bill_To__City__s, Bill_To__PostalCode__s, Bill_To__StateCode__s,
                Bill_To__CountryCode__s, Bill_To__Latitude__s, Bill_To__Longitude__s, Bill_To__GeocodeAccuracy__s, Bill_To__c, 
                Bill_To_Name__c, ContactId__c, ContractId__c, Description__c, Discount__c, Email__c, ExpirationDate__c, Fax__c,
                GrandTotal__c, Opportunity__c, QuoteNumber__c, Phone__c, QuoteToAddress__Street__s, QuoteToAddress__City__s, 
                QuoteToAddress__PostalCode__s, QuoteToAddress__StateCode__s, QuoteToAddress__CountryCode__s, QuoteToAddress__Latitude__s,
                QuoteToAddress__Longitude__s, QuoteToAddress__GeocodeAccuracy__s, QuoteToAddress__c, QuoteToName__c, ShippingAddress__Street__s,
                ShippingAddress__City__s, ShippingAddress__PostalCode__s, ShippingAddress__StateCode__s, ShippingAddress__CountryCode__s,
                ShippingAddress__Latitude__s, ShippingAddress__Longitude__s, ShippingAddress__GeocodeAccuracy__s, ShippingAddress__c, ShippingName__c,
                ShippingHandling__c, Status__c, IsSyncing__c, Tax__c,Subtotal__c, LineItemCount__c,Account_Name__r.Name,Total_Price__c, Primary__c FROM Quote__c where Id =:quoteId];
        system.debug('Quote=>'+Quote);
        quoteLineItem=[select CreatedDate,Quantity__c,UnitPrice__c,TotalPrice__c,ListPrice__c,Product__r.Name,QuoteId__c  from Quote__c where QuoteId__c=:quoteId and QuoteId__c!=null];
        system.debug(quoteLineItem);
    }
    
    
    
}