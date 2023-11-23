import { LightningElement,api,wire } from 'lwc';

import getDeviations from '@salesforce/apex/HMC_SalesHeadApproveController.getDeviations';
import gettasks from '@salesforce/apex/HMC_SalesHeadApproveController.getTasklist';
import updateDeviations from '@salesforce/apex/HMC_SalesHeadApproveController.updateDeviations';
import closetask from '@salesforce/apex/HMC_SalesHeadApproveController.closetask';
import closetaskReject from '@salesforce/apex/HMC_SalesHeadApproveController.closetaskReject';
import roiscore from '@salesforce/schema/Account.HMC_ROI_Score1__c';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {
    CloseActionScreenEvent
}  from 'lightning/actions';
export default class HMC_SalesHeadApproval extends LightningElement {
    @api recordId;
    
    deviation = [];
    isdeviationpresent = false;
    isROIDev = false;
    isroiPresent = true;
    value = 'inProgress';
    istaskpresent = true;
    roiScoreVal = 0;
    get options() {
        return [
            { label: 'Approve', value: 'Approve' },
            { label: 'Reject', value: 'Reject' }
        ];
    }

    @wire(getRecord, { recordId: '$recordId', fields: [roiscore] })
    wiredRecordDats({ error, data }) {
        if (data) {
            
            this.accountRecord = data;
            this.roiScoreVal = this.accountRecord.fields.HMC_ROI_Score1__c.value;
            console.log('this.accountRecord.fields.HMC_ROI_Score1__c'+this.accountRecord.fields.HMC_ROI_Score1__c.value);
            
        }else if (error) {
            
        }
    }

    @wire(getDeviations,{recordId:'$recordId'}) wiredRecord2({ error, data }) {
        console.log('in method');
        if (data) {
            if(data.length !== 0){
                this.isdeviationpresent = true;
            }
            if(this.roiScoreVal < 42){
                this.isROIDev = true;
            }
            console.log(data);
            var records = [];
            data.forEach(record => {
                console.log('in method if');
                let preparedRec1 = {};
                //preparedRec1.Name = record.Name;
                preparedRec1.Id = record.Id;
                preparedRec1.Deviation_Type__c = record.Deviation_Type__c;
                preparedRec1.Deviation_Status__c = record.Deviation_Status__c;
                preparedRec1.HMC_Comments__c = record.HMC_Comments__c;
                //preparedRec1.isEnable = false;
                records.push(preparedRec1);
            }); 
            this.deviation = records; 
            //this.deviation = data;
            console.log('this.deviation',this.deviation)
        }else if (error) {
            console.log('in method error'+error.body.message);
        } 
    }
    @wire(gettasks,{recordId:'$recordId'}) wiredRecord1({ error, data }) {
        console.log('in method');
        if (data) {
            console.log(data);
           if(data.length === 0){
               this.istaskpresent = false;
           }
        }else if (error) {
            console.log('in method error'+error.body.message);
        } 
    }

    handleChange(event){
        var rowIndex = event.currentTarget.dataset.index;
        var value = event.detail.value;
        console.log('rowIndex'+rowIndex);
        if(value === 'Approve'){
            this.deviation[rowIndex].Deviation_Status__c = 'Approved';
        }else if(value === 'Reject'){
            this.deviation[rowIndex].Deviation_Status__c = 'Rejected';
        }
        
    }
    handlecomments(event){
        var rowIndex = event.currentTarget.dataset.index;
        var value = event.detail.value;
        this.deviation[rowIndex].HMC_Comments__c = value;
        console.log('handlecomments-->'+value);
    }
     handleClickSubmit(event){
        var updatedlst = [];
        //console.log('table '+this.deviation.Name + this.deviation.Date);
        for(let rowIndex in this.deviation){
            console.log('for');
            let updaterec = {};
            updaterec.Deviation_Status__c = this.deviation[rowIndex].Deviation_Status__c;
            updaterec.HMC_Comments__c = this.deviation[rowIndex].HMC_Comments__c;
            if(this.deviation[rowIndex].Id != undefined && this.deviation[rowIndex].Id != 'undefined'){
                updaterec.Id = this.deviation[rowIndex].Id;
            }
            updatedlst.push(updaterec);
            console.log(this.deviation[rowIndex].Deviation_Status__c + this.deviation[rowIndex].Id);
        }
        console.log(updatedlst);
        updateDeviations({data: updatedlst , recordId : this.recordId});
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Deviations data updated successfully',
                variant: 'success'
            })
        );
       window.location.reload();
    }

    closeQuickAction() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    handleClickApprove(event){
        closetask({recordId : this.recordId});
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Dealer Onboarding Approved',
                variant: 'success'
            })
        );
        this.closeQuickAction();
        window.location.reload();
    }

    handleClickReject(event){
        closetaskReject({recordId : this.recordId});
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: 'Dealer Onboarding Rejected',
                variant: 'Error'
            })
        );
        this.closeQuickAction();
    }

}