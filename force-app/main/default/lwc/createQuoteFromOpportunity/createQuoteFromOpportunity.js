// createQuoteFromOpportunity.js
import { LightningElement, api, wire, track } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getRelatedQuotes from '@salesforce/apex/OpportunityQuotesController.getRelatedQuotes';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity__c';

export default class CreateQuoteFromOpportunity extends LightningElement {
    @api recordId; // Opportunity Id

    quoteName = '';
    expirationDate = '';
    status = 'Draft';
    opportunityId;
    relatedQuotesCheck = false;

    @track showActions = false;
    @track showCreateQuoteModal = false;
    @track showViewAllButton = true;
    @track displayedQuotes = [];

    connectedCallback() {
        this.opportunityId = this.recordId;
        this.loadRelatedQuotes();
    }

    loadRelatedQuotes() {
        getRelatedQuotes({ opportunityId: this.opportunityId })
            .then(result => {
                console.log('result===> ', result);
                this.displayedQuotes = result.slice(0, 1); // Display only the first quote initially
                this.relatedQuotes = result;
                this.relatedQuotesCheck = true;
            })
            .catch(error => {
                console.error('Error fetching related quotes:', error);
            });
    }

    toggleActions() {
        this.showActions = !this.showActions;
    }

    handleActionOne() {
        this.showCreateQuoteModal = true;
    }

    closeModal() {
        this.showCreateQuoteModal = false;
    }

    handleCollapse() {
        console.log('Panel collapsed');
        // Add any additional logic for panel collapse
    }

    handleNameChange(event) {
        this.quoteName = event.target.value;
    }

    handleExpirationDateChange(event) {
        this.expirationDate = event.target.value;
    }

    createQuote() {
        const fields = {
            Name: this.quoteName,
            ExpirationDate__c: this.expirationDate,
            Status__c: this.status,
            Opportunity__c: this.opportunityId
        };

        const recordInput = { apiName: 'Quote__c', fields };
        createRecord(recordInput)
            .then(result => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Quote created successfully.',
                        variant: 'success'
                    })
                );
                this.showCreateQuoteModal = false;
                this.loadRelatedQuotes(); // Refresh the related quotes after creating a new one
            })
            .catch(error => {
                console.error('Error creating quote:', error.body.message);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error creating quote: ' + error.body.message,
                        variant: 'error'
                    })
                );
            });
    }

    handleViewAll() {
        this.showViewAllButton = false; // Hide "View All" button after clicking
        // Show all related quotes
        this.displayedQuotes = this.relatedQuotes;
    }
}