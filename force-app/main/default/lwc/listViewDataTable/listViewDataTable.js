import { LightningElement,api } from 'lwc';
import { publish,subscribe,unsubscribe,createMessageContext,releaseMessageContext } from 'lightning/messageService';
import SAMPLEMC from "@salesforce/messageChannel/ListViewSendDataFromLightningPage__c";
export default class ListViewDataTable extends LightningElement{

    @api recordvaluetodatatable;
    @api columnsvaluetodatatable;
    isDataLoaded = false;
    subscription = null;
    context = createMessageContext();

    connectedCallback(){
        this.isDataLoaded = true;
        this.subscribeMC();
    }
    
    

   

    handleChange(event) {
        this.myMessage = event.target.value;
    }

    publishMC() {
        const message = {
            objectNameContainer: this.recordData,
            fieldSetNameContainer : this.columns,
            calledFrom: "From List View Filter"
        };
        publish(this.context, SAMPLEMC, message);
    }

    subscribeMC() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(this.context, SAMPLEMC, (message) => {
            console.log('message====>',JSON.stringify(message.fieldSetNameContainer));
            this.recordvaluetodatatable = message.objectNameContainer;
            this.columnsvaluetodatatable = message.fieldSetNameContainer;
            this.isDataLoaded = false;
            this.displayMessage(message);
        });
     }
 
     unsubscribeMC() {
         unsubscribe(this.subscription);
         this.subscription = null;
     }

     displayMessage(message) {
        console.log('messageinDATATABLE==51==>',JSON.stringify(message));
        
        
     }

     disconnectedCallback() {
         releaseMessageContext(this.context);
     }
}