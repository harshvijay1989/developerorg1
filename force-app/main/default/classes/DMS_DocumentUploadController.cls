public class DMS_DocumentUploadController {
    
    @AuraEnabled
    public static documentMetadataWrapper getDocumentAndAccRecordTypes(){
        Map<String,DMS_Config__mdt> documentUploadMap = DMS_Config__mdt.getAll();  
        if(documentUploadMap.containsKey('DocumentUpload')){
            DMS_Config__mdt dmsConfigMdt = documentUploadMap.get('DocumentUpload');
            documentMetadataWrapper docMetadataWrapper = new documentMetadataWrapper();
            docMetadataWrapper.documentTypes = documentUploadMap.get('DocumentUpload').Documents__c;
            docMetadataWrapper.accountTypes = documentUploadMap.get('DocumentUpload').Account_Type__c;    
            return docMetadataWrapper;
        }    
        return null;
    }  
    
    // @AuraEnabled
    // public static String updateContentVersion(String requestString){
    //     try{
    //         Map<String,Object> data = (Map<String,Object>)JSON.deserializeUntyped(requestString);
    //         String docId = String.valueOf(data.get('docId'));
    //         String docType = String.valueOf(data.get('docType'));
    //         String docName = String.valueOf(data.get('docName'));
    //         ContentVersion cv = [SELECT Id,Type__c,Title FROM ContentVersion WHERE ContentDocumentId = :docId];
    //         if(cv.Type__c != docType){
    //             cv.Title = cv.Title + '__'+docType;
    //             cv.Type__c = docType;
    //             update cv; 
    //             return 'Record Updated';
    //         }
    //     }catch(Exception e){
    //         return e.getMessage()+' at: '+e.getLineNumber();
    //     }
    //     return null;
    // }

    @AuraEnabled
    public static String updateContentVersion(String requestString){
        Map<String,Object> data = (Map<String,Object>)JSON.deserializeUntyped(requestString);
        String docId = String.valueOf(data.get('docId'));
        String docType = String.valueOf(data.get('docType'));
        String docName = String.valueOf(data.get('docName'));
        String posDocNam = String.valueOf(data.get('posDocNam'));
        String cvtitle = String.valueOf(data.get('cvtitle'));
       
        ContentVersion cv = [SELECT Id,Type__c,Title FROM ContentVersion WHERE ContentDocumentId = :docId];
        if(cv.Type__c != docType){
            cv.Type__c = docType;
        }
        cv.Title = cvtitle;
        system.debug('----- cv'+json.serialize(cv));
        try{
        	update cv;
        }catch(exception e){
            system.debug('error ------'+json.serialize(e));
        }
        return null;
    }

    @AuraEnabled
    public static Map<String,String> getDocumentCount(string accountId){
        Map<String,String> docType = new Map<String,String>();
        List<ContentVersion> cvLst = [select id,Type__c from ContentVersion where FirstPublishLocationId =: accountId];
        for(ContentVersion cv: cvLst){
            if(cv.Type__c != '' && cv.Type__c != null){
        		docType.put(cv.Type__c,cv.Type__c);        
            }
        }
        return docType;
    }
    
    @AuraEnabled
    public static  List<String> getDocumentTypes(string accountId){
        
        List<String> docTypes = System.Label.DocumentTypes.split(',');
        List<String> docTypelst = new List<String>();
        
        //system.debug('docTypes :'+docTypes);
        Map<String,String> docTypesMap = new Map<String,String>();
        List<ContentVersion> cvLst = [select id,Type__c from ContentVersion where FirstPublishLocationId =: accountId];
        for(ContentVersion cv: cvLst){
            if(cv.Type__c != '' && cv.Type__c != null && docTypes.contains(cv.Type__c)){
                Integer index = docTypes.indexOf(cv.Type__c);
				system.debug('------'+cv.Type__c);
                docTypes.remove(index);
                docTypesMap.put(cv.Type__c,cv.Type__c);    
            }
        }
        //system.debug('docTypes 1:'+docTypes);
        return docTypes;
    }
    
    @AuraEnabled
    public static String getContentDetails(String recordId) {
        List<ContentDocumentLink> contentDocumentList = [SELECT ContentDocumentId, LinkedEntityId 
                                                         FROM   ContentDocumentLink 
                                                         WHERE  LinkedEntityId =: recordId];
        Set<Id> contentDocumentId = new Set<Id>();
        
        for(ContentDocumentLink cdl : contentDocumentList){
            contentDocumentId.add(cdl.ContentDocumentId);
        }

        List<ContentVersion> contentVersionList = [SELECT Id, VersionData, FileType, Title, FileExtension,
                                                   ContentDocument.CreatedBy.Name, ContentDocument.ContentSize,
                                                   CreatedDate, ContentDocumentId, ContentDocument.FileType
                                                   FROM   ContentVersion 
                                                   WHERE  ContentDocumentId IN: contentDocumentId];
        return JSON.serialize(contentVersionList);
    }
    
    @AuraEnabled
    public static void deleteContentDocument(String recordId) {
        Database.delete(recordId);
    }

    
    public class DocumentMetadataWrapper{
        @AuraEnabled
        public String documentTypes{get;set;}
        @AuraEnabled
        public String accountTypes{get;set;}
    }
    
}