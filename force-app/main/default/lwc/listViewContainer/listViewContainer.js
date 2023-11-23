import { LightningElement,api } from 'lwc';
import { publish,subscribe,unsubscribe,createMessageContext,releaseMessageContext } from 'lightning/messageService';
import SAMPLEMC from "@salesforce/messageChannel/ListViewSendDataFromLightningPage__c";
export default class ListViewContainer extends LightningElement {

    
    @api objectNameContainer;
    @api fieldSetNameContainer;
    subscription = null;
    context = createMessageContext();
    

    connectedCallback(){
        console.log('objectNameContainer===>',this.objectNameContainer);
        console.log('fieldSetName===>',this.fieldSetNameContainer);
        
        this.subscribeMC();
        setTimeout(() => {
            
           this.publishMC();
        }, 3000);
        
    
    }

  

    

    handleChange(event) {
        this.myMessage = event.target.value;
    }

    publishMC() {
        console.log("calledPublis");
        const message = {
            objectNameContainer: this.objectNameContainer,
            fieldSetNameContainer: this.fieldSetNameContainer,
            calledFrom : "Parent"
        };
        publish(this.context, SAMPLEMC, message);
        console.log('message====38==>',JSON.stringify(message));
    }

    subscribeMC() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(this.context, SAMPLEMC, (message) => {
            console.log('message===47===>',JSON.stringify(message));
            //this.displayMessage(message);
            
        });

     }
 
     unsubscribeMC() {
         unsubscribe(this.subscription);
         this.subscription = null;
     }

     displayMessage(message) {

         //this.receivedMessage = message ? JSON.stringify(message, null, '\t') : 'no message payload';
     }

     disconnectedCallback() {
         releaseMessageContext(this.context);
     }
    
}