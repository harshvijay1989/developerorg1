public class AuraLookupController {
    
    private final static Integer MAX_RESULTS = 5;
     
    @AuraEnabled(cacheable=true)
    public static List<LookupSearchResult> search(String objectApiName, String fieldApiName, String subFieldApiName, String searchTerm, List<String> selectedIds, String anOptionalParam) {
       	System.debug('objectApiName : '+objectApiName);
        System.debug('fieldApiName : '+fieldApiName);
        System.debug('subFieldApiName : '+subFieldApiName);
        System.debug('searchTerm : '+searchTerm);
        System.debug('selectedIds : '+selectedIds);
        System.debug('anOptionalParam : '+anOptionalParam);
        
        List<LookupSearchResult> results = new List<LookupSearchResult>();
        
        String strQuery = 'SELECT Id, '+fieldApiName + (String.isNotBlank(subFieldApiName) ? ' ,'+subFieldApiName : '')+' FROM '+objectApiName;
        strQuery += ' WHERE '+fieldApiName+' LIKE \'' + searchTerm + '%\' AND ';  
        strQuery += ' Id NOT IN :selectedIds ORDER BY '+fieldApiName+' LIMIT :MAX_RESULTS';
        System.debug('strQuery'+strQuery);
        List<sObject> searchResults = Database.query(strQuery); 
        System.debug('searchResults'+searchResults);
        if(searchResults != NUll && !searchResults.isEmpty()){
            for(sObject sObj : searchResults){
                LookupSearchResult res = new LookupSearchResult();
                res.sObjectType = objectApiName;
                res.Id = sObj.Id;
                res.title = String.valueOf(sObj.get(fieldApiName));
                
                //sub field
                if(String.isNotBlank(subFieldApiName) && sObj.get(subFieldApiName) != NULL){
                    res.subtitle = String.valueOf(sObj.get(subFieldApiName));
                }else{
                    res.subtitle = objectApiName;
                } 
                
                //icons
                if(objectApiName.equalsIgnoreCase('Account')){
                    res.icon = 'standard:account';
                }else  if(objectApiName.equalsIgnoreCase('Contact')){
                    res.icon = 'standard:contact';
                } else  if(objectApiName.equalsIgnoreCase('Opportunity__c')){
                    res.icon = 'standard:opportunity';
                }else{
                    res.icon = 'standard:sobject';
                }
                
                
                results.add(res);
            }
        }
        return results;   
    }
    
    public class LookupSearchResult {
        @AuraEnabled public Id id{get;set;}
        @AuraEnabled public String title{get;set;}
        @AuraEnabled public String subtitle{get;set;}
        @AuraEnabled public String icon{get;set;}
        @AuraEnabled public String sObjectType{get;set;} 
    }

}