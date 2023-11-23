public without sharing class AddProductController {
    @AuraEnabled
    public static String findProducts(String recordId, String name, String productCode, List<String> productFamily, Integer RecordLimit) {
        system.debug('recordId'+recordId);
        
        wrapperClass wc = new wrapperClass();
        
        String ProductQuery = 'Select id,Product_Family__c, Product_Description__c, Prod_Prod_Code__c, Name, Unit_Price__c from Opportunity__c where RecordType.Name = \'Product\'';
        if (productFamily != null && productFamily.size() != 0) {
            ProductQuery += 'AND Product_Family__c IN :productFamily';
        }
        
        List<Opportunity__c> productList = Database.query(ProductQuery);
        List<ProductWrapper> lstProduct = new List<ProductWrapper>();
        
        for (Opportunity__c p2 : productList) {
            if (name != '' && !p2.Name.containsIgnoreCase(name.trim())) {
                continue;
            }
            if (productCode != '' && !p2.Product_Code__c.containsIgnoreCase(productCode.trim())) {
                continue;
            }
            
            ProductWrapper pw = new ProductWrapper();
            pw.Id = p2.Id;
            pw.purl = '/lightning/r/' + p2.Id + '/view';
            pw.Name = p2.Name;
            pw.Family = p2.Product_Family__c;
            pw.ProductCode = p2.Prod_Prod_Code__c;
            pw.Description = p2.Product_Description__c;
            pw.Price = p2.Unit_Price__c;
            
            
            lstProduct.add(pw);
            
            if (lstProduct.size() >= RecordLimit) {
                break;
            }
        }
        
        wc.productList = lstProduct;
        return JSON.serialize(wc);
    }
    
    @AuraEnabled
    public static List<PicklistValue> getproductfamily() {
        String strObjectName = 'Opportunity__c';
        String strPicklistField = 'Product_Family__c';
        Map<String, String> mapPickListValues = new Map<String, String>();
        Schema.SObjectType objSobjectType = Schema.getGlobalDescribe().get(strObjectName);
        Schema.DescribeSObjectResult objDescribeSobject = objSobjectType.getDescribe();
        Map<String, Schema.SObjectField> mapFields = objDescribeSobject.fields.getMap();
        List<Schema.PicklistEntry> lstPickListValues = mapFields.get(strPicklistField).getDescribe().getPickListValues();
        List<PicklistValue> pvList = new List<PicklistValue>();
        for (Schema.PicklistEntry objPickList : lstPickListValues) {
            PicklistValue pv = new PicklistValue(objPickList.getValue(), objPickList.getLabel());
            pvList.add(pv);
        }
        return pvList;
    }
    
     @AuraEnabled
    public static String saveProducts(String recordData, String recId) {
        System.debug('Line 63' + recId);
        System.debug('line 64' + recordData);
        id recdId=[select Id from RecordType  where DeveloperName='Opportunity_Product' limit 1].Id;
        List<Opportunity__c> myOpportunityList = [select Id,Name, Quantity__c, Discount__c from Opportunity__c where RecordType.Name = 'Opportunity Product' AND Opportunity__r.id = :recId];
        system.debug('myOpp'+myOpportunityList);
        List<ProductWrapper> wc = (List<ProductWrapper>) JSON.deserialize(recordData, List<ProductWrapper>.class);
        
        Map<String, Opportunity__c> opportunityProductMap = new Map<String, Opportunity__c>();

        Map<String, Opportunity__c> productMap = new Map<String, Opportunity__c>();

        for (Opportunity__c myOpportunity : myOpportunityList) {
             
                opportunityProductMap.put(myOpportunity.Name, myOpportunity);
		 }
        
        List<Opportunity__c> lstOpp = new List<Opportunity__c>();
        double totalAmount = 0;
        List<Opportunity__c> oppLst = [select Id,Name from Opportunity__c where RecordType.Name = 'Opportunity Product' AND Opportunity__r.id =: recId];
        system.debug('opplist'+oppLst);
        
        for (Opportunity__c opp : oppLst) {
    				productMap.put(opp.Name, opp);
		}
        for (ProductWrapper pw : wc) {
            String productName = pw.Name;
            system.debug('productName'+productName);
            Opportunity__c oli = new Opportunity__c();
            if (productMap.containsKey(productName)) {
                Opportunity__c existingOppProduct = productMap.get(productName);
      		    oli.Id = existingOppProduct.Id;
                oli.Quantity__c = pw.Quantity;
                oli.Discount__c = pw.PDate;
                oli.Line_Description__c = pw.LineDescription;
                oli.RecordTypeId = recdId; 
                
                system.debug('quantity'+ oli.Quantity__c);

                lstOpp.add(oli);
            } else {
                
                System.debug('Line 94');
                oli.Name = pw.Name;
                oli.Product__c = pw.Id;
                oli.Quantity__c = pw.Quantity;
                oli.Sales_Price__c = pw.Price;
                oli.List_Price__c = pw.Price;
                oli.Product_Code__c = pw.ProductCode;
                oli.Discount__c = pw.PDate;
                oli.Line_Description__c = pw.LineDescription;
                oli.Opportunity__c = recId;
                oli.RecordTypeId = recdId; 
                lstOpp.add(oli);
            }
        }
        
        try {
            upsert lstOpp; 
            return 'success';
            
        } catch (Exception e) {
            System.debug(e.getMessage());
            return 'error';
        }
    }
  
    
    
 @AuraEnabled
    public static List<Opportunity__c> doCheck(String recIds) {
        system.debug('recordIds'+recIds);
        List<Opportunity__c> oppProd = [select id,Name, Quantity__c, Discount__c,Sales_Price__c, Line_Description__c,Product__r.Prod_Prod_Code__c,Product__r.id, Product_Code__c from Opportunity__c where RecordType.Name = 'Opportunity Product' AND Opportunity__r.id =: recIds];
        system.debug('oppProd'+oppProd);
        return oppProd;
    }    
    
    
    public with sharing class wrapperClass {
        public List<ProductWrapper> productList;
    }
    
    public with sharing class ProductWrapper {
        public String Name;
        public String Id;
        public String purl;
        public String Product2Id;
        public String ProductCode;
        public Decimal Price;
        public Decimal Quantity ;
        public Decimal Discount;
        public String Family;
        public Decimal PDate ;
        public String Description;
        public String LineDescription;
        
    }
    
    public class PicklistValue {
        @AuraEnabled
        public String label { get; set; }
        @AuraEnabled
        public String value { get; set; }
        
        public PicklistValue(String value, String label) {
            this.value = value;
            this.label = label;
        }
    }
}