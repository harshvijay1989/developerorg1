import { LightningElement,api } from 'lwc';
import syncOpportunity from '@salesforce/apex/quoteSyncToOpportunity.syncOpportunity';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
export default class SyncQuoteToOpportunity extends LightningElement {
    @api recordId;

        connectedCallback() {
        setTimeout(() => {
          
            syncOpportunity({ quoteId: this.recordId })
                .then(result => {
                    console.log(result);
                    
                    this.showToast('Success', 'Quote sync successfully', 'success');
                    const closeAction = new CloseActionScreenEvent();
                    this.dispatchEvent(closeAction);
                
                })
                .catch(error => {
                    
                    this.showToast('Error', 'Error', 'error');
                    const closeAction = new CloseActionScreenEvent();
                    this.dispatchEvent(closeAction);
                });
        }, 1000);
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}