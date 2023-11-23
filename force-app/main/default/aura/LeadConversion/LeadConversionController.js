({
    doInit : function(component, event, helper) {
        var recId = component.get("v.recordId"); // Replace 'yourRecordId' with the actual record ID you want to pass

        var action = component.get("c.pushLeadToSAP");
        action.setParams({
            "recId": recId
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                if (result) {
                     
                    // Handle the result as needed
                    console.log('result==>',JSON.stringify(result));
                    component.set("v.validateLead",result.hasError);
                }
            } else if (state === "ERROR") {
                
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.error("Error message: " + errors[0].message);
                    }
                } else {
                    console.error("Unknown error");
                }
            }
        });

        $A.enqueueAction(action);
   
    
        if(!component.get("v.validateLead")){
    
        var action = component.get("c.getLeadRec");    
        var artId = component.get("v.recordId");


        console.log(artId);
        
        action.setParams({
            "LeadId":artId
        });
        action.setCallback(this, function (response) {
            var state = response.getState();            
            if (component.isValid() && state === "SUCCESS") {
                console.log(" response:", response.getReturnValue());
                var responseValue=response.getReturnValue();
                console.log("response.companyName:", responseValue.Company);
                component.set("v.leadObj",responseValue.leadObj);
                component.set("v.accountToSave.Name",responseValue.CompanyName);
                component.set("v.accountToSave.Phone",responseValue.phon);
                component.set("v.accountToSave.Owner.Name",responseValue.OwnrId);
                component.set("v.accountToSave.RecordType.Name",component.get('v.AccRecordType'));
                component.set("v.ContactToSave.FirstName",(responseValue.FirstName != null ?responseValue.FirstName:''));
                component.set("v.ContactToSave.LastName",responseValue.LastName);
                component.set("v.OppToSave.Name",responseValue.CompanyName);
                component.set("v.UserValue", responseValue.OwnrId);
                component.set("v.LeadConvertOptions", [{ label: 'Converted', value: 'Converted' }]);
               
                debugger;
                var nameUsr = responseValue.CreatedByName;
                
                //alert('nameUsr'+nameUsr);
                //alert('LeaduserName',component.get("v.userName",nameUsr));
                component.set("v.UserToSave.Name",responseValue.CreatedByName);
                component.set("v.UserToSave.Id",responseValue.CreatedId);
                
            } else {
                console.error("Error while executing " + method, response.getError());
            }
        });
        
        $A.enqueueAction(action);
        }
    },
    handleSelected : function(component, event, helper) {
        
        const acc = component.get('v.accountValue');
        const con = component.get('v.contactValue');
        const opp = component.get('v.opportunityValue');
        const user = component.get('v.UserValue');
        
        if(acc.length > 0){
            console.log('Acc Selected');
        }
        
        console.log('Acc', JSON.parse(JSON.stringify(acc)));
        console.log('Con', JSON.parse(JSON.stringify(con)));
        console.log('Opp', JSON.parse(JSON.stringify(opp)));
        console.log('user', JSON.parse(JSON.stringify(user)));
    },
    openModel: function(component, event, helper) {
        // Set isModalOpen attribute to true
        //alert('@#@# '+component.get("v.leadList"));
        component.set("v.isModalOpen", true);
        $A.get("e.force:closeQuickAction").fire();
    },
    
    closeModel: function(component, event, helper) {
        var checkLWC = component.get("v.CallLwc");
       // alert('64'+checkLWC);
        if(checkLWC == true){
            //alert('66'+checkLWC);
           	 var url = 'https://'+window.location.host+'/lightning/o/Lead__c/list';
            window.location.href=url;
           }
           else{
              //// alert('71'+checkLWC);
        $A.get("e.force:closeQuickAction").fire();
        }
        
    },
    accNewMtd: function(component, event, helper) {
        component.set("v.isAccNew", true);
        component.set("v.isAccOld", false);
    },
    accOldMtd: function(component, event, helper) {
        component.set("v.isAccOld", true);
        component.set("v.isAccNew", false);
    },
    conNewMtd: function(component, event, helper) {
        component.set("v.isConNew", true);
        component.set("v.isConOld", false);
    },
    oldConMtd: function(component, event, helper) {
        component.set("v.isConOld", true);
        component.set("v.isConNew", false);
    },
    oppNewMtd: function(component, event, helper) {
        component.set("v.isOppNew", true);
        component.set("v.isOppOld", false);
        component.set("v.isOppCheckboxActive", false);
        
    },
    oppOldMtd: function(component, event, helper) {
        component.set("v.isOppOld", true);
        component.set("v.isOppNew", false);
        component.set("v.isOppCheckboxActive", false);
    },
    oppCreateMtd: function(component, event, helper) {
        component.set("v.isOppCheckboxActive", true);
        component.set("v.isOppNew", false);
        component.set("v.isOppOld", false);
        component.set("v.isCreateOpp", true);
    },
    handleChange: function (component, event, helper) {
        //var selPickListValue = event.getSource().get("v.value");
        var selPickListValue = component.get("v.ltngSelectedvalue");
        
    },
    submitDetails: function(component, event, helper) {
        component.set("v.isLoding",true);
        debugger;
        
        // Set isModalOpen attribute to false
        //Add your code to call apex method or do some processing
        component.set("v.isModalOpen", false);
        //==strat Save Functiallty
        console.log('value @#@',JSON.stringify(component.get("v.accountToSave")));
        console.log('value @#@ Tue',component.get("v.isAccNew"));
        var obj = { "accObj" : (component.get("v.isAccNew")==true) ?component.get("v.accountToSave"):null,
                   "conObj" : (component.get("v.isConNew")==true) ? component.get("v.ContactToSave"): null,
                   "accExisting" : (component.get("v.isAccOld")==true) ?component.get("v.accountValue"):null,
                   "conExisting" : (component.get("v.isConOld")==true) ?component.get("v.contactValue"):null,
                   "oppObj" : (component.get("v.isOppNew")==true) ?component.get("v.OppToSave"):null,
                   "oppExisting" : (component.get("v.isOppOld")==true) ?component.get("v.opportunityValue"):null,
                   "userRec" : component.get("v.UserToSave"),
                   "CreateOppVar" : component.get("v.isCreateOpp"),
                   "RecTypeName" : component.get("v.ltngSelectedvalue"),
                  
                  };
        
        console.log('obj  @#@',JSON.stringify(obj));
        console.log('LeadId @#@',component.get("v.recordId"));
        var action = component.get("c.saveData");
        action.setParams({"WrapperDetails" : JSON.stringify(obj),
                          "LeadId":component.get("v.recordId")
                         });
         
        action.setCallback(this, function(response) {
            var state = response.getState();
            
            if (state === "SUCCESS") {
             
                console.log('Responce',response.getReturnValue());
                var responseVal = response.getReturnValue();
                var myArray = responseVal.split(".");
                component.set("v.accId", myArray[1]);
                component.set("v.conId", myArray[3]);
                component.set("v.oppId", myArray[4]);
               
                 component.set("v.auraClose", false);
              component.set("v.CallLwc", true);
                
                 //component.find('lWCComponent2').LWCFunction ();
                console.log('@@@@@@@@@',myArray[0]);
                console.log('@#>>>',myArray[1]);
                
                console.log('contectId',myArray[3]);
                console.log('contectId',myArray[4]);
                component.set("v.isLoding",false); 
                
                if(myArray[0]=="Lead Successfully Converted!!"){
                    helper.showSuccess(myArray[0] + myArray[2]);
                    var url = 'https://'+window.location.host+'/lightning/o/Lead__c/list';
                    
                    console.log('url is : ',url);
                    setTimeout(()=>{
                        //window.location.href='https://www.google.com'
                       // window.location.href=url;
                    },1500);
                   
                }else{
                    component.set("v.CallLwc", false);
                    component.set("v.auraClose", true);
                    helper.ShowError(response.getReturnValue());
                }
               
            } 
             //$A.get("e.force:closeQuickAction").fire();
        });
        $A.enqueueAction(action);
    },
    
    submitDetails1: function(component, event, helper) {
       var action = component.get("c.gtAccId");
        action.setCallback(this, function(response) {
            
            var responseValue = response.getReturnValue(); 
            //alert('@@@@ '+responseValue);
            
        });
        
        // Enqueue Action
        $A.enqueueAction(action);
    }
    
    
})