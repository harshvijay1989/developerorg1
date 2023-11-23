import {
    LightningElement,
    api,
    wire, track
} from 'lwc';
import kycdoucement from '@salesforce/schema/Account.HMC_KYC_Document__c';
import marketreputation from '@salesforce/schema/Account.HMC_Market_Reputation__c';
import legaldoc from '@salesforce/schema/Account.HMC_Legal_Proceeding__c';
import checklist from '@salesforce/schema/Account.HMC_Checklist_Completed__c';
import reasonlegal from '@salesforce/schema/Account.HMC_Rejection_Reason__c';

import monthlysales from '@salesforce/schema/Account.HMC_Monthly_Sales__c';
import securitdeposit from '@salesforce/schema/Account.HMC_Security_Deposit__c';
import networth from '@salesforce/schema/Account.HMC_Net_Worth__c';
import businessexp from '@salesforce/schema/Account.HMC_Business_Experience__c';
import noOfyrstrade from '@salesforce/schema/Account.HMC_NumberofyearsincycleTrade_Business__c';
import roiscore from '@salesforce/schema/Account.HMC_ROI_Score1__c';

import currentstepacc from '@salesforce/schema/Account.HMC_Current_Step__c';
import paymentstatus from '@salesforce/schema/Account.HMC_Payment_Status__c';
import stage from '@salesforce/schema/Account.HMC_Stage__c';
import comments from '@salesforce/schema/Account.HMC_Comments__c';
import verificationstatus from '@salesforce/schema/Account.HMC_Verification_Status__c';

