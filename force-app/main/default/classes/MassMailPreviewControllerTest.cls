@isTest
private class MassMailPreviewControllerTest {
    @isTest
    static void testCallPDF() {
        
         massMailPreviewController controller = new massMailPreviewController();
        ContentVersion testContent = [SELECT ContentDocumentId,title, VersionData, PathOnClient FROM ContentVersion limit 1]; 
        
        // Set up the test page reference
        PageReference pageRef = Page.massEmailVfpage; // Replace YourPageName with your page's name
        Test.setCurrentPage(pageRef);
        pageRef.getParameters().put('recordId', testContent.ContentDocumentId);
        
        // Instantiate the controller
       
        
        Test.startTest();
        // Call the method under test
        controller.callPDF();
        Test.stopTest();
        
        
    }
}