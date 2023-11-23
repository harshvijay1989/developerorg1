public with sharing class CompactLayoutHelperClass {
    
    @AuraEnabled(cacheable = true)
    
    public static List<WebLink> buttonAndLinksList(String selectedObject) {
        
        if(selectedObject != null){
            List<WebLink> webLinks = [SELECT Name, MasterLabel, Description, LinkType, OpenType, Url, CreatedDate FROM WebLink WHERE PageOrSobjectType = :selectedObject WITH SECURITY_ENFORCED
                                      
                                      ORDER BY Name  LIMIT 49999];
            return webLinks;
        }else{
            return null;
        }
    }
}