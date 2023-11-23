public class massMailPreviewController {
    public String pdfURL { get; set; }
    public String contentVersionId { get; set; }
    public ContentVersion contentVersion { get; private set; }
    public String contentUrl { get; private set; }
    public massMailPreviewController(){
        //Id recordId = ApexPages.CurrentPage().getParameters().get('id');
        //String contentVersionId = ApexPages.currentPage().getParameters().get('contentVersionId');
    }
    public void callPDF(){
        String contentVersionId = apexPages.currentPage().getParameters().get('recordId');
        System.debug('###contentVersionId : '+ contentVersionId);
        List<ContentVersion> conVirLst1 = new List<ContentVersion>([select id, title, VersionData, PathOnClient, FirstPublishLocationId,IsMajorVersion, ContentDocumentId from ContentVersion Where ContentDocumentId = '0695j00000JenTFAAZ']);
        contentVersionId = conVirLst1[0].Id;
        if(contentVersionId != Null  && contentVersionId != 'undefined'){
            System.debug('not null @@@ ');
            Blob fileData = conVirLst1[0].VersionData;
            pdfURL = fileData != null ? fileData.toString() : '';
            System.debug('pdfURL : '+ pdfURL);       
        }
        else{
            System.debug('helo no preview');
            pdfURL = ' No Preview Page ';
        }
    }
}