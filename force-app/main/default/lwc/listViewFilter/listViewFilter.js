import { LightningElement, api } from 'lwc';
import getFieldsForColumns from '@salesforce/apex/ListViewFilterController.getFieldsForColumns';
import { publish, subscribe, unsubscribe, createMessageContext, releaseMessageContext } from 'lightning/messageService';
import SAMPLEMC from "@salesforce/messageChannel/ListViewSendDataFromLightningPage__c";
export default class ListViewFilter extends LightningElement {
    objectvaluefilter;
    fieldsetvaluefilter;
    fieldSet;
    isDataLoaded = false;
    @api columns;
    @api recordData;
    subscription = null;
    context = createMessageContext();
    connectedCallback() {
        this.subscribeMC();
      
    }



    handleDataFromApex() {
        console.log('this.objectvaluefilter===Filter=>', this.objectvaluefilter);
        console.log('this.fieldsetvaluefilter====Filter>', this.fieldsetvaluefilter);
        getFieldsForColumns({ objectName: this.objectvaluefilter, fieldSetName: this.fieldsetvaluefilter })//, dmsAndSalesRepreName: this.dmsAndSalesRepreName })
            .then(result => {
                console.log('result===31filter=>', result);
                this.recordData = result.records;
                if (result.fieldList.length > 0) {
                    console.log('result.fieldList=====>', result.fieldList);
                    this.columns = result.fieldList.map(fieldWrapper => {
                        return {
                            label: fieldWrapper.label,
                            fieldName: fieldWrapper.fieldPath,
                            type: 'text',
                            editable: true
                        };
                    });
                    this.isDataLoaded = true;
                }
            }).catch(error => {
                console.log('error====>', error);
            });
            setTimeout(() => {
               
               
                this.publishMC();
            }, 3000);
    }

    handleChange(event) {
        this.myMessage = event.target.value;
    }

    publishMC() {
        const message = {
            objectNameContainer: this.recordData,
            fieldSetNameContainer: this.columns,
            calledFrom: "From List View Filter"
        };
        publish(this.context, SAMPLEMC, message);
    }

    subscribeMC() {
        console.log('====58>');
        if (this.subscription) {
            return;
        }
        console.log('====61>');
        this.subscription = subscribe(this.context, SAMPLEMC, (message) => {
            console.log('message===72=viewFilter==>', message);
            if (message.objectNameContainer != null && message.fieldSetNameContainer != null && message.calledFrom == 'Parent') {
                console.log('message===72 in viewfilter===>',message);
                this.objectvaluefilter = message.objectNameContainer;
                this.fieldsetvaluefilter = message.fieldSetNameContainer;
                this.handleDataFromApex();
            }

           
        });
    }

    unsubscribeMC() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }


    disconnectedCallback() {
        releaseMessageContext(this.context);
    }

}