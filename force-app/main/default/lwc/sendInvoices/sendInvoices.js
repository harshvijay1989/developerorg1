import { LightningElement, api } from 'lwc';
import sendInvoicesWithPdf from '@salesforce/apex/SendMail.sendInvoicesWithPdf';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';

export default class SendInvoices extends LightningElement {
    @api recordId;
    @api showSpinner=false;

    sendInvoice() {
        this.showSpinner=true;
        setTimeout(() => {
            console.log('recordId => ' + this.recordId);
            sendInvoicesWithPdf({ recordId: this.recordId })
                .then(result => {
                    this.showToast('Success', 'sent invoices successfully', 'success');
                    const closeAction = new CloseActionScreenEvent();
                    this.dispatchEvent(closeAction);
                })
                .catch(error => {
                    this.showToast('Error', 'Error sending invoices', 'error');
                    const closeAction = new CloseActionScreenEvent();
                    this.dispatchEvent(closeAction);
                });
        }, 1000);
    }


    handleCancel() {
        const closeAction = new CloseActionScreenEvent();
        this.dispatchEvent(closeAction);
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