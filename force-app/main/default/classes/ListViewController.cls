public class ListViewController {
    @AuraEnabled
    public static String getListViewApi(String objectName,String listApiName){
        System.debug('listApiName'+listApiName);
        System.debug('objectNameobjectName'+objectName);
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://'+URL.getSalesforceBaseUrl().getHost()+'/services/data/v49.0/ui-api/list-info/'+objectName+'/'+listApiName);
        req.setMethod('GET');
        string autho = 'Bearer '+UtilsGetSessionId.getSessionIdFromVFPage(Page.GetSessionIdFromVFPage);
        req.setHeader('Authorization', autho);        
        Http http = new Http();
        HTTPresponse res= http.send(req);
        string response = res.getBody();
        System.debug('Response : '+response);
        Map<String, Object> m = (Map<String, Object>) JSON.deserializeUntyped(response);
        List<Object> fieldList = (List<Object>) m.get('displayColumns');  
        String listviewFieldName = '';
        for(Object fields : fieldList){
            Map<String, Object> fieldsMap = (Map<String, Object>) fields;
            listviewFieldName = listviewFieldName+fieldsMap.get('fieldApiName')+',';
        } 
        String query = 'SELECT ';
        query += listviewFieldName.removeEnd(',');
        query += ' FROM ' + objectName;
        System.debug('Query : '+query);
        System.debug('Fields are : '+listviewFieldName);
        return listviewFieldName.removeEnd(',');
    }
    
    @AuraEnabled
    public static String getListViewRecord(String objectName,String listApiName){
        Map<String, String> returnMap = new Map<String,String>();

        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://'+URL.getSalesforceBaseUrl().getHost()+'/services/data/v49.0/sobjects/'+objectName+'/listviews/'+listApiName+'/describe');
        System.debug('https://'+URL.getSalesforceBaseUrl().getHost()+'/services/data/v49.0/sobjects/'+objectName+'/listviews/'+listApiName+'/describe');
        req.setMethod('GET');
        string autho = 'Bearer '+UtilsGetSessionId.getSessionIdFromVFPage(Page.GetSessionIdFromVFPage);
        req.setHeader('Authorization', autho);       
        Http http = new Http();
        HTTPresponse res= http.send(req);
        string response = res.getBody();
        Map<String, Object> obj = (Map<String, Object>) JSON.deserializeUntyped(response);
        String query = (String) obj.get('query');
        List<SObject> finalData = Database.query(query);
        System.debug('finalDatafinalData'+finalData);
        List<String> flds = new List<String>();
        Pattern pattern = Pattern.compile('SELECT\\s+(.*?)\\s+FROM');
        Matcher matcher = pattern.matcher(query);
        
        if (matcher.find()) {
            String fieldsString = matcher.group(1);
            flds = fieldsString.split(',');
            for (Integer i = 0; i < flds.size(); i++) {
                flds[i] = flds[i].trim();
            }
        }
        for (Integer i = 0; i < flds.size(); i++) {
            flds[i] = flds[i].replaceAll('toLabel\\((.*?)\\)', '$1');
        }
        for (Integer i = 0; i < flds.size(); i++) {
            flds[i] = flds[i].replaceAll('Owner.Alias', 'Owner.User.Alias');
        }
        List<Map<String, Object>> dataLst = new List<Map<String, Object>>();
        Integer i = 0 ;
        Map<String, Object> fieldWithData = new Map<String,Object>();
        Map<String, String> fieldLabel = getFieldLabelMap(flds,objectName);
        String fieldApiName = getListViewApi(objectName, listApiName);
        Set<String> fieldApiNamesSet = new Set<String>();
        for(String fieldApi : fieldApiName.split(',')){
            System.debug(fieldApi);
            fieldApiNamesSet.add(fieldApi.replace('__r.Name', '__c'));
        }
        System.debug('fieldLabel '+fieldLabel.keyset());
        System.debug('fieldApiNamesSet : '+fieldApiNamesSet);
        for(SObject rec : finalData ){
            Map<String, Object> fMap = new Map<String,Object>();
            for(String apiName : fieldLabel.keyset()){
                //System.debug('apiName : '+apiName);
                if (fieldApiNamesSet.contains(apiName)) {
                    //System.debug('fieldLabelapiName : '+fieldLabel.get(apiName)+'value'+rec.get(apiName));
                    fMap.put(fieldLabel.get(apiName), rec.get(apiName));
                }
            }
            dataLst.add(fMap);
        }
        List<String> fieldLabelLst = getFieldLabelsForObject(objectName, fieldApiNamesSet);
        returnMap.put('FIELD_LIST', JSON.serialize(fieldApiNamesSet));
        returnMap.put('RECORD_LIST', JSON.serialize(finalData));
		returnMap.put('Field_List', JSON.serialize(fieldLabelLst));       
        
        System.debug('DataLst==> '+dataLst);
        return JSON.serialize(returnMap);
       // return  JSON.serialize(dataLst);
    }
    @AuraEnabled
    public static List<Map<String, Object>> getRecord(String objName, List<String> fieldLabels){
        List<Map<String, Object>> resultList = new List<Map<String, Object>>();
        Schema.SObjectType objectType = Schema.getGlobalDescribe().get(objName);
        Schema.DescribeSObjectResult objectDescribe = objectType.getDescribe();
        Map<String, Schema.SObjectField> fieldMap = objectDescribe.fields.getMap();
        
        for(String fieldLabel : fieldLabels) {
            String fieldApiName = getFieldApiNameByLabel(fieldLabel, fieldMap);
            
            if(fieldApiName != null) {
                String fieldsQuery = String.join(new List<String>{fieldApiName}, ',');
                String queryString = 'SELECT ' + fieldsQuery + ' FROM ' + objName;
                
                List<SObject> records = Database.query(queryString);
                
                for (SObject record : records) {
                    Map<String, Object> result = new Map<String, Object>();
                    
                    Schema.SObjectField recordField = record.getSObjectType().getDescribe().fields.getMap().get(fieldApiName);
                    if(recordField != null) {
                        Schema.DescribeFieldResult fieldDescribe = recordField.getDescribe();
                        String apiName = fieldDescribe.getName();
                        Object fieldValue = record.get(apiName);
                        result.put(fieldLabel, fieldValue);
                    }
                    resultList.add(result);
                }
            }
        }
        return resultList;
    }
    
    private static String getFieldApiNameByLabel(String fieldLabel, Map<String, Schema.SObjectField> fieldMap) {
        for(String apiName : fieldMap.keySet()) {
            System.debug('Api Name : '+apiName);
            Schema.SObjectField field = fieldMap.get(apiName);
            if(field.getDescribe().getLabel() == fieldLabel) {
                return apiName;
            }
        }
        return null;
    }
    public static Map<String, String> getFieldLabelMap(List<String> fieldApiNames, String objName){
        Map<String, String> fieldLabelMap = new Map<String, String>();
        
        Schema.SObjectType objectType = Schema.getGlobalDescribe().get(objName);
        Schema.DescribeSObjectResult objectDescribe = objectType.getDescribe();
        Map<String, Schema.SObjectField> fieldMap = objectDescribe.fields.getMap();
        
        for(String fieldApiName : fieldApiNames) {
            if(fieldMap.containsKey(fieldApiName)) {
                Schema.SObjectField field = fieldMap.get(fieldApiName);
                fieldLabelMap.put(fieldApiName, field.getDescribe().getLabel());
            }
        }
        System.debug('FieldLabelMap : '+fieldLabelMap);
        return fieldLabelMap;
    }
    
    @AuraEnabled
    public static List<String> getFieldLabels(String objectApiName) {
        System.debug('Call : '+objectApiName);
        List<String> fieldLabels = new List<String>();
        Schema.DescribeSObjectResult describeResult = Schema.getGlobalDescribe().get(objectApiName).getDescribe();
        for(Schema.SObjectField field : describeResult.fields.getMap().values()) {
            fieldLabels.add(field.getDescribe().getLabel());
        }
        System.debug('Fields label : '+fieldLabels);
        return fieldLabels;
    }

    @AuraEnabled
    public static void insertList(String name, String apiName, String objName){
        System.debug('Name : '+name);
        System.debug('Api Name : '+apiname);
        System.debug('Obj Name : '+objName);
        MetadataService.MetadataPort service = new MetadataService.MetadataPort();                         
        MetadataService.ListView listView = new MetadataService.ListView();
        MetadataService.SessionHeader_element sessionHeader = new MetadataService.SessionHeader_element();
        String sessionID = UtilsGetSessionId.getSessionIdFromVFPage(Page.GetSessionIdFromVFPage);
        sessionHeader.sessionId = sessionID;
        service.SessionHeader = sessionHeader;
        listView.fullName = objName+'.'+apiName;
        listView.filterScope = 'Everything';
        listView.label = name;
        List<MetadataService.SaveResult> results =                        
            service.createMetadata(
                new MetadataService.Metadata[] { listView }); 
        if(!results.isEmpty()){
            for (MetadataService.SaveResult result : results) {
                if (result.success) {
                    system.debug('Succeeded'); 
                } else { 
                    System.debug(JSON.serialize(result.errors[0].message));
                }   
            }
        } else{
            system.debug('Result is null');
        }
    }
    
    @AuraEnabled
    public static void renameList(String apiName, String label, String objName) {
        System.debug('Api Name: ' + apiName);
        System.debug('New Label: ' + label);
        MetadataService.MetadataPort service = new MetadataService.MetadataPort();
        MetadataService.SessionHeader_element sessionHeader = new MetadataService.SessionHeader_element();
        String sessionID = UtilsGetSessionId.getSessionIdFromVFPage(Page.GetSessionIdFromVFPage);
        sessionHeader.sessionId = sessionID;
        service.SessionHeader = sessionHeader;
        
        MetadataService.ListView existingListView = new MetadataService.ListView();
        existingListView.fullName = objName + '.' + apiName;
        
        try {
            MetadataService.ReadListViewResult result = (MetadataService.ReadListViewResult) service.readMetadata('ListView', new String[] { objName + '.' + apiName });
            if (result.records != null && result.records.size() > 0) {
                MetadataService.ListView listView = (MetadataService.ListView) result.records[0];
                listView.label = label; 
                System.debug('List view Column : '+listView.columns+' Filter : '+listView.filterScope);
                List<MetadataService.SaveResult> results = service.updateMetadata(new MetadataService.Metadata[] { listView }); 
                if (!results.isEmpty()) {
                    for (MetadataService.SaveResult saveResult : results) {
                        if (saveResult.success) {
                            System.debug('List view updated successfully');
                        } else {
                            System.debug(JSON.serialize(saveResult.errors[0].message));
                        }
                    }
                } else {
                    System.debug('Result is null');
                }
            } else {
                System.debug('List view not found');
            }
        } catch (Exception e) {
            System.debug('Error: ' + e.getMessage());
        }
    }
    @AuraEnabled
    public static void deleteList(String apiName, String objName) {
        System.debug('Api Name: ' + apiName);
        System.debug('Obj Name: ' + objName);
        MetadataService.MetadataPort service = new MetadataService.MetadataPort();
        MetadataService.SessionHeader_element sessionHeader = new MetadataService.SessionHeader_element();
        String sessionID = UtilsGetSessionId.getSessionIdFromVFPage(Page.GetSessionIdFromVFPage);
        sessionHeader.sessionId = sessionID;
        service.SessionHeader = sessionHeader;
        
        try {
            String fullName = objName + '.' + apiName;
            MetadataService.deleteMetadata_element deleteElement = new MetadataService.deleteMetadata_element();
            deleteElement.type_x = 'ListView';
            deleteElement.fullNames = new String[]{fullName};
                
                MetadataService.DeleteResult[] deleteResult = service.deleteMetadata(deleteElement.type_x, deleteElement.fullNames);
            
            if (deleteResult != null && deleteResult.size() > 0) {
                for (MetadataService.DeleteResult deleteResultItem : deleteResult) {
                    if (deleteResultItem.success) {
                        System.debug('List view deleted successfully');
                    } else {
                        System.debug(JSON.serialize(deleteResultItem.errors[0].message));
                    }
                }
            } else {
                System.debug('Result is null');
            }
        } catch (Exception e) {
            System.debug('Error: ' + e.getMessage());
        }
    }
    class ResponseWrapper{
        String cloneable;
        String createable;
        String deletable;
        List<DisplayColumnsWrapper> displayColumns;
    }
    class DisplayColumnsWrapper{
        String fieldApiName;
        String label;
        String sortable;
    }

    @AuraEnabled
    public static list<listViewWrapper> listValues(string objectApiName){
            System.debug('objectApiName==> '+objectApiName);
        list<listViewWrapper> oListViewWrapper = new list<listViewWrapper>();

        for(ListView lv : [SELECT id, Name, DeveloperName FROM ListView
                           WHERE sObjectType = : objectApiName ORDER By Name ASC]){ 
            listViewWrapper oWrapper = new listViewWrapper();
            oWrapper.label = lv.Name;
            oWrapper.developerName = lv.DeveloperName;
            oListViewWrapper.add(oWrapper);
        }
                    System.debug('oListViewWrapper==> '+oListViewWrapper);

        return oListViewWrapper; 
    }

    /*wrapper class to store listView details*/ 
    public class listViewWrapper{
        @AuraEnabled public string label{get;set;} 
        @AuraEnabled public string developerName{get;set;} 
    }
    
    public static List<String> getFieldLabelsForObject(String objectApiName, Set<String> fieldApiNames) {
        System.debug('Call : ' + objectApiName);
        List<String> fieldLabels = new List<String>();
        
        // Retrieve the describe result for the object
        Schema.DescribeSObjectResult describeResult = Schema.getGlobalDescribe().get(objectApiName).getDescribe();
        
        // Loop through the fields and check if the API name is in the provided set
        for (Schema.SObjectField field : describeResult.fields.getMap().values()) {
            String apiName = field.getDescribe().getName();
            if (fieldApiNames.contains(apiName)) {
                fieldLabels.add(field.getDescribe().getLabel());
            }
        }
        
        return fieldLabels;
    }
}