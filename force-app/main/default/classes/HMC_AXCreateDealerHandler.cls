/**
    * @Class Name:  HMC_AXCreateDealerHandler 
    * @Description: HMC_AXCreateDealerHandler - Product webservice
    * @Author:      Developer Name (Neeraj Sethi) (Date - 10/15/2021)
    * @TestClass:   
    * @History
    * 10/15/2021    Developer Name (Neeraj Sethi) | 
    */
    
    public class HMC_AXCreateDealerHandler {
        public static HTTPResponse createDealer(Id recordId) {
            String body = getDealerBody(recordId);
            System.debug('==================>>>>>>>>>>>>>>>>> body => '+body);
            //{"StatusCode":0,"Status":"ERROR","Description":"SourceId  Already exists","dealerCode":"","sourceId":"001C3000002HJt7IAG"}
            HTTPResponse response = HMC_AXCreateDealerHandler.generateHttpResponse(recordId); //HMC_HTTPUtility.sendRequestAX('AX_Create_Customer',body);
            System.debug(response.getbody());
            System.debug('==================>>>>>>>>>>>>>>>>> response => '+response);
            return response;
        }   
        public static HttpResponse generateHttpResponse(String accountId) {
            String dealerCode = getDealerCode(accountId);
            String sourceId = accountId;
            
            // Create JSON body
            Map<String, Object> responseBody = new Map<String, Object>{
                'StatusCode' => 200,
                    'Status' => 'Success',
                    'Description' => 'Success',
                    'dealerCode' => dealerCode,
                    'sourceId' => sourceId
                    };
                        
                        String jsonString = JSON.serializePretty(responseBody);
            
            // Create HTTP response
            HttpResponse response = new HttpResponse();
            response.setHeader('Content-Type', 'application/json');
            response.setBody(jsonString);
            response.setStatusCode(200);
            
            return response;
        }

        private static String getDealerCode(String accountId) {
            List<Account> accounts = [SELECT HMC_Dealer_Code__c FROM Account WHERE HMC_Dealer_Code__c LIKE 'FFX%' ORDER BY HMC_Dealer_Code__c DESC LIMIT 1];
            if (!accounts.isEmpty()) {
                String lastDealerCode = accounts[0].HMC_Dealer_Code__c;
                String numericPart = lastDealerCode.substring(3);
                Integer nextValue = Integer.valueOf(numericPart) + 1;
                String formattedV1 = String.valueOf(nextValue).leftPad(5, '0');
                String nextDealerCode = 'FFX'+String.Valueof(formattedV1);
                return nextDealerCode;
            }
            return 'FFX00001';
        }
        public static String getDealerBody(Id accountId){
            if(accountId!=null){
                List<Account> accLst = [select id,Name,Customer_Group__c,Area__c,HMC_Contact_Email__c,Billingcity,Billingcountry,HMC_GST_Number__c,BillingState,BillingStreet,BillingPostalCode,HMC_Contact_Number__c,HMC_Pan_Card_Number__c from account where id = : accountId];
                system.debug('accLstaccLst'+accLst);
                DealerRequestWrapper wrapperObj = new DealerRequestWrapper();
                wrapperObj.Billingcity = accLst[0].Billingcity;
                wrapperObj.Billingcountry = 'Ind';//HMC_Utility.getCountryCode(accLst[0].BillingCountry) ; //need to discuss
               // wrapperObj.BillingStateCode = HMC_Utility.getStateCode(accLst[0].BillingState);
                wrapperObj.BillingStreet = accLst[0].BillingStreet;
                wrapperObj.BillingZipCode = accLst[0].BillingPostalCode;
                //wrapperObj.currencyCode = HMC_Utility.getcurrencyCode('Indian Rupee');
                wrapperObj.CustName= accLst[0].Name;
                wrapperObj.Email = accLst[0].HMC_Contact_Email__c;
                wrapperObj.sourceid = accountId;
                wrapperObj.AreaId = accLst[0].Area__c;
                wrapperObj.CustGroup = accLst[0].Customer_Group__c;
                wrapperObj.BillingGSTNo = accLst[0].HMC_GST_Number__c;
                wrapperObj.PhoneNo = accLst[0].HMC_Contact_Number__c;
                wrapperObj.PANNumber = accLst[0].HMC_Pan_Card_Number__c;
                
                //wrapperObj.
                system.debug('=========>  There are Yes');
                return JSON.serialize(wrapperObj);
            }else{
                system.debug('=========>  There are no record Id');
                return 'There are no record Id';
            }
            
        }
        public class DealerRequestWrapper{
            public String Billingcity;  //Ajmer
            public String Billingcountry;   //Ind
            public String BillingGSTNo; //EPHPS5028I
            public String BillingStateCode; //RJ
            public String BillingStreet;    //test
            public String BillingZipCode;   //305624
            public String currencyCode; //INR
            public String CustId;   //1234567890
            public String CustName; //SF2
            public String CustSearchName;   //SF2
            public String Email;    //test@gmail.com
            public String InvoiceAccount;   //1234567890
            public String PaymTermId;   //23456789
            public String PhoneNo;  //1234567890
            public String ServiceOrder; //1234567890
            public String sourceid; //0010l00001LixBk
            public String Type = 'Default';
            public String AreaId;
            public String CustGroup;
            public String PANNumber;
        } 
    }