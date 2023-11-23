import { LightningElement,api } from 'lwc';

export default class ListViewHeader extends LightningElement {
    @api objectvalueheader;
    @api fieldsetvalueheader;

    connectedCallback(){
        console.log('this.objectvalue===>header',this.objectvalueheader);
        console.log('this.fieldsetvalue===>header',this.fieldsetvalueheader);
    }
    
}