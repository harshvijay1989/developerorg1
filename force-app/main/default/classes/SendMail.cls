public class SendMail {
    @AuraEnabled(cacheable=true)
    public static String sendEmailWithPDF(String recordId) {
        Quote__c quoteRecord = [SELECT Id, Name,Opportunity__r.Primary_contact__r.Email,Opportunity__r.Name FROM Quote__c WHERE Id = :recordId LIMIT 1];
        Organization orgInfo = [SELECT Id, Name FROM Organization LIMIT 1];
        String emailCustomer=quoteRecord.Opportunity__r.Primary_contact__r.Email;
        System.debug('emailCustomer'+emailCustomer);
        try {
            
            String emailBody = '<p>Please find the attached quote PDF.</p>' +
                '<p>Best regards,<br/>'+orgInfo.Name+'</p>';
            
            
            // Generate PDF using Visualforce page
            PageReference pageRef = Page.customQuotePDF;
            pageRef.getParameters().put('id', recordId);
            Blob pdfBlob = pageRef.getContentAsPDF();
            
                          
            
            // Create an email message
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            email.setSubject('Your Quote Details');
            
            email.setHtmlBody(emailBody);
            
            Messaging.EmailFileAttachment attachment = new Messaging.EmailFileAttachment();
            attachment.setFileName(quoteRecord.Opportunity__r.Name+'-Quote.pdf');
            attachment.setBody(pdfBlob);
            email.setFileAttachments(new Messaging.EmailFileAttachment[]{attachment});
            // Set recipient email address
            email.setToAddresses(new List<String>{emailCustomer});// Add recipient email address
            Messaging.sendEmail(new Messaging.SingleEmailMessage[]{email});
            
            return 'Email sent successfully';
        } catch (Exception e) {
            // Handle exceptions here
            return 'Error sending email: ' + e.getMessage();
        }
    }
    
    @AuraEnabled
    public static String sendInvoicesWithPdf(String recordId) {
        System.debug('recordId => ' + recordId);
        order__c orderRecord = [SELECT Id, ContractId__c, Name, OrderNumber__c, PrimaryQuote__r.Opportunity__r.Primary_contact__r.Email FROM Order__c WHERE Id =: recordId];
        Organization orgInfo = [SELECT Id, Name FROM Organization LIMIT 1];
        String recipientEmail = orderRecord.PrimaryQuote__r.Opportunity__r.Primary_contact__r.Email;
        String emailBody = '<p>Please find the attached Order Invoice PDF.</p>' +
            '<p>Best regards,<br/>'+orgInfo.Name+'</p>';
        //updating order
        Order__c  ord= new Order__c();
        ord.Id=recordId;
        ord.Invoice_Generated__c=true;
        system.debug('order detail'+ord);
        if(ord!=null){
            system.debug('Invoice Send update');
            update ord;
        } 
        try {
            // Generate PDF using Visualforce page
            PageReference pageRef = Page.customInvoicePDF;
            pageRef.getParameters().put('id', recordId);
            Blob pdfBlob = pageRef.getContentAsPDF();

            

            
            
            if (recipientEmail != null) {
                Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
                email.setToAddresses(new List<String>{recipientEmail});
                email.setSubject('Your Order Invoice');
                
                
                email.setHtmlBody(emailBody);
                
                Messaging.EmailFileAttachment attachment = new Messaging.EmailFileAttachment();
                attachment.setFileName('Invoices.pdf');
                attachment.setBody(pdfBlob);
                email.setFileAttachments(new Messaging.EmailFileAttachment[]{attachment});
                
               // Messaging.sendEmail(new Messaging.SingleEmailMessage[]{email});
                
                return 'Email sent successfully';
                
            } else {
                system.debug('Email id is null');	
            }
            return 'Error';
        } catch (Exception e) {
            return 'Error sending email: ' + e.getMessage();
        }   
    }   
}