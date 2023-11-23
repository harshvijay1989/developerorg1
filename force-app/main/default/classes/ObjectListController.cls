public with sharing class ObjectListController {
    
    @AuraEnabled(cacheable=true)
    //@AuraEnabled
    public static List<DataWrapper> getObjectList() {
        List<DataWrapper> objectDataNames = new List<DataWrapper>();
        
        // Query the object names and sort them in ascending order
        List<Schema.SObjectType> objectTypes = Schema.getGlobalDescribe().Values();
        for (Schema.SObjectType objectType : objectTypes) {
            Schema.DescribeSObjectResult describeResult = objectType.getDescribe();
            objectDataNames.add(new DataWrapper(describeResult.getlabel(),describeResult.getName()));
        }
        
        return objectDataNames;
    }
    
    public class DataWrapper{
        @AuraEnabled
        public string label;
        @AuraEnabled
        public string value;
        public DataWrapper(string label,string value){
            this.label=label;
            this.value=value;
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getObjectRecords(String selectedObject) { 
        System.debug('selectedObject '+ selectedObject );
        List<Map<String, String>> records = new List<Map<String, String>>();
        
        
        String query = 'SELECT id, Name, Email, Phone FROM ' + selectedObject;
        
        try {
            List<SObject> sObjects = Database.query(query);
            
            for (SObject obj : sObjects) {
                Map<String, String> record = new Map<String, String>();
                record.put('id', (String)obj.get('id'));
                record.put('Name', (String)obj.get('Name'));
                record.put('Email', (String)obj.get('Email'));
                record.put('Phone', (String)obj.get('Phone'));
                records.add(record);
            }
        } catch (Exception e) {
            // Handle any exceptions or errors here
            System.debug('Error: ' + e.getMessage());
        }
        
        return records;
    }
    @AuraEnabled
    public static List<String> fetchEmails(List<String> selectedEmails, string templateId) {
        System.debug('selectedEmails'+selectedEmails);
        System.debug('templateId'+templateId);
        List<String> emails = new List<String>();
        
        Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
        
        message.setToAddresses(selectedEmails);
        
        //message.setWhatId('0035j00000xO8jkAAC');
        
        message.setTargetObjectId('0031m00000XwMxAAAV');
        message.setTreatTargetObjectAsRecipient(false);
        
        
        
        if(String.isNotBlank(templateId)){
            
            message.setTemplateId(templateId);
            
        }else{
            
            message.setPlainTextBody('No Email template found.');
            
        }
        
        Messaging.SendEmailResult[] results = Messaging.sendEmail( new List<Messaging.SingleEmailMessage> {message} );
        
        System.debug('Mail Sent'+results);
        
        
        
        return selectedEmails;
    }
    
    /*@AuraEnabled(cacheable=true)
    public static String singleEmail(String objName, String recId) {
        String email = '';
        
        try {
            String query = 'SELECT Email FROM ' + objName + ' WHERE Id = :recId';
            
            List<SObject> records = Database.query(query);
            System.debug('records==>>'+records);
            if (!records.isEmpty()) {
                SObject record = records[0];
                email = (String)record.get('Email');
                System.debug('email777777>>>'+email);
            }
        } catch (Exception e) {
            // Handle any exceptions here
            System.debug('Error: ' + e.getMessage());
        }
        
        return email;
    }*/    
    @AuraEnabled(cacheable=true)
    public static List<EmailTemplate> getEmailTemplates() {
        return [SELECT Id, Name FROM EmailTemplate];
    }
    @AuraEnabled(cacheable=true)
    public static List<EmailTemplate> searchEmailTemplates(string searchKey) {
        system.debug('searchKey===> '+searchKey);
        List<EmailTemplate> emailtemplate = new List<EmailTemplate>();
        string sWildCardText = '%' + searchKey + '%';
        
        List<EmailTemplate> emailTemplateData =  [SELECT Id, Name FROM EmailTemplate Where Name Like : sWildCardText];
        
        system.debug('emailTemplateData===> '+emailTemplateData);
        system.debug('emailTemplateData size() ===> '+emailTemplateData.size());
        for (EmailTemplate obj: emailTemplateData) {
            emailtemplate.add(obj);
        }
        return emailtemplate;
    }
    
    @AuraEnabled
    public static string  getTemplate(String searchKey) {
        System.debug('logLevel'+ searchKey);
        
        EmailTemplate emailTemplate = [SELECT Id, Subject, HtmlValue, Body, DeveloperName FROM EmailTemplate where Id =: searchKey];
        /*String emailBodyText = emailTemplate.body;
        System.debug('emailBodyText : '+ emailBodyText);
        ContentVersion contentVersion = new ContentVersion();
        contentVersion.Title = 'Email Template Content';
        contentVersion.PathOnClient = 'EmailTemplateContent.doc'; // You can choose a filename
        contentVersion.VersionData = Blob.valueOf(emailBodyText);
        contentVersion.FirstPublishLocationId = '0015j00001BsNgeAAF';
        insert contentVersion;*/
        
        return emailTemplate.HtmlValue;
    }
       
      /*@AuraEnabled
    public static Map<String, String> getTemplate(String searchKey) {
        EmailTemplate template = [SELECT HtmlValue FROM EmailTemplate WHERE Id = :searchKey];
        Document imageDocument = [SELECT Url FROM Document WHERE Id = '0151m0000000ic5AAA'];
        Map<String, String> emailData = new Map<String, String>();
        emailData.put('template', template.HtmlValue);
        emailData.put('imageUrl', imageDocument.Url);
        return emailData;
    }*/
    
    @AuraEnabled(cacheable=true)
    public static List<String> getEmailFields(String objectApiName) {
        List<String> emailFields = new List<String>();
        
        try {
            // Describe the selected object
            Schema.DescribeSObjectResult objDescribe = Schema.getGlobalDescribe().get(objectApiName).getDescribe();
            
            // Iterate through the fields and identify Email fields
            for (Schema.SObjectField field : objDescribe.fields.getMap().values()) {
                Schema.DescribeFieldResult fieldDescribe = field.getDescribe();
                if (fieldDescribe.getType() == Schema.DisplayType.Email) {
                    emailFields.add(fieldDescribe.getName());
                }
            }
        } catch (Exception e) {
            // Handle any exceptions
        }
        
        return emailFields;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<SObject> fetchDataFromApex(List<String> selectedFields, String objectApiName) {
        System.debug('selectedFields'+selectedFields);
        System.debug('objectApiName'+objectApiName);
        List<SObject> results = new List<SObject>();
        
        try {
            // Construct a dynamic query to select the desired fields
            String query = 'SELECT ' + String.join(selectedFields, ', ') + ' FROM ' + objectApiName;
            
            
            // Execute the dynamic query and assign results
            results = Database.query(query);
        } catch (QueryException qe) {
            // Handle query-related exceptions (e.g., invalid query syntax)
            System.debug('Query Exception: ' + qe.getMessage());
            // You may choose to throw or return an error message
        } catch (Exception e) {
            // Handle other exceptions
            System.debug('Exception: ' + e.getMessage());
            // You may choose to throw or return an error message
        }
        System.debug('results===>>>'+results);
        return results;
    }
    
    @AuraEnabled
   public static void sendEmailTemplate(List<String> toAddress, String subject, String body) {
       System.debug('toAddress'+toAddress);
       System.debug('subject'+subject);
       System.debug('body'+body);
       
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        
        // Set the recipient's email address
       //email.setToAddresses(new String[] { toAddress });
       email.setToAddresses(toAddress);
        
        // Set the email subject
        email.setSubject(subject);
        
        // Set the email body
       email.setHtmlBody(body);
       //email.setPlainTextBody(body);
        
        try {
            // Send the email
            Messaging.SendEmailResult[] results = Messaging.sendEmail(new Messaging.SingleEmailMessage[] { email });
            
            // Check for success
            if (results[0].isSuccess()) {
                System.debug('Email sent successfully');
            } else {
                System.debug('Email sending failed: ' + results[0].getErrors()[0].getMessage());
            }
        } catch (Exception e) {
            System.debug('Exception while sending email: ' + e.getMessage());
        }
       
    }
   
    
}