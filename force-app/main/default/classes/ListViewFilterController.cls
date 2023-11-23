public with sharing class ListViewFilterController {
    @AuraEnabled
    public static WrapperClass getFieldsForColumns(String objectName,String fieldSetName) {
        system.debug('objectName====> '+ objectName);
        system.debug('fieldSetName====> '+ fieldSetName);
            WrapperClass wrapper = new WrapperClass();
            SObjectType objectType = Schema.getGlobalDescribe().get(objectName);
            if (objectType != null) {	
                List<String> fieldsToQuery = new List<String>{'Id'};
                Schema.FieldSet fieldSetObj = objectType.getDescribe().fieldSets.getMap().get(fieldSetName);
                system.debug('fieldSetObj====> '+ fieldSetObj);
                if (fieldSetObj != null) {
                    for (Schema.FieldSetMember field : fieldSetObj.getFields()) {
                        fieldsToQuery.add(field.getFieldPath());
                    }
                }
                String queryString = 'SELECT ' + String.join(fieldsToQuery, ', ') + ' FROM ' + objectName; //+ ' WHERE '+ ParentObject + ' =: recordId';
            List<SObject> records = Database.query(queryString);
            wrapper.records = getRecordsWithFieldSet(records, objectName, fieldSetName);
            wrapper.fieldList = getFieldListFromFieldSetName(objectType, fieldSetName);
            
            }
            return wrapper;
        
    }
    private static List<Map<String, Object>> getRecordsWithFieldSet(List<SObject> records, String objectName, String fieldSetName) {
        List<Map<String, Object>> recordsWithFieldSet = new List<Map<String, Object>>();

        SObjectType objType = Schema.getGlobalDescribe().get(objectName);
        Schema.FieldSet fieldSetObj = objType.getDescribe().fieldSets.getMap().get(fieldSetName);

        if (fieldSetObj != null) {
            for (SObject record : records) {
                Map<String, Object> recordMap = new Map<String, Object>();
                recordMap.put('sObjectType', objectName);
                recordMap.put('Id', record.Id);
                for (Schema.FieldSetMember field : fieldSetObj.getFields()) {
                    String fieldName = field.getFieldPath();
                    recordMap.put(fieldName, String.valueOf(record.get(fieldName)));
                }
                recordsWithFieldSet.add(recordMap);
            }
        }

        return recordsWithFieldSet;
    }

    private static List<FieldWrapper> getFieldListFromFieldSetName(SObjectType objectType, String fieldSetName) {
        List<FieldWrapper> fieldList = new List<FieldWrapper>();

        Schema.FieldSet fieldSetObj = objectType.getDescribe().fieldSets.getMap().get(fieldSetName);

        if (fieldSetObj != null) {
            for (Schema.FieldSetMember field : fieldSetObj.getFields()) {
                fieldList.add(new FieldWrapper(
                    field.getFieldPath(),
                    field.getLabel(),
                    ''
                ));
            }
        }

        return fieldList;
    }
    public class WrapperClass {
        @AuraEnabled
        public List<Map<String, Object>> records;
        @AuraEnabled
        public List<FieldWrapper> fieldList;
    }
    public class FieldWrapper {
        @AuraEnabled
        public String fieldPath;
        @AuraEnabled
        public String label;
        @AuraEnabled
        public String value;

        public FieldWrapper(String fieldPath, String label, String value) {
            this.fieldPath = fieldPath;
            this.label = label;
            this.value = value;
        }
    }
    
}