public with sharing class RecordTypeController {
    @AuraEnabled(cacheable=true)
    public static List<SObject> getRecordsByRecordType(String objectApiName, String recordTypeDeveloperName, String fields) {
        String query = 'SELECT ' + fields + ' FROM ' + objectApiName + ' WHERE RecordType.DeveloperName = \'' + recordTypeDeveloperName + '\'';
        return Database.query(query);
    }
}