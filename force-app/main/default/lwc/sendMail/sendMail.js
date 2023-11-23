import { LightningElement, api, wire } from 'lwc';
import sendMailWithPdf from '@salesforce/apex/SendMail.sendEmailWithPDF';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';

export default class SendMail extends LightningElement {
    @api recordId;
     @api showSpinner=false;

    sendQuote() {
         this.showSpinner=true;
        setTimeout(() => {
          
            sendMailWithPdf({ recordId: this.recordId })
                .then(result => {
                    console.log(result);
                    
                    this.showToast('Success', 'Email sent successfully', 'success');
                    const closeAction = new CloseActionScreenEvent();
                    this.dispatchEvent(closeAction);
                
                })
                .catch(error => {
                    
                    this.showToast('Error', 'Error sending email', 'error');
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