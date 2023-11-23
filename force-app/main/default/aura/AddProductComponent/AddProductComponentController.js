({
    doInit : function(component, event, helper) {
        helper.getProductInformation(component, event, helper);
        helper.getAccountAddressInfo(component, event, helper);
        //helper.getOppLineItems(component, event, helper);
    },
    handleComponentEvent : function(component, event, helper) {
        debugger;
        var valueFromChild = event.getParam("message");
        //alert(valueFromChild)
        for ( var i = 0; i < valueFromChild.length; i++ ) {
            //alert(valueFromChild[i].Id);
            //alert(valueFromChild[i].City__c);
            
            component.set("v.ShippingAddress1", valueFromChild[i].City__c);
            component.set("v.ShippingAddress1",valueFromChild[i].Id);
        }
        //component.set("v.ShippingAddress1", valueFromChild);
        console.log(component.get("v.ShippingAddress1"));
    },
    addRow : function(component, event, helper) {
        helper.addRow(component, event, helper);
    },
    remove : function(component, event, helper) {
        //var count = event.target.id;
        var selectedItem = event.currentTarget;
        var count = selectedItem.dataset.record;
        
        console.log('count is'+count);
        var OliWrapperList =  component.get("v.OliWrapperList");
        OliWrapperList.splice(count, 1);
        component.set("v.OliWrapperList",OliWrapperList );
    },
    
    
    
    
    handleParentEvent : function(cmp, event) { 
        console.log('fire event--->');
        //Get the event message attribute
        var message = event.getParam("message");
        console.log('Test --->',message); 
        //Set the handler attributes based on event data 
        //cmp.set("v.eventMessage", message + 'Biswajeet');
        //  alert(message);         
    }, 
    
    handleComponentEvent1 : function(component, event, helper) {
        debugger;
        console.log('In handleComponentEvent');
        // get the selected Product record from the COMPONENT event 	 
        var index = event.target.id;
        //alert(index);
        //var selectedProductGetFromEvent = event.getParam("ProductByEvent");
        //var index = event.getParam("Index");
        
        var oliWrapper = component.get("v.OliWrapperList[" + index + "]");
        var selectedProductGetFromEvent = oliWrapper.lstProductsFilter.find(prod => oliWrapper.productId === prod.Id)
        
        if($A.util.isEmpty(selectedProductGetFromEvent)){
            oliWrapper.productId = undefined;
            oliWrapper.listPrice = undefined;
            oliWrapper.priceBookEntryId = undefined;
            oliWrapper.quantity = undefined;
            oliWrapper.product = undefined;
            oliWrapper.priceBookEntry = undefined;
            oliWrapper.fileId = undefined;
            //Added K-MRP
            //oliWrapper.MRP = undefined;
            oliWrapper.BasePrice = undefined;
            oliWrapper.TotalDiscount = undefined;
            oliWrapper.NetAmount = undefined;
            component.set("v.OliWrapperList[" + index + "]",oliWrapper);
        }
        else{
            /* oliWrapper.product = selectedProductGetFromEvent;
            oliWrapper.productId = selectedProductGetFromEvent.Id;
            var productVSpricebookEntryMap = component.get("v.productDataWrapper.mapOfProductIdVsPricebookEntry");
            var productIdVSFileIdMap = component.get("v.productDataWrapper.mapOfProductIdVsFileId");
            var priceBookEntry = productVSpricebookEntryMap[oliWrapper.productId];
            oliWrapper.listPrice = priceBookEntry.UnitPrice;
            oliWrapper.priceBookEntryId = priceBookEntry.Id;
            oliWrapper.priceBookEntry = priceBookEntry;
            oliWrapper.fileId = productIdVSFileIdMap[oliWrapper.productId];;
            console.log(JSON.stringify(oliWrapper));
            component.set("v.OliWrapperList[" + index + "]",oliWrapper);  */
            var action = component.get("c.getPriceMaster");        
            action.setParams({
                opportunityId : component.get("v.recordId"),
                productId : selectedProductGetFromEvent.Id
            });
            action.setCallback(this, function(response){
                var state = response.getState();
                if(state === "SUCCESS"){
                    debugger;
                    //var productWrapper1 = response.getReturnValue();
                    oliWrapper.product = selectedProductGetFromEvent;
                    oliWrapper.productId = selectedProductGetFromEvent.Id;
                    var productVSpricebookEntryMap = component.get("v.productDataWrapper.mapOfProductIdVsPricebookEntry");
                    var productIdVSFileIdMap = component.get("v.productDataWrapper.mapOfProductIdVsFileId");
                    var priceBookEntry1 = productVSpricebookEntryMap[oliWrapper.productId];
                    
                    console.log('productWrapper1',response.getReturnValue())
                    var priceBookEntry = response.getReturnValue();
                    console.log('priceBookEntry.UnitPrice'+priceBookEntry.UnitPrice);
                    
                    // 09-07-2022 Start
                    /* if($A.util.isUndefinedOrNull(priceBookEntry.UnitPrice)){ //$A.util.isUndefinedOrNull(someAttribute) priceBookEntry.UnitPrice != '' || priceBookEntry.UnitPrice !=='undefined'
                        console.log('inside if ----------');
                        oliWrapper.Disount = '';
                        oliWrapper.product = selectedProductGetFromEvent;
                        oliWrapper.listPrice = priceBookEntry1.UnitPrice;
                        oliWrapper.priceBookEntryId = priceBookEntry1.Id;
                        oliWrapper.priceBookEntry = priceBookEntry1;
                        //oliWrapperoliWrapper.fileId = priceBookEntry1.FileId;
                        console.log(JSON.stringify(oliWrapper));
                        component.set("v.OliWrapperList[" + index + "]",oliWrapper);
                    }else{
                        oliWrapper.listPrice = priceBookEntry.UnitPrice;
                        oliWrapper.RetaillistPrice = priceBookEntry.RetailUnitPrice;
                        oliWrapper.product = selectedProductGetFromEvent;
                        oliWrapper.Disount = priceBookEntry.discount;
                        oliWrapper.StockFlag = priceBookEntry.StockAvailable;
                        oliWrapper.FinalPrice = priceBookEntry.finalAmount;
                        oliWrapper.priceBookEntryId = priceBookEntry.priceBookEntry.Id;
                        oliWrapper.priceBookEntry = priceBookEntry.priceBookEntry;
                        oliWrapper.fileId = priceBookEntry.FileId;
                        console.log(JSON.stringify(oliWrapper));
                        component.set("v.OliWrapperList[" + index + "]",oliWrapper);
                        console.log('inside else ----------');
                    }*/
                    oliWrapper.StockFlag = priceBookEntry.StockAvailable;
                    oliWrapper.priceBookEntryId = priceBookEntry.priceBookEntry.Id;
                    oliWrapper.fileId = priceBookEntry.FileId;
                    component.set("v.OliWrapperList[" + index + "]",oliWrapper);
                    // 09-07-2022 End
                    
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
            component.set("v.displaySpinner",true);
            $A.enqueueAction(action);
        }
    },
    handleaicmaChange : function(component, event, helper) {
        component.set("v.loadingScreen",true);
        var prodlst = component.get("v.listOfProducts");
        var AICMALst =new Set();
        var ModelLst =new Set();
        var index = event.target.id;
        var oliWrapper = component.get("v.OliWrapperList[" + index + "]");
        /* for(var indexVar = 0; indexVar < prodlst.length; indexVar++){
            if(prodlst[indexVar].HMC_MODEL__c == oliWrapper.model){
                AICMALst.add(prodlst[indexVar].HMC_AICMA__c);
                listOfProductsMod.push(prodlst[indexVar]);
            }
        } */
        var aicammap  =  component.get("v.mapModelACIMAStore");
        for(var key in aicammap){
            console.log(key);
            console.log(aicammap[key].key);
            if(aicammap[key].key == oliWrapper.AICMA){
                ModelLst = aicammap[key].value;
            }
        }
        //var lstaicma = aicammap[oliWrapper.model].key;
        //component.set("v.listOfProductsModel",listOfProductsMod);
        oliWrapper.models = Array.from(ModelLst);
        
        
        //clear
        oliWrapper.productId = undefined;
        oliWrapper.listPrice = undefined; 
        oliWrapper.RetaillistPrice = undefined ;
        oliWrapper.priceBookEntryId = undefined;
        oliWrapper.quantity = undefined;
        oliWrapper.product = undefined;
        oliWrapper.priceBookEntry = undefined;
        oliWrapper.fileId = undefined;
        //Added K-MRP
        //oliWrapper.MRP = undefined;
        oliWrapper.BasePrice = undefined;
        oliWrapper.TotalDiscount = undefined;
        oliWrapper.NetAmount = undefined;
        
        console.log(JSON.stringify(oliWrapper));
        component.set("v.OliWrapperList[" + index + "]",oliWrapper);
        console.log('oliWrapper',oliWrapper)
        component.set("v.loadingScreen",false);
    },
    onModelChange : function(component, event, helper){
        debugger;
        component.set("v.loadingScreen",true);
        var lstprod = [];
        var prodlst = component.get("v.listOfProducts");
        var index = event.target.id;
        var oliWrapper = component.get("v.OliWrapperList[" + index + "]");
        /* for(var indexVar = 0; indexVar < prodlst.length; indexVar++){
            if(prodlst[indexVar].HMC_MODEL__c == oliWrapper.model && prodlst[indexVar].HMC_AICMA__c == oliWrapper.AICMA){
                lstprod.push(prodlst[indexVar]);
            }
        } */
        console.log(Array.isArray(prodlst));
        lstprod = prodlst.filter(prod => oliWrapper.model === prod.HMC_MODEL__c & oliWrapper.AICMA === prod.HMC_AICMA__c)
        debugger;
        oliWrapper.lstProductsFilter = lstprod;
        
        //clear
        oliWrapper.productId = undefined;
        oliWrapper.listPrice = undefined; 
        oliWrapper.RetaillistPrice = undefined ;
        oliWrapper.priceBookEntryId = undefined;
        oliWrapper.quantity = undefined;
        oliWrapper.product = undefined;
        oliWrapper.priceBookEntry = undefined;
        oliWrapper.fileId = undefined;
        //Added K-MRP
        //oliWrapper.MRP = undefined;
        oliWrapper.BasePrice = undefined;
        oliWrapper.TotalDiscount = undefined;
        oliWrapper.NetAmount = undefined;
        
        console.log('lstprod-->'+lstprod);
        console.log(JSON.stringify(oliWrapper) +' wrapperksvjf');
        component.set("v.loadingScreen",false);
        component.set("v.OliWrapperList[" + index + "]",oliWrapper);
    },
    handleProductChange : function(component, event, helper) {
        var index = event.target.id;
        // alert(index)
        debugger;
        var oliWrapper = component.get("v.OliWrapperList[" + index + "]");
        // oliWrapper.product = selectedProductGetFromEvent;
        oliWrapper.productId = component.get('v.selectedProductId');
        var productVSpricebookEntryMap = component.get("v.productDataWrapper.mapOfProductIdVsPricebookEntry");
        var productIdVSFileIdMap = component.get("v.productDataWrapper.mapOfProductIdVsFileId");
        var priceBookEntry = productVSpricebookEntryMap[oliWrapper.productId];
        oliWrapper.listPrice = priceBookEntry.UnitPrice;
        oliWrapper.priceBookEntryId = priceBookEntry.Id;
        oliWrapper.priceBookEntry = priceBookEntry;
        oliWrapper.fileId = productIdVSFileIdMap[oliWrapper.productId];
        //alert(oliWrapper.productId)
        console.log(JSON.stringify(oliWrapper));
        component.set("v.OliWrapperList[" + index + "]",oliWrapper);
    },
    onProductTypeSelect : function(component, event, helper) {
        var index = event.target.id;
        console.log('index is'+index);
        var oliWrapper = component.get("v.OliWrapperList[" + index + "]");
        oliWrapper.productId = undefined;
        oliWrapper.listPrice = undefined; 
        oliWrapper.priceBookEntryId = undefined;
        oliWrapper.quantity = undefined;
        oliWrapper.product = undefined;
        oliWrapper.priceBookEntry = undefined;
        oliWrapper.fileId = undefined;
        component.set("v.OliWrapperList[" + index + "]",oliWrapper);
    },
    
    redirectToOpportunity: function(component, event, helper) {
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": component.get("v.recordId"),
            "slideDevName": "Detail"
        });
        navEvt.fire();
        //window.location.href = '/' + component.get("v.recordId");
    },
    
    saveOpportunityLineItem: function(component, event, helper) {
        debugger;
        var errorMessage = '';
        component.set("v.message",'');
        var OliWrapperList = component.get("v.OliWrapperList");
        console.log(component.get("v.OliWrapperList"));
        errorMessage = helper.checkError(OliWrapperList);
        console.log('errorMessage:::::'+errorMessage);
        if(errorMessage != ''){
            component.set("v.message",errorMessage);
            document.getElementById("showErrorProductCart").style.display = "block";
        }
        else{
            helper.createOLI(component, event, helper);
        }
    },
    submitOpportunityLineItem : function(component, event, helper){
        debugger;
        var errorMessage = '';
        component.set("v.message",'');
        var OliWrapperList = component.get("v.OliWrapperList");
        errorMessage = helper.checkError(OliWrapperList);
        console.log('errorMessage:::::'+errorMessage);
        if(errorMessage != ''){
            component.set("v.message",errorMessage);
            document.getElementById("showErrorProductCart").style.display = "block";
        }
        else{
            // Submit time save the order
            helper.createOLIonSubmit(component, event, helper);
            //helper.OrderSubmit(component, event, helper);
        }
    },
    GetCreditLimitDealer :  function(component, event, helper){
        debugger;
        component.set("v.loadingScreen",true);
        var action = component.get("c.getCreditLimit");
        action.setParams({
            'recordId': component.get("v.recordId"),
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (component.isValid() && state === "SUCCESS") {
                var storeResponse = response.getReturnValue(); 
                component.set("v.loadingScreen",false);
                if (response.getReturnValue() != "Error") {
                    component.set("v.creditLimt",response.getReturnValue());
                    //helper.showToast(component,'Success','Credit Limit had been updated Successfully');
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title : 'Success',
                        message: 'Credit Limit had been updated Successfully.',
                        duration:' 5000',
                        key: 'info_alt',
                        type: 'Success',
                        mode: 'dismissible'
                    });
                    toastEvent.fire();
                }else if (response.getReturnValue() == "Error") {
                    helper.showToast(component,'Success','Error while getting Credit limit');
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    previewpdf : function(component, event, helper){
        var action = component.get('c.genaratedInvoicePdf'); 
        var recordIdacc = component.get('v.recordId');
        action.setParams({
            "OrderId": recordIdacc
        });  
        action.setCallback(this, function(response) {
            var state = response.getState();
            debugger;
            if (state === "SUCCESS") {
                if(response.getReturnValue() == 'Success'){
                    component.set('v.pdfGenarated',true);                    
                }else{
                    component.set('v.noError',false);
                    component.set('v.pdfGenaratedError',true);
                }
            }
            
        });
        $A.enqueueAction(action);
    },
    
    openModel: function(component, event, helper) {
        // Set isModalOpen attribute to true
        if($A.get("$Browser.isPhone") == false){
            component.set("v.isModalOpen", true);    
        }else{
            var urlEvent = $A.get("e.force:navigateToURL");
            urlEvent.setParams({
                "url": '/apex/HMC_OrderPreview?Id=' + component.get("v.recordId")
            });
            urlEvent.fire();
            //sforce.one.navigateToURL('/apex/HMC_OrderPreview?Id=' + component.get("v.recordId"));
        }        
    },
    
    closeModel: function(component, event, helper) {
        // Set isModalOpen attribute to false  
        component.set("v.isModalOpen", false);
    } ,
    closeModelCredit: function(component, event, helper) {
        // Set isModalOpen attribute to false  
        component.set("v.isModalOpenCreditLimit", false);
    } ,
    SendEmail : function(component, event, helper){
        var action = component.get('c.genaratePdf'); 
        var recordIdacc =  component.get("v.recordId");
        //('recordIdacc  '+recordIdacc);
        action.setParams({
            "OrderId": component.get("v.recordId")
        });  
        action.setCallback(this, function(response) {
            var state = response.getState();
            debugger;
            if (state === "SUCCESS") {
                if(response.getReturnValue() == 'Success'){
                    alert('Mail sent successfully');
                }else{
                    alert('Mail sent failed');
                }
            }
            
        });
        $A.enqueueAction(action);
        
    },
    addRowOpenPopUp: function(component, event, helper) {
        // Set isModalOpen attribute to true
        component.set("v.isModalOpenSKU", true);
    },
    
    closeModelsku: function(component, event, helper) {
        // Set isModalOpen attribute to false  
        component.set("v.isModalOpenSKU", false);
    },
    
    
    onSearchTermChange: function( component, event, helper ) {
        // search anytime the term changes
        var searchTerm = component.get( "v.searchTerm" );
        // to improve performance, particularly for fast typers,
        // we wait a small delay to check when user is done typing
        var delayMillis = 500;
        // get timeout id of pending search action
        var timeoutId = component.get( "v.searchTimeoutId" );
        // cancel pending search action and reset timer
        clearTimeout( timeoutId );
        // delay doing search until user stops typing
        // this improves client-side and server-side performance
        timeoutId = setTimeout( $A.getCallback( function() {
            helper.handleSearch( component, searchTerm );
        }), delayMillis );
        component.set( "v.searchTimeoutId", timeoutId );
    },
    
    AddSelectedProd: function(component, event, helper) {
        var records = [];
        component.set("v.loadingScreen",true);
        var productVSpricebookEntryMap = component.get("v.productDataWrapper.mapOfProductIdVsPricebookEntry");
        var productIdVSFileIdMap = component.get("v.productDataWrapper.mapOfProductIdVsFileId");
        //var priceBookEntry1 = productVSpricebookEntryMap[oliWrapper.productId];
        var selectedProd = [];
        var checkvalue = component.find("prodSku");
        //undefined
        if(checkvalue == undefined){
            component.set("v.loadingScreen",false);
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                title : 'Error',
                message:'Can not Add Product before Search',
                duration:' 5000',
                key: 'info_alt',
                type: 'error',
                mode: 'pester'
            });
            toastEvent.fire();
            
        }else{
            if(!Array.isArray(checkvalue)){
                if (checkvalue.get("v.value") == true) {
                    selectedProd.push(checkvalue.get("v.text"));
                }
            }else{
                for (var i = 0; i < checkvalue.length; i++) {
                    if (checkvalue[i].get("v.value") == true) {
                        selectedProd.push(checkvalue[i].get("v.text"));
                    }
                }
            }
            if(selectedProd == ''){
                component.set("v.loadingScreen",false);
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    title : 'Error',
                    message:'Please select the check box to add the product',
                    duration:' 5000',
                    key: 'info_alt',
                    type: 'error',
                    mode: 'pester'
                });
                toastEvent.fire();
            }else{
                console.log('selectedProd-' + selectedProd);
                for(var i=0;i<component.get('v.listOfProducts').length;i++){
                    for(var j=0;j<selectedProd.length;j++){
                        if(component.get('v.listOfProducts')[i].Name == selectedProd[j]){
                            records.push(component.get('v.listOfProducts')[i]);
                        }
                    }
                }
                
                var OliWrapperList = component.get("v.OliWrapperList");
                /* if(OliWrapperList.length <= 1){
            if($A.util.isEmpty(oliWrapperList[1].productId) && $A.util.isEmpty(oliWrapperList[1].listPrice) && $A.util.isEmpty(oliWrapperList[1].quantity)){
                remove(component, event, helper);
            }
        } */
                var action = component.get("c.getPriceForSku");
                action.setParams({
                    'prodlst' : records,
                    'opportunityId': component.get("v.recordId"),
                });
                action.setCallback( this, function( response ) {
                    var res = response.getReturnValue();
                    if(response.getState() === "SUCCESS"){
                        debugger;
                        component.set("v.loadingScreen",false);
                        console.log('productwithprice -->'+JSON.stringify(res));
                        var custs = [];
                        for ( var key in res ) {
                            custs.push({value:res[key], key:key});
                            for(var i=0;i<records.length;i++){
                                if(key == records[i].Id){
                                    var priceWrapper = res[key];
                                    console.log('priceWrapper-->'+priceWrapper);
                                    /*if(priceWrapper.UnitPrice == undefined){
                                OliWrapperList.push({'productId':records[i].Id , 'product' : records[i],
                                                     'model' : records[i].HMC_MODEL__c , 'AICMA' :   records[i].HMC_AICMA__c 
                                                    });
                            }else{ commented*/
                                    var aicmalst = [];
                                    var prodlst = [];
                                    var models = [];
                                    aicmalst.push(records[i].HMC_AICMA__c);
                                    models.push(records[i].HMC_MODEL__c);
                                    prodlst.push(records[i]);
                                    console.log('records[i].HMC_AICMA__c --> '+records[i].HMC_AICMA__c);
                                    // 24/06/2022 Add - , 'StockFlag' : priceWrapper.StockAvailable
                                    OliWrapperList.push({'productId':records[i].Id , 'product' : records[i],'RetaillistPrice' : priceWrapper.RetailUnitPrice ,
                                                         'model' : records[i].HMC_MODEL__c , 'AICMA' :   records[i].HMC_AICMA__c , 'AICMAList' : aicmalst , 'lstProductsFilter' : prodlst ,'models':models,
                                                         'listPrice' : priceWrapper.UnitPrice , 'priceBookEntryId' : priceWrapper.priceBookEntry.Id,
                                                         'fileId' : priceWrapper.FileId, 'Disount' : priceWrapper.discount , 'StockFlag' : priceWrapper.StockAvailable
                                                        });
                                    // }
                                    
                                    console.log('OliWrapperList test--->',OliWrapperList);
                                    component.set("v.OliWrapperList",OliWrapperList);
                                    console.log(component.get("v.OliWrapperList"));
                                }
                            }
                        }                
                    }
                });
                $A.enqueueAction( action );
                component.set("v.isModalOpenSKU", false); 
            }  
        }
    },
     handleGetPrice : function(component, event, helper){
        component.set("v.loadingScreen",true);
        var action = component.get("c.HMC_ProductGetDiscount");
        action.setParams({
            opportunityId : component.get("v.recordId"),
            cliJson: JSON.stringify(component.get("v.OliWrapperList"))
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var res = response.getReturnValue();
                component.set("v.OliWrapperList", res);
                helper.onTotalChange(component, event, helper);
                // helper.FocusModelCheck(component, event, helper);
                console.log('handleGetPrice'+response.getReturnValue());
            }
            component.set("v.loadingScreen",false);
        });
       
        $A.enqueueAction(action);
    },
    /*
    handleGetPrice : function(component, event, helper){
        component.set("v.loadingScreen",true);
        var error = '';
        component.set("v.message",'');
        var OliWrapperList = component.get("v.OliWrapperList");
        console.log(component.get("v.OliWrapperList"));
        error = helper.getPriceError(OliWrapperList);
        console.log('errorMessage:::::'+error);
        if(error != ''){
            component.set("v.loadingScreen",false);
            component.set("v.message",error);
            document.getElementById("showErrorProductCart").style.display = "block";
        }else{
            var action = component.get("c.HMC_ProductGetDiscount");
            action.setParams({
                opportunityId : component.get("v.recordId"),
                cliJson: JSON.stringify(component.get("v.OliWrapperList"))
            });
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var res = response.getReturnValue();
                    component.set("v.OliWrapperList", res);
                    helper.onTotalChange(component, event, helper);
                    console.log('handleGetPrice'+response.getReturnValue());
                }
                component.set("v.loadingScreen",false);
            });
            
            $A.enqueueAction(action);
        }
    }*/
    handleShippingAddress : function(component, event, helper){
        helper.getAccountAddressInfo(component, event, helper);
    }
})