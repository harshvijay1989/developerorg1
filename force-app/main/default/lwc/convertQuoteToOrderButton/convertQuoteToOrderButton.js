// ConvertQuoteToOrderButton.js
import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import convertQuoteToOrder from '@salesforce/apex/QuoteToOrderController.convertQuoteToOrder';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';

export default class ConvertQuoteToOrderButton extends NavigationMixin(LightningElement) {
    @api recordId;

    convertToOrder() {

        console.log('this.recordId===>', this.recordId);
        convertQuoteToOrder({ quoteId: this.recordId })
            .then(result => {
                if(result != 'Null'){
                console.log('Quote converted to order successfully:', result);

                // Use NavigationMixin to navigate to the newly created Order record

                this.showToast('Success', 'Order Place Successfully', 'success');
                const closeAction = new CloseActionScreenEvent();
                this.dispatchEvent(closeAction);
            //setTimeout(() => {
            this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: result,
                        actionName: 'view',
                    },
                });
                }
                //}, 1000);

                else{
                this.showToast('Error', 'To place an order, quote status should be accepted', 'error');

                }

            })
            .catch(error => {
                console.log('hiii');
                this.showToast('Error', 'Error in placing Order', 'error');
                const closeAction = new CloseActionScreenEvent();
                this.dispatchEvent(closeAction);
                console.error('Error converting quote to order:', error);
            });
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