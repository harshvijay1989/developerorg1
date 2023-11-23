import { LightningElement,api } from 'lwc';
import getQuoteItem from '@salesforce/apex/demo1.getQuoteItem';

export default class QuoteLineItem extends LightningElement {
    @api recordId;
    @api recordName='';

    connectedCallback() {
        setTimeout(() => {
            this.getQuoteItem();
        }, 500);
    }
    getQuoteItem(){
    getQuoteItem({recId:this.recordId })
    .then((result) => {
          this.recordName=JSON.parse(result).Name;
        
    }).catch((err) => {
        console.log('error');
        
    });

     }
}