import submitDealer from '@salesforce/apex/HMC_ChecklistManagerController.submitDealer';
import createDeviationTask from '@salesforce/apex/HMC_ChecklistManagerController.createDeviationTask';
import genarateDealerCode from '@salesforce/apex/HMC_ChecklistManagerController.genarateDealerCode';
import sendEmailToDealer from '@salesforce/apex/HMC_ChecklistManagerController.sendEmailToDealer';
import sendNotification from '@salesforce/apex/HMC_ChecklistManagerController.sendNotification';
import createFinancetask from '@salesforce/apex/HMC_ChecklistManagerController.createFinancetask';
import getTasklist from '@salesforce/apex/HMC_ChecklistManagerController.getTasklist';
import getAccount from '@salesforce/apex/HMC_ChecklistManagerController.getAccount';
import savePaymentStatus from '@salesforce/apex/HMC_ChecklistManagerController.savePaymentStatus';
import saveVerificationStatus from '@salesforce/apex/HMC_ChecklistManagerController.saveVerificationStatus';
import saveApproval from '@salesforce/apex/HMC_ChecklistManagerController.saveApproval';
import updateAbort from '@salesforce/apex/HMC_ChecklistManagerController.updateAbort';
import enableSaveBtnForDocumentTab from '@salesforce/apex/HMC_ChecklistManagerController.enableSaveBtnForDocumentTab';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import {
    CloseActionScreenEvent
} from 'lightning/actions';
import { getRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
export default class hmc_checklistManager extends NavigationMixin(LightningElement) {
    @api recordId;
    @api objectApiName;

    isVisible = false;
    fields = [kycdoucement, marketreputation, legaldoc, checklist, reasonlegal, currentstepacc, stage, verificationstatus];
    fieldContent;
    kycdocumentvar;
    marketreputationvar;
    legalproceedingvar;
    roiscorevar;
    checklistvar;
    isvisiblepopup = false;
    isDeviation = false;
    isLoading = false;
    accountRecord;
    disableRecord = false;
    disableDocuRecord = false;
    islegalProceeding = false;
    showlegalreson = false;
    //for paths 
    isroivisible = false;
    iskyc = false;
    isadvancepatment = false;
    isdocuments = false;
    isDeviationtask = false;
    value = 'inProgress';
    showkyc = true;
    @track currentStep;
    oldPathHide = false;
    newPathHide = false;
    gstNumber = '';
    panCardNumber = '';
    @track url;

    connectedCallback() {
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                actionName: 'view',
            },
        }).then((url) => {
            this.url = url;
        });

    }
    get acceptedFormats() {
        return ['.pdf', '.png', '.jpg', '.jpeg'];
    }
    handleUploadFinished(event) {
        // Get the list of uploaded files
        const uploadedFiles = event.detail.files;
        let uploadedFileNames = '';
        for (let i = 0; i < uploadedFiles.length; i++) {
            uploadedFileNames += uploadedFiles[i].name + ', ';
        }
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: uploadedFiles.length + ' Files uploaded Successfully: ' + uploadedFileNames,
                variant: 'success',
            }),
        );
    }
    get options() {
        return [
            { label: 'Approve', value: 'Approve' },
            { label: 'Reject', value: 'Reject' }
        ];
    }
    get optionsarea() {
        return [
            { label: 'NORTH', value: 'NORTH' },
            { label: 'SOUTH', value: 'SOUTH' },
            { label: 'EAST', value: 'EAST' },
            { label: 'WEST', value: 'WEST' },
            { label: 'CENTRAL', value: 'CENTRAL' }
        ];
    }

    get optionsCustomer_Group() {
        return [
            { label: 'CG-01- Exclusive Dealer', value: 'CG01' },
            { label: 'CG-02- Multi Brand Dealer', value: 'CG02' },
            { label: 'CG-013- Distributor', value: 'CG13' }
        ];
    }
    get optionskyc() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' }
        ];
    }

    get optionslegal() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' }
        ];
    }


    get optionsmarket() {
        return [
            { label: 'Positive', value: 'Positive' },
            { label: 'Negative', value: 'Negative' }
        ];
    }

    get optionspayment() {
        return [
            { label: 'Paid in Full', value: 'Paid in Full' },
            { label: 'Pending', value: 'Pending' }
        ];
    }
    get optionsDocument() {
        return [
            { label: 'Approved', value: 'Approved' },
            { label: 'Rejected', value: 'Rejected' },
            { label: 'Need Additional Details', value: 'Need Additional Details' },
            { label: 'Waiting for Approval', value: 'Waiting for Approval' }
        ];
    }

    lstAccounts = [
        {
            pItem: '101',
            Name: 'Cristiano Ronaldo'
        },
        {
            pItem: '102',
            Name: 'Lionel Messi'
        },
        {
            pItem: '103',
            Name: 'Sachin Tendulkar'
        }
    ];


    get picklistValues() {

    }
    paymentstatus = '';
    verificationstatus = ''
    verficationcomments = ''
    area = ''
    customer_Group = ''
    kyc = ''
    marketreputation1 = ''
    legalprice = ''
    roi = null
    rejectreason = ''
    disableAbort = false;
    currentStepcheck;
    isDocShowtextshow = false;

    @wire(getRecord, { recordId: '$recordId', fields: [kycdoucement, marketreputation, legaldoc, currentstepacc, stage, checklist, verificationstatus] })
    wiredRecord({ error, data }) {
        if (data) {
            this.onLoadCall();
            this.accountRecord = data;
            console.log('this.accountRecord.fields.HMC_Checklist_Completed__c' + this.accountRecord.fields.HMC_Checklist_Completed__c.value);
            if (this.accountRecord.fields.HMC_Checklist_Completed__c.value) {
                console.log('disable');
                this.disableRecord = true;
                this.disableDocuRecord = true;
                this.isDocShowtextshow = true;
            } else {
                this.disableRecord = false;
            }

            if (this.accountRecord.fields.HMC_Stage__c.value == 'Closed Dropped') {
                this.disableAbort = true;
            }
            console.log('this.accountRecord.fields.HMC_Stage__c' + this.accountRecord.fields.HMC_Stage__c.value);
            this.currentStep = String(this.accountRecord.fields.HMC_Current_Step__c.value);
            if (this.accountRecord.fields.HMC_Current_Step__c.value === 4) {
                this.oldPathHide = true;
            }
            if (this.currentStep != null) {
                this.newPathHide = true;
            }
            console.log('this.showkyc ' + this.showkyc);
            if (this.accountRecord.fields.HMC_Current_Step__c.value === 1) {
                this.isroivisible = true;
            }
            if (this.accountRecord.fields.HMC_Current_Step__c.value === 2) {
                this.isroivisible = false;
                this.iskyc = true;
                this.currentStepcheck = this.accountRecord.fields.HMC_Current_Step__c.value;
            }
            if (this.accountRecord.fields.HMC_Current_Step__c.value === 3) {
                this.isadvancepatment = true;
            }
            if (this.accountRecord.fields.HMC_Current_Step__c.value === 4) {
                this.isdocuments = true;
            }

        } else if (error) {

        }
    }

    handleCancel(event) {
        this.isDeviation = false;
        this.islegalProceeding = false;
        this.showlegalreson = false;
    }

    handlepancardNumber(event) {

    }

    handlegstNumber(event) {
        this.gstNumber = event.target.value;

    }

    handlepancardNumber(event) {
        this.panCardNumber = event.target.value;
    }

    onLoadCall() {
        console.log('On load');
        getTasklist({ recordId: this.recordId }).then(result => {
            console.log('result.length ' + result.length);
            if (result.length === 0 && this.currentStepcheck === 2) {
                this.showkyc = true;
            } else if (result.length > 0 && this.currentStepcheck === 2) {
                this.showkyc = false;
                this.isDeviationtask = true;
                this.iskyc = false;
            }
        })
            .catch(error => { });

        enableSaveBtnForDocumentTab({ recordId: this.recordId }).then(result => {
            this.disableDocuRecord = result;
            if (this.disableDocuRecord) {
                this.isDocShowtextshow = true;
            } else {
                this.isDocShowtextshow = false;
            }
        })
            .catch(error => {
                console.log('error' + error);
            });

        console.log('this.disableDocuRecord' + this.disableDocuRecord);
        getAccount({ recordId: this.recordId }).then(result => {
            this.paymentstatus = result.HMC_Payment_Status__c;
            this.verificationstatus = result.HMC_Verification_Status__c,
                this.verficationcomments = result.HMC_Comments__c
            this.kyc = result.HMC_KYC_Document__c;
            this.marketreputation1 = result.HMC_Market_Reputation__c;
            this.legalproce = result.HMC_Legal_Proceeding__c;
            this.roi = result.HMC_ROI_Score1__c;
            this.area = result.Area__c;
            this.customer_Group = result.Customer_Group__c;
            this.gstNumber = result.HMC_GST_Number__c;
            this.panCardNumber = result.HMC_Pan_Card_Number__c;
            try {
                this.roi = this.roi.toFixed(2);
            } catch (e) { }
        })
            .catch(error => { });
    }


    handleRecordSubmit() {
        /* this.isLoading = true; 
         console.log('normal');
          const fieldsvar = this.template.querySelectorAll('lightning-input-field');
         this.fieldContent = fieldsvar;
         fieldsvar.forEach(val=>{
                 console.log(val.value);
                 if(val.name == 'kyc'){
                     this.kycdocumentvar = val.value;
                 }
                 if(val.name == 'market'){
                     this.marketreputationvar = val.value;
                 }
                 if(val.name == 'legal'){
                     this.legalproceedingvar = val.value;
                 }
                 if(val.name == 'roiscore'){
                     this.roiscorevar =  val.value;
                 }
 
             }
         ) */
        if (this.customer_Group == undefined || this.customer_Group == '') {
            const evt = new ShowToastEvent({
                title: 'Warning',
                message: 'Customer Groups field is required',
                variant: 'warning',
                mode: 'dismissable'
            });
            this.dispatchEvent(evt);
            this.isLoading = false;
        } else if (this.isInputValid()) {
            saveApproval({ recordId: this.recordId, Area: this.area, Customer_Group: this.customer_Group, KYC: this.kyc, marketreputation: this.marketreputation1, legalProceeding: this.legalprice, gstNumber: this.gstNumber, panCardNumber: this.panCardNumber }).then(result => { })

                .catch(error => { });
                
            if (this.kyc == 'Yes' && this.marketreputation1 == 'Positive' && this.legalproce == 'No' && this.roi > 42) {
                console.log('if submit');
                //this.handlesaveRecord();
                submitDealer({ recordId: this.recordId }).then(result => {
                    this.isLoading = false;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Dealer Onboarding Task Created for Sales Head!',
                            variant: 'success',
                        }),
                    );
                    window.location.reload();
                    //this.contacts = result;
                })
                    .catch(error => {
                        //this.errorMsg = error;
                    })/* 
                 const result = await submitDealer({recordId: this.recordId});
                    console.log(JSON.stringify("Apex update result: "+ result)); */
            } else {
                this.isLoading = false;
                console.log('else submit');
                if (this.legalproce == 'Yes') {
                    this.islegalProceeding = true;
                } else {
                    this.isDeviation = true;
                }
            }
        }
    }

    handleclose(event) {
        this.isDeviation = false;
    }
    closeQuickAction() {
        this.dispatchEvent(new CloseActionScreenEvent());
        //window.location.reload();
    }
    handlesubmitrecord(event) {
        console.log('event in');
        this.isLoading = true;
        this.isDeviation = false;
        //this.template.querySelector('lightning-record-edit-form').submit(this.fieldContent)
        var tasknamelst = [];
        if (this.kyc == 'No') {
            tasknamelst.push('KYC Documents');
        }
        if (this.marketreputation1 == 'Negative') {
            tasknamelst.push('Market Reputation');
        }
        if (this.legalproce == 'Yes') {
            tasknamelst.push('Legal Proceeding');
        }
        if (this.roi < 42) {
            tasknamelst.push('Less ROI Score');
        }
        createDeviationTask({ recordId: this.recordId, tasklist: tasknamelst, KYC: this.kyc, marketreputation: this.marketreputation1, legalProceeding: this.legalproce }).then(result => {
            this.isLoading = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Dealer Onboarding Task Created for Sales Head!',
                    variant: 'success',
                }),
            );
            window.location.reload();
            //this.contacts = result;
        })
            .catch(error => {
                console.log('error' + JSON.stringify(error));
            })
        //this.handlesaveRecord();
        //this.template.querySelector('lightning-record-edit-form').submit(this.fieldContent);

    }
    handlesaveRecord(event) {
        this.template.querySelector('lightning-record-edit-form').submit(this.template.querySelector('lightning-record-edit-form').fields);

    }
    handleSuccess(event) {
        this.isLoading = false;
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Record saved successfully!',
                variant: 'success',
            }),
        );
        this.closeQuickAction();
    }

    handleSuccesskyc(event) {
        this.isLoading = false;
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Data updated successfully. Approval task created for NSM.',
                variant: 'success',
            }),
        );
        this.closeQuickAction();
    }

    handleSuccesspayment(event) {
        this.isLoading = false;
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Data updated successfully. Financial task got created.',
                variant: 'success',
            }),
        );
        this.closeQuickAction();
    }

    handleabort() {
        this.islegalProceeding = false;
        this.showlegalreson = true;
    }

    handledeviationrej() {
        updateAbort({ recordId: this.recordId, reason: this.rejectreason }).then(result => {
            //this.paymentstatus = result.HMC_Payment_Status__c ;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Record saved successfully.',
                    variant: 'success',
                }),
            );
            window.location.reload();
        })

            .catch(error => { });
    }

    handledeviation() {
        this.islegalProceeding = false;
        this.isDeviation = true;
    }
    handleSaveLegal() {
        this.showlegalreson = false;
        this.template.querySelector('lightning-record-edit-form').submit(this.fieldContent)
    }

    handleSubmitRoiFields(event) {
        //this.template.querySelector('lightning-record-edit-form').submit(this.template.querySelector('lightning-record-edit-form').fields);
        event.preventDefault();       // stop the form from submitting
        const fields = event.detail.fields;
        fields.HMC_Current_Step__c = '2';
        this.template.querySelector('lightning-record-edit-form').submit(fields);

        sendEmailToDealer({ recordId: this.recordId }).then(result => {
            this.isLoading = false;
            /*  this.dispatchEvent(
                 new ShowToastEvent({
                     title: 'Success',
                     message: 'Dealer Onboarding Task Created for Sales Head!',
                     variant: 'success',
                 }),
                     ); */
            this.closeQuickAction();
            //this.contacts = result;
        })
            .catch(error => {
                console.log('error' + error);
            })
    }

    handleSubmit(event) {
        event.preventDefault();       // stop the form from submitting
        const fields = event.detail.fields;
        fields.HMC_Stage__c = 'Closed Dropped';
        this.template.querySelector('lightning-record-edit-form').submit(fields);
        console.log('onsubmit event recordEditForm' + event.detail.fields);
    }

    handleSubmitpayment(event) {
        this.isLoading = true;
        event.preventDefault();       // stop the form from submitting
        const fields = event.detail.fields;
        const fieldsvar = this.template.querySelectorAll('lightning-input-field');
        this.fieldContent = fieldsvar;
        fieldsvar.forEach(val => {
            console.log(val.value);
            if (val.name == 'payment') {
                if (val.value === 'Paid in Full') {
                    createFinancetask({ recordId: this.recordId }).then(result => {
                        this.isLoading = false;
                        this.closeQuickAction();
                    })
                        .catch(error => {
                            console.log('error' + error);
                        })
                    fields.HMC_Current_Step__c = '4';
                    fields.HMC_Verification_Status__c = 'Waiting for Approval';
                    this.template.querySelector('lightning-record-edit-form').submit(fields);
                } else {
                    this.template.querySelector('lightning-record-edit-form').submit(fields);
                }
            }
        }
        );

        //fields.HMC_Stage__c = 'Closed Dropped';
        //this.template.querySelector('lightning-record-edit-form').submit(fields);
        console.log('onsubmit event recordEditForm' + event.detail.fields);
    }

    handlesubmitDealerCode(event) {
        this.isLoading = true;
        event.preventDefault();
        const fieldsvar = this.template.querySelectorAll('lightning-input-field');
        this.fieldContent = fieldsvar;
        var status = '';
        fieldsvar.forEach(val => {
            console.log(val.value);
            if (val.name == 'verificationstatus') {
                status = val.value;
            }

        });
        //this.template.querySelector('lightning-record-edit-form').submit(this.fieldContent) 
        if (status === 'Approved') {
            this.isLoading = true;
            //this.template.querySelector('lightning-record-edit-form').submit(this.fieldContent)
            genarateDealerCode({ recordId: this.recordId }).then(result => {

                if (result == 'Success') {
                    this.isLoading = false;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: result,
                            variant: 'success',
                        }),
                    );
                } else {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: result,
                            variant: 'Error',
                        }),
                    );
                }
                this.closeQuickAction();
                //this.contacts = result;
            })
                .catch(error => {
                    //this.errorMsg = error;
                })
            this.template.querySelector('lightning-record-edit-form').submit(this.template.querySelector('lightning-record-edit-form').fields);
        } else if (status === 'Rejected') {
            this.isLoading = false;
            const fields = event.detail.fields;
            fields.HMC_Stage__c = 'Closed Dropped';
            this.template.querySelector('lightning-record-edit-form').submit(fields);
            console.log('in else rej');
            //this.template.querySelector('lightning-record-edit-form').submit(this.template.querySelector('lightning-record-edit-form').fields);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Record saved successfully',
                    variant: 'success',
                }),
            );
            this.closeQuickAction();

        } else if (status === 'Need Additional Details') {
            this.template.querySelector('lightning-record-edit-form').submit(this.template.querySelector('lightning-record-edit-form').fields);
            sendNotification({ recordId: this.recordId }).then(result => {
                this.isLoading = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Notification send to Salesperson',
                        variant: 'success',
                    }),
                );
                this.closeQuickAction();
                //this.contacts = result;
            })
                .catch(error => {
                    //this.errorMsg = error;
                })
        }

        eval("$A.get('e.force:refreshView').fire();");
    }
    handlepaymentstatus(event) {
        /* const fields = event.detail.fields;
        fields.forEach(val=>{
            console.log(val.value);
        }); */
        this.paymentstatus = event.detail.value;
        //console.log('payment status -- '+value);
        /* savePaymentStatus({recordId:this.recordId, paymentStatus : value}).then(result => {
           //this.paymentstatus = result.HMC_Payment_Status__c ;
           this.dispatchEvent(
               new ShowToastEvent({
                   title: 'Success',
                   message: 'Notification send to Salesperson',
                   variant: 'success',
               }),
                   );
       })
      
       .catch(error => {}); */
    }

    handlepaymentstatus12() {
        savePaymentStatus({ recordId: this.recordId, paymentStatus: this.paymentstatus }).then(result => {
            //this.paymentstatus = result.HMC_Payment_Status__c ;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Data updated successfully.',
                    variant: 'success',
                }),

            );
            window.location.reload();
        })

            .catch(error => { });
    }

    handledocstatys(event) {
        this.verificationstatus = event.detail.value;
        //console.log('payment status -- '+value);
    }
    verficationcommentsVal;
    verficationcommentsValue(event) {
        this.verficationcommentsVal = event.detail.value;
    }

    handleDocstatusmethod() {
        this.isLoading = true;
        saveVerificationStatus({ recordId: this.recordId, status: this.verificationstatus, Comments: this.verficationcommentsVal }).then(result => {
            //this.paymentstatus = result.HMC_Payment_Status__c ;
            this.isLoading = false;
            //alert('result'+result);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Record saved successfully.',
                    variant: 'success',
                }),
            );
            window.location.reload();
        })

            .catch(error => { });
    }
    handleChangearea(event) {
        this.area = event.detail.value;
    }
    handleChangecustomer_Group(event) {
        this.customer_Group = event.detail.value;
    }
    handleChangekyc(event) {
        this.kyc = event.detail.value;
    }

    handleChangemarket(event) {
        this.marketreputation1 = event.detail.value;
    }

    handleChangelegal(event) {
        this.legalproce = event.detail.value;
    }

    isInputValid() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.validate');
        inputFields.forEach(inputField => {
            if (!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
            //     this.contact[inputField.name] = inputField.value;
        });
        return isValid;
    }

    handlesaveRecordkyc() {
        if (this.customer_Group == undefined || this.customer_Group == '') {
            const evt = new ShowToastEvent({
                title: 'Warning',
                message: 'Customer Groups field is required',
                variant: 'warning',
                mode: 'dismissable'
            });
            this.dispatchEvent(evt);
        } else {

            if (this.isInputValid()) {
                saveApproval({ recordId: this.recordId, Area: this.area, Customer_Group: this.customer_Group, KYC: this.kyc, marketreputation: this.marketreputation1, legalProceeding: this.legalproce, gstNumber: this.gstNumber, panCardNumber: this.panCardNumber }).then(result => {
                    //this.paymentstatus = result.HMC_Payment_Status__c ;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Record saved successfully.',
                            variant: 'success',
                        }),
                    );
                    window.location.reload();
                })
                    .catch(error => { });
            }
        }

    }
}