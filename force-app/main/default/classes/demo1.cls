public class demo1 {
    @AuraEnabled
    public Static String getQuoteItem(String  recId){
           
         Quote__c qt=[select id,name from Quote__c where Id=:recId];
         return JSON.serialize(qt);
    }

    @AuraEnabled
    public Static String getOrderItem(String  recId){
           
         Order__c qt=[select id,name from Order__c where Id=:recId];
         return JSON.serialize(qt);
    }
    
    @AuraEnabled
    public static String saveProduct(String data1){
        id proId=[select id,Name from RecordType where name='Product'].Id;
        Map<String, Object> untypedData = (Map<String, Object>) JSON.deserializeUntyped(data1);
        Opportunity__c prod  = new Opportunity__c();
        prod.Name=(String)untypedData.get('PName');
        prod.Prod_Prod_Code__c=(String)untypedData.get('ProductCode');
        prod.Product_Description__c=(String)untypedData.get('productdes');
        prod.Product_Family__c=(String)untypedData.get('ProductType');
        prod.Product_IS_Active__c=(Boolean)untypedData.get('isActive');
        prod.Unit_Price__c=(double)untypedData.get('unitPrice');
        prod.RecordTypeId=proId;
        insert prod;
        return prod.Name;
    }
}