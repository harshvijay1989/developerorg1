import { LightningElement, api, wire } from 'lwc';
import getRecordsByRecordType from '@salesforce/apex/RecordTypeController.getRecordsByRecordType';
import { NavigationMixin } from 'lightning/navigation';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name', type: 'url', 
      typeAttributes: { label: { fieldName: 'Name' }, target: '_blank' } }
];

export default class ViewPage extends NavigationMixin(LightningElement) {
    @api objectApiName = 'Opportunity__c';
    @api recordTypeDeveloperName = 'Product';
    
    records = [];
    columns = COLUMNS;

    connectedCallback() {
        this.loadRecords();
    }

    loadRecords() {
        getRecordsByRecordType({ objectApiName: this.objectApiName, recordTypeDeveloperName: this.recordTypeDeveloperName, fields: 'Name' })
            .then(result => {
                this.records = result.map(record => {
                    return { 
                        Name: '/' + record.Id // Create the URL for navigation
                    };
                });
            })
            .catch(error => {
                // Handle error
            });
    }

    handleRowAction(event) {
        const recordId = event.detail.row.Id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: this.objectApiName,
                actionName: 'view'
            }
        });
    }
}