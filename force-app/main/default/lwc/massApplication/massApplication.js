import { LightningElement,api } from 'lwc';

export default class MassApplication extends LightningElement {
    @api salesforceobj = '';

    connectedCallback(){
        this.salesforceobj = true;
    }
}