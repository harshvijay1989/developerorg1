import { LightningElement,api } from 'lwc';
import getOrderItem from '@salesforce/apex/demo1.getOrderItem';
export default class OrderLineItem extends LightningElement {
    @api recordId;
    @api recordName='';

    connectedCallback() {
        setTimeout(() => {
            this.getOrderItem();
        }, 500);
    }
    getOrderItem(){
    getOrderItem({recId:this.recordId })
    .then((result) => {
          this.recordName=JSON.parse(result);
          console.log('result'+result);
        
    }).catch((err) => {
        console.log('error');
        
    });

     }

 clickNeButton(){
    console.log('hoo');

    console.log('this.recordId==> ',this.recordId);
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: this.recordId,
        actionName: "edit",
      },
    });
  }
}