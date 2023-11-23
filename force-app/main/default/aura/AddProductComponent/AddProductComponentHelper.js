({
    getProductInformation : function(component, event, helper) {
        //component.set("v.displaySpinner",true);
        // debugger;
        var action = component.get("c.getProductInformation");     
        component.set("v.loadingScreen",true);
        action.setParams({
            opportunityId : component.get("v.recordId")
        });
        
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                component.set("v.loadingScreen",false);
                var productWrapper = response.getReturnValue();
                console.log('productWrapper',productWrapper)
                component.set("v.listOfProducts", productWrapper.lstOfProduct);
                component.set("v.OliWrapperList", productWrapper.exisintingOLIList);
                component.set("v.productDataWrapper", productWrapper);
                component.set("v.OpportunityData",productWrapper.objOfOpportunity);
                debugger;
                //component.set("v.creditLimt",productWrapper.objOfOpportunity.Account.HMC_Credit_Limit__c);
                component.set("v.finalnote",productWrapper.finalnote);
                component.set("v.creditLimt",productWrapper.creditLimt);
                component.set("v.isDealerPresent",productWrapper.DealerCodeNotPresent);
                
                if(productWrapper.DealerCodeNotPresent){
                    
                }
                
                if(productWrapper.finalnote == 'Kindly collect 100% advance payment'){
                    component.set("v.shownote",true);
                }
                var ModelLst = [];
                var AICMAList = [];
                var MapModelAcima = [];
                var MapModelAcimaFinal = [];
                try{
                    for(var indexVar = 0; indexVar < productWrapper.lstOfProduct.length; indexVar++){
                        if(AICMAList.indexOf( productWrapper.lstOfProduct[indexVar].HMC_AICMA__c) === -1) {
                            AICMAList.push( productWrapper.lstOfProduct[indexVar].HMC_AICMA__c);
                            var lst = [];
                            MapModelAcima.push({value:lst, key:productWrapper.lstOfProduct[indexVar].HMC_AICMA__c});
                        }
                    }
                    debugger;
                    
                    for(var key in MapModelAcima ){
                        console.log('key--'+JSON.stringify(MapModelAcima[key].key));
                        var valuelst = [];
                        for(var indexVar = 0; indexVar < productWrapper.lstOfProduct.length; indexVar++){
                            if(MapModelAcima[key].key == productWrapper.lstOfProduct[indexVar].HMC_AICMA__c){
                                if(valuelst.indexOf( productWrapper.lstOfProduct[indexVar].HMC_MODEL__c) === -1) {
                                    valuelst.push(productWrapper.lstOfProduct[indexVar].HMC_MODEL__c);
                                }
                            }
                        }
                        MapModelAcimaFinal.push({value:valuelst, key:MapModelAcima[key].key});
                    }
                }catch(e){
                    console.log(e);
                }
                component.set("v.mapModelACIMA",MapModelAcima);
                component.set("v.mapModelACIMAStore",MapModelAcimaFinal);
                component.set("v.productDataWrapper.AICMAList",AICMAList);
                //component.set("v.productDataWrapper.mapOfModelandAICMA",AICMALst);                
                if(productWrapper.exisintingOLIList == null || productWrapper.exisintingOLIList.length <= 0){
                    //24/06/2022 change remove 1 automatic add row
                    // helper.addRow(component, event, helper);   
                }else{
                    var total = 0;
                    var Quantity = 0;
                    for(var i=0; i < productWrapper.exisintingOLIList.length; i++){
                        console.log('item'+ productWrapper.exisintingOLIList[i].TotalPrice);//TotalPrice
                        total = parseInt(total) + parseInt(productWrapper.exisintingOLIList[i].NetAmount);
                        Quantity = parseInt(Quantity) + parseInt(productWrapper.exisintingOLIList[i].quantity);
                    }
                    component.set("v.Total",total);
                    component.set("v.TotalQuantity",Quantity);
                    
                    
                    
                    /* const index = productWrapper.lstOfProduct.findIndex(prod => prod.Id === productWrapper.exisintingOLIList[i].productId);
                        var prodlst = component.get("v.listOfProducts")[index];
                        //component.get("v.OliWrapperList")[i].lstProductsFilter = prodlst;
                        component.set(component.get("v.OliWrapperList")[i].lstProductsFilter,prodlst);
                        console.log('wrapper -->'+JSON.stringify(component.get("v.OliWrapperList")[i])); */
                    
                    
                }
                
                if(productWrapper.objOfOpportunity.HMC_Order_Submitted__c){
                    component.set("v.enableButton",true);
                }else{
                    component.set("v.enableButton",false);
                }
                if(productWrapper.DealerCodeNotPresent){
                    if(productWrapper.objOfOpportunity.Account.RecordType.Name.indexOf('Dealer') !=-1){
                        component.set("v.enableButton",true);
                        component.set("v.message", 'Dealer is not Onboarded');
                        document.getElementById("showErrorProductCart").style.display = "block";
                    }else if(productWrapper.objOfOpportunity.Account.RecordType.Name.indexOf('Corporate') !=-1){
                        component.set("v.enableButton",true);
                        component.set("v.message", 'Corporate account is not Onboarded.');
                        document.getElementById("showErrorProductCart").style.display = "block";
                    }
                }
            }else if(state === "ERROR" ){
                component.set("v.loadingScreen",false);
                var errors = response.getError();
                if(errors[0] && errors[0].pageErrors){
                    component.set("v.message", errors[0].pageErrors[0].message);
                    document.getElementById("showErrorProductCart").style.display = "block";
                }else if(errors[0] && errors[0].message){
                    component.set("v.message", errors[0].message);
                    document.getElementById("showErrorProductCart").style.display = "block";
                }
            }
        });  
        $A.enqueueAction(action);
    },
    
    checkError : function(oliWrapperList) {
        debugger;
        var looseQuantity = 0;
        var looseProd = false;
        var errorMessage = '';
        if(oliWrapperList.length == 0){
            errorMessage = 'Please add a product and then click finish.';
            return errorMessage;
        }
        for(var i in oliWrapperList){
            var index = eval(i)+1;
            if($A.util.isEmpty(oliWrapperList[i].productId)){
                errorMessage += 'Error in Order Product '+index+': OFFERING(SUMMARY) is required.\n';
            }
            /*
            if($A.util.isEmpty(oliWrapperList[i].listPrice)){
                errorMessage += 'Error in OLI '+index+': PRODUCT AMOUNT is required.\n';
            }*/
            
            if($A.util.isEmpty(oliWrapperList[i].quantity)){
                errorMessage += 'Error in Order Proudct '+index+': QUANTITY is required.\n';
            }
           /* if(v.productDataWrapper.objOfOpportunity.Account.RecordType.Name != 'Retail'){
                alert('retail');
            }*/
            if($A.util.isEmpty(oliWrapperList[i].NetAmount)){
                errorMessage += 'Error in Order Product '+index+': Please get the price before you save\n';
            }
            
            if($A.util.isEmpty(oliWrapperList[i].quantity) && oliWrapperList[i].productType == 'CKD' && oliWrapperList[i].productType % 2 != 0){
                errorMessage += 'Error in Order Product '+index+': QUANTITY should be an even number on a CKD product.\n';
            }
            
            if($A.util.isEmpty(oliWrapperList[i].quantity) && oliWrapperList[i].productType == 'LOOSE'){
                looseProd = true;
                looseQuantity += oliWrapperList[i].quantity;
            }
        }
        
        if(looseProd && looseQuantity < 4){
            errorMessage += 'Error in Order Product minimum quantity on loose product must be 4';
        }
        
        return errorMessage;
    },
    //Added K-error
   /* getPriceError : function(oliWrapperList) {
        //debugger;
        var looseQuantity = 0;
        var looseProd = false;
        var error = '';
        if(oliWrapperList.length == 0){
            error = 'Please add a product and then click finish.';
            return error;
        }
        for(var i in oliWrapperList){
            var index = eval(i)+1;
            if($A.util.isEmpty(oliWrapperList[i].productId)){
                error += 'Error in Order Product '+index+': Product is required.\n';
            }
            if($A.util.isEmpty(oliWrapperList[i].quantity)){
                error += 'Error in Order Proudct '+index+': QUANTITY is required.\n';
            }
       }
        
         return error;
    },*/
    
    createOLI : function(component, event, helper) {
        debugger;
        component.set('v.displaySpinner',true);
        var action = component.get("c.createOLI");      
        console.log('###@@##'+JSON.stringify(component.get("v.OliWrapperList")))
        action.setParams({
            opportunityId : component.get("v.recordId"),
            cliJson: JSON.stringify(component.get("v.OliWrapperList"))
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                component.set('v.displaySpinner',false);
                this.toastMessage(component, event, 'Success Message', 'Record has been updated Successfully', 'SUCCESS');
                
                //commented on Save not to go back on 3rd feb
                /*  var navEvt = $A.get("e.force:navigateToSObject");
                navEvt.setParams({
                    "recordId": component.get("v.recordId"),
                    "slideDevName": "Detail"
                });
                navEvt.fire();*/
                //window.location.href = '/' + component.get("v.recordId");
            }else if(state === "ERROR" ){
                component.set('v.displaySpinner',false);
                var errors = response.getError();
                if(errors[0] && errors[0].pageErrors){
                    //component.set("v.message", errors[0].pageErrors[0].message);
                    document.getElementById("showErrorProductCart").style.display = "block";
                }else if(errors[0] && errors[0].message){
                    component.set("v.message", errors[0].message);
                    document.getElementById("showErrorProductCart").style.display = "block";
                }
            }
        });  
        $A.enqueueAction(action);
    },
    createOLIonSubmit : function(component, event, helper) {
        debugger;
        component.set('v.displaySpinner',true);
        var action = component.get("c.createOLI");      
        console.log('###@@##'+JSON.stringify(component.get("v.OliWrapperList")))
        action.setParams({
            opportunityId : component.get("v.recordId"),
            cliJson: JSON.stringify(component.get("v.OliWrapperList"))
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                // Order Submit after save
                helper.OrderSubmit(component, event, helper);
            }else if(state === "ERROR" ){
                component.set('v.displaySpinner',false);
                var errors = response.getError();
                if(errors[0] && errors[0].pageErrors){
                    //component.set("v.message", errors[0].pageErrors[0].message);
                    document.getElementById("showErrorProductCart").style.display = "block";
                }else if(errors[0] && errors[0].message){
                    component.set("v.message", errors[0].message);
                    document.getElementById("showErrorProductCart").style.display = "block";
                }
            }
        });  
        $A.enqueueAction(action);
    },
    /*getProductDetails : function(component,event,getInputkeyWord) {
        // call the apex class method 
        var action = component.get("c.fetchProduct");
        component.set('v.displaySpinner',true);
        action.setParams({
            opportunityId : component.get("v.recordId")
        });
        // set a callBack    
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                // set searchResult list with return value from server.
                component.set("v.listOfProducts", storeResponse);
                console.log('storeResponse',storeResponse)
                component.set('v.displaySpinner',false);
                //alert(listOfProducts.length)
            }
            
        });
        // enqueue the Action  
        $A.enqueueAction(action);
        
    },*/
    addRow : function(component, event, helper) {
        debugger;
        component.set("v.displaySpinner",true);
        var OliWrapperList = component.get("v.OliWrapperList");
        OliWrapperList.push({});
        component.set("v.OliWrapperList",OliWrapperList);
        component.set("v.displaySpinner",false);
    },
    OrderSubmit : function(component, event, helper){
        debugger;
        var action = component.get("c.getorder");   
        component.set('v.displaySpinner',true);
        var getResponse = [];
        var DescriptionC;
        var StatusC;
        var StatusCodeC;
        action.setParams({
            opportunityId : component.get("v.recordId")
        });
        action.setCallback(this, function(response){
            debugger;
            var state = response.getState();
            console.log('response'+JSON.stringify(response.getReturnValue()));
            component.set('v.displaySpinner',false);
            if(state === "SUCCESS"){
                var result = response.getReturnValue();
                for(var key in result){
                    getResponse.push({key: key,value: result[key]});
                    var responseWrapper = result[key];
                    if(key === 'Description'){
                       DescriptionC = responseWrapper; 
                    }else if(key === 'Status'){
                        StatusC = responseWrapper;
                    } else if(key === 'StatusCode'){
                        StatusCodeC = responseWrapper;
                    }
                }
                if( StatusC === "SUCCESS"){
                    //component.set("v.message", "Order submitted Successfully");
                    document.getElementById("showErrorProductCart").style.display = "block";
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title : 'Success',
                        message: 'Order Submitted Successfully.',
                        duration:' 5000',
                        key: 'info_alt',
                        type: 'success',
                        mode: 'pester'
                    });
                    toastEvent.fire();
                    //console.log('Order submitted Successfully');
                    var navEvt = $A.get("e.force:navigateToSObject");
                    navEvt.setParams({
                        "recordId": component.get("v.recordId"),
                        "slideDevName": "Detail"
                    });
                    navEvt.fire();
                }else{
                    //component.set("v.message", "Error while submitting Order");
                    document.getElementById("showErrorProductCart").style.display = "block";
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title : 'Info',
                        message: 'Error while submitting Order - '+ DescriptionC,
                        duration:' 5000',
                        key: 'info_alt',
                        type: 'info',
                        mode: 'dismissible'
                    });
                    toastEvent.fire();
                    //console.log('Error while submitting Order');
                }
            }else if(state === "ERROR" ){
                var errors = response.getError();
                if(errors[0] && errors[0].pageErrors){
                    component.set("v.message", errors[0].pageErrors[0].message);
                    document.getElementById("showErrorProductCart").style.display = "block";
                }else if(errors[0] && errors[0].message){
                    component.set("v.message", errors[0].message);
                    document.getElementById("showErrorProductCart").style.display = "block";
                }
            }
        });  
        $A.enqueueAction(action);
    },
    getAccountAddressInfo : function(component, event, helper){
        debugger;
        this.getAccountadd(component, event, helper);
        var action = component.get("c.getAddress");   
        component.set('v.loadingScreen',true);
        action.setParams({
            recordId : component.get("v.recordId")
        });
        
        action.setCallback(this, function(response){
            var state = response.getState();
            console.log('response'+JSON.stringify(response.getReturnValue()));
            component.set('v.loadingScreen',false);
            var AddressRec = response.getReturnValue();
            if(state === "SUCCESS"){
                // for(var i=0; i<AddressRec.length; i++){
                /* if(AddressRec[i].Type__c == 'Bill'){
                        component.set("v.BillingAddress",AddressRec[i]);
                  //  }else *///if(AddressRec[i].Type__c == 'Ship'){
                component.set("v.ShippingAddress",AddressRec);
                // }
                // }
            }
        });  
        $A.enqueueAction(action);
    },
    getAccountadd : function(component, event, helper){
        debugger;
        var action = component.get("c.getBillingAddress");   
        component.set('v.loadingScreen',true);
        action.setParams({
            recordId : component.get("v.recordId")
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            console.log('response'+JSON.stringify(response.getReturnValue()));
            component.set('v.loadingScreen',false);
            var AddressRec = response.getReturnValue();
            if(state === "SUCCESS"){
                debugger;
                component.set("v.BillingAddress",AddressRec);
            }
        });  
        $A.enqueueAction(action); 
    },
    updateOppLineItems: function(component, value){
        debugger;
        var total =   component.get("v.Total");
        var valuee =  value;
        var totalValue = total+valuee;
        console.log('hsbfhbsdjf'+valuee);
        component.set("v.Total",totalValue);
    },
    getOppLineItems : function(component, event, helper){
        debugger;
        var action = component.get("c.getOppLineItems");   
        component.set('v.loadingScreen',true);
        action.setParams({
            recordId : component.get("v.recordId")
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            console.log('response'+response.getReturnValue());
            component.set('v.loadingScreen',false);
            var total = 0;
            var Quantity = 0;
            if(state === "SUCCESS"){
                var res = response.getReturnValue();
                var resonsestr = JSON.stringify(res);
                if(res.length != 0){
                    console.log('item');
                    for(var i=0; i < res.length; i++){
                        console.log('item'+ res[i].Net_Amount__c);
                        total = parseInt(total) + parseInt(res[i].Net_Amount__c);
                        Quantity = parseInt(Quantity) + parseInt(res[i].Quantity);
                    }
                }
                component.set("v.Total",total);
                component.set("v.TotalQuantity",Quantity);
            }
        });  
        $A.enqueueAction(action);
    },
    showToast : function(component, type, Message) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title : type,
            message: Message,
            duration:' 5000',
            key: 'info_alt',
            type: type,
            mode: 'dismissible'
        });
        toastEvent.fire();
    },
    
    
    
    handleSearch: function( component, searchTerm ) {
        //component.set("v.loadingScreen",true);
        var OliWrapperList = component.get("v.OliWrapperList");
        var action = component.get( "c.getProductBySku" );
        action.setParams({
            sku: searchTerm
        });
        action.setCallback( this, function( response ) {
            var res = response.getReturnValue();
            if(response.getState() === "SUCCESS"){
                //component.set("v.loadingScreen",false);
                console.log('product -->'+JSON.stringify(res));
                component.set("v.lstSKUproduct",res);
                component.set("v.isprodpresentSKU",true);
                /* if(oliWrapperList.length == 1){
                    if($A.util.isEmpty(oliWrapperList[i].productId) && $A.util.isEmpty(oliWrapperList[i].listPrice) && $A.util.isEmpty(oliWrapperList[i].quantity)){

                    }
                } */
            }
        });
        $A.enqueueAction( action );
    },
    toastMessage: function(component, event, title, errorMessage, errorType) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title: title,
            message: errorMessage,
            type: errorType,
            mode: 'pester'
        });
        toastEvent.fire();
    },
    onTotalChange : function(component, event, helper) {
        debugger;
        var check = JSON.stringify(component.get("v.OliWrapperList"));
        var cc = component.get("v.OliWrapperList");
        var total = 0;
        var Quantity = 0;
        console.log(component.get("v.OliWrapperList"));
        for(var i=0; i<cc.length; i++){
            var kldsfk = parseInt(cc[i].quantity);
            var disc =  parseInt(cc[i].TotalDiscount);
            if(parseInt(cc[i].quantity) != null){
                var finalValue;
                if(parseInt(cc[i].TotalDiscount) != undefined && !isNaN(parseInt(cc[i].TotalDiscount)) && parseInt(cc[i].TotalDiscount) !=0){
                    //var percentage = (parseInt(cc[i].Disount) / 100);
                    var percentage = (100 - parseInt(cc[i].TotalDiscount))/100;
                    //var finalValue = (parseInt(cc[i].quantity) * parseInt(cc[i].listPrice));
                    finalValue = percentage*(parseInt(cc[i].quantity) * parseInt(cc[i].BasePrice));
                    //var finalValue = (parseInt(cc[i].quantity) * parseInt(cc[i].RetaillistPrice));
                    total = total + (finalValue);
                } else if(parseInt(cc[i].TotalDiscount) == undefined || isNaN(parseInt(cc[i].TotalDiscount)) || parseInt(cc[i].TotalDiscount) ==0 ){
                   
                    finalValue = (parseInt(cc[i].quantity) * parseInt(cc[i].BasePrice));
                    //var finalValue = (parseInt(cc[i].quantity) * parseInt(cc[i].RetaillistPrice));
                    total = total + finalValue;
                }
                // Tax calculator
                
                if(parseInt(cc[i].product.Tax_Percentage__c) != undefined && !isNaN(parseInt(cc[i].product.Tax_Percentage__c)) && parseInt(cc[i].product.Tax_Percentage__c) != 0  && parseInt(cc[i].product.Tax_Percentage__c) !='NaN'){
                    
                    var Taxvalue = parseInt(finalValue*parseInt(cc[i].product.Tax_Percentage__c))/100;
                    total = parseInt(total + Taxvalue);
                }
                
                
                total = parseInt(total);
                Quantity = parseInt(Quantity)+parseInt(cc[i].quantity);
            }
        }
        component.set("v.Total",total);
        component.set("v.TotalQuantity",Quantity);
        if(component.get("v.creditLimt") != null && component.get("v.creditLimt") != undefined && component.get("v.finalnote") == null && component.get("v.creditLimt") == undefined){
            if(total != null && total != undefined && !isNaN(total)){
                if(total > component.get("v.creditLimt")){
                    // helper.toastMessage(component, event, 'WARNING Message', 'Total amount is more than credit Limit', 'WARNING');
                    component.set("v.isModalOpenCreditLimit",true); 
                }
            }
        }
        /*    var inputCmp = component.find("inputCmp");
        var type = inputCmp.get("v.value");
        var CheckVal = event.getSource().get('v.name');
        var ccc = event.getSource().get('v.value');
      //  helper.getOppLineItems(component, event, helper);*/
    },
    
    
    parentComponentEvent : function(cmp, event) { 
        //Get the event message attribute
        var message = event.getParam("message"); 
        //Set the handler attributes based on event data 
        alert('Event Message');         
    },
     FocusModelCheck : function(component, event, helper){
        component.set("v.loadingScreen",true);
        var action = component.get("c.FocusModelCheck");
        action.setParams({
            opportunityId : component.get("v.recordId"),
            cliJson: JSON.stringify(component.get("v.OliWrapperList"))
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var res = response.getReturnValue();
                if(res != null){
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title : 'Warning',
                        message: 'Please select these focus models - ' +res,
                        duration:' 3000',
                        key: 'info_alt',
                        type: 'warning',
                        mode: 'sticky'
                    });
                    toastEvent.fire();
                }
            }
            component.set("v.loadingScreen",false);
        });
        $A.enqueueAction(action);
    }
    
})